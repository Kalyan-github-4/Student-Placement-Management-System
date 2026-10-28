import { FormSkeleton, HeaderSkeleton, ListSkeleton, PageSkeleton } from "@/components/portal/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <FormSkeleton fields={2} />
      <ListSkeleton rows={3} />
    </PageSkeleton>
  );
}
