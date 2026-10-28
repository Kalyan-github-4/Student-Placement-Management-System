# TRD: Student Placement Management System

Technical requirements for building the system described in the [PRD](./PRD%20Student%20Placement%20Management%20System.md). It covers the architecture, data model, security design and the technical requirements for each delivery phase in [PHASES.md](./PHASES.md).

Sections marked **Built** describe code that is in the repository. Sections marked **Planned** are the design for later phases and may change during implementation.

| | |
| --- | --- |
| Status | Phase 1 built, Phases 2–4 planned |
| Last updated | 27 Oct 2026 |
| Owner | Kalyan Manna |

## 1. Scope

The system is a single web application for one college. It serves four roles (Super Admin, TPO, Student, Recruiter) and runs the placement cycle: company onboarding, student records, drives, applications, selection rounds, offers and reports.

Out of scope for v1, as in the PRD: online tests and interviews, multiple colleges, native mobile apps, and the Department Coordinator role.

## 2. Technology stack

| Layer | Choice | Version | Notes |
| --- | --- | --- | --- |
| Framework | Next.js (App Router) | 16.4.0 | `cacheComponents` and `partialPrefetching` enabled |
| UI | React | 19.3.0 | Server Components by default |
| Language | TypeScript | 5.x | Strict mode |
| Styling | Tailwind CSS | 4.x | Plus shadcn components built on Base UI |
| Auth | Auth.js (`next-auth`) | 5.0.0-beta.32 | Credentials provider, JWT sessions |
| Database | PostgreSQL on Neon | — | Accessed through `@neondatabase/serverless` over HTTP |
| ORM | Drizzle ORM / drizzle-kit | 0.45 / 0.31 | Schema in `db/schema.ts` |
| Validation | Zod | 4.x | Shared between forms and server actions |
| Password hashing | bcryptjs | 3.x | Cost factor 10 |
| Email | Resend REST API | — | Console fallback in development |
| IDs | cuid2 | 3.x | Generated in the app, stored as `text` |

## 3. Architecture

### 3.1 Overview

```
Browser
  │  HTML / RSC stream, form posts (Server Actions)
  ▼
proxy.ts ──────────── optimistic role check on /admin, /tpo, /company, /student
  ▼
Next.js App Router
  ├─ Server Components (pages)  ── read data through lib/data/*
  ├─ Server Actions (actions.ts) ── validate (Zod) → authorize → write → audit
  └─ Route Handlers             ── /api/auth/*, /portal
        │
        ├─ lib/dal.ts          session → current user (re-read from DB)
        ├─ lib/data/*          server-only queries per portal
        ├─ lib/tokens.ts       one-time links
        ├─ lib/rate-limit.ts   fixed-window counters in Postgres
        ├─ lib/audit.ts        audit log inserts
        └─ lib/email.ts        Resend or console
        ▼
Neon PostgreSQL (HTTP driver)
```

### 3.2 Conventions

- **Reads** happen in Server Components through functions in `lib/data/*`. Every file there imports `server-only`.
- **Writes** happen only in Server Actions (`"use server"` files). Every action:
  1. calls `requireRole(...)` first,
  2. validates input with Zod,
  3. checks ownership or state (for example, the company is still `PENDING`),
  4. writes the change and its audit row in one `db.batch([...])`,
  5. sends email, then calls `refresh()` or `redirect()`.
- **Nothing but actions is exported from a `"use server"` file.** Any export from such a file becomes a public endpoint, so helpers live in `lib/`.
- **Forms** use `useActionState`. Actions return `FormState` (`{ errors, values, message }`), so the form can show per-field errors and refill what the user typed. Passwords are never echoed back.
- **Cache Components:** any component that reads cookies, `searchParams` or the database at request time sits inside a `<Suspense>` boundary. Portal pages get this from `PortalShell`. Public pages that read `searchParams` wrap that part in their own boundary.
- **No JavaScript clock in render paths:** expiry checks compare against the database's `now()`, not `new Date()`. Prerendering rejects reading the time, and the database clock is the authoritative one.

### 3.3 Database access constraints

The Neon HTTP driver does not support interactive transactions. Multi-statement writes use `db.batch([...])`, which Neon runs as one transaction. This rules out a read followed by a conditional write inside the same transaction, so:

