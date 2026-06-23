export default function DashboardCardSkeleton({ rows = 2, className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="w-full space-y-3">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-7 w-16 rounded bg-slate-200" />
        </div>
        <div className="h-9 w-9 rounded-lg bg-slate-200" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-3 rounded bg-slate-100"
            style={{ width: `${88 - index * 18}%` }}
          />
        ))}
      </div>
    </div>
  );
}
