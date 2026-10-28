import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { db } from "./index";
import { domainFromWebsite } from "../lib/company";
import { eligibilityIssues } from "../lib/eligibility";
import { academicFields } from "../lib/student";
import {
  users,
  students,
  companies,
  companyUsers,
  tpoProfiles,
  drives,
  eligibilityCriteria,
  applications,
  correctionRequests,
  auditLogs,
} from "./schema";
import {
  DAY,
  between,
  daysAgo,
  demoCompanies,
  demoCorrections,
  demoStudents,
  pick,
  random,
  type DemoCompany,
} from "./seed-data";

const defaultUsers = [
  { email: "admin@brainware.edu", password: "Admin@123", role: "SUPER_ADMIN" as const },
  { email: "tpo@brainware.edu", password: "Tpo@123", role: "TPO" as const },
];

const extraTpos = [
  { email: "tpo.assistant@brainware.edu", name: "Sharmila Dutta", designation: "Assistant Placement Officer" },
];

type Role = (typeof users.$inferInsert)["role"];
type AuditEntry = typeof auditLogs.$inferInsert;
type DriveRow = typeof drives.$inferSelect & { criteria: typeof eligibilityCriteria.$inferSelect };

// bcrypt is slow on purpose, so hash each demo password once.
const hashes = new Map<string, Promise<string>>();
const hashFor = (password: string) => {
  if (!hashes.has(password)) hashes.set(password, bcrypt.hash(password, 10));
  return hashes.get(password)!;
};

async function createUser(email: string, password: string, role: Role, createdAt = new Date()) {
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash: await hashFor(password),
      role,
      status: "ACTIVE",
      emailVerified: createdAt,
      createdAt,
      // Most demo accounts have signed in at some point.
      lastLogin: random() < 0.8 ? new Date(Math.max(createdAt.getTime(), Date.now() - between(0, 6) * DAY)) : null,
    })
    .returning();
  return user;
}

// Collected while seeding and written at the end, oldest first.
const audit: AuditEntry[] = [];

async function seedCompany(company: DemoCompany, tpoId: string, created: DriveRow[]) {
  const { email, name, recruiter, drives: demoDrives, status = "APPROVED", reason, registeredDaysAgo, ...details } =
    company;
  const registeredAt = daysAgo(registeredDaysAgo);
  const reviewedAt = status === "PENDING" ? null : daysAgo(registeredDaysAgo - 2);
  const user = await createUser(email, "Company@123", "RECRUITER", registeredAt);

  const [row] = await db
    .insert(companies)
    .values({
      ...details,
      name,
      domain: domainFromWebsite(details.website)!,
      status,
      rejectionReason: reason ?? null,
      reviewedBy: reviewedAt ? tpoId : null,
      reviewedAt,
      createdAt: registeredAt,
      updatedAt: reviewedAt ?? registeredAt,
    })
    .returning();
  await db.insert(companyUsers).values({ userId: user.id, companyId: row.id, ...recruiter, isAdmin: true, createdAt: registeredAt });

  if (reviewedAt) {
    const decision = status === "REJECTED" ? "REJECTED" : "APPROVED";
    audit.push({
      actorId: tpoId,
      action: decision === "APPROVED" ? "company.approved" : "company.rejected",
      entity: "company",
      entityId: row.id,
      before: { status: "PENDING", rejectionReason: null },
      after: { status: decision, rejectionReason: decision === "REJECTED" ? reason : null },
      at: reviewedAt,
    });
  }
  if (status === "SUSPENDED") {
    audit.push({
      actorId: tpoId,
      action: "company.suspended",
      entity: "company",
      entityId: row.id,
      before: { status: "APPROVED", rejectionReason: null },
      after: { status: "SUSPENDED", rejectionReason: reason },
      at: daysAgo(5),
    });
  }

  for (const demo of demoDrives) {
    const driveStatus = demo.status ?? "OPEN";
    const deadline = new Date(Date.now() + demo.deadlineInDays * DAY);
    // Drives open about three weeks before their deadline, never before the company was approved.
    const openedAt = new Date(
      Math.min(Date.now() - DAY, Math.max(reviewedAt?.getTime() ?? 0, deadline.getTime() - 21 * DAY))
    );
    const proposedByCompany = random() < 0.6 || driveStatus === "PENDING_APPROVAL" || driveStatus === "DRAFT";
    const approved = !["DRAFT", "PENDING_APPROVAL"].includes(driveStatus);

    const [drive] = await db
      .insert(drives)
      .values({
        companyId: row.id,
        title: demo.title,
        type: demo.type ?? (demo.ctcLpa ? "FULL_TIME" : "INTERNSHIP"),
        ctcLpa: demo.ctcLpa ?? null,
        stipend: demo.stipend ?? null,
        location: demo.location,
        description: demo.description,
        bondDetails: demo.bondDetails ?? null,
        deadline,
        status: driveStatus,
        createdBy: proposedByCompany ? user.id : tpoId,
        approvedBy: approved ? tpoId : null,
        approvedAt: approved ? openedAt : null,
        createdAt: new Date(openedAt.getTime() - DAY),
        updatedAt: openedAt,
      })
      .returning();
    const [criteria] = await db
      .insert(eligibilityCriteria)
      .values({
        driveId: drive.id,
        minCgpa: demo.minCgpa ?? null,
        branches: demo.branches ?? [],
        batch: demo.batch ?? null,
        maxBacklogs: demo.maxBacklogs ?? null,
        min10: demo.min10 ?? null,
        min12: demo.min12 ?? null,
      })
      .returning();
    created.push({ ...drive, criteria });

    if (!proposedByCompany) {
      audit.push({
        actorId: tpoId,
        action: "drive.created",
        entity: "drive",
        entityId: drive.id,
        before: null,
        after: { status: "OPEN", title: drive.title },
        at: openedAt,
      });
    } else if (approved) {
      audit.push({
        actorId: tpoId,
        action: "drive.approved",
        entity: "drive",
        entityId: drive.id,
        before: { status: "PENDING_APPROVAL" },
        after: { status: "OPEN" },
        at: openedAt,
      });
    }
    if (driveStatus === "CLOSED" || driveStatus === "COMPLETED") {
      audit.push({
        actorId: tpoId,
        action: "drive.closed",
        entity: "drive",
        entityId: drive.id,
        before: { status: "OPEN" },
        after: { status: "CLOSED" },
        at: new Date(deadline.getTime() + DAY / 2),
      });
    }
    if (driveStatus === "COMPLETED") {
      audit.push({
        actorId: tpoId,
        action: "drive.completed",
        entity: "drive",
        entityId: drive.id,
        before: { status: "CLOSED" },
        after: { status: "COMPLETED" },
        at: new Date(deadline.getTime() + 10 * DAY),
      });
    }
  }
  return name;
}