- State changes include the expected state in the `WHERE` clause (for example `status IN ('PENDING')`). A stale request then updates nothing.
- Uniqueness relies on database constraints (`users.email`, `companies.domain`, `applications(student_id, job_id)`), not only on checks in code.

## 4. Project structure

```
app/
  (account)/            verify-email, verify-email/resend, forgot-password,
                        reset-password, activate  + shared actions/forms
  admin/                Super Admin portal
  company/              Recruiter portal
  tpo/                  TPO portal (companies, review, invite)
  student/              Student portal
  register/company/     Public company registration
  login/                Single login page
  portal/route.ts       Post-login redirect by role
  api/auth/[...nextauth]/
components/
  auth/  company/  forms/  portal/  landing/  ui/
db/
  schema.ts  seed.ts  reset.ts  index.ts
lib/
  dal.ts  roles.ts  tokens.ts  rate-limit.ts  audit.ts
  email.ts  emails.ts  forms.ts  company.ts  eligibility.ts  branches.ts
  data/  admin.ts  company.ts  invites.ts  student.ts  tpo.ts
auth.ts  proxy.ts
```

## 5. Authentication (Built)

### 5.1 Login

- One login page (`/login`) for every role. The form sends only email and password, and the role comes from `users.role`.
- On success, Auth.js redirects to `/portal`, which redirects to the role's portal: `/admin`, `/tpo`, `/company` or `/student`.
- `authorize()` in `auth.ts` runs these checks in order:

| Step | Check | Result if it fails |
| --- | --- | --- |
| 1 | Rate limit: 30 attempts per IP per 15 minutes | `rate_limited` |
| 2 | User exists and has a password | Generic "invalid email or password" |
| 3 | `locked_until` is in the past | `locked` |
| 4 | bcrypt compare | Increment `failed_login_count`; on the 5th failure set `locked_until = now + 15 min` and reset the counter |
| 5 | `email_verified` is set | `unverified` (the form links to resend verification) |
| 6 | `status` is not `SUSPENDED` | `suspended` |
| 7 | Success | Reset the counter, clear the lock, set `last_login` |

### 5.2 Session

- Auth.js JWT session in an httpOnly cookie with an 8-hour maximum age. The token carries `id`, `role` and `status`.
- **Deviation from the PRD:** the PRD asks for a short-lived access token plus a refresh token. Instead, `lib/dal.ts` re-reads the user's role and status from the database on every portal request (`getCurrentUser`, memoized per request with React `cache`). A suspension or role change therefore takes effect on the next request, which is what the refresh-token design was meant to achieve, without a token-rotation endpoint.
- `proxy.ts` makes an optimistic redirect from the JWT alone. The real check is `requireRole()` in every page and action.

### 5.3 One-time links

| Purpose | Token type | Lifetime | Created by |
| --- | --- | --- | --- |
| Verify email | `EMAIL_VERIFICATION` | 24 hours | Company registration, resend form |
| Reset password | `PASSWORD_RESET` | 1 hour | Forgot-password form |
| Activate account | `ACCOUNT_ACTIVATION` | 7 days | Super Admin creating a TPO (Phase 2: student import) |
| Company invite | `company_invites` row | 14 days | TPO invite form |

- Tokens are 32 random bytes, base64url-encoded. Only the SHA-256 hash is stored.
- Issuing a token revokes any unused token of the same type for that user.
- Using a token is a single conditional `UPDATE ... WHERE used_at IS NULL AND expires_at > now()`, so a link cannot be used twice even under concurrent requests.
- Email verification needs a button press on the page, not just a page load. This stops email link scanners from consuming the token.
- Forgot-password and resend-verification give the same answer whether or not the account exists.

### 5.4 Account status rules

| Event | `users.status` | `email_verified` |
| --- | --- | --- |
| Recruiter registers | `PENDING` | null |
| Recruiter verifies email | `ACTIVE` | set |
| Recruiter registers through an invite | `ACTIVE` | set at signup |
| Super Admin creates TPO | `PENDING` | null |
| TPO activates (sets password) | `ACTIVE` | set |
| Password reset completed | Recruiter `PENDING` → `ACTIVE`; others unchanged | set if empty |
| Super Admin disables TPO | `SUSPENDED` | — |
| Super Admin re-enables TPO | `ACTIVE` if a password exists, otherwise `PENDING` | — |
| Student imported or verified by TPO (Phase 2) | `ACTIVE` | set on activation |

