import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import BookingStatusBadge from "../../components/dashboard/BookingStatusBadge";
import BookingTableSkeleton from "../../components/dashboard/BookingTableSkeleton";
import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/serviceHelpers.js";
import {
  acceptVendorBooking,
  completeVendorBooking,
  getVendorBookings,
  rejectVendorBooking,
} from "../../services/bookingService";

const STATUSES = ["ALL", "PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"];

function BookingActions({ booking, onAction, activeActionId }) {
  const isWorking = activeActionId === booking.id;

  if (booking.status === "PENDING") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary px-3 py-1.5 text-xs"
          disabled={isWorking}
          onClick={() => onAction(booking, "accept")}
        >
          Accept
        </button>
        <button
          type="button"
          className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isWorking}
          onClick={() => onAction(booking, "reject")}
        >
          Reject
        </button>
      </div>
    );
  }

  if (booking.status === "ACCEPTED") {
    return (
      <button
        type="button"
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isWorking}
        onClick={() => onAction(booking, "complete")}
      >
        Complete
      </button>
    );
  }

  return <span className="text-xs font-semibold text-slate-400">No action</span>;
}

export default function BookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeActionId, setActiveActionId] = useState("");

  const loadBookings = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Booking data comes from the existing vendor booking API and keeps its status contract.
      const response = await getVendorBookings(token);
      setBookings(response.bookings || []);
    } catch (err) {
      setError(err.message || "Unable to load bookings");
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

    getVendorBookings(token)
      .then((response) => {
        if (isActive) {
          setBookings(response.bookings || []);
          setError("");
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err.message || "Unable to load bookings");
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

  const filteredBookings = useMemo(() => {
    if (statusFilter === "ALL") {
      return bookings;
    }

    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      PENDING: bookings.filter((booking) => booking.status === "PENDING").length,
      ACCEPTED: bookings.filter((booking) => booking.status === "ACCEPTED").length,
      COMPLETED: bookings.filter((booking) => booking.status === "COMPLETED").length,
      CANCELLED: bookings.filter((booking) => booking.status === "CANCELLED").length,
    }),
    [bookings],
  );

  const handleBookingAction = async (booking, action) => {
    setActiveActionId(booking.id);
    setActionError("");

    try {
      const actionMap = {
        accept: acceptVendorBooking,
        reject: rejectVendorBooking,
        complete: completeVendorBooking,
      };
      const response = await actionMap[action](booking.id, token);
      const updatedBooking = response.booking || response;

      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.id === booking.id
            ? { ...currentBooking, ...updatedBooking }
            : currentBooking,
        ),
      );
    } catch (err) {
      setActionError(err.message || "Unable to update booking");
    } finally {
      setActiveActionId("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Booking management
        </p>
        <h1 className="mt-2">Bookings</h1>
        <p className="mt-2 max-w-2xl text-sm">
          Review customer requests, accept work, and mark accepted jobs complete.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label="Pending" value={statusCounts.PENDING} tone="amber" icon={Clock3} />
        <DashboardStatCard label="Accepted" value={statusCounts.ACCEPTED} tone="blue" icon={CalendarCheck} />
        <DashboardStatCard label="Completed" value={statusCounts.COMPLETED} tone="green" icon={CheckCircle2} />
        <DashboardStatCard label="Cancelled" value={statusCounts.CANCELLED} tone="slate" icon={XCircle} />
      </div>

      {isLoading ? <BookingTableSkeleton /> : null}

      {!isLoading && error ? (
        <DashboardEmptyState
          eyebrow="Bookings unavailable"
          title="We could not load your bookings."
          description={error}
          actionLabel="Try Again"
          onAction={loadBookings}
        />
      ) : null}

      {!isLoading && !error ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2>Customer Requests</h2>
              <p className="mt-1 text-sm">Filter by status without changing booking data.</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              Status
              <select
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {actionError ? <p className="form-error m-4">{actionError}</p> : null}

          {filteredBookings.length === 0 ? (
            <div className="p-4">
              <DashboardEmptyState
                eyebrow="Bookings"
                title="No bookings found."
                description="Bookings that match your selected status will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-950">
                          {booking.customer?.name || "Customer"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.customer?.email || "Email unavailable"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {booking.service?.title || "Service request"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatDate(booking.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <BookingStatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-4">
                        <BookingActions
                          booking={booking}
                          onAction={handleBookingAction}
                          activeActionId={activeActionId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
