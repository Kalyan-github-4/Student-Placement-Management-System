import { HeaderSkeleton, ListSkeleton, PageSkeleton, TabsSkeleton } from "@/components/portal/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <TabsSkeleton count={5} />
      <ListSkeleton rows={6} />
    </PageSkeleton>
  );
}
