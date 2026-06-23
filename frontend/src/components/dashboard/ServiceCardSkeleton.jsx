export default function ServiceCardSkeleton() {
  return (
    <article
      className="min-h-[292px] animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      aria-hidden="true"
    >
      <div className="h-36 bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-5 w-4/5 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-2/3 rounded bg-slate-100" />
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded bg-slate-200" />
            <div className="h-8 w-16 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </article>
  );
}
