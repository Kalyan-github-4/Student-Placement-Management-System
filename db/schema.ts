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
export const approvalStatusEnum = pgEnum("approval_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "APPLIED",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
]);
export const tokenTypeEnum = pgEnum("token_type", [
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
  "ACCOUNT_ACTIVATION",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  // Null until an invited or imported user sets a password via their activation link.
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

export const studentProfiles = pgTable("student_profiles", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  rollNumber: text("roll_number").notNull().unique(),
  branch: text("branch").notNull(),
  cgpa: doublePrecision("cgpa").notNull(),
  backlogs: integer("backlogs").notNull().default(0),
  phone: text("phone"),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

export const jobPostings = pgTable("job_postings", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  minCgpa: doublePrecision("min_cgpa"),
  allowedBranches: text("allowed_branches").array().notNull().default([]),
  maxBacklogs: integer("max_backlogs"),
  salaryPackage: text("salary_package"),
  location: text("location"),
  status: approvalStatusEnum("status").notNull().default("PENDING"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    studentId: text("student_id")
      .notNull()
      .references(() => studentProfiles.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobPostings.id, { onDelete: "cascade" }),
    status: applicationStatusEnum("status").notNull().default("APPLIED"),
    appliedAt: timestamp("applied_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("applications_student_job_idx").on(table.studentId, table.jobId)]
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

export const usersRelations = relations(users, ({ one }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  companyUser: one(companyUsers, {
    fields: [users.id],
    references: [companyUsers.userId],
  }),
  tpoProfile: one(tpoProfiles, {
    fields: [users.id],
    references: [tpoProfiles.userId],
  }),
}));

export const tpoProfilesRelations = relations(tpoProfiles, ({ one }) => ({
  user: one(users, { fields: [tpoProfiles.userId], references: [users.id] }),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one, many }) => ({
  user: one(users, { fields: [studentProfiles.userId], references: [users.id] }),
  applications: many(applications),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  members: many(companyUsers),
  jobPostings: many(jobPostings),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  user: one(users, { fields: [companyUsers.userId], references: [users.id] }),
  company: one(companies, { fields: [companyUsers.companyId], references: [companies.id] }),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobPostings.companyId],
    references: [companies.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  student: one(studentProfiles, {
    fields: [applications.studentId],
    references: [studentProfiles.id],
  }),
  job: one(jobPostings, { fields: [applications.jobId], references: [jobPostings.id] }),
}));
