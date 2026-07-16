import { useState } from "react";
import { Star } from "lucide-react";
import { formatDate } from "../../utils/serviceHelpers";

//////////////////////////////////////////////////
// INITIAL_VISIBLE_COUNT controls how many reviews are
// shown before the user clicks "View All Reviews".
// Expand happens client-side – no backend pagination.
//////////////////////////////////////////////////
const INITIAL_VISIBLE_COUNT = 3;

// Renders a single star row for a given integer rating (1–5)
function StarRating({ rating }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-slate-300"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// Individual review card
function ReviewCard({ review }) {
  const reviewerName =
    review?.customer?.user?.name ||
    review?.reviewer?.name ||
    review?.user?.name ||
    "Anonymous";

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{reviewerName}</p>
          <div className="mt-1">
            <StarRating rating={review.rating} />
          </div>
        </div>
        <p className="text-xs text-slate-400">{formatDate(review.createdAt)}</p>
      </div>

      {review.comment ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
      ) : (
        <p className="mt-3 text-xs italic text-slate-400">No comment left.</p>
      )}
    </div>
  );
}

export default function ReviewsSection({ reviews = [], reviewStats }) {
  // Controls whether all reviews are visible or only the initial subset
  const [isExpanded, setIsExpanded] = useState(false);

  const averageRating = Number(reviewStats?.averageRating || 0);
  const totalReviews = Number(reviewStats?.totalReviews || reviews.length || 0);

  // Slice to INITIAL_VISIBLE_COUNT unless the user has expanded the list
  const visibleReviews = isExpanded
    ? reviews
    : reviews.slice(0, INITIAL_VISIBLE_COUNT);

  const hasMore = reviews.length > INITIAL_VISIBLE_COUNT && !isExpanded;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* ── Section header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Customer Reviews
          </p>         
        </div>

        {/* Rating summary badge */}
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-center">
          <p className="text-2xl font-extrabold text-slate-950">
            {averageRating ? averageRating.toFixed(1) : "New"}
          </p>
          <p className="text-xs text-slate-500">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* ── Review list or empty state ───────────────────────────────── */}
      {reviews.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-600">
            No reviews yet.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Be the first to book this artisan and leave a review.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {visibleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {/* "View All Reviews" expands the list in-place – no pagination */}
          {hasMore ? (
            <button
              type="button"
              className="btn-secondary mt-2 w-full"
              onClick={() => setIsExpanded(true)}
            >
              View All Reviews ({reviews.length})
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
