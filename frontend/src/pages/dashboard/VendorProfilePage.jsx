import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, Clock3, Star } from "lucide-react";
import DashboardCardSkeleton from "../../components/dashboard/DashboardCardSkeleton";
import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import DeleteServiceDialog from "../../components/dashboard/DeleteServiceDialog";
import ServiceCardSkeleton from "../../components/dashboard/ServiceCardSkeleton";
import VendorProfileForm from "../../components/dashboard/VendorProfileForm";
import VendorProfileManagementHeader from "../../components/dashboard/VendorProfileManagementHeader";
import VendorServiceCard from "../../components/dashboard/VendorServiceCard";
import VendorAbout from "../../components/vendor/VendorAbout";
import { useAuth } from "../../context/AuthContext";
import { deleteService, getMyServices, pinMyService, unpinMyService } from "../../services/serviceService";
import { getMyProfile } from "../../services/vendorService";
import { useNavigate } from "react-router-dom";

export default function VendorProfilePage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [featureServiceId, setFeatureServiceId] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      // The profile supplies analytics while the catalog endpoint supplies card-ready image/category data.
      const [profileResult, serviceResult] = await Promise.allSettled([
        getMyProfile(token),
        getMyServices(token),
      ]);

      if (profileResult.status === "rejected") {
        throw profileResult.reason;
      }

      const nextProfile = profileResult.value;
      setProfile(nextProfile);
      if (serviceResult.status === "fulfilled") {
        setServices(
          serviceResult.value.services?.length
            ? serviceResult.value.services
            : nextProfile.services || [],
        );
      } else {
        setServices(nextProfile.services || []);
        setError(serviceResult.reason?.message || "Unable to load service details");
      }
    } catch (err) {
      setError(err.message || "Unable to load vendor profile");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Deferring the initial request keeps the effect itself free of synchronous state updates.
    Promise.resolve().then(loadProfile);
  }, [loadProfile]);

  const featuredServices = useMemo(
    () => profile?.pinnedServices || [],
    [profile],
  );

  const analytics = useMemo(() => [
    { label: "Total Bookings", value: profile?.totalBookingsCount ?? 0, tone: "green", icon: CalendarCheck },
    { label: "Completed Bookings", value: profile?.completedBookingsCount ?? 0, tone: "violet", icon: CheckCircle2 },
    { label: "Pending Bookings", value: profile?.pendingBookingsCount ?? 0, tone: "amber", icon: Clock3 },
    {
      label: "Average Rating",
      value: profile?.reviewStats?.totalReviews ? profile.reviewStats.averageRating : "N/A",
      helper: profile?.reviewStats?.totalReviews ? `${profile.reviewStats.totalReviews} reviews` : "No reviews yet",
      tone: "slate",
      icon: Star,
    },
  ], [profile]);

  const handleEditService = (service) => navigate(`/dashboard/services/${service.id}/edit`);

  const handleToggleFeatured = async (service) => {
    if (!token) return;

    setFeatureServiceId(service.id);
    setError("");
    try {
      const response = service.isPinned
        ? await unpinMyService(service.id, token)
        : await pinMyService(service.id, token);
      const updatedService = response.service || response;
      const nextPinnedState = !service.isPinned;
      const mergedService = { ...service, ...updatedService, isPinned: nextPinnedState };

      setServices((currentServices) => currentServices.map((currentService) => (
        currentService.id === service.id
          ? mergedService
          : currentService
      )));
      // Keep the backend-provided pinnedServices collection in sync for immediate UI feedback.
      setProfile((currentProfile) => {
        if (!currentProfile) return currentProfile;

        const currentPinnedServices = currentProfile.pinnedServices || [];
        return {
          ...currentProfile,
          pinnedServices: nextPinnedState
            ? [...currentPinnedServices.filter((item) => item.id !== service.id), mergedService]
            : currentPinnedServices.filter((item) => item.id !== service.id),
        };
      });
    } catch (err) {
      setError(err.message || "Unable to update featured service");
    } finally {
      setFeatureServiceId(null);
    }
  };

  const openDeleteDialog = (service) => {
    setServiceToDelete(service);
    setDeleteError("");
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setServiceToDelete(null);
      setDeleteError("");
    }
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete || !token) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteService(serviceToDelete.id, token);
      setServices((currentServices) => currentServices.filter((service) => service.id !== serviceToDelete.id));
      setProfile((currentProfile) => (
        currentProfile
          ? {
            ...currentProfile,
            pinnedServices: (currentProfile.pinnedServices || []).filter(
              (service) => service.id !== serviceToDelete.id,
            ),
          }
          : currentProfile
      ));
      setServiceToDelete(null);
    } catch (err) {
      setDeleteError(err.message || "Unable to delete service");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <>
          <DashboardCardSkeleton rows={4} />
          <DashboardCardSkeleton rows={3} />
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <DashboardCardSkeleton key={index} />)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <ServiceCardSkeleton key={index} />)}
          </div>
        </>
      ) : null}

      {!isLoading && error && !profile ? (
        <DashboardEmptyState eyebrow="Profile unavailable" title="We could not load your vendor profile." description={error} actionLabel="Try Again" onAction={loadProfile} />
      ) : null}

      {!isLoading && !error && !profile ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <VendorProfileForm token={token} onProfileCreated={loadProfile} />
        </section>
      ) : null}

      {!isLoading && profile ? (
        <>
          <VendorProfileManagementHeader profile={profile} />
          {error ? <p className="form-error">{error}</p> : null}
          <VendorAbout vendor={profile} />

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Featured services</p>
              <h2 className="mt-1">Services highlighted on your public profile</h2>
            </div>
            {featuredServices.length ? (
              <div className="-mx-5 mt-5 flex gap-4 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6">
                {featuredServices.map((service) => (
                  <div key={service.id} className="w-72 shrink-0">
                    <VendorServiceCard service={service} onEdit={handleEditService} onDelete={openDeleteDialog} onToggleFeatured={handleToggleFeatured} isFeatureUpdating={featureServiceId === service.id} />
                  </div>
                ))}
              </div>
            ) : (
              <DashboardEmptyState eyebrow="Featured services" title="No services are featured yet." description="Use the service menu below to add up to five services to your public profile." />
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Analytics</p>
            <h2 className="mt-1">A quick view of your business</h2>
            <div className="mt-5 grid gap-4 grid-cols-2 xl:grid-cols-4">
              {analytics.map((stat) => <DashboardStatCard key={stat.label} {...stat} />)}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Services</p>
                <h2 className="mt-1">Manage your service catalog</h2>
              </div>
              <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => navigate("/dashboard/create-service")}>Add New Service</button>
            </div>
            {services.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => (
                  <VendorServiceCard key={service.id} service={service} onEdit={handleEditService} onDelete={openDeleteDialog} onToggleFeatured={handleToggleFeatured} isFeatureUpdating={featureServiceId === service.id} />
                ))}
              </div>
            ) : (
              <div className="mt-5"><DashboardEmptyState eyebrow="Service catalog" title="You have not created any services yet." description="Create your first listing so customers can discover what you offer." actionLabel="Create First Service" onAction={() => navigate("/dashboard/create-service")} /></div>
            )}
          </section>
        </>
      ) : null}

      <DeleteServiceDialog service={serviceToDelete} isDeleting={isDeleting} error={deleteError} onClose={closeDeleteDialog} onConfirm={confirmDeleteService} />
    </div>
  );
}
