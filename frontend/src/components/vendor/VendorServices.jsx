import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceCard from "../service/ServiceCard";

//////////////////////////////////////////////////
// INITIAL_VISIBLE_COUNT — services shown before "View More" is clicked.
// Progressive reveal is client-side only (no backend pagination needed).
//////////////////////////////////////////////////
const INITIAL_VISIBLE_COUNT = 6;
const PAGE_SIZE = 6; // how many more services each "View More" click reveals

export default function VendorServices({ services = [] }) {
  const navigate = useNavigate();

  // Track how many services are currently visible
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const visibleServices = services.slice(0, visibleCount);
  const hasMore = services.length > visibleCount;

  const actions = [
    {
      label: "View Details",
      // Navigate to the Service Details page on card action click
      onClick: (service) => navigate(`/market/services/${service.id}`),
    },
  ];

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-slate-50 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-[80rem] space-y-6">
        {/* ── Section header ──────────────────────────────────────── */}
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            Services
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Explore What This Artisan Offers
          </h2>
        </div>

      {services.length === 0 ? (
        // Empty state – section stays visible for layout consistency
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-600">
            No published services yet.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            This artisan hasn&apos;t published any services on the marketplace.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: responsive grid. Mobile: 2-column grid (matches Home/Market) */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {visibleServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                actions={actions}
                compactMobile
              />
            ))}
          </div>

          {/* Progressive reveal – shows more services without backend pagination */}
          {hasMore ? (
            <div className="mt-5 text-center">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                View More ({services.length - visibleCount} remaining)
              </button>
            </div>
          ) : null}
        </>
      )}
      </div>
    </section>
  );
}
