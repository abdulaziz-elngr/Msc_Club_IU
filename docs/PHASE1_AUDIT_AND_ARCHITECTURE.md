# Phase 1 — Audit & Architecture

## 1. Audit findings (existing project)

Stack: React 19 + Vite 8 + Tailwind 4 (SPA, hash routing) served by an Express server (`server.ts`, `tsx`). ~11k lines.

| # | Finding | Impact |
|---|---------|--------|
| A1 | **Frontend never calls the backend.** `src/lib/api.ts` is imported nowhere. All state lives in `AppContext.tsx` (2.2k lines) seeded from in-file `SEED_*` arrays and persisted in **browser localStorage** (35 usages). | No shared database exists: admin changes cannot reach other visitors. Core requirement #5 cannot be met without rewiring the data layer. |
| A2 | **No authentication.** Roles (`STUDENT/TEAM_LEAD/ADMIN`) are switched by a client button; the server tracks a single global `currentActingUserId` (`/api/auth/switch-role` is open to anyone). | Anyone can become admin. Must be replaced entirely (Phase 7 enforces; Phase 2 introduces real login). |
| A3 | Server DB is a single `data/db.json` rewritten in-process; no relations, constraints, migrations or concurrency safety. | Unsuitable for production → migrate. |
| A4 | Backend has Events/Registrations/HMAC pass token and a basic `/events/checkin`, but no QR image, email, check-out, capacity/duplicate DB constraints, audit of corrections, or exports per event. | Rebuild on the new DB, reuse the token idea. |
| A5 | Hard-coded fallback HMAC secret in source (`innovation-university-msc-secret-key-2026`). | Must be env-only, fail-fast in production. |
| A6 | `package.json`: `esbuild ^0.25` conflicts with Vite 8 peer → **`npm install` fails** (ERESOLVE). | **Fixed in this delivery** (`esbuild ^0.27`). |
| A7 | `.env.example`/README are AI-Studio boilerplate (Gemini key unused by code). | Replaced in final delivery. |
| A8 | Public pages (Home, About, Teams, News, Workshops, Projects, Learning, Resources, Contact) render from hard-coded seed content and i18n strings (EN/AR). | CMS must serve this content from DB with EN/AR fields, keeping current defaults as seed data. |

Baseline: `tsc --noEmit` clean, `vite build` succeeds (after A6 fix).

## 2. Decisions

- **Database: SQLite (WAL, foreign keys ON) via `better-sqlite3`**, SQL migration files + small runner (`server/migrations/*.sql`, `schema_migrations` table). Verified installable here. Single-node club deployment; schema is portable to Postgres if scale demands.
- **Existing data preserved:** one-time importer `db.json` → SQLite (users, events, registrations, projects, resources, certificates, XP, audit logs, etc.); seed content from `AppContext` SEED_* becomes CMS rows so the public site looks identical on day one.
- **Auth:** email+password (bcrypt), JWT in `HttpOnly; SameSite=Lax; Secure(prod)` cookie, server-side session check on every request, login rate limiting. Role switcher removed.
- **Authorization:** permission strings (`events.manage`, `members.manage`, `content.manage`, `attendance.manage`, `roles.manage`, …) attached to **roles**; **membership ranks** are a separate table (title/ordering only, no permissions). Middleware `requirePermission()` on every protected route. Built-in roles: Super Admin, Event Manager, Member Manager, Content Manager; Super Admin can create custom roles.
- **QR:** token = 32-byte random (`crypto.randomBytes`), stored **hashed (SHA-256)** with event_id/member_id/status; QR encodes only an opaque `MSC1.<token>` string. Scan validates server-side (exists, not revoked, event matches, event not cancelled).
- **Email:** Nodemailer over SMTP, configured only by env (`SMTP_HOST/PORT/USER/PASS/FROM`); every send logged in `email_logs` (QUEUED/SENT/FAILED + error). Resend endpoint for admins.
- **Uploads:** multer to `uploads/` (type/size allow-list), rows in `media`.
- **Frontend strategy (no rewrite):** keep all pages/components/design. Replace the localStorage-backed parts of `AppContext` with API-backed state (React data hooks), page by page; add new dashboard pages (Members, Events, Attendance, Content, Roles) in the existing admin style.

## 3. Schema (target)

`users`(id, email, password_hash, role_id, status) · `members`(id, user_id, unique_code, name, name_ar, phone, avatar_media_id, rank_id, status, joined_at) · `ranks`(id, title, title_ar, sort_order) · `roles`, `role_permissions`(role_id, permission) · `events`(id, slug, title…, image, location, starts_at, ends_at, capacity, reg_deadline, eligibility, status DRAFT/PUBLISHED/CANCELLED) · `registrations`(id, event_id, member_id, status, UNIQUE(event_id, member_id)) · `qr_tokens`(id, registration_id UNIQUE, token_hash UNIQUE, revoked_at) · `attendance`(id, registration_id, checked_in_at, checked_out_at, method SCAN/MANUAL, by_user_id) · `attendance_corrections` / `audit_logs`(actor, action, target, before/after JSON, ip, at) · `email_logs`(registration_id, to, subject, status, error, sent_at) · `content_blocks`(page, key, data JSON EN/AR, published, sort_order) · `nav_items`, `site_settings`(contact, socials, footer, branding) · `news`, `workshops`, `projects`, `teams`, `learning_items`, `resources` (each: published, sort_order) · `media`.

## 4. Phase plan

1. ✅ Audit & architecture (this doc, esbuild fix)
2. DB + migrations + importer, auth, members, ranks, profiles
3. Events + registration (duplicate/capacity enforced by DB + API)
4. QR + email + resend + logs
5. Attendance page (camera scan, check-in/out, manual, corrections, stats, CSV/XLSX)
6. CMS for all public content + rewire public pages
7. Roles/permissions UI + backend enforcement + security hardening
8. Automated test suite, test report, final ZIP

## 5. Risk to flag
A1 is larger than "adding features": every public page currently reads localStorage seed data, so Phases 2–6 include migrating that layer to the API. Existing visuals/branding are untouched.
