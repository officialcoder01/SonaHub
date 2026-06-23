import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RelatedServices from "../components/service-details/RelatedServices";
import ReviewSection from "../components/service-details/ReviewSection";
import ServiceDetailsSkeleton from "../components/service-details/ServiceDetailsSkeleton";
import ServiceGallery from "../components/service-details/ServiceGallery";
import ServiceInfo from "../components/service-details/ServiceInfo";
import TrustIndicators from "../components/service-details/TrustIndicators";
import VendorCard from "../components/service-details/VendorCard";
import PublicLayout from "../layouts/PublicLayout";
import { getServiceDetails } from "../services/serviceService";
import { useAuth } from "../context/AuthContext";
import BookingModal from "../components/bookings/BookingModal";

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const relatedServicesRef = useRef(null);
  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const isAuthenticated = Boolean(user || token);
  const isVendor = user?.role === "VENDOR";

  //////////////////////////////////////////////////
  // Handle 'Book Now' flow
  // Redirects guests to login, opens modal for customers
  //////////////////////////////////////////////////
  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user?.role === "CUSTOMER") {
      setIsBookingModalOpen(true);
    }
  };

  const loadServiceDetails = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getServiceDetails(id);
      setService(response.service);
      setRelatedServices(response.relatedServices || []);
    } catch (err) {
      setError(err.message || "Unable to load service details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isActive = true;

    const loadPage = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getServiceDetails(id);

        if (isActive) {
          setService(response.service);
          setRelatedServices(response.relatedServices || []);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || "Unable to load service details");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      // Prevent setting state after a fast route change or unmount.
      isActive = false;
    };
  }, [id]);

  const scrollToRelatedServices = () => {
    // Keep the "View Similar" action focused on the related service section.
    relatedServicesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <PublicLayout contentClassName="max-w-[80rem] pb-28 pt-28 lg:pt-28">
      {isLoading ? <ServiceDetailsSkeleton /> : null}

      {!isLoading && error ? (
        <section className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="form-error mb-4">{error}</p>
          <Link to="/market" className="btn-secondary mr-3">
            Back to Market
          </Link>
          <button type="button" className="btn-primary" onClick={loadServiceDetails}>
            Try Again
          </button>
        </section>
      ) : null}

      {!isLoading && !error && service ? (
        <div className="space-y-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/market" className="text-blue-700 hover:text-blue-800">
              Market
            </Link>
            <span>/</span>
            <span className="max-w-[16rem] truncate text-slate-700 sm:max-w-md">
              {service.title}
            </span>
          </nav>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-start">
            <ServiceGallery
              key={service.id}
              images={service.images}
              title={service.title}
            />
            <ServiceInfo
              service={service}
              onViewSimilar={scrollToRelatedServices}
              onBookNow={handleBookNow}
              isVendor={isVendor}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="space-y-6">
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                  Service description
                </p>
 
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">
                  {service.description}
                </p>
              </article>

              <TrustIndicators isVerified={service.vendor?.isVerified} />
            </div>

            <VendorCard vendor={service.vendor} />
          </section>

          <div ref={relatedServicesRef}>
            <RelatedServices services={relatedServices} />
          </div>

          <ReviewSection reviewStats={service.vendor?.reviewStats} />

          {!isVendor && (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
              <div className="mx-auto flex max-w-[80rem] items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {service.title}
                  </p>
                  <p className="text-xs font-semibold text-blue-700">
                    Ready to book?
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary shrink-0 px-5 py-3"
                  onClick={handleBookNow}
                >
                  Book Now
                </button>
              </div>
            </div>
          )}

          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            service={service}
          />
        </div>
      ) : null}
    </PublicLayout>
  );
}
