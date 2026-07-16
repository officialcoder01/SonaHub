import { MapPin, MessageCircle, Star } from "lucide-react";

//////////////////////////////////////////////////
// Derive initials from vendor business name or user name
// Used as avatar fallback when no profile image exists
//////////////////////////////////////////////////
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "AM";

const renderStar = (rating) => {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <span 
      class={rounded > 0 ? "text-amber-400" : "text-slate-400"}
      aria-hidden="true"
    >
      <Star className="h-4 w-4 fill-current" />
    </span>
  )
}

export default function VendorHeader({ vendor }) {
  const businessName = vendor?.businessName || "Artisan Vendor";
  const userName = vendor?.user?.name || "";
  const isVerified = vendor?.isVerified ?? false;
  const location = vendor?.location || "Location not listed";
  const bio = vendor?.bio || "";

  // Rating data lives in the reviewStat object returned by the backend
  const averageRating = Number(vendor?.reviewStats?.averageRating || 0);
  const totalReviews = Number(vendor?.reviewStats?.totalReviews || 0);
  const ratingDisplay = averageRating ? averageRating.toFixed(1) : "New";

  const initials = getInitials(businessName);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* ── Avatar ──────────────────────────────────────────────────── */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-extrabold text-white shadow-sm">
          {initials}
        </div>

        {/* ── Identity ────────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {businessName}
            </h1>

            {/* Verification badge only appears when the vendor is verified */}
            {isVerified ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                Verified
              </span>
            ) : null}
          </div>

          {/* Vendor's real name beneath the business name */}
          {userName ? (
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              {userName}
            </p>
          ) : null}

          {/* Location line */}
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            {location}
          </p>

          {/* Rating summary */}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
              {renderStar(averageRating)}
              {ratingDisplay}
              <span className="font-normal text-slate-500">
                ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
              </span>
            </span>
          </div>
        </div>

        {/* ── Message Vendor CTA ──────────────────────────────────────── */}
        {/* Messaging backend is not yet implemented – placeholder action */}
        <div className="shrink-0">
          <button
            type="button"
            className="btn-primary gap-2"
            onClick={() => {
              // TODO: Navigate to messaging when the feature is implemented
              alert("Messaging coming soon!");
            }}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Message Vendor
          </button>
        </div>
      </div>

      {/* ── Bio ─────────────────────────────────────────────────────── */}
      {bio ? (
        <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-7 text-slate-600">
          {bio}
        </p>
      ) : null}
    </section>
  );
}
