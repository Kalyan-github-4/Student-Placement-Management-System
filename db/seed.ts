import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { domainFromWebsite } from "../lib/company";
import {
  users,
  studentProfiles,
  companies,
  companyUsers,
  tpoProfiles,
  jobPostings,
} from "./schema";

const defaultUsers = [
  {
    email: "admin@brainware.edu",
    password: "Admin@123",
    role: "SUPER_ADMIN" as const,
  },
  {
    email: "tpo@brainware.edu",
    password: "Tpo@123",
    role: "TPO" as const,
  },
  {
    email: "student@brainware.edu",
    password: "Student@123",
    role: "STUDENT" as const,
  },
  {
    email: "company@brainware.edu",
    password: "Company@123",
    role: "RECRUITER" as const,
  },
];

type DemoJob = Omit<typeof jobPostings.$inferInsert, "companyId" | "status">;

// Fictional companies so the student portal has openings to browse.
// Each gets a recruiter login: <email> / Company@123.
const demoCompanies: {
  email: string;
  companyName: string;
  description: string;
  website: string;
  industry: string;
  size: string;
  address: string;
  linkedinUrl: string;
  gstinOrCin: string | null;
  recruiter: { name: string; designation: string; phone: string };
  status?: "PENDING" | "APPROVED";
  jobs: DemoJob[];
}[] = [
  {
    email: "company@brainware.edu",
    industry: "Software Product",
    size: "51-200",
    address: "Sector V, Salt Lake, Kolkata 700091",
    linkedinUrl: "https://www.linkedin.com/company/demo-technologies",
    gstinOrCin: "19AABCD1234E1Z5",
    recruiter: { name: "Priya Sen", designation: "HR Manager", phone: "9830000001" },
    companyName: "Demo Technologies Pvt. Ltd.",
    description: "Default company account for testing the recruiter portal.",
    website: "https://example.com",
    jobs: [
      {
        title: "Graduate Engineer Trainee",
        description:
          "One-year trainee programme covering full-stack development, testing and deployment on client projects.",
        minCgpa: 6.5,
        maxBacklogs: 1,
        salaryPackage: "4.5 LPA",
        location: "Kolkata",
      },
    ],
  },
  {
    email: "hr@nimbuscloud.example",
    industry: "IT Services",
    size: "1001-5000",
    address: "Outer Ring Road, Bellandur, Bengaluru 560103",
    linkedinUrl: "https://www.linkedin.com/company/nimbus-cloud",
    gstinOrCin: "29AABCN5678F1Z2",
    recruiter: { name: "Arjun Rao", designation: "Talent Acquisition Lead", phone: "9830000002" },
    companyName: "Nimbus Cloud Systems",
    description: "Cloud infrastructure and DevOps services for enterprise customers.",
    website: "https://nimbuscloud.example",
    jobs: [
      {
        title: "Associate Software Engineer",
        description:
          "Build and maintain microservices in Go and TypeScript. Training on Kubernetes and AWS provided.",
        minCgpa: 7.0,
        allowedBranches: ["CSE", "CSE (AI & ML)", "CSE (Data Science)", "IT", "MCA"],
        maxBacklogs: 0,
        salaryPackage: "7.2 LPA",
        location: "Bengaluru",
      },
      {
        title: "Cloud Support Engineer",
        description:
          "Help customers troubleshoot Linux, networking and cloud deployments. Rotational shifts.",
        minCgpa: 6.0,
        maxBacklogs: 2,
        salaryPackage: "5 LPA",
        location: "Hyderabad",
      },
    ],
  },
  {
    email: "careers@quantra.example",
    industry: "Consulting",
    size: "201-1000",
    address: "Action Area I, New Town, Kolkata 700156",
    linkedinUrl: "https://www.linkedin.com/company/quantra-analytics",
    gstinOrCin: "19AABCQ9012G1Z8",
    recruiter: { name: "Meera Iyer", designation: "Campus Recruiter", phone: "9830000003" },
    companyName: "Quantra Analytics",
    description: "Data analytics and machine learning consulting for retail and banking.",
    website: "https://quantra.example",
    jobs: [
      {
        title: "Data Analyst",
        description:
          "Work with SQL, Python and Power BI to turn business data into dashboards and insights.",
        minCgpa: 7.5,
        allowedBranches: ["CSE", "CSE (AI & ML)", "CSE (Data Science)", "IT", "BCA", "MCA"],
        maxBacklogs: 0,
        salaryPackage: "6 LPA",
        location: "Kolkata",
      },
      {
        title: "Machine Learning Engineer",
        description:
          "Train, evaluate and deploy ML models for demand forecasting and fraud detection.",
        minCgpa: 8.5,
        allowedBranches: ["CSE (AI & ML)", "CSE (Data Science)"],
        maxBacklogs: 0,
        salaryPackage: "10 LPA",
        location: "Pune",
      },
    ],
  },
  {
    email: "hiring@vertexfin.example",
    industry: "Banking & Finance",
    size: "201-1000",
    address: "Bandra Kurla Complex, Mumbai 400051",
    linkedinUrl: "https://www.linkedin.com/company/vertex-fintech",
    gstinOrCin: "27AABCV3456H1Z4",
    recruiter: { name: "Rohan Mehta", designation: "HR Business Partner", phone: "9830000004" },
    companyName: "Vertex Fintech",
    description: "Digital payments and lending platform serving small businesses across India.",
    website: "https://vertexfin.example",
    jobs: [
      {
        title: "Backend Developer",
        description:
          "Design reliable payment APIs in Java and Spring Boot with a focus on security and scale.",
        minCgpa: 7.0,
        allowedBranches: ["CSE", "IT", "MCA"],
        maxBacklogs: 0,
        salaryPackage: "8.5 LPA",
        location: "Mumbai",
      },
    ],
  },
  {
    email: "talent@orbitembedded.example",
    industry: "Electronics & Semiconductors",
    size: "51-200",
    address: "Sector 62, Noida 201309",
    linkedinUrl: "https://www.linkedin.com/company/orbit-embedded",
    gstinOrCin: "09AABCO7890J1Z6",
    recruiter: { name: "Kavya Nair", designation: "HR Executive", phone: "9830000005" },
    companyName: "Orbit Embedded Technologies",
    description: "Embedded systems and IoT products for automotive and industrial clients.",
    website: "https://orbitembedded.example",
    jobs: [
      {
        title: "Embedded Systems Engineer",
        description:
          "Develop firmware in C for microcontrollers, and test hardware with oscilloscopes and logic analysers.",
        minCgpa: 6.5,
        allowedBranches: ["ECE", "EE"],
        maxBacklogs: 1,
        salaryPackage: "5.5 LPA",
        location: "Noida",
      },
    ],
  },
  {
    email: "jobs@greenline.example",
    industry: "Energy",
    size: "201-1000",
    address: "City Centre, Durgapur 713216",
    linkedinUrl: "https://www.linkedin.com/company/greenline-energy",
    gstinOrCin: "19AABCG2345K1Z1",
    recruiter: { name: "Sourav Das", designation: "Recruitment Manager", phone: "9830000006" },
    companyName: "Greenline Energy Solutions",
    description: "Renewable energy EPC company building solar and wind projects.",
    website: "https://greenline.example",
    jobs: [
      {
        title: "Graduate Engineer – Projects",
        description:
          "Assist with design, site execution and commissioning of utility-scale solar plants.",
        minCgpa: 6.0,
        allowedBranches: ["EE", "ME", "CE"],
        maxBacklogs: 2,
        salaryPackage: "4.8 LPA",
        location: "Durgapur",
      },
      {
        title: "Business Analyst Intern",
        description: "Six-month paid internship supporting the bids and market research team.",
        minCgpa: 6.0,
        salaryPackage: "₹25,000 / month",
        location: "Kolkata (Hybrid)",
      },
    ],
  },
  {
    // Left pending so the TPO approval flow can be tried straight after seeding.
    email: "hr@acmerobotics.example",
    industry: "Manufacturing",
    size: "51-200",
    address: "Kalyani Industrial Estate, Nadia 741235",
    linkedinUrl: "https://www.linkedin.com/company/acme-robotics",
    gstinOrCin: "19AABCA6789L1Z3",
    recruiter: { name: "Neha Gupta", designation: "HR Lead", phone: "9830000007" },
    companyName: "Acme Robotics",
    description: "Industrial automation and robotics for factories in eastern India.",
    website: "https://acmerobotics.example",
    status: "PENDING",
    jobs: [],
  },
];

