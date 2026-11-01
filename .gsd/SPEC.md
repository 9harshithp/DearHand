# DearHand Specification
Source: [SPEC.md](file:///home/gs/Downloads/DearHand/docs/SPEC.md)

DearHand gives adult children a verified, consistent helper who steps in for them when their parents need help at home.
Targeting families in Mysuru whose children work in Bengaluru or abroad.

## Architecture
- Backend: Java 17/21, Spring Boot 3, Spring Security with JWT, MySQL 8 with Flyway migrations
- Frontend: React with Vite, Tailwind CSS, responsive mobile-first UI with high contrast and readable typography
- Storage: Private file storage (local dev / AWS S3 signed URLs)
- Payments: Razorpay (test mode) with webhook verification
- Core roles: Family, Helper, Admin
