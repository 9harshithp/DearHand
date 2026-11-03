# DearHand - PRD, TRD and Build Plan
**Date:** Nov 1, 2026 · @Harshith P

## Vision and goals
DearHand gives adult children a verified, consistent helper who steps in for them when their parents need help at home. The pilot targets families in Mysuru whose children work in Bengaluru or abroad.

**Problem.** Children who live far away cannot drive a parent to the hospital, pick up medicine or fix small problems at home. Existing services are mostly metro-focused or volunteer-run, and families often get a different person each time.

**Product goal.** A child books a vetted helper for a task, a day or a month in under three minutes, then sees proof of what happened.

### Pilot success measures (proposed, adjust after family interviews)
- 10 families interviewed before any code is written
- 10 paid bookings within 6 weeks of the manual pilot
- Average rating of 4.5 out of 5 or higher
- At least half of families book a second time
- Zero safety incidents

---

## Users and personas
Four kinds of people use DearHand, and only the family and helper use the software directly.

| Role | Who they are | What they need |
| :--- | :--- | :--- |
| **Parent** | Elderly person living alone or with a spouse; may not use apps | A familiar face who speaks their language, with no new technology to learn |
| **Child (booker)** | Adult son or daughter in another city or country; pays for the service | Easy booking, confidence the helper is safe, proof and updates after each visit |
| **Helper** | Vetted individual who acts as the stand-in for the child | Clear tasks, fair and on-time pay, a safe workflow |
| **Admin** | Operations team | Approve helpers, match bookings, handle emergencies and complaints |

*Parents who do not use apps book by phone or WhatsApp, and an admin enters the booking for them.*

---

## Features and priorities
The MVP covers the full booking loop: apply, approve, book, match, pay, visit, review. Everything else waits until the pilot shows what families use.

| Feature | Phase | Notes |
| :--- | :--- | :--- |
| Family sign up and login | MVP | Phone or email with password; OTP can follow |
| Parent profile | MVP | Address, language, care notes, medical history written by the family, emergency contacts |
| Helper application and profile | MVP | Documents, languages, skills, driving details |
| Admin approval of helpers | MVP | Nobody is bookable until approved |
| Booking: per task and day packages | MVP | Date, time, address, task notes |
| Matching and helper accept or decline | MVP | Admin assigns at first |
| Online payment and receipt | MVP | Razorpay test mode first |
| Visit check-in, check-out and update | MVP | Notes and photos sent to the family |
| Ratings and reviews | MVP | Family rates every completed visit |
| WhatsApp or SMS notifications | MVP | Booking confirmed, helper on the way, visit done |
| Emergency escalation | MVP | Helper taps one button and the family and admin are alerted |
| Monthly plans and recurring visits | Phase 2 | After helpers prove reliable |
| Automatic matching | Phase 2 | By language, gender preference, distance, availability |
| Live location during visits | Phase 2 | Needs explicit consent from the parent |
| Medicine reminders and pharmacy tie-up | Phase 2 | Partner with a licensed pharmacy |
| Kannada and Hindi interface | Phase 2 | Helper and family screens |
| Helper payout automation | Phase 2 | Manual payouts at first |
| Native mobile apps | Phase 3 | Responsive web app and PWA first |

---

## Core booking flow
1. A booking is confirmed only when a helper accepts it and the family pays.
2. If a helper declines, the booking returns to the admin, who picks the next helper.
3. Parents who do not use apps ask an admin to book for them by phone or WhatsApp.
4. Helper onboarding is a separate flow, covered by the approval stages under Helper profile.

---

## Packages and pricing
Launch with per-task and day packages, and add monthly plans once helpers have proven reliable. No prices are fixed yet: set them after talking to 10 families and checking what local drivers and attendants charge.

| Package | What it covers | Pricing basis |
| :--- | :--- | :--- |
| **Single task** | One errand or visit: hospital trip, bank work, medicine pickup | Fixed price per task, plus fuel and parking at cost |
| **Half day** | 4 hours of help, with driving if needed | Hourly rate for 4 hours, with a minimum |
| **Full day** | 8 hours including driving and accompanying | Hourly rate for 8 hours, with a small discount |
| **Monthly plan (Phase 2)** | A fixed number of visits a month with the same helper | Monthly fee |
| **Emergency booking** | Same-day help | Surcharge on top of the normal rate |

