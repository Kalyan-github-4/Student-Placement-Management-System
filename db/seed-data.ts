import { branches } from "../lib/branches";

// Demo data for `npm run db:seed`. Everything is fictional. Students are generated from
// a fixed random seed, so every `db:reset` produces the same people with the same marks.

export const DAY = 24 * 60 * 60 * 1000;
export const daysAgo = (days: number) => new Date(Date.now() - days * DAY);

// Small seeded PRNG (mulberry32).
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const random = seededRandom(2027);
export const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)];
export const between = (min: number, max: number) => min + random() * (max - min);
const round = (value: number, places: number) => Number(value.toFixed(places));

// ---------------------------------------------------------------------------
// Companies and drives
// ---------------------------------------------------------------------------

export type DemoDrive = {
  title: string;
  description: string;
  type?: "FULL_TIME" | "INTERNSHIP" | "BOTH";
  ctcLpa?: number;
  stipend?: string;
  location: string;
  bondDetails?: string;
  // Days from now; negative means the deadline has passed.
  deadlineInDays: number;
  // OPEN unless set. PENDING_APPROVAL and DRAFT drives are proposed by the company.
  status?: "DRAFT" | "PENDING_APPROVAL" | "OPEN" | "CLOSED" | "COMPLETED";
  minCgpa?: number;
  branches?: string[];
  batch?: number;
  maxBacklogs?: number;
  min10?: number;
  min12?: number;
};

export type DemoCompany = {
  email: string;
  name: string;
  description: string;
  website: string;
  industry: string;
  size: string;
  address: string;
  linkedinUrl: string;
  gstinOrCin: string | null;
  pan?: string;
  hiringRoles?: string;
  hiringCtc?: string;
  hiringBatch?: string;
  recruiter: { name: string; designation: string; phone: string };
  status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  // Rejection or suspension reason, shown to the company.
  reason?: string;
  // How long ago the company registered.
  registeredDaysAgo: number;
  drives: DemoDrive[];
};

const CS = ["CSE", "CSE (AI & ML)", "CSE (Data Science)", "IT", "MCA"];

