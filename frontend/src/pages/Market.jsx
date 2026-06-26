import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import ServiceGrid from "../components/service/ServiceGrid";
import { getServices } from "../services/serviceService";

const SERVICES_PER_PAGE = 12;

export default function Market() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(services.length / SERVICES_PER_PAGE));
  const pageStart = (currentPage - 1) * SERVICES_PER_PAGE;
  const visibleServices = useMemo(
    () => services.slice(pageStart, pageStart + SERVICES_PER_PAGE),
    [pageStart, services],
  );

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getServices();
      setServices(response.services || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Unable to load services");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    getServices()
      .then((response) => {
        if (isActive) {
          setServices(response.services || []);
          setCurrentPage(1);
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err.message || "Unable to load services");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  const actions = [
    {
      label: "View Details",
      onClick: (service) => {
        navigate(`/market/services/${service.id}`);
      },
    },
  ];

  return (
    <PublicLayout contentClassName="max-w-[80rem] pb-10 pt-20 lg:pt-20">
      <div className="mb-8 mt-4 lg:mt-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Marketplace
        </p>
        <h1 className="mt-2">Browse Services</h1>
        <p className="mt-3 max-w-2xl">
          Explore artisan services across categories.
        </p>
      </div>

      {isLoading ? (
        <section className="page-panel">
          <p>Loading services...</p>
        </section>
      ) : null}

      {!isLoading && error ? (
        <section className="page-panel">
          <p className="form-error mb-4">{error}</p>
          <button type="button" className="btn-secondary" onClick={loadServices}>
            Try Again
          </button>
        </section>
      ) : null}

      {!isLoading && !error && services.length === 0 ? (
        <section className="page-panel">
          <h2>No services available yet.</h2>
          <p className="mt-2">
            Check back soon to discover new artisan offerings.
          </p>
        </section>
      ) : null}

      {!isLoading && !error && services.length > 0 ? (
        <div className="space-y-8">
          <ServiceGrid
            services={visibleServices}
            actions={actions}
            compactMobile
            mobileColumns={2}
          />

          <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row">
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <p className="text-sm font-medium text-slate-600">
              Page {currentPage} of {totalPages}
            </p>

            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </PublicLayout>
  );
}