### Rules to define before launch
- Cancellation window and refund terms
- Overtime charges and how they are approved
- Fuel, parking and purchases paid by the family at actual cost, with receipts
- Helpers never hold cash beyond an amount the family agrees in advance
- Whether tips are allowed

---

## Helper profile, verification and safety
Trust is the product, so no helper is bookable until an admin has checked every item below in person or by call.

| Area | What to collect | How to check |
| :--- | :--- | :--- |
| **Identity** | Full name, photo, phone, address, government ID | See original ID; store verification reference or last 4 digits, not full number |
| **Driving** | Licence number, validity date, vehicle type, years of experience | See original licence; track expiry date and block bookings after it |
| **Languages** | Kannada, English, Hindi or others, spoken and read | Short phone call in the parent's language |
| **Skills** | First aid, wheelchair handling, smartphone and UPI help, reading prescriptions | Interview and a short practical check |
| **Background** | Police verification certificate, two references, work history | Call both references; renew certificate every year |
| **Health** | Basic fitness declaration | Self-declaration signed by the helper |
| **Trial** | One supervised visit before working alone | Admin rates the visit |

### Conduct rules every helper signs
- Give medicine only as written in the family's instructions
- Handle money only up to the agreed amount, and keep receipts
- Take photos only for visit updates the family has agreed to
- Report any incident or emergency to the admin within one hour
- Never share the parent's address, health or family details

### Approval stages
1. Helper applies and uploads documents
2. Admin verifies identity, licence and police certificate
3. Admin calls references and interviews the helper
4. Helper completes one supervised trial visit
5. Admin sets profile to `Approved` and helper becomes bookable

---

## Technical architecture
Three React screens talk to one Spring Boot API, which uses MySQL, private file storage, Razorpay and a messaging provider. Simple enough for one developer to build and run.

The role in the login token decides what each user can reach, so the family, helper and admin screens share the same API.

| Layer | Choice | Why |
| :--- | :--- | :--- |
| **Front end** | React with Vite, Tailwind CSS | Responsive app for all roles |
| **Back end** | Java 17, Spring Boot 3, Spring Security with JWT | Strong role-based security |
| **Database** | MySQL 8 with Flyway migrations | Relational data fits bookings & payments; tracked schema changes |
| **File storage** | AWS S3 private bucket with signed links (local folder in dev) | ID and licence files stay private |
| **Payments** | Razorpay | Common in India, with UPI and cards and a test mode |
| **Notifications** | WhatsApp Business API or SMS provider | Families and helpers already use WhatsApp |
| **Maps** | Google Maps for address entry | Fewer wrong addresses |
| **Hosting** | AWS (EC2 and RDS) or Render with managed MySQL | Affordable and maintainable |
| **Quality** | GitHub Actions for tests, Sentry for errors | Catch problems early |

---

## Database schema
MySQL 8 with Flyway migrations. Each table has auto-increment `id`, `created_at` and `updated_at`.

### Tables and Key Columns
- `users`: role (`family`, `helper`, `admin`), name, phone, email, password_hash, status
- `parents`: family_user_id, name, age, address, city, language, care_notes, medical_history, emergency_contact_name, emergency_contact_phone
- `helper_profiles`: user_id, bio, languages, skills, has_licence, licence_no, licence_expiry, vehicle_type, years_experience, status (`applied`, `verified`, `approved`, `suspended`), rating_avg
- `helper_documents`: helper_id, type, file_key, verified_by, verified_at
- `packages`: name, type (`task`, `half_day`, `full_day`, `monthly`), duration_hours, base_price, active
- `bookings`: family_id, parent_id, package_id, helper_id, scheduled_start, scheduled_end, address, task_notes, status, total_amount
- `payments`: booking_id, razorpay_order_id, razorpay_payment_id, amount, status, paid_at
- `visit_logs`: booking_id, checkin_at, checkout_at, notes, photo_keys
- `reviews`: booking_id, rating, comment
- `incidents`: booking_id, reported_by, description, severity, status
- `notifications`: user_id, channel, template, status, sent_at
- `audit_log`: actor_id, action, entity, entity_id, created_at

### Relationships
- One family user has many parents and many bookings.
- One helper has many documents and many bookings.
- A booking has one payment, one visit log and one review.

### Booking status flow
`requested` -> `matched` -> `accepted` -> `paid` -> `in_progress` -> `completed`
*(A booking can move to `cancelled` from any state before `in_progress`)*