## 6. Authorization

### 6.1 Role to portal

| Role | Portal | Created by |
| --- | --- | --- |
| `SUPER_ADMIN` | `/admin` | Seed script only |
| `TPO` | `/tpo` | Super Admin |
| `RECRUITER` | `/company` | Self-registration or TPO invite |
| `STUDENT` | `/student` | Seed today; TPO import or self-signup in Phase 2 |

### 6.2 Enforcement

- **Role:** `requireRole(role)` in every page and Server Action. It redirects signed-out users to `/login`, suspended users to `/login?error=suspended`, and users with the wrong role to their own portal.
- **Ownership:** each action loads the record through the current user. For example, `updateCompany` finds the company through the recruiter's `company_users` row, never from a submitted ID. Phase 2 and 3 actions follow the same rule: a recruiter reaches applicants only through drives of their own company, and a student only their own applications.
- **State:** each action checks the record is in an allowed state before changing it (see section 8).

### 6.3 Known gap

The PRD permission matrix lets Super Admin approve companies and import students. In Phase 1, Super Admin manages TPO accounts only. Closing this needs `requireRole` to accept a list of roles and `/tpo` to admit `SUPER_ADMIN`, scheduled for Phase 4.

## 7. Data model

### 7.1 Enums (Built)

| Enum | Values |
| --- | --- |
| `role` | `SUPER_ADMIN`, `TPO`, `STUDENT`, `RECRUITER` |
| `user_status` | `PENDING`, `ACTIVE`, `SUSPENDED` |
| `company_status` | `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| `token_type` | `EMAIL_VERIFICATION`, `PASSWORD_RESET`, `ACCOUNT_ACTIVATION` |
| `approval_status` | `PENDING`, `APPROVED`, `REJECTED` (job postings; replaced in Phase 2) |
| `application_status` | `APPLIED`, `SHORTLISTED`, `REJECTED`, `HIRED` (replaced in Phase 2) |

### 7.2 Tables (Built)

All IDs are `text` cuid2 values. Timestamps are `timestamp` without time zone, written in UTC.

**users**: login for every role

| Column | Type | Notes |
| --- | --- | --- |
| id | text PK | |
| email | text unique | Stored lowercase |
| password_hash | text null | Null until an invited user sets a password |
| role | role | |
| status | user_status | Default `PENDING` |
| email_verified | timestamp null | |
| failed_login_count | integer | Default 0 |
| locked_until | timestamp null | |
| last_login | timestamp null | |
| created_at | timestamp | |

**auth_tokens**: `id`, `user_id` → users (cascade), `type`, `token_hash` unique, `expires_at`, `used_at`, `created_at`. Index on `user_id`.

**rate_limits**: `key` PK (for example `login:<ip>`, `reset:<email>`), `count`, `window_start`.

**tpo_profiles**: `user_id` PK → users (cascade), `name`, `designation`, `created_by` → users (set null), `created_at`.

**companies**

| Column | Type | Notes |
| --- | --- | --- |
| id | text PK | |
| name, website, industry, size, address, linkedin_url | text | Required |
| domain | text unique | Host of `website` without `www.`; one company per domain |
| description | text null | |
| gstin_or_cin, pan | text null | GSTIN/CIN required before approval |
| hiring_roles, hiring_ctc, hiring_batch | text null | Hiring intent |
| status | company_status | Default `PENDING` |
| rejection_reason | text null | Also holds the suspension reason |
| reviewed_by | text null → users | Last TPO decision |
| reviewed_at | timestamp null | |
| created_at, updated_at | timestamp | `updated_at` is set by the app on every update |

**company_users**: `user_id` PK → users (cascade), `company_id` → companies (cascade), `name`, `designation`, `phone`, `is_admin`, `created_at`. The first recruiter is the company admin.

**company_invites**: `id`, `email`, `company_name`, `token_hash` unique, `invited_by` → users, `expires_at`, `accepted_at`, `created_at`.

**audit_logs**: `id`, `actor_id` → users (set null), `action` (for example `company.approved`), `entity`, `entity_id`, `before` jsonb, `after` jsonb, `at`. Index on `(entity, entity_id)`. The app only inserts into this table.

**student_profiles**, **job_postings**, **applications**: unchanged from before Phase 1 except that `job_postings.company_id` now references `companies`. They are replaced in Phase 2.

### 7.3 Phase 2 changes (Planned)

| Change | Detail |
| --- | --- |
| `student_profiles` → `students` | Add `batch`, `marks_10`, `marks_12`, `skills text[]`, `github_url`, `linkedin_url`, `portfolio_url`, `verified_by`, `verified_at`. Rename `backlogs` to `active_backlogs`. Academic fields become TPO-only. |
| `documents` | `id`, `owner_id` → users, `type` (`RESUME`, `LOGO`, `AUTH_LETTER`, `OFFER_LETTER`), `storage_key`, `file_name`, `mime_type`, `size`, `is_default`, `created_at` |
| `correction_requests` | `id`, `student_id`, `field`, `current_value`, `requested_value`, `reason`, `status` (`PENDING`/`APPROVED`/`REJECTED`), `reviewed_by`, `reviewed_at` |
| `job_postings` → `drives` | `title`, `type` (`FULL_TIME`/`INTERNSHIP`/`BOTH`), `ctc` (numeric, LPA), `stipend`, `location`, `jd`, `bond_details`, `deadline`, `tier`, `status` (`drive_status`), `created_by`, `rejection_reason` |
| `eligibility_criteria` | `drive_id` PK → drives, `min_cgpa`, `branches text[]`, `batch`, `max_backlogs`, `min_10`, `min_12` |
| `applications` | `job_id` → `drive_id`, add `resume_id` → documents, `withdrawn_at`; status uses the PRD values |
| New enums | `drive_status`: `DRAFT`, `PENDING_APPROVAL`, `OPEN`, `CLOSED`, `COMPLETED`. `application_status`: `APPLIED`, `SHORTLISTED`, `IN_PROCESS`, `SELECTED`, `REJECTED`, `WITHDRAWN` |

### 7.4 Phase 3 and 4 tables (Planned)

| Table | Columns |
| --- | --- |
| `rounds` | `id`, `drive_id`, `order`, `name`, `scheduled_at`, `mode` (`ONLINE`/`OFFLINE`), `venue_or_link`; unique `(drive_id, order)` |
| `round_results` | `round_id`, `application_id`, `result` (`CLEARED`/`NOT_CLEARED`), `remarks`; PK `(round_id, application_id)` |
| `offers` | `id`, `application_id` unique, `ctc`, `role`, `joining_date`, `letter_document_id`, `status` (`ISSUED`/`ACCEPTED`/`DECLINED`/`EXPIRED`), `respond_by`, `responded_at` |
| `placement_policy` | One row: `mode` (`ONE_OFFER`/`TIER_UPGRADE`), `offer_response_days`, tier CTC thresholds |
| `eligibility_exceptions` | `drive_id`, `student_id`, `reason`, `granted_by`, `created_at` |
| `notifications` (Phase 4) | `id`, `user_id`, `type`, `payload` jsonb, `read_at`, `created_at` |

### 7.5 Delete behaviour

Profile and membership rows cascade from `users`. Company data cascades from `companies`. References to reviewers and actors (`reviewed_by`, `invited_by`, `audit_logs.actor_id`) use `set null`, so deleting a staff account never deletes history. Audit rows are never deleted by the app.

## 8. State machines

**Company** (Built)

```
            register                    approve (GSTIN/CIN + verified recruiter)
  (none) ───────────► PENDING ──────────────────────────────► APPROVED
            invite ─────────────────────────────────────────►    │  ▲
                        │ reject (reason)                suspend │  │ reinstate
                        ▼                               (reason) ▼  │
                     REJECTED ── recruiter edits & saves ──►  SUSPENDED
                        └────────────► PENDING
