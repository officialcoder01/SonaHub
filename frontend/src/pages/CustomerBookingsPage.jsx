import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import PublicLayout from "../layouts/PublicLayout";
import BookingStatusBadge from "../components/dashboard/BookingStatusBadge";
import BookingCardSkeleton from "../components/bookings/BookingCardSkeleton";
import BookingDetailsModal from "../components/bookings/BookingDetailsModal";
import { useAuth } from "../context/AuthContext";
import { getCustomerBookings, cancelBooking } from "../services/bookingService";
import { formatDate } from "../utils/serviceHelpers";

/**
 * CustomerBookingsPage displays a list of services booked by the current customer.
 * Supports status tracking, booking cancellations, detailed modal view, loading skeletons,
 * empty states, auto-dismissing toast notifications, and review status indicators.
 */
export default function CustomerBookingsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Component states
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Track specific booking cancellation actions to show inline spinner/loading
  const [cancellingId, setCancellingId] = useState(null);

  // Confirmation modal for cancellation
  const [cancelConfirmation, setCancelConfirmation] = useState({
    isOpen: false,
    bookingId: null,
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Read success messages passed via navigation state (e.g. from BookingModal)
  useEffect(() => {
    if (location.state?.toastMessage) {
      const message = location.state.toastMessage;
      Promise.resolve().then(() => {
        showToast(message);
      });
      // Clean up navigation state so toast does not show again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  //////////////////////////////////////////////////
  // Load Customer Bookings from GET /bookings/my
  //////////////////////////////////////////////////
  const loadBookings = useCallback(async () => {
    if (!token) return;
    setError("");

    try {
      const response = await getCustomerBookings(token);
      setBookings(response.bookings || []);
    } catch (err) {
      console.error("Failed to load customer bookings:", err);
      setError(err.message || "Unable to retrieve your bookings. Please try again.");
    }
  }, [token]);

  useEffect(() => {
    // If not logged in, or if logged-in user is not a customer, block access.
    if (!token) {
      navigate("/login");
      return;
    }
    if (user.role !== "CUSTOMER" && user.role !== "VENDOR") {
      navigate("/");
      return;
    }

    let isActive = true;

    Promise.resolve().then(() => {
      if (isActive) {
        setIsLoading(true);
      }
    });

    getCustomerBookings(token)
      .then((response) => {
        if (isActive) {
          setBookings(response.bookings || []);
          setError("");
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err.message || "Unable to retrieve your bookings. Please try again.");
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
  }, [token, user, navigate]);

  //////////////////////////////////////////////////
  // Handle Cancellation logic via PATCH /bookings/:id/cancel
  //////////////////////////////////////////////////
  const handleCancelBooking = (bookingId) => {
    // Open confirmation modal instead of window.confirm (works better on mobile)
    setCancelConfirmation({ isOpen: true, bookingId });
  };

  const handleConfirmCancellation = async () => {
    const { bookingId } = cancelConfirmation;

    // Close the modal
    setCancelConfirmation({ isOpen: false, bookingId: null });

    setCancellingId(bookingId);
    setError("");

    try {
      await cancelBooking(bookingId, token);
      showToast("Booking request cancelled successfully.");
      // Reload fresh list of bookings to reflect status updates
      await loadBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setError(err.message || "Could not cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelConfirmation = () => {
    setCancelConfirmation({ isOpen: false, bookingId: null });
  };

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
    setIsDetailsOpen(false);
  };

  //////////////////////////////////////////////////
  // Optimistic review update — called by BookingDetailsModal after a
  // successful submission so the booking card indicator updates immediately
  // without a full re-fetch of the bookings list.
  //////////////////////////////////////////////////
  const handleReviewSubmitted = (bookingId, newReview) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, review: newReview } : b
      )
    );

    // Also update the modal's booking reference so it reflects the new review
    // if the user keeps the modal open.
    setSelectedBooking((prev) =>
      prev && prev.id === bookingId ? { ...prev, review: newReview } : prev
    );
  };

  return (
    <PublicLayout contentClassName="max-w-[70rem] pb-24 pt-20 lg:pt-28">
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-xl animate-fade-in transition-all">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            ✓
          </div>
          <p className="text-sm font-semibold text-slate-800">{toast}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Section */}
      <section className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          My Bookings
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Track the status of your booking requests, cancel pending jobs, and view details.
        </p>
      </section>

      {/* Error state alert */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex justify-between items-center">
          <p>{error}</p>
          <button
            onClick={loadBookings}
            className="rounded-lg bg-red-100 px-3 py-1.5 font-semibold text-red-800 hover:bg-red-200 transition text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main List Area */}
      <div className="space-y-5">
        {isLoading ? (
          // Display matching skeletons while loading to preserve layout proportions
          Array.from({ length: 3 }).map((_, idx) => (
            <BookingCardSkeleton key={idx} />
          ))
        ) : bookings.length === 0 ? (
          // Empty State view with Browse CTA
          <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-2xl">
              📅
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-950">
              No Bookings Yet
            </h3>
            <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
              You haven&apos;t made any bookings yet. Browse our local artisans and request their services!
            </p>
            <div className="mt-6">
              <Link to="/market" className="btn-primary inline-flex px-6 py-3 font-semibold text-sm">
                Browse Services
              </Link>
            </div>
          </section>
        ) : (
          // Bookings list container (responsive grid/stacked list)
          bookings.map((booking) => {
            const firstImage = booking.service?.images?.[0];
            const imageUrl = firstImage
              ? typeof firstImage === "string"
                ? firstImage
                : firstImage.url
              : "";
            const serviceTitle = booking.service?.title || "Deleted Service";
            const vendorName = booking.vendor?.businessName || "Local Artisan";
            const bookingDate = formatDate(booking.createdAt);
            const status = booking.status;
            const message = booking.message;

            const isEligibleForCancel = status === "PENDING" || status === "ACCEPTED";
            const isCancelling = cancellingId === booking.id;

            // Review indicator: only meaningful on completed bookings.
            const isCompleted = status === "COMPLETED";
            const hasReview = Boolean(booking.review);

            return (
              <article
                key={booking.id}
                className="flex flex-col gap-5 sm:flex-row sm:items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 transition hover:shadow-md"
              >
                {/* Service Image */}
                <div className="h-60 xl:h-40 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-32">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={serviceTitle}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-center text-xs font-semibold text-slate-400 px-2">
                      No Image Added
                    </div>
                  )}
                </div>

                {/* Content details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="space-y-1.5">
                    {/* Top Row: Date & Status Badge */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold text-slate-500">
                        Booked on {bookingDate}
                      </span>
                      <BookingStatusBadge status={status} />
                    </div>

                    {/* Service Title */}
                    <h2 className="text-lg font-bold text-slate-950 truncate leading-snug">
                      {serviceTitle}
                    </h2>

                    {/* Artisan vendor business name */}
                    <p className="text-sm font-medium text-slate-600">
                      By <span className="font-semibold text-slate-800">{vendorName}</span>
                    </p>

                    {/* Optional Customer Message snippet */}
                    {message && (
                      <p className="mt-2 line-clamp-2 rounded-lg bg-slate-50 p-3 text-xs italic text-slate-600 leading-relaxed border border-slate-100">
                        &ldquo;{message}&rdquo;
                      </p>
                    )}

                    {/*
                      ────────────────────────────────────────────────────────
                      REVIEW INDICATOR BADGE
                      Shown only on completed bookings so the customer can
                      tell at a glance whether they have already reviewed
                      this service before opening the modal.

                      "Reviewed ★★★★★" — review exists, shows actual rating
                      "Review Pending" — completed but not yet reviewed
                      ────────────────────────────────────────────────────────
                    */}
                    {isCompleted && (
                      <div className="mt-2">
                        {hasReview ? (
                          // Show filled stars matching the submitted rating
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                            Reviewed
                            <span className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= booking.review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-transparent text-amber-300"
                                  }`}
                                />
                              ))}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                            Review Pending
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 flex justify-end gap-3 border-t border-slate-50 pt-3">
                    {isEligibleForCancel ? (
                      <button
                        type="button"
                        disabled={isCancelling}
                        onClick={() => handleCancelBooking(booking.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(booking)}
                        className="btn-secondary px-4 py-2 text-xs font-bold"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Details modal view */}
      <BookingDetailsModal
        key={selectedBooking?.id}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        booking={selectedBooking}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Cancel Confirmation Modal */}
      {cancelConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={handleCancelConfirmation}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-sm transform rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-950">Cancel Booking?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelConfirmation}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={cancellingId === cancelConfirmation.bookingId}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancellingId === cancelConfirmation.bookingId ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
