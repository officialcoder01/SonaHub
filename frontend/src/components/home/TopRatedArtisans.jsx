import { useNavigate, Link } from "react-router-dom";
import { Briefcase, Clock, MapPin, Star, Trophy } from "lucide-react";

const getVendorName = (vendor) =>
  vendor.businessName || vendor.user?.name || "Independent artisan";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const getBio = (vendor) =>
  vendor.bio || vendor.specialization || vendor.category?.name || "Master Artisan";

export default function TopRatedArtisans({ vendors = [], isLoading, error }) {
  const navigate = useNavigate();
  const topArtisans = vendors;

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-[80rem] space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Top Rated Vendors
          </h2>
        </div>

        {isLoading ? (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[260px] animate-pulse rounded-xl border border-amber-200 bg-amber-50/40"
              />
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && topArtisans.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Vendors are joining soon.
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Top rated vendors profiles will appear here as the marketplace grows.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && topArtisans.length > 0 ? (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topArtisans.map((vendor, index) => {
              const vendorName = getVendorName(vendor);
              const getRating = Number(vendor?.averageRating || 0);
              const totalReview = Number(vendor?.reviewCount || 0);

              return (
                <article
                  key={vendor.id || vendorName}
                  className="relative flex min-h-[260px] flex-col rounded-xl border border-amber-200 bg-amber-50/35 p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
                >
                  <Link to={`vendors/${vendor.id}`}>
                    <span className="absolute left-1/2 top-3 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                      <Trophy className="h-3 w-3 fill-white" aria-hidden="true" />
                      Top Rated
                    </span>

                    <div className="mx-auto mt-9 flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-base font-bold text-white shadow-sm">
                      {getInitials(vendorName) || "AM"}
                    </div>

                    <h3 className="mt-3 truncate text-sm font-bold text-slate-950">
                      {vendorName}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-600">
                      {getBio(vendor)}
                    </p>
                    <p className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {vendor.location || "Location Unavailable"}
                    </p>

                    <div className="mt-3 space-y-1.5 border-t border-amber-200/80 pt-3 text-left text-[11px] text-slate-600">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                          Rating
                        </span>
                        <strong>{getRating} ({totalReview})</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase className="h-3 w-3 text-amber-600" aria-hidden="true" />
                          Completed Jobs
                        </span>
                        <strong>{vendor.completedJobs || 10 + index * 2}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-amber-600" aria-hidden="true" />
                          Response Time
                        </span>
                        <strong>{vendor.responseTime || "1 hour"}</strong>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <button
                        type="button"
                        className="inline-flex flex-1 items-center justify-center rounded-md bg-amber-500 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        onClick={() => vendor.id && navigate(`/vendors/${vendor.id}`)}
                      >
                        View Profile
                      </button>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
