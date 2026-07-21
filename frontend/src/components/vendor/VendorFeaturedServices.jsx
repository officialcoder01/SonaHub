import { useNavigate } from "react-router-dom";
import ServiceCard from "../service/ServiceCard";

//////////////////////////////////////////////////
// VendorFeaturedServices
//
// Temporarily uses the first 3 services returned by the vendor API
// as "featured work" since backend support for vendor-curated featured
// services does not yet exist. Swap the `featuredServices` slice for
// a real featured-services array once the backend ships the feature.
//////////////////////////////////////////////////
export default function VendorFeaturedServices({ services = [] }) {
  const navigate = useNavigate();

  // Temporary: treat the first 3 services as the featured selection
  const featuredServices = services;

  const actions = [
    {
      label: "View Details",
      onClick: (service) => navigate(`/market/services/${service.id}`),
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        Featured Work
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-950">
        Highlighted Services
      </h2>

      {featuredServices.length === 0 ? (
        // Empty state when the vendor has no services yet
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-600">
            No featured services yet.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            This artisan is still setting up their portfolio.
          </p>
        </div>
      ) : (
        // Horizontal scroll on mobile (matches RelatedServices pattern)
        // Switches to a row of up to 3 columns on sm+
        <div className="-mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <div key={service.id} className="w-72 shrink-0 sm:w-auto">
              <ServiceCard service={service} actions={actions} dense />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
