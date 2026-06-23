import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/serviceHelpers";

/**
 * BookingModal allows authenticated customers to request a service.
 * Displays service details, vendor business name, starting price, and an optional message.
 */
export default function BookingModal({ isOpen, onClose, service }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !service) return null;

  // Extract vendor details gracefully
  const vendorName = service.vendor?.businessName || "Local Artisan";

  //////////////////////////////////////////////////
  // Handle booking submission to POST /bookings
  //////////////////////////////////////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // API call expects { serviceId, message }
      await createBooking(
        {
          serviceId: service.id,
          message: message.trim() || undefined,
        },
        token
      );

      // Reset state and close modal
      setMessage("");
      onClose();

      // Redirect to bookings list page, passing toast state
      navigate("/bookings", {
        state: { toastMessage: "Booking request sent successfully." },
        replace: true,
      });
    } catch (err) {
      console.error("Failed to submit booking:", err);
      setError(err.message || "Something went wrong while booking the service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Modal backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg transform rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Request Booking
          </h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <span className="text-lg font-bold">X</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Service summary */}
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Service Details
          </p>
          <h3 className="mt-1 font-bold text-slate-900 text-lg">
            {service.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <span>By: <span className="font-semibold text-slate-800">{vendorName}</span></span>
            <span className="font-bold text-blue-700">{formatPrice(service.price)}</span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-message" className="text-sm font-semibold text-slate-700">
              Optional Message for Artisan
            </label>
            <textarea
              id="booking-message"
              rows={4}
              maxLength={500}
              placeholder="Tell the artisan about your project requirements, preferred timeline, or ask a question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
            />
            <p className="text-right text-xs text-slate-400">
              {message.length}/500 characters
            </p>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col gap-3 pt-3 sm:flex-row-reverse">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full sm:flex-1"
            >
              {isSubmitting ? "Submitting Booking..." : "Submit Booking"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
