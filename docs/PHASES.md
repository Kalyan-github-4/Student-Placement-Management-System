# Build phases

How the [PRD](../PRD%20Student%20Placement%20Management%20System.md) is being delivered. Each phase ends with a working, buildable app and a "done when" check from the PRD release plan.

Decisions made up front:

- The dev database is disposable: each phase that reshapes the schema runs `npm run db:reset` (drop, push, seed).
- Email goes through Resend when `RESEND_API_KEY` is set; otherwise every email (with its links) is printed to the server console.
- Auth stays on NextAuth with a JWT session in an httpOnly cookie. The user's role and status are re-read from the database on every portal request, so a suspension takes effect right away.

## Phase 1: Foundation ✅

Status: complete (2026-10-26). Verified end to end against a production build.

Done when: **a company can register and be approved by the TPO.**

- Schema: roles `SUPER_ADMIN`, `TPO`, `STUDENT`, `RECRUITER`; `users.status`, email verification, lockout fields; `companies` + `company_users`; `tpo_profiles`; `auth_tokens`; `company_invites`; `audit_logs`
- One login page for all roles (no role picker); role read from the account
- Email verification, forgot / reset password, lockout after 5 failed logins, rate limiting on login, signup and reset
- Super Admin portal (`/admin`): create TPO accounts (activation link), disable / enable them
- Company registration (`/register/company`): PRD fields, free email providers blocked, email domain must match the website
- Company portal (`/company`): pending / rejected / approved states, profile editing, resubmission after rejection
- TPO portal (`/tpo`): review companies, approve / reject with reason / suspend / reinstate, invite a company (invite link registers it as approved)
- Audit log entries for every admin and TPO change

Deferred to Phase 2 (needs file storage): company logo and authorization letter uploads.

## Phase 2: Core cycle (MVP)

Done when: **an eligible student can apply to an approved company's drive.**

- File storage for resumes, logos and documents (private, served through short-lived signed URLs)
- Students table per PRD (batch, 10th / 12th marks, skills, links, `verified_by`)
- TPO bulk CSV import with row-level validation before saving; activation emails
- Student self-signup with the college email domain, pending until TPO verifies
- Academic fields locked for students; correction requests approved by the TPO
- Resume upload (PDF, 2 MB) with a default resume
- Drives replace job postings: full fields, `DRAFT` / `PENDING_APPROVAL` / `OPEN` / `CLOSED` / `COMPLETED`, created by TPO or proposed by a company
- `eligibility_criteria` (min CGPA, branches, batch, max backlogs, min 10th / 12th), enforced when listing and when applying
- Applications with the PRD statuses, apply with a chosen resume, withdraw before the deadline, applicant CSV export
- Emails: new eligible drive, application events

## Phase 3: Selection

Done when: **a drive runs from shortlist to accepted offer.**

- Ordered rounds per drive (date, mode, venue or link)
- Round results per student, with bulk CSV upload
- Offers (CTC, role, joining date, offer letter), accept / decline window, expiry
- Configurable placement policy and tiers (Regular / Dream / Super Dream)
- Emails for shortlist, round results and offers

Needs an answer first: which placement policy applies (PRD open question).

## Phase 4: Insight and hardening

Done when: **the TPO can pull the season report without spreadsheets.**

- Reports: placed vs unplaced (overall and per branch), highest / average / median CTC, company-wise hiring
- Audit log viewer, exports (CSV / Excel)
- In-app notification centre
- Multiple recruiters per company (Company Admin invites colleagues)
- Eligibility exceptions, profile completeness indicator
- DPDP basics: consent at signup, student data download and deletion request
- Security review: role + ownership checks on every action, upload checks, rate limits, headers
