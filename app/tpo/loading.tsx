import { HeaderSkeleton, ListSkeleton, PageSkeleton, StatsSkeleton } from "@/components/portal/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <StatsSkeleton />
      <StatsSkeleton count={3} />
      <ListSkeleton rows={3} />
    </PageSkeleton>
  );
}
