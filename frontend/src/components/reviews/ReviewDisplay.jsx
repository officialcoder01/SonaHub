import { Star } from "lucide-react";
import { formatDate } from "../../utils/serviceHelpers";

/**
 * ReviewDisplay renders a read-only summary of a submitted review.
 *
 * Props:
 *  - review : { rating, comment, createdAt } — the review object from the API.
 *
 * No edit or delete actions are exposed — reviews are permanent by design.
 */
export default function ReviewDisplay({ review }) {
  if (!review) return null;

  return (
    <div className="mt-1 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
      {/* Section heading */}
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
        Your Review
      </p>

      {/* ─── Star display ────────────────────────────────────────────── */}
      {/* Render filled stars up to the rating value and outline stars beyond. */}
      <div
        className="flex items-center gap-1 mb-2"
        aria-label={`Rating: ${review.rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= review.rating
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300"
            }`}
          />
        ))}
      </div>

      {/* ─── Optional comment ──────────────────────────────────────────── */}
      {review.comment ? (
        <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>
      ) : (
        <p className="mt-2 text-xs italic text-slate-400">No comment left.</p>
      )}

      {/* ─── Submission date ───────────────────────────────────────────── */}
      {review.createdAt && (
        <p className="mt-3 text-xs text-slate-400">
          Submitted on{" "}
          <span className="font-medium text-slate-500">
            {formatDate(review.createdAt)}
          </span>
        </p>
      )}
    </div>
  );
}
