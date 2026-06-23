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
      slate: "bg-slate-100 text-slate-700",
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
        
        {/*
          //////////////////////////////////////////////////////////////////////
          // DYNAMIC ICON RENDERING
          //
          // DashboardStatCard conditionally renders the dynamic Lucide icon 
          // component passed via the `icon` prop (renamed locally to capitalized `Icon`).
          // The icon element (<Icon className="h-5 w-5" />) inherits its colors from
          // `toneClassName` to align with the dashboard's design token palette, and
          // is constrained to h-5 w-5 inside a h-9 w-9 container for visual balance.
          //////////////////////////////////////////////////////////////////////
        */}
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
