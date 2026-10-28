import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  pgEnum,
  uniqueIndex,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const roleEnum = pgEnum("role", ["SUPER_ADMIN", "TPO", "STUDENT", "RECRUITER"]);
export const userStatusEnum = pgEnum("user_status", ["PENDING", "ACTIVE", "SUSPENDED"]);
export const companyStatusEnum = pgEnum("company_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
]);
export const tokenTypeEnum = pgEnum("token_type", [
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
  "ACCOUNT_ACTIVATION",
]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "DRAFT",
  "SUBMITTED",
  "VERIFIED",
  "REJECTED",
]);
export const reviewStatusEnum = pgEnum("review_status", ["PENDING", "APPROVED", "REJECTED"]);
export const documentTypeEnum = pgEnum("document_type", ["RESUME", "LOGO", "AUTH_LETTER"]);
export const driveTypeEnum = pgEnum("drive_type", ["FULL_TIME", "INTERNSHIP", "BOTH"]);
export const driveStatusEnum = pgEnum("drive_status", [
  "DRAFT",
  "PENDING_APPROVAL",
  "OPEN",
  "CLOSED",
  "COMPLETED",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "APPLIED",
  "SHORTLISTED",
  "IN_PROCESS",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  // Null until an invited user sets a password via their activation link.
  passwordHash: text("password_hash"),
  role: roleEnum("role").notNull(),
  status: userStatusEnum("status").notNull().default("PENDING"),
  emailVerified: timestamp("email_verified"),
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Single-use links sent by email. Only the SHA-256 hash of the token is stored.
export const authTokens = pgTable(
  "auth_tokens",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: tokenTypeEnum("type").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("auth_tokens_user_idx").on(table.userId)]
);

// Fixed-window counters for rate limiting, keyed by action and IP or email.
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start").notNull().defaultNow(),
});

