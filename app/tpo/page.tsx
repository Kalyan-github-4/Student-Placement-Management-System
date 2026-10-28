import Link from "next/link";
import { ArrowRight, Briefcase, Building2, ClipboardCheck, FilePen, GraduationCap, UserCheck } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { countDrivesByStatus } from "@/lib/data/drives";
import {
  getCompanyCounts,
  getStudentCounts,
  listCompanies,
  listPendingCorrections,
} from "@/lib/data/tpo";
import { CompanyTable } from "./companies/company-table";

export default async function TpoOverview() {
  const user = await requireRole("TPO", "SUPER_ADMIN");
  const [companyCounts, studentCounts, corrections, pendingDrives, openDrives, pending] =
    await Promise.all([
      getCompanyCounts(),
      getStudentCounts(),
      listPendingCorrections(),
      countDrivesByStatus("PENDING_APPROVAL"),
      countDrivesByStatus("OPEN"),
      listCompanies("PENDING"),
    ]);

  // The first row is the TPO's to-do list; the second is the state of the season.
  const todo = [
    { label: "Profiles to verify", value: studentCounts.SUBMITTED, icon: UserCheck, href: "/tpo/students?status=SUBMITTED" },
    { label: "Correction requests", value: corrections.length, icon: FilePen, href: "/tpo/corrections" },
    { label: "Companies to review", value: companyCounts.PENDING, icon: Building2, href: "/tpo/companies?status=PENDING" },
    { label: "Drives to approve", value: pendingDrives, icon: ClipboardCheck, href: "/tpo/drives?status=PENDING_APPROVAL" },
  ];
  const season = [
    { label: "Verified students", value: studentCounts.VERIFIED, icon: GraduationCap, href: "/tpo/students?status=VERIFIED" },
    { label: "Approved companies", value: companyCounts.APPROVED, icon: Building2, href: "/tpo/companies?status=APPROVED" },
    { label: "Open drives", value: openDrives, icon: Briefcase, href: "/tpo/drives?status=OPEN" },
  ];

  const tile = (stat: (typeof todo)[number], highlight: boolean) => (
    <Link
      key={stat.label}
      href={stat.href}
      className={`rounded-2xl border bg-white p-5 transition hover:border-[#174A91] ${
        highlight && stat.value > 0 ? "border-amber-300" : "border-[#D9E4F2]"
      }`}
    >
      <stat.icon className="h-5 w-5 text-[#174A91]" />
      <p className="mt-3 text-3xl font-bold text-[#152C50]">{stat.value}</p>
      <p className="text-sm text-[#526987]">{stat.label}</p>
    </Link>
  );

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Placement cell</h1>
        <p className="mt-1 text-[#526987]">Signed in as {user.email}</p>
      </div>

      {user.role === "SUPER_ADMIN" && (
        <p className="rounded-2xl border border-[#D9E4F2] bg-white p-4 text-sm text-[#526987] sm:px-6">
          You&apos;re in the placement cell portal as Super Admin. Your decisions here are recorded
          in the audit log under your account.{" "}
          <Link href="/admin" className="font-semibold text-[#174A91] hover:underline">
            Back to Super Admin
          </Link>
        </p>
      )}

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-[#526987] uppercase">Needs your attention</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{todo.map((s) => tile(s, true))}</div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-[#526987] uppercase">This season</h2>
        <div className="grid gap-4 sm:grid-cols-3">{season.map((s) => tile(s, false))}</div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-[#D9E4F2] p-5 sm:px-6">
          <h2 className="text-lg font-semibold text-[#152C50]">Companies awaiting review</h2>
          <Link
            href="/tpo/companies"
            className="flex items-center gap-1 text-sm font-semibold text-[#174A91] hover:underline"
          >
            All companies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CompanyTable companies={pending} />
      </section>
    </div>
  );
}
