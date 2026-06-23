export default function DashboardEmptyState({
  eyebrow = "No data yet",
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm">{description}</p> : null}
      {actionLabel && onAction ? (
        <button type="button" className="btn-primary mt-5" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
