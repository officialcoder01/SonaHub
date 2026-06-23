export default function BookingTableSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      aria-hidden="true"
    >
      <div className="grid grid-cols-4 gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-3 rounded bg-slate-200" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-1 gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:grid-cols-4"
        >
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="h-7 w-28 rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
