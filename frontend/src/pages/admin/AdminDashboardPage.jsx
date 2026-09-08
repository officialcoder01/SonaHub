import { useCallback, useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  UsersRound,
} from "lucide-react";
import AdminDashboardSkeleton from "../../components/admin/AdminDashboardSkeleton";
import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboard } from "../../services/adminService";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatActivityDate = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : dateFormatter.format(date);
};

export default function AdminDashboardPage() {
  // const navigate = useNavigate();
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      // The endpoint deliberately supplies all dashboard data in one response so widgets update together.
      const result = await getAdminDashboard(token);
      setDashboard(result);
    } catch (err) {
      setError(err.message || "Unable to load the admin dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isActive = true;

    if (!token) return undefined;

    // Avoid updating the view if the admin navigates away before the request completes.
    getAdminDashboard(token)
      .then((result) => {
        if (isActive) setDashboard(result);
      })
      .catch((err) => {
        if (isActive) setError(err.message || "Unable to load the admin dashboard.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const stats = useMemo(
    () => [
      { label: "Total Users", value: dashboard?.stats?.totalUsers, icon: UsersRound, tone: "blue" },
      { label: "Pending Verification", value: dashboard?.stats?.pendingVerification, icon: Clock3, tone: "amber" },
      { label: "Total Services", value: dashboard?.stats?.totalServices, icon: BriefcaseBusiness, tone: "violet" },
      { label: "Verified Vendors", value: dashboard?.stats?.verifiedVendors, icon: BadgeCheck, tone: "green" },
    ],
    [dashboard]
  );

  const categories = dashboard?.servicesByCategory || [];
  const highestCategoryCount = Math.max(...categories.map((category) => category?._count?.services || 0), 1);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {isLoading ? <AdminDashboardSkeleton /> : null}

        {!isLoading && error ? (
          <DashboardEmptyState
            eyebrow="Admin dashboard"
            title="We could not load your dashboard."
            description={error}
            actionLabel="Try Again"
            onAction={loadDashboard}
          />
        ) : null}

        {!isLoading && !error && dashboard ? (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Dashboard</p>
              <h1 className="mt-2">Welcome back, {user?.name || "Admin"}</h1>
              <p className="mt-2 max-w-2xl text-sm">Here is a clear view of your marketplace activity and vendor verification queue.</p>
            </header>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Marketplace statistics">
              {stats.map((stat) => <DashboardStatCard key={stat.label} {...stat} />)}
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2>Pending Verification</h2>
                    <p className="mt-1 text-sm">Vendors waiting for an account review.</p>
                  </div>
                  <button type="button" className="btn-secondary w-full px-3 py-1.5 text-xs sm:w-auto" onClick={() => alert("This would navigate to the vendor verification page.")}>
                    View All
                  </button>
                </div>

                {dashboard.pendingVendors?.length ? (
                  <div className="mt-5 divide-y divide-slate-100">
                    {dashboard.pendingVendors.map((vendor) => (
                      <article key={vendor.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">{vendor.businessName || vendor.user?.name || "Vendor"}</p>
                          <p className="truncate text-sm">{vendor.user?.email || "No email available"}</p>
                        </div>
                        <button type="button" className="btn-primary shrink-0 px-3 py-1.5 text-xs" onClick={() => alert(`This would navigate to the vendor verification page for ${vendor.businessName || vendor.user?.name || "Vendor"}.`)}>
                          Review
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-600">There are no vendors awaiting verification.</div>
                )}
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2>Recent Activity</h2>
                <p className="mt-1 text-sm">Latest actions across the marketplace.</p>
                {dashboard.recentActivities?.length ? (
                  <ol className="mt-5 space-y-4">
                    {dashboard.recentActivities.map((activity) => (
                      <li key={activity.id} className="border-l-2 border-blue-100 pl-3">
                        <p className="text-sm font-medium leading-6 text-slate-800">{activity.message || activity.type || "Marketplace activity"}</p>
                        <time className="mt-1 block text-xs text-slate-500" dateTime={activity.createdAt}>{formatActivityDate(activity.createdAt)}</time>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-5 rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-600">No recent activity to show yet.</div>
                )}
              </section>
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2>Services By Category</h2>
              <p className="mt-1 text-sm">Active services in your most populated categories.</p>
              {categories.length ? (
                <div className="mt-6 space-y-5">
                  {categories.map((category) => {
                    const count = category?._count?.services || 0;
                    const width = `${Math.max((count / highestCategoryCount) * 100, count ? 8 : 0)}%`;

                    return (
                      <div key={category.id} className="grid gap-2 sm:grid-cols-[minmax(120px,0.35fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                        <p className="truncate text-sm font-semibold text-slate-700">{category.name}</p>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${category.name} services`} aria-valuemin="0" aria-valuemax={highestCategoryCount} aria-valuenow={count}>
                          <div className="h-full rounded-full bg-blue-600 transition-[width] duration-300" style={{ width }} />
                        </div>
                        <span className="text-right text-sm font-semibold tabular-nums text-slate-600">{count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-600">No active services have been grouped into categories yet.</div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
