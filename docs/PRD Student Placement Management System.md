# PRD: Student Placement Management System

Oct 26, 2026 · @Kalyan Manna

## Overview

A single web portal where the Training & Placement Office (TPO), verified companies and students run the full campus placement cycle, from company onboarding to offer letters.

### Problem

Most colleges run placements on spreadsheets, Google Forms and WhatsApp groups. Eligibility is checked by hand, students miss deadlines, fake or unverified recruiters slip through, and the TPO has no live view of who is placed.

### Goals

- Verified onboarding for companies, students and placement staff, each with its own login and permissions
- Drives with eligibility rules enforced by the system, not by hand
- One place to track every application, round and offer
- Placement reports (placed %, CTC, branch-wise) available to the TPO at any time

### Non-goals (v1)

- Online coding tests or video interviews inside the portal (link out to the company's own tools)
- Multi-college / multi-tenant support
- Native mobile apps (responsive web only)

### Success metrics

| Metric | Target |
| --- | --- |
| Final-year students with verified profiles | 90% before the first drive |
| Company approval time | Under 48 hours |
| Eligibility errors (ineligible student applies) | Zero |
| Placement report generation | Instant, no manual spreadsheet work |

## Users and roles

v1 ships the three existing roles (Student, Company, TPO) plus a Super Admin to create TPO accounts. Department Coordinator is planned for v2.

| Role | Who | How the account is created |
| --- | --- | --- |
| Super Admin | College IT / owner | Seeded at deployment |
| TPO | Placement officer and staff | Created by Super Admin, no public signup |
| Department Coordinator (v2) | Faculty per branch | Created by TPO, scoped to one branch |
| Student | Final and pre-final year students | Bulk-imported by TPO or self-signup with college email, then verified |
| Company Recruiter | HR / hiring staff | Self-signup + TPO approval, or TPO invite |

### Permission matrix

| Action | Super Admin | TPO | Student | Recruiter |
| --- | --- | --- | --- | --- |
| Create / disable TPO accounts | Yes | No | No | No |
| Approve or reject companies | Yes | Yes | No | No |
| Import and verify students | Yes | Yes | No | No |
| Edit academic data (CGPA, backlogs) | Yes | Yes | No | No |
| Edit own profile and resume | No | No | Yes | Yes (company profile) |
| Create or propose a drive | No | Yes | No | Yes (needs TPO approval) |
| Set eligibility criteria | No | Yes | No | Propose only |
| View and apply to drives | No | No | Eligible drives only | No |
| View applicants | No | All drives | Own applications | Own drives only |
| Update round results and offers | No | Yes | No | Own drives only |
| View reports | Yes | Yes | No | Own drive stats |

## Onboarding and authentication

Every account starts unverified and gains access only after the right check: email ownership for everyone, plus TPO approval for companies and students.

### Company registration fields

| Field | Required | Notes |
| --- | --- | --- |
| Company name, website, industry, size | Yes | Size as a range (1-50, 51-200, ...) |
| Logo | No | PNG/JPG, max 1 MB |
| Recruiter name, designation, phone | Yes | Phone with OTP optional in v1 |
| Official email | Yes | Free providers (gmail, yahoo, outlook) blocked; domain should match website |
| Registered address, LinkedIn page | Yes |  |
| GSTIN or CIN | Required before approval | PAN optional |
| Authorization letter | No | PDF, max 2 MB |
| Hiring intent (roles, CTC range, batch) | No | Helps the TPO prioritise |

### Company verification flow

1. Recruiter submits the form; a verification link goes to the official email.
2. After email verification, account status is `PENDING`. The recruiter can log in and complete the profile but cannot post drives or see students.
3. TPO reviews details and documents, then sets `APPROVED` or `REJECTED` with a reason. The recruiter gets an email either way.
4. TPO can also invite a company directly; the invite link creates an account that is approved on signup.
5. The first recruiter becomes Company Admin and can invite colleagues from the same email domain.
6. TPO can `SUSPEND` a company at any time; its open drives are paused.

### Student onboarding

- **Bulk import (recommended):** TPO uploads a CSV (roll no, name, college email, branch, batch, CGPA, backlogs). Each student gets an activation link to set a password.
- **Self-signup:** only with the college email domain; account stays `PENDING` until the TPO verifies it.
- Academic fields are locked for students. Changes go through a correction request the TPO approves.

### Authentication

- One login page for all roles; the role is read from the account, never chosen by the user
- Access token (short-lived JWT carrying user id, role, status) plus a refresh token in an httpOnly cookie
- Email verification, forgot/reset password, and account lockout after repeated failed logins
- Optional Google sign-in restricted to the college domain for students (v2)

## Functional requirements

Requirements are tagged P0 (MVP), P1 (soon after) or P2 (later).

### Student profile

- P0: Personal details, branch, batch, CGPA, backlogs, 10th/12th marks, skills, links (GitHub, LinkedIn, portfolio)
- P0: Resume upload (PDF, max 2 MB), with one marked as default
- P1: Multiple resumes, with one chosen per application
- P1: Profile completeness indicator; incomplete profiles cannot apply

### Company profile

- P0: Company details from registration, editable after approval (legal fields need TPO re-approval)
- P1: Multiple recruiters per company with Company Admin role

### Drives (job postings)

- P0: Title, role type (full-time / internship / both), CTC or stipend, location, job description, bond details, application deadline
- P0: Status: `DRAFT`, `PENDING_APPROVAL`, `OPEN`, `CLOSED`, `COMPLETED`
- P0: Created by TPO, or proposed by a company and approved by TPO
- P1: Placement tier (Regular / Dream / Super Dream) based on CTC

### Eligibility

- P0: Rules per drive: min CGPA, allowed branches, batch, max active backlogs, min 10th/12th %
- P0: Enforced on the server when listing and when applying
- P0: Students only see drives they are eligible for; ineligible attempts are rejected
- P1: TPO can manually add an exception for one student, logged in the audit trail

### Applications

- P0: One-click apply with chosen resume before the deadline
- P0: Status: `APPLIED`, `SHORTLISTED`, `IN_PROCESS`, `SELECTED`, `REJECTED`, `WITHDRAWN`
- P0: Student can withdraw before the deadline
- P0: Recruiter and TPO can export applicants as CSV/Excel

### Selection rounds

- P0: Ordered rounds per drive (aptitude, technical, HR, etc.) with date, mode and venue or link
- P0: Result per student per round (cleared / not cleared), uploadable in bulk via CSV
- P1: Round scheduling notifications to shortlisted students

### Offers and placement policy

- P0: Record offer (CTC, role, joining date) and upload offer letter
- P0: Student accepts or declines within a set window
- P0: Configurable policy, e.g. a placed student can only apply to a higher tier; one accepted offer locks further applications

### Notifications

- P0: Email for account events, new eligible drives, shortlist, round results, offers
- P1: In-app notification centre
- P2: WhatsApp / SMS

### Reports (TPO)

- P0: Placed vs unplaced count and %, overall and per branch
- P0: Highest, average and median CTC
- P1: Company-wise hiring, year-on-year comparison, export to PDF/Excel

## Core user flow

The TPO sits between companies and students at two gates: company approval and drive approval. Nothing a company posts reaches students until both pass.

&#91;embedded content: placement cycle · 8 steps across 3 roles\]

Students are imported and verified by the TPO before the first drive opens, so the eligibility check at the apply step uses trusted academic data. A rejected company or drive goes back to the recruiter with a reason; a student who accepts an offer is locked out of lower-tier drives by the placement policy.

## Data model

One `users` table handles login for every role; role-specific details live in separate profile tables linked by `user_id`.

| Entity | Key fields | Links to |
| --- | --- | --- |
| users | id, email, password\_hash, role, status, email\_verified, last\_login | One profile table by role |
| students | user\_id, roll\_no, name, branch, batch, cgpa, active\_backlogs, marks\_10, marks\_12, verified\_by | users |
| companies | id, name, website, domain, gstin\_or\_cin, status, approved\_by, rejection\_reason | company\_users |
| company\_users | user\_id, company\_id, designation, is\_admin | users, companies |
| tpo\_profiles | user\_id, name, designation | users |
| drives | id, company\_id, title, type, ctc, location, jd, deadline, tier, status, created\_by | companies |
| eligibility\_criteria | drive\_id, min\_cgpa, branches\[\], batch, max\_backlogs, min\_10, min\_12 | drives |
| applications | id, drive\_id, student\_id, resume\_id, status, applied\_at | drives, students |
| rounds | id, drive\_id, order, name, date, mode, venue\_or\_link | drives |
| round\_results | round\_id, application\_id, result, remarks | rounds, applications |
| offers | application\_id, ctc, role, joining\_date, letter\_url, status | applications |
| documents | id, owner\_id, type, url, size | users |
| notifications | id, user\_id, type, payload, read\_at | users |
| audit\_logs | id, actor\_id, action, entity, entity\_id, before, after, at | users |

### Status values

- **users.status:** `PENDING`, `ACTIVE`, `SUSPENDED`
- **companies.status:** `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`
- **drives.status:** `DRAFT`, `PENDING_APPROVAL`, `OPEN`, `CLOSED`, `COMPLETED`
- **applications.status:** `APPLIED`, `SHORTLISTED`, `IN_PROCESS`, `SELECTED`, `REJECTED`, `WITHDRAWN`
- **offers.status:** `ISSUED`, `ACCEPTED`, `DECLINED`, `EXPIRED`

## Non-functional requirements

Student data is personal, so access control and auditability matter more than raw scale.

### Security and access control

- Every API route checks two things: the **role** (e.g. only TPO can approve companies) and **ownership** (a recruiter only sees applicants of their own company's drives; a student only sees their own applications)
- Passwords hashed with bcrypt or argon2; no plain-text secrets in code or logs
- Rate limiting on login, signup, OTP and password reset
- Input validation on every endpoint; file uploads checked for type and size, stored privately and served through short-lived signed URLs
- HTTPS only; CORS limited to the app's domain

### Privacy

- Recruiters see only what they need: profile, resume and academic data of applicants, never phone or address before shortlisting (configurable)
- Follow India's DPDP Act basics: consent at signup, a way for students to download and request deletion of their data after graduation

### Audit

- Log every TPO and admin action that changes data: approvals, rejections, academic edits, eligibility exceptions, offer changes
- Logs are read-only and kept for at least 3 years

### Performance and reliability

- Sized for one college: about 3,000 students and 200 companies per year, with spikes of a few hundred concurrent users at drive deadlines
- Pages load in under 2 seconds on a 4G connection
- Daily database backups, kept for 30 days

### Usability

- Responsive web that works on phones, since most students will apply from mobile
- Clear deadline countdowns and status labels on every application

## Release plan

Build in four phases so a working placement cycle exists after Phase 2, before reports and polish.

| Phase | Scope | Done when |
| --- | --- | --- |
| 1. Foundation | Auth, roles, middleware, Super Admin creates TPO, company signup + approval | A company can register and be approved by the TPO |
| 2. Core cycle (MVP) | Student import and profiles, drives, eligibility, applications, email notifications | An eligible student can apply to an approved company's drive |
| 3. Selection | Rounds, bulk results, offers, placement policy | A drive runs from shortlist to accepted offer |
| 4. Insight and hardening | Reports, audit log viewer, exports, in-app notifications, security review | TPO can pull the season report without spreadsheets |

### Risks

- **Dirty student data at import:** validate the CSV and show row-level errors before saving anything
- **Fake recruiters:** domain-matched email plus GSTIN/CIN check before approval
- **Deadline-day load:** test with a few hundred concurrent applies before the first live drive
- **Policy disputes:** make placement rules configurable and visible to students up front

### Open questions

- [ ] Does the college want Department Coordinators in v1, or is TPO approval enough?
- [ ] Which placement policy applies: one offer and out, or tier upgrades allowed?
- [ ] Should companies see student phone numbers before shortlisting?
- [ ] Will GSTIN/CIN be checked manually by the TPO or through a verification API?
- [ ] Are internships (pre-final year) run through the same drives, or a separate module?
