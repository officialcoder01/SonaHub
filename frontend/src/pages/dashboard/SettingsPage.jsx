import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Workspace preferences
        </p>
        <h1 className="mt-2">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm">
          Account and vendor workspace settings will collect here as the platform grows.
        </p>
      </div>

      <DashboardEmptyState
        eyebrow="Settings"
        title="No dashboard settings yet."
        description="This page is intentionally prepared for future settings without creating mock business logic."
      />
    </div>
  );
}