// Each company gets a recruiter login: <email> / Company@123.
export const demoCompanies: DemoCompany[] = [
  {
    email: "company@brainware.edu",
    name: "Demo Technologies Pvt. Ltd.",
    description: "Default company account for testing the recruiter portal.",
    website: "https://example.com",
    industry: "Software Product",
    size: "51-200",
    address: "Sector V, Salt Lake, Kolkata 700091",
    linkedinUrl: "https://www.linkedin.com/company/demo-technologies",
    gstinOrCin: "19AABCD1234E1Z5",
    recruiter: { name: "Priya Sen", designation: "HR Manager", phone: "9830000001" },
    registeredDaysAgo: 58,
    drives: [
      {
        title: "Graduate Engineer Trainee",
        description:
          "One-year trainee programme covering full-stack development, testing and deployment on client projects.",
        ctcLpa: 4.5,
        location: "Kolkata",
        deadlineInDays: 14,
        minCgpa: 6.5,
        maxBacklogs: 1,
      },
      {
        title: "Frontend Developer",
        description:
          "Build accessible React interfaces for our SaaS dashboard. Portfolio or GitHub link expected.",
        ctcLpa: 6,
        location: "Kolkata (Hybrid)",
        deadlineInDays: 20,
        status: "PENDING_APPROVAL",
        minCgpa: 7,
        branches: CS,
        maxBacklogs: 0,
      },
    ],
  },
  {
    email: "hr@nimbuscloud.example",
    name: "Nimbus Cloud Systems",
    description: "Cloud infrastructure and DevOps services for enterprise customers.",
    website: "https://nimbuscloud.example",
    industry: "IT Services",
    size: "1001-5000",
    address: "Outer Ring Road, Bellandur, Bengaluru 560103",
    linkedinUrl: "https://www.linkedin.com/company/nimbus-cloud",
    gstinOrCin: "29AABCN5678F1Z2",
    pan: "AABCN5678F",
    hiringRoles: "Software Engineer, Cloud Support",
    hiringCtc: "5 – 7.2 LPA",
    hiringBatch: "2027",
    recruiter: { name: "Arjun Rao", designation: "Talent Acquisition Lead", phone: "9830000002" },
    registeredDaysAgo: 55,
    drives: [
      {
        title: "Associate Software Engineer",
        description:
          "Build and maintain microservices in Go and TypeScript. Training on Kubernetes and AWS provided.",
        ctcLpa: 7.2,
        location: "Bengaluru",
        bondDetails: "18-month service agreement",
        deadlineInDays: 9,
        minCgpa: 7,
        branches: CS,
        batch: 2027,
        maxBacklogs: 0,
        min10: 60,
        min12: 60,
      },
      {
        title: "Cloud Support Engineer",
        description:
          "Help customers troubleshoot Linux, networking and cloud deployments. Rotational shifts.",
        ctcLpa: 5,
        location: "Hyderabad",
        deadlineInDays: 16,
        minCgpa: 6,
        maxBacklogs: 2,
      },
      {
        title: "DevOps Intern",
        description: "Six-month internship on CI/CD pipelines and infrastructure as code.",
        type: "INTERNSHIP",
        stipend: "₹30,000 / month",
        location: "Bengaluru",
        deadlineInDays: -12,
        status: "CLOSED",
        minCgpa: 7,
        branches: CS,
      },
    ],
  },
  {
    email: "careers@quantra.example",
    name: "Quantra Analytics",
    description: "Data analytics and machine learning consulting for retail and banking.",
    website: "https://quantra.example",
    industry: "Consulting",
    size: "201-1000",
    address: "Action Area I, New Town, Kolkata 700156",
    linkedinUrl: "https://www.linkedin.com/company/quantra-analytics",
    gstinOrCin: "19AABCQ9012G1Z8",
    recruiter: { name: "Meera Iyer", designation: "Campus Recruiter", phone: "9830000003" },
    registeredDaysAgo: 50,
    drives: [
      {
        title: "Data Analyst",
        description:
          "Work with SQL, Python and Power BI to turn business data into dashboards and insights.",
        ctcLpa: 6,
        location: "Kolkata",
        deadlineInDays: 11,
        minCgpa: 7.5,
        branches: [...CS, "BCA"],
        maxBacklogs: 0,
      },
      {
        title: "Machine Learning Engineer",
        description:
          "Train, evaluate and deploy ML models for demand forecasting and fraud detection.",
        ctcLpa: 10,
        location: "Pune",
        deadlineInDays: 21,
        minCgpa: 8.5,
        branches: ["CSE (AI & ML)", "CSE (Data Science)"],
        maxBacklogs: 0,
        min12: 70,
      },
    ],
  },
  {
    email: "hiring@vertexfin.example",
    name: "Vertex Fintech",
    description: "Digital payments and lending platform serving small businesses across India.",
    website: "https://vertexfin.example",
    industry: "Banking & Finance",
    size: "201-1000",
    address: "Bandra Kurla Complex, Mumbai 400051",
    linkedinUrl: "https://www.linkedin.com/company/vertex-fintech",
    gstinOrCin: "27AABCV3456H1Z4",
    recruiter: { name: "Rohan Mehta", designation: "HR Business Partner", phone: "9830000004" },
    registeredDaysAgo: 47,
    drives: [
      {
        title: "Backend Developer",
        description:
          "Design reliable payment APIs in Java and Spring Boot with a focus on security and scale.",
        ctcLpa: 8.5,
        location: "Mumbai",
        deadlineInDays: 6,
        minCgpa: 7,
        branches: ["CSE", "IT", "MCA"],
        maxBacklogs: 0,
        min10: 65,
        min12: 65,
      },
      {
        title: "Risk Analyst",
        description: "Credit risk modelling and portfolio monitoring for the SME lending book.",
        ctcLpa: 7,
        location: "Mumbai",
        deadlineInDays: -30,
        status: "COMPLETED",
        minCgpa: 7.5,
        maxBacklogs: 0,
      },
    ],
  },
  {
    email: "talent@orbitembedded.example",
    name: "Orbit Embedded Technologies",
    description: "Embedded systems and IoT products for automotive and industrial clients.",
    website: "https://orbitembedded.example",
    industry: "Electronics & Semiconductors",
    size: "51-200",
    address: "Sector 62, Noida 201309",
    linkedinUrl: "https://www.linkedin.com/company/orbit-embedded",
    gstinOrCin: "09AABCO7890J1Z6",
    recruiter: { name: "Kavya Nair", designation: "HR Executive", phone: "9830000005" },
    registeredDaysAgo: 44,
    drives: [
      {
        title: "Embedded Systems Engineer",
        description:
          "Develop firmware in C for microcontrollers, and test hardware with oscilloscopes and logic analysers.",
        ctcLpa: 5.5,
        location: "Noida",
        deadlineInDays: 13,
        minCgpa: 6.5,
        branches: ["ECE", "EE"],
        maxBacklogs: 1,
      },
    ],
  },
  {
    email: "jobs@greenline.example",
    name: "Greenline Energy Solutions",
    description: "Renewable energy EPC company building solar and wind projects.",
    website: "https://greenline.example",
    industry: "Energy",
    size: "201-1000",
    address: "City Centre, Durgapur 713216",
    linkedinUrl: "https://www.linkedin.com/company/greenline-energy",
    gstinOrCin: "19AABCG2345K1Z1",
    recruiter: { name: "Sourav Das", designation: "Recruitment Manager", phone: "9830000006" },
    registeredDaysAgo: 41,
    drives: [
      {
        title: "Graduate Engineer – Projects",
        description:
          "Assist with design, site execution and commissioning of utility-scale solar plants.",
        ctcLpa: 4.8,
        location: "Durgapur",
        bondDetails: "1-year bond, ₹50,000",
        deadlineInDays: 18,
        minCgpa: 6,
        branches: ["EE", "ME", "CE"],
        maxBacklogs: 2,
      },
      {
        title: "Business Analyst Intern",
        description: "Six-month paid internship supporting the bids and market research team.",
        type: "INTERNSHIP",
        stipend: "₹25,000 / month",
        location: "Kolkata (Hybrid)",
        deadlineInDays: 25,
        minCgpa: 6,
      },
    ],
  },
  {
    email: "people@lumenhealth.example",
    name: "Lumen Healthtech",
    description: "Hospital management software and telemedicine apps used in 300+ clinics.",
    website: "https://lumenhealth.example",
    industry: "Healthcare",
    size: "201-1000",
    address: "Rajarhat Main Road, Kolkata 700135",
    linkedinUrl: "https://www.linkedin.com/company/lumen-healthtech",
    gstinOrCin: "19AABCL4455M1Z9",
    recruiter: { name: "Ananya Bose", designation: "Senior HR Executive", phone: "9830000008" },
    registeredDaysAgo: 36,
    drives: [
      {
        title: "Software Engineer – Mobile",
        description: "Build our patient app in React Native and Kotlin. Exposure to HL7/FHIR is a plus.",
        ctcLpa: 6.5,
        location: "Kolkata",
        deadlineInDays: 15,
        minCgpa: 7,
        branches: [...CS, "BCA"],
        maxBacklogs: 0,
      },
      {
        title: "QA Engineer",
        description: "Manual and automated testing of clinical workflows with Playwright and Postman.",
        ctcLpa: 4.2,
        location: "Kolkata",
        deadlineInDays: 24,
        status: "PENDING_APPROVAL",
        minCgpa: 6,
        maxBacklogs: 1,
      },
    ],
  },
  {
    email: "hr@brickstone.example",
    name: "Brickstone Infra Projects",
    description: "Highways, bridges and metro rail civil works across eastern India.",
    website: "https://brickstone.example",
    industry: "Construction & Infrastructure",
    size: "1001-5000",
    address: "Park Street, Kolkata 700016",
    linkedinUrl: "https://www.linkedin.com/company/brickstone-infra",
    gstinOrCin: "19AABCB6677N1Z2",
    recruiter: { name: "Debashis Mondal", designation: "Deputy Manager – HR", phone: "9830000009" },
    registeredDaysAgo: 60,
    drives: [
      {
        title: "Site Engineer (Civil)",
        description: "Supervise structural works, quantity surveying and quality checks on metro sites.",
        ctcLpa: 4.6,
        location: "Kolkata / Patna",
        bondDetails: "2-year service agreement",
        deadlineInDays: -20,
        status: "COMPLETED",
        minCgpa: 6,
        branches: ["CE"],
        maxBacklogs: 1,
      },
      {
        title: "Graduate Engineer Trainee – Electrical & Mechanical",
        description: "Rotational programme across plant, electrical and MEP teams.",
        ctcLpa: 5,
        location: "Bhubaneswar",
        deadlineInDays: -4,
        status: "CLOSED",
        minCgpa: 6.5,
        branches: ["EE", "ME"],
        maxBacklogs: 0,
      },
    ],
  },
  {
    email: "campus@cartnest.example",
    name: "CartNest Commerce",
    description: "Online grocery and essentials marketplace in 40 Indian cities.",
    website: "https://cartnest.example",
    industry: "E-commerce & Retail",
    size: "1001-5000",
    address: "HSR Layout, Bengaluru 560102",
    linkedinUrl: "https://www.linkedin.com/company/cartnest",
    gstinOrCin: "29AABCC8899P1Z5",
    recruiter: { name: "Ishaan Kapoor", designation: "Campus Hiring Manager", phone: "9830000010" },
    registeredDaysAgo: 30,
    drives: [
      {
        title: "Software Development Engineer I",
        description: "Work on search, cart and checkout services handling millions of orders a day.",
        ctcLpa: 12,
        location: "Bengaluru",
        deadlineInDays: 8,
        minCgpa: 8,
        branches: ["CSE", "CSE (AI & ML)", "CSE (Data Science)", "IT"],
        batch: 2027,
        maxBacklogs: 0,
        min10: 75,
        min12: 75,
      },
      {
        title: "Operations Analyst",
        description: "Supply chain analytics for dark stores. Excel and SQL required.",
        type: "BOTH",
        ctcLpa: 5.5,
        stipend: "₹20,000 / month during internship",
        location: "Kolkata",
        deadlineInDays: 30,
        status: "DRAFT",
        minCgpa: 6.5,
      },
    ],
  },
  {
    // Left pending so the TPO approval flow can be tried straight after seeding.
    email: "hr@acmerobotics.example",
    name: "Acme Robotics",
    description: "Industrial automation and robotics for factories in eastern India.",
    website: "https://acmerobotics.example",
    industry: "Manufacturing",
    size: "51-200",
    address: "Kalyani Industrial Estate, Nadia 741235",
    linkedinUrl: "https://www.linkedin.com/company/acme-robotics",
    gstinOrCin: "19AABCA6789L1Z3",
    recruiter: { name: "Neha Gupta", designation: "HR Lead", phone: "9830000007" },
    status: "PENDING",
    registeredDaysAgo: 3,
    drives: [],
  },
  {
    email: "talent@skywardedu.example",
    name: "Skyward Edutech",
    description: "Live online coding classes for school students.",
    website: "https://skywardedu.example",
    industry: "Education",
    size: "1-50",
    address: "Ballygunge, Kolkata 700019",
    linkedinUrl: "https://www.linkedin.com/company/skyward-edutech",
    gstinOrCin: null,
    recruiter: { name: "Tanvi Agarwal", designation: "Founder's Office", phone: "9830000011" },
    status: "PENDING",
    registeredDaysAgo: 1,
    drives: [],
  },
  {
    email: "hr@quickhire.example",
    name: "QuickHire Solutions",
    description: "Staffing and recruitment services.",
    website: "https://quickhire.example",
    industry: "Other",
    size: "1-50",
    address: "Howrah 711101",
    linkedinUrl: "https://www.linkedin.com/company/quickhire-solutions",
    gstinOrCin: "19AABCQ0000Q1Z0",
    recruiter: { name: "Vikram Singh", designation: "Director", phone: "9830000012" },
    status: "REJECTED",
    reason:
      "The GSTIN doesn't match the company name on the GST portal, and third-party staffing agencies aren't allowed on campus.",
    registeredDaysAgo: 26,
    drives: [],
  },
  {
    email: "jobs@pixelforge.example",
    name: "Pixelforge Studios",
    description: "Game art and animation outsourcing studio.",
    website: "https://pixelforge.example",
    industry: "Software Product",
    size: "51-200",
    address: "Sector V, Salt Lake, Kolkata 700091",
    linkedinUrl: "https://www.linkedin.com/company/pixelforge-studios",
    gstinOrCin: "19AABCP1122R1Z7",
    recruiter: { name: "Rahul Verma", designation: "Studio Manager", phone: "9830000013" },
    status: "SUSPENDED",
    reason: "Selected students from the last drive were asked to pay a training fee. Suspended pending inquiry.",
    registeredDaysAgo: 52,
    drives: [
      {
        title: "Junior 3D Artist",
        description: "Model and texture game assets in Blender and Substance Painter.",
        ctcLpa: 3.2,
        location: "Kolkata",
        deadlineInDays: -25,
        status: "CLOSED",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export type DemoStudent = {
  email: string;
  name: string;
  status: "DRAFT" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  note?: string;
  // How long ago the student registered.
  registeredDaysAgo: number;
  profile: {
    rollNumber?: string;
    branch?: string;
    batch?: number;
    cgpa?: number;
    activeBacklogs?: number;
    marks10?: number;
    marks12?: number;
    phone?: string;
    skills?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
  };
};

// Hand-written accounts that the docs refer to.
const namedStudents: DemoStudent[] = [
  {
    email: "student@brainware.edu",
    name: "Demo Student",
    status: "VERIFIED",
    registeredDaysAgo: 40,
    profile: {
      rollNumber: "BWU/BTECH/23/001",
      branch: "CSE",
      batch: 2027,
      cgpa: 8.2,
      activeBacklogs: 0,
      marks10: 88,
      marks12: 82,
      phone: "9876543210",
      skills: ["Java", "SQL", "React"],
      githubUrl: "https://github.com/demo-student",
    },
  },
  {
    email: "riya.student@brainware.edu",
    name: "Riya Chatterjee",
    status: "SUBMITTED",
    registeredDaysAgo: 6,
    profile: {
      rollNumber: "BWU/BTECH/23/014",
      branch: "ECE",
      batch: 2027,
      cgpa: 7.4,
      activeBacklogs: 1,
      marks10: 81,
      marks12: 76,
      phone: "9876500014",
      skills: ["Embedded C", "MATLAB"],
    },
  },
  { email: "new.student@brainware.edu", name: "Arnab Ghosh", status: "DRAFT", registeredDaysAgo: 2, profile: {} },
];

const firstNames = [
  "Aditya", "Ankita", "Arijit", "Ayan", "Debjani", "Dipanjan", "Ishita", "Kaustav", "Moumita", "Nilanjan",
  "Pallavi", "Pritam", "Rajdeep", "Rimjhim", "Ritwik", "Sayantani", "Shreya", "Soham", "Sneha", "Subhajit",
  "Sudipta", "Tanmoy", "Trisha", "Anirban", "Megha", "Rohit", "Priyanka", "Abhishek", "Sanjana", "Aniket",
  "Puja", "Sourav", "Ankur", "Nandini", "Arpita", "Kunal", "Swati", "Saptarshi", "Oindrila", "Amit",
];
const lastNames = [
  "Banerjee", "Bhattacharya", "Bose", "Chakraborty", "Das", "Dey", "Dutta", "Ghosh", "Kar", "Majumdar",
  "Mitra", "Mondal", "Mukherjee", "Nandi", "Paul", "Roy", "Saha", "Sarkar", "Sen", "Sinha",
  "Gupta", "Singh", "Jha", "Prasad", "Halder", "Pal", "Biswas", "Maity", "Hazra", "Chatterjee",
];

const skillsByBranch: Record<string, string[]> = {
  CSE: ["Java", "C++", "Python", "React", "Node.js", "SQL", "DSA", "Spring Boot", "Docker", "Git"],
  "CSE (AI & ML)": ["Python", "TensorFlow", "PyTorch", "scikit-learn", "NLP", "SQL", "Pandas", "OpenCV"],
  "CSE (Data Science)": ["Python", "SQL", "Power BI", "Tableau", "Pandas", "Statistics", "R", "Spark"],
  IT: ["Java", "JavaScript", "React", "SQL", "Linux", "Networking", "AWS", "PHP"],
  ECE: ["Embedded C", "VHDL", "MATLAB", "Arduino", "PCB Design", "IoT", "Verilog"],
  EE: ["MATLAB", "AutoCAD Electrical", "PLC", "Power Systems", "SCADA", "Python"],
  ME: ["AutoCAD", "SolidWorks", "ANSYS", "CATIA", "Six Sigma", "Thermodynamics"],
  CE: ["AutoCAD", "STAAD.Pro", "Revit", "Estimation", "Surveying", "Primavera"],
  BCA: ["Java", "Python", "HTML/CSS", "JavaScript", "SQL", "PHP", "Excel"],
  MCA: ["Java", "Python", "React", "Node.js", "SQL", "MongoDB", "AWS", "DSA"],
};

const rejectionNotes = [
  "Class 12 percentage doesn't match your marksheet on file. Please enter the aggregate shown on the board marksheet.",
  "Roll number is in the wrong format. Use the one printed on your university ID card.",
  "CGPA should be the cumulative CGPA up to the last semester, not the SGPA of one semester.",
  "University records show one active backlog. Please update the backlog count.",
];

// Branch decides the programme and roll number series; most of the batch passes out in 2027.
function rollFor(branch: string, batch: number, serial: number) {
  const n = String(serial).padStart(3, "0");
  if (branch === "BCA") return { rollNumber: `BWU/BCA/${batch - 2003}/${n}`, batch };
  if (branch === "MCA") return { rollNumber: `BWU/MCA/${batch - 2002}/${n}`, batch };
  return { rollNumber: `BWU/BTECH/${batch - 2004}/${n}`, batch };
}

function generateStudents(count: number): DemoStudent[] {
  const used = new Set<string>();
  const serials = new Map<string, number>();
  const result: DemoStudent[] = [];

  for (let i = 0; i < count; i++) {
    let first: string, last: string;
    do {
      first = pick(firstNames);
      last = pick(lastNames);
    } while (used.has(first + last));
    used.add(first + last);

    const branch = pick(branches);
    const batch = random() < 0.8 ? 2027 : 2028;
    const key = `${branch}-${batch}`;
    const serial = (serials.get(key) ?? 100) + 1;
    serials.set(key, serial);

    // A rough bell curve centred near 7.4.
    const cgpa = round(Math.min(9.8, Math.max(5.2, (between(5.4, 9.6) + between(5.4, 9.6)) / 2 + 0.1)), 2);
    const strong = cgpa >= 8;
    const roll = random();
    const status: DemoStudent["status"] =
      roll < 0.62 ? "VERIFIED" : roll < 0.8 ? "SUBMITTED" : roll < 0.88 ? "REJECTED" : "DRAFT";

    const handle = `${first}.${last}`.toLowerCase();
    const full = {
      ...rollFor(branch, batch, serial),
      branch,
      cgpa,
      activeBacklogs: cgpa < 6.5 && random() < 0.5 ? Math.ceil(random() * 3) : 0,
      marks10: round(between(strong ? 78 : 62, 97), 1),
      marks12: round(between(strong ? 72 : 58, 94), 1),
      phone: `${pick(["6", "7", "8", "9"])}${String(Math.floor(random() * 1e9)).padStart(9, "0")}`,
      skills: [...new Set(Array.from({ length: 3 + Math.floor(random() * 4) }, () => pick(skillsByBranch[branch])))],
      githubUrl: random() < 0.5 ? `https://github.com/${handle.replace(".", "-")}` : undefined,
      linkedinUrl: random() < 0.6 ? `https://www.linkedin.com/in/${handle.replace(".", "-")}` : undefined,
    };

    result.push({
      email: `${handle}@brainware.edu`,
      name: `${first} ${last}`,
      status,
      note: status === "REJECTED" ? pick(rejectionNotes) : undefined,
      registeredDaysAgo: Math.floor(between(5, 45)),
      // Incomplete profiles have only the basics filled in.
      profile:
        status === "DRAFT"
          ? { branch: full.branch, phone: random() < 0.5 ? full.phone : undefined }
          : full,
    });
  }
  return result;
}

export const demoStudents: DemoStudent[] = [...namedStudents, ...generateStudents(70)];

// Correction requests against locked fields of verified students.
export const demoCorrections = [
  { field: "marks12", requested: (v: number) => String(v + 1.4), reason: "Re-evaluation result raised my Class 12 marks. Updated marksheet attached with the college office.", status: "PENDING" },
  { field: "cgpa", requested: (v: number) => String(Math.min(10, v + 0.12).toFixed(2)), reason: "Semester 5 supplementary result is out and my CGPA has changed.", status: "PENDING" },
  { field: "activeBacklogs", requested: () => "0", reason: "Cleared my pending backlog in the supplementary exam.", status: "PENDING" },
  { field: "marks10", requested: (v: number) => String(v + 2), reason: "I entered the percentage without the additional subject.", status: "PENDING" },
  { field: "cgpa", requested: (v: number) => String(Math.min(10, v + 0.2).toFixed(2)), reason: "Result of semester 6 is published.", status: "APPROVED", note: null },
  { field: "marks12", requested: (v: number) => String(v + 6), reason: "Typo in my Class 12 marks.", status: "REJECTED", note: "Your board marksheet on file shows the value already entered." },
] as const;