type NewUser = { email: string; password: string; role: (typeof users.$inferInsert)["role"] };

async function upsertUser({ email, password, role }: NewUser) {
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    console.log(`  - ${email} already exists, skipping`);
    return existing;
  }

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      status: "ACTIVE",
      emailVerified: new Date(),
    })
    .returning();
  console.log(`  + created ${role.toLowerCase()} ${email}`);
  return user;
}

async function seedCompany({
  email,
  companyName,
  recruiter,
  jobs,
  status = "APPROVED",
  ...details
}: (typeof demoCompanies)[number]) {
  const user = await upsertUser({ email, password: "Company@123", role: "RECRUITER" });

  const [existingMember] = await db
    .select()
    .from(companyUsers)
    .where(eq(companyUsers.userId, user.id));
  if (existingMember) return;

  const [company] = await db
    .insert(companies)
    .values({
      ...details,
      name: companyName,
      domain: domainFromWebsite(details.website)!,
      status,
      reviewedAt: status === "APPROVED" ? new Date() : null,
    })
    .returning();
  await db
    .insert(companyUsers)
    .values({ userId: user.id, companyId: company.id, ...recruiter, isAdmin: true });
  console.log(`  + created ${status.toLowerCase()} company ${companyName}`);

  if (jobs.length === 0) return;
  await db
    .insert(jobPostings)
    .values(jobs.map((job) => ({ ...job, companyId: company.id, status: "APPROVED" as const })));
  console.log(`  + added ${jobs.length} opening(s) for ${companyName}`);
}

async function main() {
  console.log("Seeding default users...");
  const [, tpo, student] = await Promise.all(defaultUsers.map(upsertUser));

  await db
    .insert(tpoProfiles)
    .values({ userId: tpo.id, name: "Placement Officer", designation: "Training & Placement Officer" })
    .onConflictDoNothing();

  await db
    .insert(studentProfiles)
    .values({
      userId: student.id,
      name: "Demo Student",
      rollNumber: "BWU/BTECH/22/001",
      branch: "CSE",
      cgpa: 8.2,
      backlogs: 0,
      phone: "9876543210",
    })
    .onConflictDoNothing();

  console.log("\nSeeding demo companies...");
  for (const company of demoCompanies) await seedCompany(company);

  console.log("\nDefault logins:");
  console.table(
    defaultUsers.map(({ role, email, password }) => ({ role, email, password }))
  );
  console.log("\nDemo recruiters (password Company@123):");
  console.table(
    demoCompanies.map(({ email, companyName, status = "APPROVED" }) => ({
      email,
      companyName,
      status,
    }))
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
