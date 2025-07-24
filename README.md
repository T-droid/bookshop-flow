📘 Bookshop IMS – Developer Onboarding Guide
🛠 Overview
Bookshop IMS is a multi-tenant inventory management system built specifically for bookshops. It allows shop owners to manage inventory, suppliers, purchases, taxes, and sales — with support for auditing and role-based access. The system is secure, scalable, and built with clean code principles (SOLID, DRY, KISS) to ensure long-term maintainability.

📦 Tech Stack
Frontend
Framework: Next.js

Styling: Tailwind CSS

Bundler: Vite via plugin for Next.js or used separately in components

Language: TypeScript

Backend
Framework: FastAPI

Database: SQLite (PostgreSQL or MySQL may be used in future production deployments)

Authentication: Passkeys (WebAuthn), OTP, and optional 2FA

👥 User Roles
Manager: Full access (create users, manage inventory, view reports, handle taxes).

Cashier: Limited access (record sales, view inventory).

Each bookshop operates in isolation (multi-tenant setup). Users and data are scoped per shop.

🔐 Security Architecture
Authentication:

Passkey-based login using WebAuthn

OTP verification during device/browser switch

Optional TOTP-based 2FA (e.g., Google Authenticator)

Authorization:

Role-based access control at both frontend and backend

Audit Logs:

Every change to inventory, purchases, or settings is logged

Input Sanitization:

Both frontend and backend validate and sanitize input

Rate Limiting & Protection:

Basic rate limiting in API

Helmet (on frontend) for common web security headers

🏗 Folder Structure (Simplified)
Frontend (Next.js)
```bash
/app
  /dashboard
  /auth
/components
  /ui (Radix UI wrappers, inputs, modals)
  /common
/hooks
/styles
/utils
```

Backend (FastAPI)
```bash
/app
  /db
    /models (SQLAlchemy models)
  /modules
    **_routes.py
    **_service.py
    **_model.py
```
⚙️ Setup Instructions
1. Clone the Repo
```bash
git clone https://github.com/T-droid/bookshop_flow.git
cd bookshop-ims
```

2. Frontend Setup (Next.js)
```bash
cd frontend
pnpm install
pnpm run dev
```
If using Vite as a plugin or separately, refer to the /vite.config.ts if present.

3. Backend Setup (FastAPI)
```bash
cd bookshop_backend
uv install
uv run fastapi dev
```
Create .env file based on .env.example.

4. Database Migration
SQLite is used in dev mode. To create tables:

```bash
alembic upgrade head
```
🧪 Developer Guidelines
Write clean, modular, SOLID-compliant code

Use TypeScript types and FastAPI Pydantic models

Validate all input both client-side and server-side

Write unit tests (Pytest or Vitest) for each business-critical module

All changes must pass linting and tests

Use meaningful commit messages (Conventional Commits encouraged)

🔍 Features (In Progress / Planned)
✅ Inventory and Sales per Bookshop

✅ Supplier and Purchase Management

✅ Role-based Login

✅ Audit Logs

✅ Tax configuration per shop

🔐 Passkey + OTP + 2FA Authentication

📦 Multi-tenancy Support (data isolation)

📊 Reporting and Analytics (upcoming)

🤝 Collaboration & Git Workflow
Feature branches: feature/<name>

Use Pull Requests for all changes

Code review is mandatory before merge

Work items are tracked via issues

📞 Support
Reach out to the lead dev or maintainer via Email/GitHub issues if you're stuck. Document bugs, edge cases, and assumptions clearly.
