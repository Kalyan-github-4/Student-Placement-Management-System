export type EligibilityStudent = {
  branch: string | null;
  batch: number | null;
  cgpa: number | null;
  activeBacklogs: number | null;
  marks10: number | null;
  marks12: number | null;
};

export type Criteria = {
  minCgpa: number | null;
  branches: string[];
  batch: number | null;
  maxBacklogs: number | null;
  min10: number | null;
  min12: number | null;
};

// Returns the reasons a student does not meet a drive's criteria; empty means eligible.
// Missing student data never passes a rule that needs it. Used both when listing
// drives and inside the apply action, so the two can't disagree.
export function eligibilityIssues(student: EligibilityStudent, criteria: Criteria | null) {
  if (!criteria) return [];
  const issues: string[] = [];
  if (criteria.minCgpa !== null && (student.cgpa ?? -1) < criteria.minCgpa) {
    issues.push(`Requires CGPA ${criteria.minCgpa}+`);
  }
  if (criteria.branches.length > 0 && !criteria.branches.includes(student.branch ?? "")) {
    issues.push(`Open to ${criteria.branches.join(", ")} only`);
  }
  if (criteria.batch !== null && student.batch !== criteria.batch) {
    issues.push(`Open to the ${criteria.batch} batch only`);
  }
  if (
    criteria.maxBacklogs !== null &&
    (student.activeBacklogs ?? Infinity) > criteria.maxBacklogs
  ) {
    issues.push(
      criteria.maxBacklogs === 0 ? "No active backlogs allowed" : `Max ${criteria.maxBacklogs} active backlogs`
    );
  }
  if (criteria.min10 !== null && (student.marks10 ?? -1) < criteria.min10) {
    issues.push(`Requires ${criteria.min10}%+ in Class 10`);
  }
  if (criteria.min12 !== null && (student.marks12 ?? -1) < criteria.min12) {
    issues.push(`Requires ${criteria.min12}%+ in Class 12`);
  }
  return issues;
}

// Plain-language summary of a drive's rules for display.
export function criteriaSummary(criteria: Criteria | null) {
  if (!criteria) return ["Open to all students"];
  const lines: string[] = [];
  if (criteria.minCgpa !== null) lines.push(`CGPA ${criteria.minCgpa}+`);
  if (criteria.branches.length > 0) lines.push(criteria.branches.join(", "));
  if (criteria.batch !== null) lines.push(`${criteria.batch} batch`);
  if (criteria.maxBacklogs !== null) {
    lines.push(criteria.maxBacklogs === 0 ? "No active backlogs" : `Up to ${criteria.maxBacklogs} backlogs`);
  }
  if (criteria.min10 !== null) lines.push(`Class 10: ${criteria.min10}%+`);
  if (criteria.min12 !== null) lines.push(`Class 12: ${criteria.min12}%+`);
  return lines.length > 0 ? lines : ["Open to all students"];
}
