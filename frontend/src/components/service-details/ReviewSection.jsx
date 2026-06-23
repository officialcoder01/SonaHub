export default function ReviewSection({ reviewStats }) {
  const averageRating = Number(reviewStats?.averageRating || 0);
  const totalReviews = Number(reviewStats?.totalReviews || 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Customer reviews
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            What customers are saying
          </h2>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-2xl font-extrabold text-slate-950">
            {averageRating ? averageRating.toFixed(1) : "New"}
          </p>
          <p className="text-sm text-slate-500">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {totalReviews === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
          <p className="font-semibold text-slate-800">
            No reviews yet. Be the first to review this vendor.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Review posting is coming soon; this form is a preview of the future workflow.
          </p>
        </div>
      ) : null
      }

      <form className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <label className="form-field">
          <span className="form-label">Your review</span>
          <textarea
            className="form-input min-h-28 resize-none"
            placeholder="Share your experience after booking this artisan."
            disabled
          />
        </label>
        <button type="button" className="btn-secondary w-full sm:w-fit" disabled>
          Post Review Soon
        </button>
      </form>
    </section>
  );
}
