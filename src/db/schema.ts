import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const roleEnum = pgEnum("role", ["STUDENT", "COMPANY", "ADMIN"]);
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

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
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

export const companyProfiles = pgTable("company_profiles", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  description: text("description"),
  website: text("website"),
  status: approvalStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jobPostings = pgTable("job_postings", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  companyId: text("company_id")
    .notNull()
    .references(() => companyProfiles.id, { onDelete: "cascade" }),
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

export const usersRelations = relations(users, ({ one }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  companyProfile: one(companyProfiles, {
    fields: [users.id],
    references: [companyProfiles.userId],
  }),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one, many }) => ({
  user: one(users, { fields: [studentProfiles.userId], references: [users.id] }),
  applications: many(applications),
}));

export const companyProfilesRelations = relations(companyProfiles, ({ one, many }) => ({
  user: one(users, { fields: [companyProfiles.userId], references: [users.id] }),
  jobPostings: many(jobPostings),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  company: one(companyProfiles, {
    fields: [jobPostings.companyId],
    references: [companyProfiles.id],
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
