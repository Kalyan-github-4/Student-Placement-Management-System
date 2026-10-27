import "server-only";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";

type AuditEntry = typeof auditLogs.$inferInsert;

// Build an audit insert to run in the same db.batch() as the change it records.
export function auditInsert(entry: AuditEntry) {
  return db.insert(auditLogs).values(entry);
}
