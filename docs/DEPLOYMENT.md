# DearHand Deployment & Operations Runbook

**Project:** DearHand — Verified Stand-in Helpers for Elderly Parents in Mysuru  
**Version:** 1.0.0 (Pilot Production Ready)  
**Date:** November 2026  

---

## 1. System Architecture Overview

DearHand is structured as a resilient, decoupled client-server architecture:

```
[ Family / Helper / Admin Browser ]
              │
              │ HTTPS (TLS 1.3)
              ▼
   [ Reverse Proxy / Nginx ]
   ├── /               ──> React + Vite Static SPA (Built bundle)
   └── /api/v1/*       ──> Spring Boot 3 REST Application (Port 8080)
                             │
                             ├── Rate Limiting & Security Headers
                             ├── JWT Authentication Filter (Role-Based RBAC)
                             ├── Business Logic (Parents, Bookings, Visits, Reviews, Incidents)
                             │
                             ├── Flyway Migrations (Schema V1, Seed V2)
                             ├── MySQL 8 InnoDB Database
                             ├── Razorpay Payment Gateway (Orders, Webhook verification)
                             └── Secure Document Storage (Local disk or AWS S3)
```

---

## 2. Infrastructure & Prerequisites

| Component | Recommended Production Spec | Minimal Pilot Spec |
| :--- | :--- | :--- |
| **Server / Cloud** | AWS ECS / EC2 (t3.medium) or Render/Railway | 1 vCPU, 2 GB RAM |
| **Java Runtime** | OpenJDK 17 or 21 (LTS) | JDK 17+ |
| **Node.js** | Node.js 18.x or 20.x LTS | Node.js 18+ |
| **Database** | Managed MySQL 8.0 (AWS RDS / Railway MySQL) | MySQL 8.0 Docker container |
| **TLS/SSL** | Let's Encrypt or AWS Certificate Manager | TLS 1.2+ mandatory |
| **Storage** | AWS S3 Bucket with private ACL & pre-signed URLs | Mounted local storage directory |

---

## 3. Environment Variables & Secrets Checklist

Create a secure `.env` or inject these environment variables in your deployment pipeline. **Never commit actual credentials to version control.**

```bash
# ==============================================================================
# SERVER & CORS
# ==============================================================================
PORT=8080
SPRING_PROFILES_ACTIVE=prod
DEARHAND_CORS_ALLOWED_ORIGINS=https://dearhand.in,https://app.dearhand.in

# ==============================================================================
# DATABASE (MySQL 8)
# ==============================================================================
DB_HOST=db.prod.dearhand.internal
DB_PORT=3306
DB_NAME=dearhand
DB_USER=dearhand_app
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD_HERE

# ==============================================================================
# SECURITY & JWT (Minimum 256-bit secret)
# ==============================================================================
JWT_SECRET=YOUR_64_CHAR_HEX_OR_BASE64_RANDOM_SECRET_KEY_HERE
JWT_EXPIRATION_MS=86400000

# ==============================================================================
# RATE LIMITING & PROTECTION
# ==============================================================================
DEARHAND_RATE_LIMITING_ENABLED=true
DEARHAND_RATE_LIMITING_LIMIT_PER_MINUTE=15

# ==============================================================================
# RAZORPAY PAYMENT GATEWAY
# ==============================================================================
RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_key_secret
RAZORPAY_WEBHOOK_SECRET=your_configured_webhook_secret

# ==============================================================================
# STORAGE SERVICE
# ==============================================================================
DEARHAND_STORAGE_TYPE=local
DEARHAND_STORAGE_LOCAL_PATH=/var/dearhand/storage
# If AWS S3:
# DEARHAND_STORAGE_TYPE=s3
# AWS_REGION=ap-south-1
# AWS_S3_BUCKET=dearhand-private-docs
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
```

---

## 4. Production Build & Deployment Steps

### Option A: Docker Compose Deployment (Recommended for Single-Host / VPS)

1. Clone repository to server:
   ```bash
   git clone https://github.com/your-org/dearhand.git /opt/dearhand
   cd /opt/dearhand
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   chmod 600 .env
   nano .env # Populate with production secrets
   ```
3. Build and launch containers:
   ```bash
   docker compose -f docker-compose.yml up --build -d
   ```
4. Verify running health status:
   ```bash
   curl -i http://localhost:8080/api/v1/health
   # Expected: HTTP 200 {"status":"UP","service":"dearhand-backend",...}
   ```

### Option B: Native Bare-Metal / Cloud VM Deployment

#### 1. Backend Build & Launch
```bash
cd backend
export JAVA_HOME=/path/to/jdk-21
./mvnw clean package -DskipTests
java -jar -Dspring.profiles.active=prod target/dearhand-backend-0.0.1-SNAPSHOT.jar
```
*(Or configure as a `systemd` service: `/etc/systemd/system/dearhand.service`)*

#### 2. Frontend Build
```bash
cd frontend
npm install --frozen-lockfile
npm run build
# Built assets output to frontend/dist/
```

#### 3. Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name dearhand.in www.dearhand.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dearhand.in www.dearhand.in;

    ssl_certificate /etc/letsencrypt/live/dearhand.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dearhand.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /opt/dearhand/frontend/dist;
    index index.html;

    # Frontend Single Page Application fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage access for verified photo/doc inspection
    location /storage/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 5. Database Setup & Automated Migrations

Flyway automatically handles database migrations upon startup.
- `V1__init_schema.sql`: Initializes all 12 relational tables, foreign key constraints, and indices.
- `V2__seed_initial_data.sql`: Seeds default admin user (`admin@dearhand.in`), care packages (Doctor Escort, Companionship, Medication Run), and pilot config.

### Database Backup & Disaster Recovery
Run daily automated backups via cron:
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/dearhand"
mkdir -p "$BACKUP_DIR"
mysqldump -u dearhand_app -p"$DB_PASSWORD" -h "$DB_HOST" dearhand | gzip > "$BACKUP_DIR/dearhand_$TIMESTAMP.sql.gz"
# Keep only last 14 days
find "$BACKUP_DIR" -type f -mtime +14 -delete
```

---

## 6. Security & Legal Compliance Checklist

- [x] **DPDP Act 2023 Compliance:** Minimal data collection; explicit consent for visit notes and photos; full Govt ID/Aadhaar is not stored (only reference numbers & verification status).
- [x] **Zero Secrets in Codebase:** All API secrets, database passwords, and JWT signing keys injected via environment variables.
- [x] **Brute-Force Rate Limiting:** Enforced via `RateLimitingFilter.java` (HTTP 429 after 15 attempts/min per IP on login/register).
- [x] **Tamper-Proof Webhooks:** Razorpay webhooks cryptographically verified using HMAC-SHA256 constant-time comparison.
- [x] **Audit Trail Logging:** All sensitive transitions (application approvals, assignments, payment verifications, incident resolutions, pricing adjustments) logged with actor and timestamp to `audit_log`.
- [x] **Role-Based Access Control (RBAC):** Method security `@PreAuthorize` and ownership validation on all `/api/v1/*` endpoints.

---

## 7. Operational Incident Runbook

When an emergency alert is triggered via `POST /api/v1/bookings/{id}/emergency`:
1. System marks the incident as `HIGH` severity and sends immediate in-app and dispatch alerts.
2. The Operations Desk (`/admin/operations` -> Safety & Incidents tab) displays real-time details (parent name, assigned helper, contact numbers).
3. The Admin on duty contacts the family emergency contact and coordinates with local medical / emergency services in Mysuru.
4. Once resolved, the Admin logs resolution notes and marks the incident status as `RESOLVED`.
