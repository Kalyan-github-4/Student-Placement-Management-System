import { Layers, BadgeCheck, Activity } from "lucide-react";

const points = [
  {
    title: "Centralized",
    description:
      "Student profiles, company details, job postings and applications live in one system instead of scattered sheets and emails.",
    icon: Layers,
  },
  {
    title: "Verified",
    description:
      "Companies and their job postings are reviewed by the placement cell before students see them.",
    icon: BadgeCheck,
  },
  {
    title: "Transparent",
    description:
      "Every application carries a status, so students and recruiters always know where things stand.",
    icon: Activity,
  },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-18 bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <p className="text-sm font-semibold tracking-widest text-[#F12D32] uppercase">
            About
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-balance text-[#152C50] sm:text-4xl">
            The whole placement process, in one place
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#526987] sm:text-lg">
            The Student Placement Management System brings together everyone
            involved in campus recruitment at Brainware University. Students
            find and apply to opportunities, companies reach the right
            candidates, and the placement cell keeps the process organised from
            the first posting to the final result.
          </p>
        </div>

        <ul className="grid gap-5">
          {points.map((point) => (
            <li
              key={point.title}
              className="flex gap-5 rounded-2xl border border-[#E1EAF5] bg-[#F7FAFE] p-6"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#174A91] text-white">
                <point.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#152C50]">
                  {point.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#526987]">
                  {point.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
