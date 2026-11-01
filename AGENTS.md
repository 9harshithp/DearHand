# DearHand Project Rules

Project: DearHand, a platform where families book verified helpers for elderly parents.
Source of truth: docs/SPEC.md. Follow its schema, API list and status flow exactly.
Stack: Java 17 (or compatible Java 21), Spring Boot 3, Spring Security with JWT, MySQL 8 with Flyway migrations; React with Vite and Tailwind CSS.
Rules:
- Small commits
- No secrets in code
- Validate all input
- Check role and ownership on every endpoint
- Write tests for each service
- Large readable text and high contrast in the UI (minimum 16px font, 44px tap targets)
- Before big changes, show a plan and wait for approval.
