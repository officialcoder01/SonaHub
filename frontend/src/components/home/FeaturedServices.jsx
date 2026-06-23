import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ServiceGrid from "../service/ServiceGrid";
import { useNavigate } from "react-router-dom";

export default function FeaturedServices({ services = [], isLoading, error }) {
  const navigate = useNavigate();
  const actions = [
    {
      label: "View Detail",
      onClick: (service) => {
        navigate(`/market/services/${service.id}`);
      },
    },
  ];

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-[80rem] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
              Marketplace activity
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Featured services
            </h2>
          </div>
          <Link to="/market" className="btn-secondary w-full sm:w-auto">
            View All Services
          </Link>
        </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[282px] animate-pulse rounded-lg border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && services.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">
            No services available yet.
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            New artisan offerings will appear here as vendors publish them.
          </p>
        </div>
      ) : null}

      {!isLoading && !error && services.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          <ServiceGrid
            services={services}
            actions={actions}
            columns={4}
            dense
            homepageFeatured
          />
        </motion.div>
      ) : null}
      </div>
    </section>
  );
}
