import { Star } from "lucide-react";

export default function VendorCard({ vendor }) {
  const reviewStats = vendor?.reviewStats || {};
  const averageRating = Number(reviewStats.averageRating || 0);
  const totalReviews = Number(reviewStats.totalReviews || 0);
  const initials = (vendor?.businessName || vendor?.user?.name || "Vendor")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-extrabold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-950">
              {vendor?.businessName || "Vendor business"}
            </h2>
            {vendor?.isVerified ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                Verified
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {vendor?.user?.name || "Vendor name unavailable"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {vendor?.location || "Location not listed"}
          </p>
        </div>
      </div>

      {vendor?.bio ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {vendor.bio}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Rating
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            <Star className="inline h-5 w-5 text-amber-400 fill-current" /> {averageRating ? averageRating.toFixed(1) : "New"}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Reviews
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {totalReviews}
          </p>
        </div>
      </div>

      <button type="button" className="btn-secondary mt-5 w-full">
        View Profile
      </button>
    </section>
  );
}
