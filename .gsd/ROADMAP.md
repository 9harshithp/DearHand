---
milestone: DearHand MVP
version: 1.0.0
updated: 2026-11-01
---

# Roadmap: DearHand Platform

> **Current Phase:** 1 - Monorepo Setup & Health Check
> **Status:** ready

## Must-Haves (from docs/SPEC.md)
- [ ] Family sign up, login, parent profiles, booking creation
- [ ] Helper application, document upload, admin verification lifecycle
- [ ] Admin matching board, helper accept/decline queue
- [ ] Razorpay payment integration with signature-verified webhooks
- [ ] Visit tracking: check-in, photo/note updates, check-out, emergency alert
- [ ] Ratings and reviews after completed visits
- [ ] Audit logs and role/ownership security checks on every endpoint

---

## Phases

### Phase 1: Setup & Monorepo Foundation
**Status:** ⬜ Ready
**Objective:** Create monorepo with `/backend` (Spring Boot 3, Maven) and `/frontend` (React, Vite, Tailwind CSS), docker-compose with MySQL 8, health endpoint, README, and `.env.example`.

### Phase 2: Database Schema & Entities
**Status:** ⬜ Not Started
**Objective:** Flyway migrations and JPA entities for all 12 tables, repositories, and seed script for admin, packages, and test data.

### Phase 3: Authentication & Authorization
**Status:** ⬜ Not Started
**Objective:** JWT & BCrypt auth with role guards (`family`, `helper`, `admin`), React auth screens and protected routes.

### Phase 4: Helper Onboarding & Document Verification
**Status:** ⬜ Not Started
**Objective:** Helper application form, secure file storage for ID/license, and admin verification workflow.

### Phase 5: Parents & Bookings Management
**Status:** ⬜ Not Started
**Objective:** Parent profile CRUD, booking creation flow, strict booking status state machine.

### Phase 6: Matching & Acceptance Workflow
**Status:** ⬜ Not Started
**Objective:** Admin assignment board, helper accept/decline queue with auto-fallback to admin.

### Phase 7: Online Payments & Receipts
**Status:** ⬜ Not Started
**Objective:** Razorpay order creation, checkout integration, idempotent webhook verification, receipt view.

### Phase 8: Visit Execution, Live Updates & Reviews
**Status:** ⬜ Not Started
**Objective:** Visit check-in/out, note/photo updates, one-tap emergency escalation, post-visit rating.

### Phase 9: Notifications & Admin Operations
**Status:** ⬜ Not Started
**Objective:** Notification dispatch, incident management, package pricing configuration, audit logging.

### Phase 10: Security Hardening, Testing & Deployment
**Status:** ⬜ Not Started
**Objective:** Security compliance audit against SPEC, CORS, rate limiting, automated tests, deployment instructions.
