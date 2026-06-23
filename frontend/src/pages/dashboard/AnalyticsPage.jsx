import { Eye, MessageSquare, TrendingUp } from "lucide-react";
import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Performance
        </p>
        <h1 className="mt-2">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm">
          A focused place for practical vendor insights as analytics endpoints mature.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard label="Views" value="N/A" helper="Awaiting analytics API" icon={Eye} />
        <DashboardStatCard label="Inquiries" value="N/A" helper="Awaiting analytics API" tone="green" icon={MessageSquare} />
        <DashboardStatCard label="Conversion" value="N/A" helper="Awaiting analytics API" tone="slate" icon={TrendingUp} />
      </div>

      <DashboardEmptyState
        eyebrow="Analytics"
        title="Analytics are not connected yet."
        description="No new endpoint was added for this redesign, so this page uses safe placeholders until real metrics are available."
      />
    </div>
  );
}
