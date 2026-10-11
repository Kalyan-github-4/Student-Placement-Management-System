import { Users, Building2, User, BarChart3, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const cards = [
  {
    title: "For Students",
    description:
      "Explore job opportunities, apply to companies and track your placement status.",
    icon: Users,
    iconBg: "bg-[#174A91]",
    arrow: "text-[#174A91]",
  },
  {
    title: "For Companies",
    description:
      "Post job openings, manage applications and find the right talent.",
    icon: Building2,
    iconBg: "bg-[#F12D32]",
    arrow: "text-[#F12D32]",
  },
  {
    title: "For Placement Cell",
    description:
      "Coordinate drives, manage records and streamline the placement process.",
    icon: User,
    iconBg: "bg-[#174A91]",
    arrow: "text-[#174A91]",
  },
  {
    title: "Track & Grow",
    description:
      "Get insights, generate reports and make better decisions for a stronger future.",
    icon: BarChart3,
    iconBg: "bg-[#F12D32]",
    arrow: "text-[#F12D32]",
  },
];

export function FeatureCards() {
  return (
    <div className="relative z-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex flex-col rounded-[14px] bg-white p-6 shadow-[0_20px_45px_-15px_rgba(8,43,99,0.35)] sm:p-7"
        >
          <span
            className={cn(
              "mb-5 flex h-12 w-12 items-center justify-center rounded-full text-white",
              card.iconBg
            )}
          >
            <card.icon className="h-6 w-6" />
          </span>
          <h3 className="text-lg font-bold text-[#152C50]">{card.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#526987]">
            {card.description}
          </p>
          <ArrowRight className={cn("mt-5 h-5 w-5", card.arrow)} />
        </div>
      ))}
    </div>
  );
}
