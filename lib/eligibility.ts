type Student = { branch: string; cgpa: number; backlogs: number };
type Criteria = {
  minCgpa: number | null;
  allowedBranches: string[];
  maxBacklogs: number | null;
};

// Returns the reasons a student does not meet a job's criteria; empty means eligible.
export function eligibilityIssues(student: Student, job: Criteria) {
  const issues: string[] = [];
  if (job.minCgpa !== null && student.cgpa < job.minCgpa) {
    issues.push(`Requires CGPA ${job.minCgpa}+`);
  }
  if (job.allowedBranches.length > 0 && !job.allowedBranches.includes(student.branch)) {
    issues.push(`Open to ${job.allowedBranches.join(", ")} only`);
  }
  if (job.maxBacklogs !== null && student.backlogs > job.maxBacklogs) {
    issues.push(
      job.maxBacklogs === 0 ? "No backlogs allowed" : `Max ${job.maxBacklogs} backlogs`
    );
  }
  return issues;
}