export const tpoProfiles = pgTable("tpo_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Academic fields stay null until the student fills them in. They lock once the TPO
// verifies the profile; after that they change only through a correction request.
export const students = pgTable("students", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  rollNumber: text("roll_number").unique(),
  branch: text("branch"),
  batch: integer("batch"),
  cgpa: doublePrecision("cgpa"),
  activeBacklogs: integer("active_backlogs"),
  marks10: doublePrecision("marks_10"),
  marks12: doublePrecision("marks_12"),
  phone: text("phone"),
  skills: text("skills").array().notNull().default([]),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  verificationStatus: verificationStatusEnum("verification_status").notNull().default("DRAFT"),
  verificationNote: text("verification_note"),
  verifiedBy: text("verified_by").references(() => users.id, { onDelete: "set null" }),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// A student's request to change a locked academic field, decided by the TPO.
export const correctionRequests = pgTable(
  "correction_requests",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    field: text("field").notNull(),
    currentValue: text("current_value"),
    requestedValue: text("requested_value").notNull(),
    reason: text("reason").notNull(),
    status: reviewStatusEnum("status").notNull().default("PENDING"),
    reviewNote: text("review_note"),
    reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("correction_requests_student_idx").on(table.studentId)]
);

export const companies = pgTable("companies", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  website: text("website").notNull(),
  domain: text("domain").notNull().unique(),
  industry: text("industry").notNull(),
  size: text("size").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  linkedinUrl: text("linkedin_url").notNull(),
  // Required before approval, not at signup.
  gstinOrCin: text("gstin_or_cin"),
  pan: text("pan"),
  hiringRoles: text("hiring_roles"),
  hiringCtc: text("hiring_ctc"),
  hiringBatch: text("hiring_batch"),
  logoUrl: text("logo_url"),
  status: companyStatusEnum("status").notNull().default("PENDING"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const companyUsers = pgTable(
  "company_users",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    designation: text("designation").notNull(),
    phone: text("phone").notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("company_users_company_idx").on(table.companyId)]
);

// A TPO invitation for a company; registering through it skips the approval step.
export const companyInvites = pgTable("company_invites", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull(),
  companyName: text("company_name").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  invitedBy: text("invited_by").references(() => users.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Uploaded files. `storageKey` is the provider's id; files are private and served
// only through /files/[id], which checks access and redirects to a short-lived URL.
export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: documentTypeEnum("type").notNull(),
    storageKey: text("storage_key").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("documents_owner_idx").on(table.ownerId)]
);

export const drives = pgTable(
  "drives",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: driveTypeEnum("type").notNull(),
    // Annual CTC in lakhs per annum, null for internship-only drives.
    ctcLpa: doublePrecision("ctc_lpa"),
    stipend: text("stipend"),
    location: text("location").notNull(),
    description: text("description").notNull(),
    bondDetails: text("bond_details"),
    deadline: timestamp("deadline").notNull(),
    status: driveStatusEnum("status").notNull().default("DRAFT"),
    rejectionReason: text("rejection_reason"),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    approvedBy: text("approved_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("drives_company_idx").on(table.companyId), index("drives_status_idx").on(table.status)]
);

// Null or empty means "no restriction" for that rule.
export const eligibilityCriteria = pgTable("eligibility_criteria", {
  driveId: text("drive_id")
    .primaryKey()
    .references(() => drives.id, { onDelete: "cascade" }),
  minCgpa: doublePrecision("min_cgpa"),
  branches: text("branches").array().notNull().default([]),
  batch: integer("batch"),
  maxBacklogs: integer("max_backlogs"),
  min10: doublePrecision("min_10"),
  min12: doublePrecision("min_12"),
});

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    driveId: text("drive_id")
      .notNull()
      .references(() => drives.id, { onDelete: "cascade" }),
    resumeId: text("resume_id").references(() => documents.id, { onDelete: "set null" }),
    status: applicationStatusEnum("status").notNull().default("APPLIED"),
    appliedAt: timestamp("applied_at").notNull().defaultNow(),
    withdrawnAt: timestamp("withdrawn_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("applications_student_drive_idx").on(table.studentId, table.driveId),
    index("applications_drive_idx").on(table.driveId),
  ]
);

// Append-only record of admin and TPO changes. Never updated or deleted by the app.
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    at: timestamp("at").notNull().defaultNow(),
  },
  (table) => [index("audit_logs_entity_idx").on(table.entity, table.entityId)]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, { fields: [users.id], references: [students.userId] }),
  companyUser: one(companyUsers, { fields: [users.id], references: [companyUsers.userId] }),
  tpoProfile: one(tpoProfiles, { fields: [users.id], references: [tpoProfiles.userId] }),
  documents: many(documents),
}));

export const tpoProfilesRelations = relations(tpoProfiles, ({ one }) => ({
  user: one(users, { fields: [tpoProfiles.userId], references: [users.id] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  applications: many(applications),
  corrections: many(correctionRequests),
}));

export const correctionRequestsRelations = relations(correctionRequests, ({ one }) => ({
  student: one(students, { fields: [correctionRequests.studentId], references: [students.id] }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  members: many(companyUsers),
  drives: many(drives),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  user: one(users, { fields: [companyUsers.userId], references: [users.id] }),
  company: one(companies, { fields: [companyUsers.companyId], references: [companies.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  owner: one(users, { fields: [documents.ownerId], references: [users.id] }),
}));

export const drivesRelations = relations(drives, ({ one, many }) => ({
  company: one(companies, { fields: [drives.companyId], references: [companies.id] }),
  criteria: one(eligibilityCriteria, {
    fields: [drives.id],
    references: [eligibilityCriteria.driveId],
  }),
  applications: many(applications),
}));

export const eligibilityCriteriaRelations = relations(eligibilityCriteria, ({ one }) => ({
  drive: one(drives, { fields: [eligibilityCriteria.driveId], references: [drives.id] }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  student: one(students, { fields: [applications.studentId], references: [students.id] }),
  drive: one(drives, { fields: [applications.driveId], references: [drives.id] }),
  resume: one(documents, { fields: [applications.resumeId], references: [documents.id] }),
}));