---

## API endpoints (/api/v1)

| Method | Path | Purpose | Role |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Create a family or helper account | Public |
| POST | `/auth/login` | Log in and receive a token | Public |
| GET, POST | `/parents` | List or add parent profiles | Family |
| PUT | `/parents/{id}` | Update a parent profile | Family |
| GET | `/packages` | List active packages | Family |
| POST | `/bookings` | Request a booking | Family |
| GET | `/bookings` | List own bookings | Family, helper |
| GET | `/bookings/{id}` | Booking detail and status | Family, helper, admin |
| POST | `/bookings/{id}/cancel` | Cancel a booking | Family, admin |
| POST | `/bookings/{id}/pay` | Create a Razorpay order | Family |
| POST | `/payments/webhook` | Confirm payment from Razorpay | Razorpay |
| POST | `/helpers/apply` | Submit helper application | Helper |
| POST | `/helpers/documents` | Upload a document | Helper |
| GET | `/helpers/me` | View own profile and status | Helper |
| POST | `/bookings/{id}/accept` | Accept or decline an assignment | Helper |
| POST | `/bookings/{id}/checkin` | Start the visit | Helper |
| POST | `/bookings/{id}/update` | Add a note or photo | Helper |
| POST | `/bookings/{id}/checkout` | End the visit | Helper |
| POST | `/bookings/{id}/review` | Rate a completed visit | Family |
| POST | `/bookings/{id}/emergency` | Raise an emergency alert | Helper, family |
| GET | `/admin/helpers` | List applications by status | Admin |
| PUT | `/admin/helpers/{id}/status`| Verify, approve or suspend | Admin |
| POST | `/admin/bookings/{id}/assign`| Assign a helper | Admin |
| GET | `/admin/incidents` | List incidents | Admin |

---

## Pages and screens
Large text and high contrast for accessibility on mobile devices.

### Public
- Home page: what DearHand does, how it works, packages, trust and safety, FAQ
- Become a helper: short intro and application link
- Login and register

### Family
- Dashboard: upcoming and past bookings
- Parent profiles: add and edit
- New booking: choose parent, package, date, time and task notes
- Booking detail: helper profile, status, visit updates, photos, payment receipt
- Review screen after each visit

### Helper
- Application form and document upload
- Dashboard: assigned visits and earnings
- Visit screen: check in, add notes and photos, check out, emergency button

### Admin
- Helper applications with document viewer and approval steps
- Bookings board with assignment
- Incidents and complaints
- Packages and price settings
- Users and audit log

---

## Security, privacy and legal
- **Security:** BCrypt password hash, JWT auth, ownership and role checks on all endpoints, private documents (signed S3 URLs or secured static dev endpoints), HTTPS, Razorpay webhook signature verification, audit logs, automated backups.
- **Privacy:** Minimal data collection, DPDP Act 2023 compliance, explicit consent for photos and notes, no full Aadhaar/Govt ID storage (last 4 digits/ref only).
- **Legal:** Helper contracts, visit insurance, terms of service, refund & incident policies.

---

## Build Plan (Step-by-step)
- **Step 0: Project Rules** (Source of truth, tech stack, safety rules)
- **Prompt 1: Setup** (Monorepo `/backend` Spring Boot Maven, `/frontend` React Vite, docker-compose, health check, README, .env.example)
- **Prompt 2: Database** (Flyway migrations, JPA entities, repositories, seed script with admin, packages, test data)
- **Prompt 3: Authentication** (BCrypt, JWT, role-based security, React auth screens, route guards, token management)
- **Prompt 4: Helper Onboarding** (Helper profile application, secure document upload, admin verification workflow)
- **Prompt 5: Parents and Bookings** (Parent CRUD, booking creation, state machine validation, family dashboard)
- **Prompt 6: Matching and Acceptance** (Admin assignment board, helper accept/decline queue, notifications)
- **Prompt 7: Payments** (Razorpay test mode order creation, checkout modal, verified webhook, receipts)
- **Prompt 8: Visits and Reviews** (Helper check-in, photo updates, check-out, emergency alert, review/ratings)
- **Prompt 9: Notifications and Admin Tools** (Notifications, incident handling, pricing management, audit log)
- **Prompt 10: Hardening and Launch** (Security audit, CORS, rate limiting, automated test suite, deployment docs)
