import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Clock, MapPin, Star } from "lucide-react";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

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
  vendor.bio || vendor.specialization || vendor.category?.name || "Professional Artisan";

const getRating = (vendor) => Number(vendor?.reviewStat?.averageRating || 0);

const getCompletedJobs = (vendor, index) =>
  vendor.completedJobs || vendor.jobsCompleted || 7 + index;

const getResponseTime = (vendor, index) =>
  vendor.responseTime || `${index % 2 === 0 ? 2 : 1} hours`;

export default function FeaturedVendors({ vendors = [], isLoading, error }) {
  // Navigate to the public Vendor Profile page when a card is clicked
  const navigate = useNavigate();
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-slate-50 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-[80rem] space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
              Trusted artisans
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Featured Vendors
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Verified professionals providing quality services.
            </p>
          </div>
        </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && vendors.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">
            Vendors are joining soon.
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Featured vendors profiles will appear here as the marketplace grows.
          </p>
        </div>
      ) : null}

      {!isLoading && !error && vendors.length > 0 ? (
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
        >
          {vendors.map((vendor, index) => {
            const vendorName = getVendorName(vendor);
            const rating = getRating(vendor, index);

            return (
              <motion.article
                key={vendor.id || vendorName}
                variants={cardVariants}
                className="relative flex h-full min-h-[214px] flex-col rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white">
                  <Star className="h-2.5 w-2.5 fill-white" aria-hidden="true" />
                  Featured
                </span>

                <div className="mx-auto mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                    {getInitials(vendorName) || "AM"}
                </div>

                <h3 className="mt-3 truncate text-sm font-bold text-slate-950">
                  {vendorName}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
                  {getBio(vendor)}
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {vendor.location || "Location unavailable"}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Briefcase className="h-3 w-3 text-blue-600" aria-hidden="true" />
                    <span>
                      <strong className="block text-[11px] text-slate-700">
                        {getCompletedJobs(vendor, index)}
                      </strong>
                      Completed Jobs
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Clock className="h-3 w-3 text-blue-600" aria-hidden="true" />
                    <span>
                      <strong className="block text-[11px] text-slate-700">
                        {getResponseTime(vendor, index)}
                      </strong>
                      Response Time
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-3">
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => vendor.id && navigate(`/vendors/${vendor.id}`)}
                  >
                    View Profile
                  </button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      ) : null}
      </div>
    </section>
  );
}