```

| Transition | Allowed from | Who | Side effects |
| --- | --- | --- | --- |
| approve | `PENDING` | TPO | Email recruiter, audit row |
| reject | `PENDING` | TPO | Reason required (5–500 chars), email, audit |
| suspend | `APPROVED` | TPO | Reason required; openings hidden from students; email, audit |
| reinstate | `SUSPENDED` | TPO | Email, audit |
| resubmit | `REJECTED` | Company admin saving the profile | Back to `PENDING`, reason cleared, audit |

After approval, `name`, `website`, `gstin_or_cin` and `pan` are locked for the recruiter. Changing them goes through the TPO.

**Drive** (Planned): `DRAFT` → `PENDING_APPROVAL` (recruiter proposes) → `OPEN` (TPO approves) → `CLOSED` (deadline passes or TPO closes) → `COMPLETED` (results final). A TPO-created drive can go from `DRAFT` straight to `OPEN`. A drive is visible to students only when it is `OPEN` and its company is `APPROVED`.

**Application** (Planned): `APPLIED` → `SHORTLISTED` → `IN_PROCESS` → `SELECTED` or `REJECTED`. `WITHDRAWN` is allowed from `APPLIED` before the deadline.

**Offer** (Planned): `ISSUED` → `ACCEPTED` or `DECLINED` by the student before `respond_by`, otherwise `EXPIRED` (checked on read and by a daily job).

## 9. Functional modules

### 9.1 Phase 1: Foundation (Built)

| Module | Routes | Key requirements |
| --- | --- | --- |
| Login and account | `/login`, `/portal`, `/verify-email`, `/verify-email/resend`, `/forgot-password`, `/reset-password`, `/activate` | Section 5 |
| Company registration | `/register/company`, `/register/company?invite=<token>` | Section 9.1.1 |
| Company portal | `/company`, `/company/profile/edit` | Status banner with reason; only the company admin edits; suspended companies are read-only |
| TPO portal | `/tpo`, `/tpo/companies?status=`, `/tpo/companies/[id]`, `/tpo/invite` | Counts by status, review queue, decisions, history from `audit_logs`, invitations list |
| Super Admin | `/admin` | Create TPO (sends activation), disable / enable, resend activation |

#### 9.1.1 Company registration rules

- **Personal email domains blocked:** gmail, yahoo, outlook, hotmail, icloud, proton, rediffmail and others (list in `lib/company.ts`).
- **Email must match the website:** `hr@acme.com` matches `acme.com`, `careers.acme.com` and `www.acme.com`.
- **One company per domain:** a second recruiter from the same domain is told to ask their company admin. Inviting colleagues comes in Phase 4.
- **GSTIN or CIN** is optional at signup but required before approval. Format: a 15-character alphanumeric GSTIN or a 21-character CIN. PAN, if given, must match `AAAAA9999A`.
- **Password policy:** 8–72 characters with at least one letter and one number. The 72-character limit is bcrypt's input limit.
- **Signup rate limit:** 5 per IP per hour.
- **Atomic creation:** user, company and membership rows are written in one batch. With an invite, the company is created `APPROVED`, the email counts as verified, and the invite is marked accepted in the same batch.

### 9.2 Phase 2: Core cycle (Planned)

| Module | Requirements |
| --- | --- |
| File storage | Section 11 |
| Student import | TPO uploads a CSV with columns `roll_no, name, college_email, branch, batch, cgpa, backlogs`. The server parses and validates **every row before writing anything**. Errors are reported per row and column (bad email, unknown branch, CGPA outside 0–10, duplicate roll number in the file or database). Valid files are written in batches of 500 rows, then each student gets an activation email. Maximum 5,000 rows per file. |
| Student self-signup | Only addresses on the college domain (`COLLEGE_EMAIL_DOMAIN`). Status stays `PENDING` until a TPO verifies the student. |
| Student profile | Students edit contact details, skills, links and resumes. CGPA, backlogs, branch, batch and marks are read-only to students and change only through a correction request the TPO approves (audited). |
| Resumes | PDF only, at most 2 MB, several per student, one default. |
| Drives | CRUD for TPO. Recruiters of approved companies create drafts and submit them for approval. Eligibility criteria are stored with the drive. |
| Eligibility | One pure function, `eligibilityIssues(student, criteria)`, used by both listing and applying. Listing filters on the server, and applying re-checks inside the action. An ineligible apply is rejected. |
| Applications | Apply with a chosen resume before the deadline. Unique per (student, drive). Withdraw before the deadline. Recruiter and TPO can export applicants as CSV. |
| Email | New eligible drive (digest, at most one per student per day), application received. |

### 9.3 Phase 3: Selection (Planned)

| Module | Requirements |
| --- | --- |
| Rounds | Ordered rounds per drive with date, mode and venue or link. Editable until results exist. |
| Results | Set per student per round, or upload a CSV of `roll_no, result, remarks`, validated like the import. Not clearing a round sets the application to `REJECTED`; clearing the last round enables recording an offer. |
| Offers | Record CTC, role, joining date and offer letter (PDF). Student accepts or declines before `respond_by`. |
| Placement policy | Configurable by the TPO. `ONE_OFFER`: an accepted offer blocks further applications. `TIER_UPGRADE`: a placed student may only apply to drives of a higher tier. Enforced in the apply action and shown on the drive page. |
| Email | Shortlist, round scheduled, round result, offer issued, offer about to expire. |

### 9.4 Phase 4: Insight and hardening (Planned)

| Module | Requirements |
| --- | --- |
| Reports | Placed vs unplaced count and percentage, overall and by branch and batch; highest, average and median CTC of accepted offers; company-wise hires. Computed with SQL aggregates on request; no stored report tables. |
| Exports | CSV for every report and applicant list. Excel and PDF as P1. |
| Audit viewer | TPO and Super Admin can filter by actor, entity, action and date. Read-only. |
| Notifications | In-app list from `notifications`, unread badge in the portal header. |
| Company team | Company admin invites colleagues from the same email domain. |
| Privacy (DPDP) | Consent checkbox at signup stored with a timestamp; student data download (JSON/CSV); deletion request queue for graduated students. |

## 10. Email (Built)

- `lib/email.ts` sends through the Resend REST API when `RESEND_API_KEY` is set. Without it, the message and its links are printed to the server console.
- The sender comes from `EMAIL_FROM` and must be on a domain verified in Resend. Until then, `onboarding@resend.dev` can deliver only to the Resend account owner's address.
- Each message is sent as plain text and simple HTML. Links are absolute, built from `APP_URL`.
- A failed send is logged and never thrown, so a mail outage cannot fail the action that sent it.
- Templates live in `lib/emails.ts`: verification, password reset, TPO activation, company invite, approved, rejected, suspended, reinstated.

## 11. File storage (Planned, Phase 2)

**Decision pending:** Vercel Blob or an S3-compatible bucket (AWS S3 or Cloudflare R2). The requirements are the same either way:

- Files are private. They are never served from a public URL.
- Downloads go through a server route that checks the viewer may see the file (owner, TPO, or a recruiter of a drive the student applied to), then redirects to a signed URL valid for 5 minutes.
- Type and size are checked on the server, using magic bytes as well as the declared MIME type. Limits: resume and offer letter PDF 2 MB, authorization letter PDF 2 MB, logo PNG or JPG 1 MB.
- Storage keys are random (`<owner-id>/<cuid>.<ext>`); the original file name is kept only in the `documents` table.
- Deleting a document deletes the object.

## 12. Audit logging

- Every TPO and Super Admin change writes an `audit_logs` row in the same batch as the change.
- Phase 1 actions: `company.approved`, `company.rejected`, `company.suspended`, `company.reinstated`, `company.resubmitted`, `company.approved_via_invite`, `company.invited`, `tpo.created`, `tpo.enabled`, `tpo.disabled`.
- Later phases add academic edits, correction decisions, drive approvals, eligibility exceptions, result uploads and offer changes.
- `before` and `after` hold only the fields that changed, never password hashes or tokens.
- Retention is at least 3 years (PRD). No code path updates or deletes audit rows. Restricting database permissions to `INSERT` and `SELECT` on this table is a Phase 4 hardening task.

## 13. Security requirements

| Area | Requirement | Status |
| --- | --- | --- |
| Passwords | bcrypt, cost 10; never logged or returned to forms | Built |
| Brute force | 5 failures lock the account for 15 minutes; 30 login attempts per IP per 15 minutes | Built |
| Abuse | Rate limits: signup 5/IP/hour; reset and resend 10/IP/hour and 3/email/hour | Built |
| Account discovery | Forgot-password and resend give the same response for any email | Built |
| Tokens | Hashed at rest, single use, short-lived, revoked when reissued | Built |
| Authorization | Role and ownership checked in every action; proxy check is advisory only | Built |
| CSRF | Server Actions check the `Origin` header; Auth.js uses its own CSRF token | Built (framework) |
| Input | Zod validation on every action; field length caps | Built |
| Output | React escapes rendered text; email HTML is escaped in `lib/email.ts` | Built |
| Secrets | Only in environment variables; `.env` is git-ignored | Built |
| Uploads | Section 11 | Planned |
| Transport | HTTPS only in production (host-level); HSTS header | Planned (Phase 4) |
| Headers | Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'` | Planned (Phase 4) |
| Privacy | Recruiters see applicant phone and address only after shortlisting (configurable) | Planned (Phase 2) |

