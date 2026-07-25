import { Star } from "lucide-react";
import { formatDate, formatPrice } from "../../utils/serviceHelpers";

const renderStars = (rating) => {
  const roundedRating = Math.round(Number(rating) || 0);

  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={index}
      className={index < roundedRating ? "text-amber-400" : "text-slate-300"}
      aria-hidden="true"
    >
      <Star className="h-5 w-5 fill-current" />
    </span>
  ));
};

export default function ServiceInfo({ service, onViewSimilar, onBookNow, isNotAuthOrVendorOwnService }) {
  const reviewStats = service?.reviewStats || {};
  const averageRating = Number(reviewStats.averageRating || 0);
  const totalReviews = Number(reviewStats.totalReviews || 0);
  const location = service.vendor?.location || "Location not listed";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
          {service.category?.name || "Uncategorized"}
        </span>
        {service.vendor?.isVerified ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Verified vendor
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {service.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className="flex items-center gap-1 text-base leading-none">
            {renderStars(averageRating)}
          </span>
          <span className="font-semibold text-slate-800">
            {averageRating ? averageRating.toFixed(1) : "No rating yet"}
          </span>
          <span className="text-slate-500">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            {location}
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            Listed {formatDate(service.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-950 px-4 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white">
          Starting from
        </p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">
          {formatPrice(service.price)}
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {isNotAuthOrVendorOwnService ? (
          <button
            type="button"
            className="btn-primary w-full py-3 text-base opacity-60 cursor-not-allowed"
            disabled
            title="Vendors cannot book their services"
          >
            You Don't have permission
          </button>
        ) : (
          <button
            type="button"
            onClick={onBookNow}
            className="btn-primary w-full py-3 text-base"
          >
            Book Now
          </button>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" className="btn-secondary py-3">
            Contact Vendor
          </button>
          <button
            type="button"
            className="btn-secondary py-3"
            onClick={onViewSimilar}
          >
            View Similar
          </button>
        </div>
      </div>
    </section>
  );
}
