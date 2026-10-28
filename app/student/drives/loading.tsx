import { HeaderSkeleton, ListSkeleton, PageSkeleton } from "@/components/portal/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <ListSkeleton />
    </PageSkeleton>
  );
}
