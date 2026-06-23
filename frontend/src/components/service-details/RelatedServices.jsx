import { useNavigate } from "react-router-dom";
import ServiceCard from "../service/ServiceCard";

export default function RelatedServices({ services = [] }) {
  const navigate = useNavigate();

  if (services.length === 0) {
    return (
      <section id="related-services" className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <h2>No similar services yet</h2>
        <p className="mt-2 text-sm text-slate-500">
          Browse the marketplace to discover more artisans in nearby categories.
        </p>
      </section>
    );
  }

  const actions = [
    {
      label: "View Details",
      onClick: (service) => navigate(`/market/services/${service.id}`),
    },
  ];

  return (
    <section id="related-services" className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Related services
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          Similar artisan offers
        </h2>
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {services.slice(0, 4).map((service) => (
          <div key={service.id} className="w-72 shrink-0 sm:w-auto">
            <ServiceCard service={service} actions={actions} dense />
          </div>
        ))}
      </div>
    </section>
  );
}
