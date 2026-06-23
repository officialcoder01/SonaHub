import { useState } from "react";
import { Star } from "lucide-react";

/**
 * ReviewForm allows a customer to rate and comment on a completed booking.
 *
 * Props:
 *  - bookingId   : string  — the booking being reviewed
 *  - token       : string  — JWT token for the API call
 *  - onSubmitted : (review) => void — called with the created review on success
 */
export default function ReviewForm({ bookingId, token, onSubmitted }) {
  // Track which star the user has selected (1–5) or hovered over.
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  // Submission state — prevents double-posting and drives button/field disabled state.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline error message shown below the star row or below the button.
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side guard: rating is the only required field.
    if (!rating) {
      setError("Please select a rating before submitting.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // Lazy-import the service to keep the module graph clean and avoid
      // circular dependencies when this component is used in the modal.
      const { submitReview } = await import("../../services/reviewService.js");

      const result = await submitReview(
        {
          bookingId,
          rating,
          // Pass undefined when the comment is empty so the backend stores null
          // rather than an empty string.
          comment: comment.trim() || undefined,
        },
        token
      );

      // Bubble the newly created review object up to the modal so it can
      // immediately replace this form with the read-only ReviewDisplay —
      // no page refresh or modal close needed.
      onSubmitted(result.review);
    } catch (err) {
      // Surface meaningful errors from the API directly in the form.
      setError(err.message || "Unable to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
      {/* Section heading */}
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
        Rate Your Experience
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* ─── Star selector ─────────────────────────────────────────── */}
        <div
          className="flex items-center gap-1 mb-3"
          role="group"
          aria-label="Star rating"
        >
          {[1, 2, 3, 4, 5].map((star) => {
            // A star is "active" when it falls within the hovered range,
            // or — when the user is not hovering — within the selected range.
            const isActive = star <= (hovered || rating);

            return (
              <button
                key={star}
                type="button"
                disabled={isSubmitting}
                aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="rounded p-0.5 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    isActive
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-slate-300"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* ─── Optional comment ──────────────────────────────────────── */}
        <textarea
          id={`review-comment-${bookingId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          placeholder="Share your experience (optional)"
          className="form-input resize-none text-sm leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
          maxLength={1000}
        />

        {/* ─── Inline error ──────────────────────────────────────────── */}
        {error && (
          <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
        )}

        {/* ─── Submit ────────────────────────────────────────────────── */}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-5 py-2 text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
