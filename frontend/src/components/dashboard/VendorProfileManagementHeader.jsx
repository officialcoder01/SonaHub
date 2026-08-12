import { BadgeCheck, ExternalLink, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "AM";

export default function VendorProfileManagementHeader({ profile }) {
  const businessName = profile?.businessName || "Your business";
  const averageRating = Number(profile?.reviewStats?.averageRating || 0);
  const totalReviews = Number(profile?.reviewStats?.totalReviews || 0);
  const ratingLabel = totalReviews > 0 ? averageRating.toFixed(1) : "New";
  const tagline = profile?.bio || "Professional service provider";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-extrabold text-white shadow-sm">
            {getInitials(businessName)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {businessName}
              </h1>
              {profile?.isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Verified
                </span>
              ) : null}
            </div>

            <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-600">{tagline}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                {ratingLabel}
                <span className="font-normal text-slate-500">
                  ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {profile?.location || "Location not provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          <Link
            to="/dashboard/profile/edit"
            type="button"
            className="btn-secondary w-full opacity-60 sm:w-auto"
          >
            Edit Profile
          </Link>
          {profile?.id ? (
            <Link to={`/vendors/${profile.id}`} className="btn-primary w-full gap-2 sm:w-auto">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View Public Page
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {profile?.isVerified ? (
          <p className="text-sm font-medium text-emerald-700">Your vendor profile is verified.</p>
        ) : (
          <p className="text-sm text-slate-600">
            Verification requests are not available yet. Your current profile status is not verified.
          </p>
        )}
      </div>
    </section>
  );
}
