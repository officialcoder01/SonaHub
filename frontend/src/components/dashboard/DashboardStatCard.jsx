export default function DashboardStatCard({
  label,
  value,
  helper,
  tone = "blue",
  icon: Icon,
}) {
  const toneClassName =
    {
      blue: "bg-blue-50 text-blue-700",
      green: "bg-emerald-50 text-emerald-700",
      amber: "bg-amber-50 text-amber-700",
      violet: "bg-violet-50 text-violet-700",
    }[tone] || "bg-blue-50 text-blue-700";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold leading-none text-slate-950">
            {value}
          </p>
        </div>
        
        {Icon ? (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClassName}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      {helper ? (
        <p className="mt-3 text-xs font-medium leading-5 text-slate-500">
          {helper}
        </p>
      ) : null}
    </article>
  );
}
