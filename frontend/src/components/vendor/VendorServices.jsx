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
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        All Services
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-950">
        Explore What This Artisan Offers
      </h2>

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
    </section>
  );
}
