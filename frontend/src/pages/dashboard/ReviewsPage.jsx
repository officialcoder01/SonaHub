import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Customer trust
        </p>
        <h1 className="mt-2">Reviews</h1>
        <p className="mt-2 max-w-2xl text-sm">
          Review management will live here as the platform expands customer feedback tools.
        </p>
      </div>

      <DashboardEmptyState
        eyebrow="Reviews"
        title="No review workspace yet."
        description="Customer reviews are still shown through existing marketplace service pages. This dashboard area is ready for future review tools."
      />
    </div>
  );
}
