import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";
import ServiceCardSkeleton from "../../components/dashboard/ServiceCardSkeleton";
import VendorServiceCard from "../../components/dashboard/VendorServiceCard"
import { useAuth } from "../../context/AuthContext";
import {
  deleteService,
  getMyServices,
  pinMyService,
  unpinMyService,
} from "../../services/serviceService";

const SERVICES_PER_PAGE = 12;

export default function ServicesPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [featureServiceId, setFeatureServiceId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(services.length / SERVICES_PER_PAGE));
  const pageStart = (currentPage - 1) * SERVICES_PER_PAGE;
  const visibleServices = useMemo(
    () => services.slice(pageStart, pageStart + SERVICES_PER_PAGE),
    [pageStart, services],
  );

  const loadServices = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Services remain sourced from the existing vendor catalog API.
      const response = await getMyServices(token);
      setServices(response.services || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Unable to load your services");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isActive = true;

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    getMyServices(token)
      .then((response) => {
        if (isActive) {
          setServices(response.services || []);
          setCurrentPage(1);
          setError("");
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err.message || "Unable to load your services");
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
  }, [token]);

  const openDeleteModal = (service) => {
    setServiceToDelete(service);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setServiceToDelete(null);
      setDeleteError("");
    }
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete || !token) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteService(serviceToDelete.id, token);

      setServices((currentServices) => {
        const updatedServices = currentServices.filter(
          (service) => service.id !== serviceToDelete.id,
        );
        const nextTotalPages = Math.max(
          1,
          Math.ceil(updatedServices.length / SERVICES_PER_PAGE),
        );

        setCurrentPage((page) => Math.min(page, nextTotalPages));
        return updatedServices;
      });
      setServiceToDelete(null);
    } catch (err) {
      setDeleteError(err.message || "Unable to delete service");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditService = (service) => {
    // Edit routing is intentionally left compatible with the current implementation.
    console.log("Edit service:", service.id);
  };

  const handleToggleFeatured = async (service) => {
    if (!token) {
      return;
    }

    setFeatureServiceId(service.id);

    try {
      const response = service.isPinned
        ? await unpinMyService(service.id, token)
        : await pinMyService(service.id, token);
      const updatedService = response.service || response;

      setServices((currentServices) =>
        currentServices.map((currentService) =>
          currentService.id === service.id
            ? { ...currentService, ...updatedService, isPinned: !service.isPinned }
            : currentService,
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to update featured service");
    } finally {
      setFeatureServiceId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Service catalog
          </p>
          <h1 className="mt-2">My Services</h1>
          <p className="mt-2 max-w-2xl text-sm">
            Manage and refine the listings customers discover in the marketplace.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          onClick={() => navigate("/dashboard/create-service")}
        >
          Add New Service
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ServiceCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <DashboardEmptyState
          eyebrow="Services unavailable"
          title="We could not load your services."
          description={error}
          actionLabel="Try Again"
          onAction={loadServices}
        />
      ) : null}

      {!isLoading && !error && services.length === 0 ? (
        <DashboardEmptyState
          eyebrow="Service catalog"
          title="You have not created any services yet."
          description="Create your first listing so customers can discover what you offer."
          actionLabel="Create First Service"
          onAction={() => navigate("/dashboard/create-service")}
        />
      ) : null}

      {!isLoading && !error && services.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleServices.map((service) => (
              <VendorServiceCard
                key={service.id}
                service={service}
                onEdit={handleEditService}
                onDelete={openDeleteModal}
                onToggleFeatured={handleToggleFeatured}
                isFeatureUpdating={featureServiceId === service.id}
              />
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row">
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <p className="text-sm font-semibold text-slate-600">
              Page {currentPage} of {totalPages}
            </p>
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      ) : null}

      {serviceToDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-service-title"
          onClick={closeDeleteModal}
        >
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
              Delete service
            </p>
            <h2 id="delete-service-title" className="mt-2">
              Are you sure?
            </h2>
            <p className="mt-4 text-sm">
              Do you want to delete "{serviceToDelete.title}"? This action cannot be undone.
            </p>

            {deleteError ? <p className="form-error mt-4">{deleteError}</p> : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={confirmDeleteService}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
