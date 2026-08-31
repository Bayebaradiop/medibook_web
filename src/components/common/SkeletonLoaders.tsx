import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Hero Header Skeleton */}
    <div className="rounded-3xl p-8 bg-muted/60 h-44 flex flex-col justify-between">
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-full" />
        <Skeleton className="h-8 w-72 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32 rounded-2xl" />
        <Skeleton className="h-10 w-44 rounded-2xl" />
      </div>
    </div>

    {/* Quick Actions Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-3xl border border-border/60 bg-card flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-3xl border border-border/60 bg-card space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-2xl" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-md" />
        </div>
      ))}
    </div>

    {/* Charts & Tables Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 p-6 rounded-3xl border border-border/60 bg-card space-y-4">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
      <div className="lg:col-span-5 p-6 rounded-3xl border border-border/60 bg-card space-y-4">
        <Skeleton className="h-6 w-36 rounded-md" />
        <Skeleton className="h-64 w-full rounded-full" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-4 animate-pulse">
    {/* Filter & Action Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <Skeleton className="h-10 w-64 sm:w-80 rounded-2xl" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28 rounded-2xl" />
        <Skeleton className="h-10 w-36 rounded-2xl" />
      </div>
    </div>

    {/* Table Card */}
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
      <div className="p-4 bg-muted/40 border-b border-border flex justify-between gap-4">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>

      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <Skeleton className="h-10 w-72 rounded-2xl" />
      <Skeleton className="h-10 w-36 rounded-2xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-3xl border border-border/60 bg-card space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <div className="pt-3 border-t border-border/40 flex justify-between items-center">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="p-8 rounded-3xl border border-border/60 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-3xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-lg" />
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded-2xl" />
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 p-6 rounded-3xl border border-border/60 bg-card space-y-4">
        <Skeleton className="h-5 w-36 rounded-md" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      </div>

      <div className="md:col-span-2 p-6 rounded-3xl border border-border/60 bg-card space-y-4">
        <Skeleton className="h-5 w-48 rounded-md" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
    <div className="p-6 rounded-3xl border border-border/60 bg-card space-y-4">
      <Skeleton className="h-7 w-48 rounded-lg" />
      <Skeleton className="h-4 w-72 rounded-md" />
      
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <Skeleton className="h-11 w-28 rounded-2xl" />
        <Skeleton className="h-11 w-36 rounded-2xl" />
      </div>
    </div>
  </div>
);