async function main() {
  const [{ value: existing }] = await db.select({ value: count() }).from(users);
  if (existing > 0) {
    console.log("The database already has data. Run `npm run db:reset` to wipe it and seed again.");
    return;
  }

  console.log("Seeding staff accounts...");
  const [admin, tpo] = await Promise.all(
    defaultUsers.map(({ email, password, role }) => createUser(email, password, role, daysAgo(90)))
  );
  await db
    .insert(tpoProfiles)
    .values({ userId: tpo.id, name: "Placement Officer", designation: "Training & Placement Officer", createdBy: admin.id, createdAt: daysAgo(90) });
  audit.push({ actorId: admin.id, action: "tpo.created", entity: "user", entityId: tpo.id, before: null, after: { email: tpo.email }, at: daysAgo(90) });
  const reviewers = [tpo.id];
  for (const extra of extraTpos) {
    const user = await createUser(extra.email, "Tpo@123", "TPO", daysAgo(70));
    await db
      .insert(tpoProfiles)
      .values({ userId: user.id, name: extra.name, designation: extra.designation, createdBy: admin.id, createdAt: daysAgo(70) });
    audit.push({ actorId: admin.id, action: "tpo.created", entity: "user", entityId: user.id, before: null, after: { email: user.email }, at: daysAgo(70) });
    reviewers.push(user.id);
  }

  console.log("Seeding companies and drives...");
  const allDrives: DriveRow[] = [];
  for (const company of demoCompanies) await seedCompany(company, pick(reviewers), allDrives);

  console.log("Seeding students...");
  const verified: (typeof students.$inferSelect)[] = [];
  for (const demo of demoStudents) {
    const registeredAt = daysAgo(demo.registeredDaysAgo);
    const reviewedAt = demo.status === "VERIFIED" || demo.status === "REJECTED" ? daysAgo(Math.max(0.5, demo.registeredDaysAgo - 3)) : null;
    const user = await createUser(demo.email, "Student@123", "STUDENT", registeredAt);
    const [student] = await db
      .insert(students)
      .values({
        userId: user.id,
        name: demo.name,
        ...demo.profile,
        verificationStatus: demo.status,
        verificationNote: demo.note ?? null,
        verifiedBy: demo.status === "VERIFIED" ? tpo.id : null,
        verifiedAt: demo.status === "VERIFIED" ? reviewedAt : null,
        createdAt: registeredAt,
        updatedAt: reviewedAt ?? registeredAt,
      })
      .returning();

    if (demo.status === "VERIFIED") {
      verified.push(student);
      audit.push({
        actorId: tpo.id,
        action: "student.verified",
        entity: "student",
        entityId: student.id,
        before: { verificationStatus: "SUBMITTED" },
        after: {
          verificationStatus: "VERIFIED",
          ...Object.fromEntries(Object.keys(academicFields).map((f) => [f, student[f as keyof typeof academicFields]])),
        },
        at: reviewedAt!,
      });
    } else if (demo.status === "REJECTED") {
      audit.push({
        actorId: tpo.id,
        action: "student.rejected",
        entity: "student",
        entityId: student.id,
        before: { verificationStatus: "SUBMITTED" },
        after: { verificationStatus: "REJECTED", reason: demo.note },
        at: reviewedAt!,
      });
    }
  }

  console.log("Seeding correction requests...");
  const candidates = verified.filter((s) => s.userId !== verified[0]?.userId);
  for (const [index, correction] of demoCorrections.entries()) {
    // The backlog request only makes sense for a student who has one.
    const student =
      correction.field === "activeBacklogs"
        ? candidates.find((s) => (s.activeBacklogs ?? 0) > 0)
        : candidates[index * 3];
    if (!student) continue;
    const current = Number(student[correction.field] ?? 0);
    const requestedValue = correction.requested(current);
    const createdAt = daysAgo(4 - index * 0.5);
    const reviewedAt = correction.status === "PENDING" ? null : daysAgo(1);
    const [request] = await db
      .insert(correctionRequests)
      .values({
        studentId: student.id,
        field: correction.field,
        currentValue: String(current),
        requestedValue,
        reason: correction.reason,
        status: correction.status,
        reviewNote: "note" in correction ? correction.note : null,
        reviewedBy: reviewedAt ? tpo.id : null,
        reviewedAt,
        createdAt,
      })
      .returning();
    if (correction.status === "APPROVED") {
      await db.update(students).set({ [correction.field]: Number(requestedValue) }).where(eq(students.id, student.id));
    }
    if (reviewedAt) {
      const approve = correction.status === "APPROVED";
      audit.push({
        actorId: tpo.id,
        action: approve ? "student.academic_corrected" : "student.correction_declined",
        entity: "student",
        entityId: student.id,
        before: { [correction.field]: String(current) },
        after: approve
          ? { [correction.field]: Number(requestedValue), requestId: request.id }
          : { requestId: request.id, note: request.reviewNote },
        at: reviewedAt,
      });
    }
  }

  console.log("Seeding applications...");
  const takesApplications = allDrives.filter((d) => ["OPEN", "CLOSED", "COMPLETED"].includes(d.status));
  const rows: (typeof applications.$inferInsert)[] = [];
  for (const student of verified) {
    for (const drive of takesApplications) {
      if (eligibilityIssues(student, drive.criteria).length > 0) continue;
      if (random() > 0.55) continue;

      const opened = drive.approvedAt!.getTime();
      const closes = Math.min(drive.deadline.getTime(), Date.now());
      const appliedAt = new Date(Math.max(opened, student.verifiedAt!.getTime(), between(opened, closes)));
      const roll = random();
      let status: (typeof applications.$inferInsert)["status"] = "APPLIED";
      if (drive.status === "OPEN") status = roll < 0.08 ? "WITHDRAWN" : "APPLIED";
      if (drive.status === "CLOSED") status = roll < 0.4 ? "SHORTLISTED" : roll < 0.6 ? "IN_PROCESS" : "REJECTED";
      if (drive.status === "COMPLETED") status = roll < 0.25 ? "SELECTED" : "REJECTED";

      rows.push({
        studentId: student.id,
        driveId: drive.id,
        status,
        appliedAt,
        withdrawnAt: status === "WITHDRAWN" ? new Date(appliedAt.getTime() + DAY) : null,
        updatedAt: appliedAt,
      });
    }
  }
  if (rows.length > 0) await db.insert(applications).values(rows);

  audit.sort((a, b) => a.at!.getTime() - b.at!.getTime());
  await db.insert(auditLogs).values(audit);

  const studentsWith = (status: string) => demoStudents.filter((s) => s.status === status).length;
  console.log("\nDone.");
  console.table({
    companies: demoCompanies.length,
    drives: allDrives.length,
    students: demoStudents.length,
    verified: studentsWith("VERIFIED"),
    awaitingVerification: studentsWith("SUBMITTED"),
    sentBack: studentsWith("REJECTED"),
    incomplete: studentsWith("DRAFT"),
    applications: rows.length,
    auditEntries: audit.length,
  });

  console.log("\nStaff logins:");
  console.table([
    ...defaultUsers.map(({ role, email, password }) => ({ role, email, password })),
    ...extraTpos.map(({ email }) => ({ role: "TPO", email, password: "Tpo@123" })),
  ]);
  console.log("\nEvery student's password is Student@123, e.g. student@brainware.edu.");
  console.log("Every recruiter's password is Company@123:");
  console.table(demoCompanies.map(({ email, name, status = "APPROVED" }) => ({ email, company: name, status })));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
