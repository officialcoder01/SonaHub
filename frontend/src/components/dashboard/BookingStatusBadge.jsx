const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  ACCEPTED: "bg-blue-50 text-blue-700 ring-blue-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function BookingStatusBadge({ status }) {
  const normalizedStatus = status || "PENDING";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
        STATUS_STYLES[normalizedStatus] || STATUS_STYLES.PENDING
      }`}
    >
      {normalizedStatus}
    </span>
  );
}
