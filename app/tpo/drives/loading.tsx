import { HeaderSkeleton, ListSkeleton, PageSkeleton, TabsSkeleton } from "@/components/portal/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton action />
      <TabsSkeleton count={6} />
      <ListSkeleton rows={6} />
    </PageSkeleton>
  );
}
