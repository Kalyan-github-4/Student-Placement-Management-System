import { FormSkeleton, HeaderSkeleton, ListSkeleton, PageSkeleton } from "@/components/portal/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <FormSkeleton fields={3} />
      <ListSkeleton rows={3} />
    </PageSkeleton>
  );
}
