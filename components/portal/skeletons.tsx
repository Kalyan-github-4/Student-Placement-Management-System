import { cn } from "@/lib/utils";

// Loading placeholders shaped like the real portal pages, so content swaps in without
// the layout jumping. Used by each route's loading.tsx, which Next.js prefetches and
// shows the moment a tab is tapped.

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-[#E3ECF7]", className)} />;
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-[#D9E4F2] bg-white", className)}>{children}</div>;
}

export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-label="Loading" className="grid gap-6">
      {children}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function HeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      {action && <Skeleton className="h-10 w-32 rounded-lg" />}
    </div>
  );
}

export function TabsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-8 w-28 rounded-full" />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card className="divide-y divide-[#D9E4F2] overflow-hidden">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-5 sm:px-6">
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
        </div>
      ))}
    </Card>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="grid gap-3 p-5">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-28" />
        </Card>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <Card className="grid gap-5 p-5 sm:p-6">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="grid gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-36 rounded-lg" />
    </Card>
  );
}

// Back link, title, then a main column of sections beside a narrow side column.
export function DetailSkeleton() {
  return (
    <>
      <div className="grid gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid content-start gap-6">
          {[5, 3].map((lines, i) => (
            <Card key={i} className="grid gap-4 p-5 sm:p-6">
              <Skeleton className="h-5 w-40" />
              {Array.from({ length: lines }, (_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </Card>
          ))}
        </div>
        <Card className="grid content-start gap-3 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </Card>
      </div>
    </>
  );
}
