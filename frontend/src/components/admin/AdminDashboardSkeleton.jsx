import DashboardCardSkeleton from "../dashboard/DashboardCardSkeleton";

export default function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading admin dashboard">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-9 w-56 rounded bg-slate-200" />
        <div className="h-4 w-full max-w-md rounded bg-slate-100" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardCardSkeleton key={index} rows={0} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        <div className="animate-pulse rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 rounded bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="animate-pulse rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-6 w-36 rounded bg-slate-200" />
          <div className="mt-5 space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-8 rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
