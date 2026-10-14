import { GraduationCap, Building2, ShieldCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  {
    title: "For Students",
    description: "Find opportunities and follow every application.",
    icon: GraduationCap,
    accent: "bg-[#174A91]",
    check: "text-[#174A91]",
    items: [
      "Build your academic and skills profile",
      "Browse approved job postings",
      "Apply to companies in a few clicks",
      "Track the status of each application",
    ],
  },
  {
    title: "For Companies",
    description: "Reach the right candidates on campus.",
    icon: Building2,
    accent: "bg-[#F12D32]",
    check: "text-[#F12D32]",
    items: [
      "Create your company profile",
      "Post job openings with requirements",
      "Review applications from students",
      "Update candidates as they progress",
    ],
  },
  {
    title: "For Placement Cell",
    description: "Keep the whole process under control.",
    icon: ShieldCheck,
    accent: "bg-[#082B63]",
    check: "text-[#082B63]",
    items: [
      "Approve companies and job postings",
      "Manage student and company records",
      "Monitor applications across drives",
      "Maintain placement records",
    ],
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-18 bg-[#F0F6FD]">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-widest text-[#F12D32] uppercase">
            Features
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-balance text-[#152C50] sm:text-4xl">
            Built for everyone in the placement process
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#526987] sm:text-lg">
            Each role gets its own portal with the tools it needs.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.title}
              className="flex flex-col rounded-2xl bg-white p-7 shadow-[0_20px_45px_-25px_rgba(8,43,99,0.35)] sm:p-8"
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl text-white",
                  role.accent
                )}
              >
                <role.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-[#152C50]">
                {role.title}
              </h3>
              <p className="mt-1.5 text-sm text-[#526987]">
                {role.description}
              </p>
              <ul className="mt-6 grid gap-3 border-t border-[#E1EAF5] pt-6">
                {role.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-[#152C50]"
                  >
                    <Check
                      className={cn("mt-0.5 h-4 w-4 shrink-0", role.check)}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
