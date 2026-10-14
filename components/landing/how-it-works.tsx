const steps = [
  {
    title: "Create your account",
    description:
      "Students and companies register and complete their profile.",
  },
  {
    title: "Companies post openings",
    description:
      "Recruiters publish job postings, which the placement cell reviews and approves.",
  },
  {
    title: "Students apply",
    description:
      "Students browse approved postings and apply to the ones that fit.",
  },
  {
    title: "Track to the result",
    description:
      "Application statuses are updated as candidates move through the process.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-18 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-widest text-[#F12D32] uppercase">
            How it works
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-balance text-[#152C50] sm:text-4xl">
            From registration to placement in four steps
          </h2>
        </div>

        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#082B63] text-base font-bold text-white tabular-nums">
                  {index + 1}
                </span>
                {index < steps.length - 1 && (
                  <span
                    className="hidden h-px flex-1 bg-[#C9D8EC] lg:block"
                    aria-hidden="true"
                  />
                )}
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#152C50]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#526987]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
