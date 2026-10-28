import { FormSkeleton, HeaderSkeleton, PageSkeleton } from "@/components/portal/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <FormSkeleton fields={8} />
    </PageSkeleton>
  );
}