## 14. Performance and reliability

- **Load target:** about 3,000 students and 200 companies a year, with a few hundred concurrent users at drive deadlines.
- **Page target:** under 2 seconds on 4G. Static shells are prerendered, and session-dependent content streams in behind Suspense.
- **Queries:** lists are bounded (invites capped at 50; Phase 2 lists paginated at 50 rows). Foreign keys used in filters are indexed.
- **Deadline load:** applying is one eligibility read plus one insert protected by a unique constraint. Before the first live drive, run a load test of 300 concurrent applies (PRD risk).
- **Backups:** Neon point-in-time restore, with a retention of at least 30 days on the production branch.
- **Rate-limit table growth:** rows are reused per key. A periodic `DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'` is a Phase 4 task.

## 15. Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon connection string |
| `AUTH_SECRET` | Yes | Signs and encrypts the session cookie (`npx auth secret`) |
| `AUTH_TRUST_HOST` | For `next start` outside Vercel | Lets Auth.js accept the request host |
| `APP_URL` | Yes in production | Base URL for links in emails |
| `RESEND_API_KEY` | No (dev) / Yes (prod) | Enables real email |
| `EMAIL_FROM` | With Resend | Sender on a verified domain |
| `COLLEGE_EMAIL_DOMAIN` | Phase 2 | Allowed domain for student self-signup |
| Storage credentials | Phase 2 | Depends on the storage decision |

