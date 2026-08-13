import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarCheck,
  Clock3,
  CheckCircle2,
  Star,
} from "lucide-react";
import DashboardCardSkeleton from "../../components/dashboard/DashboardCardSkeleton";
import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import BookingStatusBadge from "../../components/dashboard/BookingStatusBadge";
import VendorProfileForm from "../../components/dashboard/VendorProfileForm";
import { useAuth } from "../../context/AuthContext";
import { getVendorBookings } from "../../services/bookingService";
import { getMyProfile } from "../../services/vendorService";

export default function OverviewPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Dashboard state is loaded together so the stat cards settle at the same time.
      const [profileResult, bookingsResult] = await Promise.all([
        getMyProfile(token),
        getVendorBookings(token).catch(() => ({ bookings: [] })),
      ]);

      setProfile(profileResult);
      setBookings(bookingsResult.bookings || []);
    } catch (err) {
      setError(err.message || "Unable to load dashboard overview");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isActive = true;

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    // Protect state updates if the vendor leaves the dashboard mid-request.
    Promise.all([
      getMyProfile(token),
      getVendorBookings(token).catch(() => ({ bookings: [] })),
    ])
      .then(([profileResult, bookingsResult]) => {
        if (isActive) {
          setProfile(profileResult);
          setBookings(bookingsResult.bookings || []);
          setError("");
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err.message || "Unable to load dashboard overview");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const stats = useMemo(
    () => [
      {
        label: "Total Services",
        value: profile?.servicesCount,
        tone: "blue",
        icon: BriefcaseBusiness,
      },
      {
        label: "Total Bookings",
        value: profile?.totalBookingsCount,
        tone: "green",
        icon: CalendarCheck,
      },
      {
        label: "Pending Requests",
        value: profile?.pendingBookingsCount,
        tone: "amber",
        icon: Clock3,
      },
      {
        label: "Completed Jobs",
        value: profile?.completedBookingsCount,
        tone: "violet",
        icon: CheckCircle2,
      },
      {
        label: "Average Rating",
        value: `${profile?.reviewStats.averageRating || "N/A"}${profile?.reviewStats.totalReviews > 0 ? ` (${profile.reviewStats.totalReviews})` : ""}`,
        tone: "slate",
        icon: Star,
      },
    ],
    [profile]
  );

  const recentBookings = bookings.slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Dashboard overview
        </p>
        <h1 className="mt-2">Welcome back{profile?.businessName ? `, ${profile.businessName}` : ""}</h1>
        <p className="mt-2 max-w-2xl text-sm">
          Track the work that matters most without turning your craft into a maze of charts.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <DashboardCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <DashboardEmptyState
          eyebrow="Dashboard unavailable"
          title="We could not load your workspace."
          description={error}
          actionLabel="Try Again"
          onAction={loadDashboard}
        />
      ) : null}

      {!isLoading && error && !profile ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Vendor profile
            </p>
            <h2 className="mt-2">Complete your vendor profile</h2>
          </div>
          <VendorProfileForm token={token} onProfileCreated={loadDashboard} />
        </section>
      ) : null}

      {!isLoading && !error && profile ? (
        <>
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <DashboardStatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2>Recent Bookings</h2>
                  <p className="mt-1 text-sm">Latest customer requests and job updates.</p>
                </div>
                <button
                  type="button"
                  className="btn-secondary px-3 py-1.5 text-xs"
                  onClick={() => navigate("/dashboard/bookings")}
                >
                  View All
                </button>
              </div>

              {recentBookings.length > 0 ? (
                <div className="mt-5 divide-y divide-slate-100">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">
                          {booking.customer?.name || booking.customer?.email || "Customer"}
                        </p>
                        <p className="mt-1 text-sm">
                          {booking.service?.title || "Service request"}
                        </p>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <DashboardEmptyState
                  eyebrow="Bookings"
                  title="No bookings yet."
                  description="New customer requests will appear here once people start booking your services."
                />
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2>Quick Actions</h2>
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  className="w-full rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-left text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                  onClick={() => navigate("/dashboard/create-service")}
                >
                  Add New Service
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                  onClick={() => navigate("/dashboard/services")}
                >
                  Manage Services
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  onClick={() => navigate("/dashboard/vendor-profile")}
                >
                  Update Vendor Profile
                </button>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
