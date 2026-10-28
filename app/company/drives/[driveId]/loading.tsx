import { DetailSkeleton, PageSkeleton } from "@/components/portal/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <DetailSkeleton />
    </PageSkeleton>
  );
}