## 16. Environments and database changes

- **Development:** `npm run db:reset` drops the schema, pushes `db/schema.ts` with `drizzle-kit push --force`, and seeds demo data. It refuses to run when `NODE_ENV=production`.
- **Production:** never use `push` or `reset`. Generate versioned SQL with `npm run db:generate`, review it, and apply it with `npm run db:migrate`. The `drizzle/` folder is committed. This switch happens before the first production deployment.
- **Seed accounts:** demo only. Production gets one Super Admin created by a one-off script with a strong password, and nothing else.

## 17. Testing

| Level | Approach | Status |
| --- | --- | --- |
| Static | `tsc --noEmit`, ESLint, `next build` (also checks Suspense and prerender rules) | Run on every change |
| End-to-end | Phase 1 was verified against a production build by a script that posts the real forms and calls the Auth.js credentials endpoint. It covers registration rules, verification, pending access, TPO decisions, lockout, password reset, TPO activation, invites and student visibility (28 checks). | Done manually |
| Planned | Move the end-to-end checks to Playwright under `tests/e2e`, plus unit tests for `eligibilityIssues`, `emailMatchesDomain` and the CSV validators. Run all of it in CI on pull requests. | Phase 2 |

## 18. Known limitations

- `docs/ERD.md` and `docs/erd-chen.svg` still show the pre-Phase-1 schema. Section 7 of this document is current.
- Until Phase 2, students can still edit their own CGPA and backlogs, and openings are the old `job_postings` with advisory criteria.
- Super Admin cannot yet act on companies or students (section 6.3).
- Company logo and authorization letter uploads wait for file storage.
- The current Next.js version (16.4.0) has a published security advisory. Upgrade before deploying.

## 19. Open questions

From the PRD, with the phase that needs the answer:

| Question | Needed by |
| --- | --- |
| File storage provider (section 11) | Phase 2 start |
| College email domain for student self-signup | Phase 2 |
| Do companies see student phone numbers before shortlisting? | Phase 2 |
| Are pre-final-year internships run through the same drives? | Phase 2 |
| Placement policy: one offer and out, or tier upgrades? | Phase 3 |
| GSTIN/CIN checked manually or through a verification API? | Phase 4 (manual in v1) |
| Department Coordinators in v1? | Deferred to v2 |
