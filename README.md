# DearHand 🤝

> A platform where families book verified, consistent helpers for elderly parents in Mysuru.

---

## Architecture Overview

DearHand is structured as a monorepo containing:
- **`backend/`**: Spring Boot 3 (Java 17/21) REST API, Spring Security with JWT, MySQL 8 with Flyway migrations.
- **`frontend/`**: React 18 with Vite and Tailwind CSS. Built with high-contrast accessibility standards (minimum 16px font, 44px tap targets).
- **`docs/`**: Product specifications, API definitions, and database schemas in [SPEC.md](file:///home/gs/Downloads/DearHand/docs/SPEC.md).

---

## Prerequisites

- **Java**: JDK 17 or JDK 21
- **Node.js**: v18+ (tested on Node v24)
- **Docker & Docker Compose**: For running MySQL 8 locally

---

## Quick Start

### 1. Start the Database
Start the MySQL 8 container:
```bash
docker compose up -d
```
MySQL will be accessible on port `3306` with database `dearhand`, user `dearhand`, and password `dearhand123`.

### 2. Run the Backend API
Navigate to `/backend`:
```bash
cd backend
./mvnw spring-boot:run
```
The API starts on `http://localhost:8080`.
Verify the health endpoint:
```bash
curl http://localhost:8080/api/v1/health
```
Expected output:
```json
{
  "service": "dearhand-backend",
  "status": "UP",
  "version": "0.0.1-SNAPSHOT",
  "timestamp": "..."
}
```

To run unit and integration tests:
```bash
./mvnw test
```

### 3. Run the Frontend App
Navigate to `/frontend`:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
The Vite dev server proxies `/api` calls to `http://localhost:8080`.

---

## Environment Variables

Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `dearhand` |
| `DB_USER` | MySQL user | `dearhand` |
| `DB_PASSWORD` | MySQL password | `dearhand123` |
| `PORT` | Backend server port | `8080` |
| `JWT_SECRET` | 256-bit secret key for JWT | Configured in `.env.example` |
| `RAZORPAY_KEY_ID`| Razorpay test key ID | `rzp_test_placeholder` |

---

## Roadmap & Next Steps
- **Prompt 1: Setup** ✅ (Monorepo, health endpoint, docker-compose, README)
- **Prompt 2: Database** ⬜ (Flyway migrations, JPA entities, repositories, seed data)
- **Prompt 3: Authentication** ⬜ (BCrypt, JWT, role guards, React auth screens)
- **Prompt 4: Helper Onboarding** ⬜ (Helper application, document upload, admin verification)
- **Prompt 5: Parents & Bookings** ⬜ (Parent CRUD, booking status state machine)
- **Prompt 6: Matching & Acceptance** ⬜ (Admin assign, helper accept/decline queue)
- **Prompt 7: Payments** ⬜ (Razorpay test mode, webhook verification, receipt view)
- **Prompt 8: Visits & Reviews** ⬜ (Check-in, photo upload, checkout, emergency alert, review)
- **Prompt 9: Notifications & Admin Tools** ⬜ (Notifications, incidents, prices, audit log)
- **Prompt 10: Hardening & Launch** ⬜ (Security audit, rate limiting, tests, deployment guide)
