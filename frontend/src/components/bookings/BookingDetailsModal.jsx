import { useState, useEffect } from "react";
import { formatDate } from "../../utils/serviceHelpers";
import BookingStatusBadge from "../dashboard/BookingStatusBadge";
import ReviewForm from "../reviews/ReviewForm";
import ReviewDisplay from "../reviews/ReviewDisplay";
import { useAuth } from "../../context/AuthContext";

/**
 * BookingDetailsModal displays detailed, read-only information about a specific booking.
 * For COMPLETED bookings it renders the inline review experience:
 *  - ReviewForm when no review exists yet
 *  - ReviewDisplay when a review has already been submitted
 *
 * The review UI lives directly inside this modal — no separate page, drawer,
 * nested modal, or bottom sheet is used.
 */
export default function BookingDetailsModal({ isOpen, onClose, booking, onReviewSubmitted }) {
  const { token } = useAuth();

  // Local review state — initialised from the booking prop so the correct
  // component (form or display) renders immediately on open.
  // When the customer submits a new review, onSubmitted updates this state
  // and the form is swapped out for the read-only display without closing
  // the modal or triggering a full page reload.
  const [localReview, setLocalReview] = useState(booking?.review ?? null);

  useEffect(() => {
    // Sync local review state with the booking prop whenever it changes.
    setLocalReview(booking?.review ?? null);
  }, [booking]);

  if (!isOpen || !booking) return null;

  // Graceful fallbacks for display fields
  const serviceTitle  = booking.service?.title || "Unknown Service";
  const vendorName    = booking.vendor?.businessName || "Local Artisan";
  const bookingDate   = formatDate(booking.createdAt);
  const completionDate = booking.completedAt ? formatDate(booking.completedAt) : null;
  const status        = booking.status;

  // Determine which review UI state to render:
  //   - isCompleted: only COMPLETED bookings receive the review section
  //   - hasReview  : controls form vs. display
  const isCompleted = status === "COMPLETED";
  const hasReview   = Boolean(localReview);

  const handleReviewSubmitted = (newReview) => {
    // Update local state so the form is immediately replaced by the
    // read-only display — optimistic UI, no API re-fetch required.
    setLocalReview(newReview);

    // Propagate upward so the parent page (CustomerBookingsPage) can
    // update the booking card indicator (Reviewed ★ vs Review Pending)
    // without a full refetch.
    if (typeof onReviewSubmitted === "function") {
      onReviewSubmitted(booking.id, newReview);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-8 max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Booking Details
            </span>
            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
              Booking Summary
            </h2>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <span className="text-lg font-bold">✕</span>
          </button>
        </div>

        {/* Body Details */}
        <div className="mt-6 space-y-4 text-sm">
          {/* Service Title */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Service
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">
              {serviceTitle}
            </p>
          </div>

          {/* Service Images Gallery */}
          {booking.service?.images && booking.service.images.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Service Images
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {booking.service.images.map((image) => (
                  <div
                    key={image.id}
                    className="flex-shrink-0 h-32 w-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                  >
                    <img
                      src={image.url}
                      alt="Service"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendor / Artisan */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Artisan
            </p>
            <p className="mt-1 font-semibold text-slate-800">{vendorName}</p>
          </div>

          {/* Status Badge */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Status
            </p>
            <div className="mt-1.5">
              <BookingStatusBadge status={status} />
            </div>
          </div>

          {/* Booking Request Date */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Booking Placed
            </p>
            <p className="mt-1 text-slate-700">{bookingDate}</p>
          </div>

          {/* Completed Date */}
          {completionDate && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Completed On
              </p>
              <p className="mt-1 text-emerald-700 font-semibold">{completionDate}</p>
            </div>
          )}

          {/*
            ────────────────────────────────────────────────────────────────
            REVIEW SECTION
            Only rendered for COMPLETED bookings.

            Conditional rendering:
              - hasReview  → ReviewDisplay (read-only, permanent)
              - !hasReview → ReviewForm   (interactive, one-time submission)
            ────────────────────────────────────────────────────────────────
          */}
          {isCompleted && (
            <div className="border-t border-slate-100 pt-4">
              {hasReview ? (
                // The customer has already reviewed this booking — show read-only display.
                <ReviewDisplay review={localReview} />
              ) : (
                // No review yet — show the interactive submission form.
                <ReviewForm
                  bookingId={booking.id}
                  token={token}
                  onSubmitted={handleReviewSubmitted}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="btn-secondary w-full sm:w-auto px-5 py-2.5"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
