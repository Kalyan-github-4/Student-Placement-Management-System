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

## Phase 2: Core cycle (MVP) ✅

Status: complete (2026-10-27). Verified end to end against a production build, except real Cloudinary uploads, which need `CLOUDINARY_URL`.

Done when: **an eligible student can apply to an approved company's drive.**

Decisions made for this phase (they change the PRD):

- Students **register themselves** with name, email and password (any email domain for now; `STUDENT_EMAIL_DOMAIN` restricts it). TPO CSV import is dropped for now.
- Students fill in their own profile, including academic details. The **TPO verifies** the profile before the student can see or apply to drives; after that, academic fields lock and change only through correction requests.
- File storage is **Cloudinary** for now, behind `lib/storage.ts` so it can be swapped later.

Built:

- Student signup, email verification, profile with completeness indicator, submit for verification
- TPO verification queue: verify or send back with a reason (emailed), audit log snapshot of what was verified
- Correction requests for locked fields, approved or declined by the TPO (audited)
- Resume upload (PDF, 2 MB, up to 5, one default), checked by file signature; files are private and served through `/files/[id]` after an access check, as 5-minute signed links
- Company logo (public) and authorization letter (private) uploads
- Drives replace job postings: full fields, `DRAFT` / `PENDING_APPROVAL` / `OPEN` / `CLOSED` / `COMPLETED`; created by the TPO or proposed by a company and approved by the TPO
- `eligibility_criteria` (min CGPA, branches, batch, max backlogs, min 10th / 12th), enforced when listing and again when applying
- Students only see drives they're eligible for; apply with a chosen resume, withdraw before the deadline
- Applicant lists and CSV export for the company (no phone numbers) and the TPO (with phone numbers)
- Emails: profile verified / sent back, correction decision, drive approved / sent back, new eligible drive (sent after the response), application received

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
