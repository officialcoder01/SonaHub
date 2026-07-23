import { useCallback, useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import { getVendorById } from "../services/vendorService";
import VendorAbout from "../components/vendor/VendorAbout";
import VendorFeaturedServices from "../components/vendor/VendorFeaturedServices";
import VendorHeader from "../components/vendor/VendorHeader";
import VendorProfileSkeleton from "../components/vendor/VendorProfileSkeleton";
import ReviewsSection from "../components/reviews/ReviewsSetion";
import VendorServices from "../components/vendor/VendorServices";

export default function VendorProfilePage() {
  const { id } = useParams();

  const [vendor, setVendor] = useState(null);
  const [pinnedServices, setPinnedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Use a ref to track the active vendor ID to prevent state updates after unmount or route change
  const activeIdRef = useRef(id);

  //////////////////////////////////////////////////
  // Load the vendor's public profile from the API.
  // Wrapped in useCallback so it can be called again on error retry.
  //////////////////////////////////////////////////
  const loadVendor = useCallback(async (targetId) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getVendorById(targetId);

      if (activeIdRef.current === targetId) {
        setVendor(response.vendorProfile);
        setPinnedServices(response.vendorProfile.pinnedServices || []);
      }
    } catch (err) {
      if (activeIdRef.current === targetId) {
        setError(err.message || "Unable to load vendor profile");
      }
    } finally {
      if (activeIdRef.current === targetId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    activeIdRef.current = id; // Update the active ID ref on route change
    loadVendor(id);

    return () => {
      activeIdRef.current = null; // Clear the ref on unmount to prevent state updates
    };
  }, [id, loadVendor]);

  return (
    <PublicLayout contentClassName="max-w-[80rem] pb-20 pt-28 lg:pt-28">
      {/* ── Loading state – skeleton matches final layout ─────────────── */}
      {isLoading ? <VendorProfileSkeleton /> : null}

      {/* ── Error state ───────────────────────────────────────────────── */}
      {!isLoading && error ? (
        <section className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="form-error mb-4">{error}</p>
          <Link to="/market" className="btn-secondary mr-3">
            Back to Market
          </Link>
          <button type="button" className="btn-primary" onClick={loadVendor}>
            Try Again
          </button>
        </section>
      ) : null}

      {/* ── Success state ─────────────────────────────────────────────── */}
      {!isLoading && !error && vendor ? (
        <div className="space-y-6">
          {/* Breadcrumb navigation */}
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/market" className="text-blue-700 hover:text-blue-800">
              Market
            </Link>
            <span>/</span>
            <span className="max-w-[16rem] truncate text-slate-700 sm:max-w-md">
              {vendor.businessName || "Vendor Profile"}
            </span>
          </nav>

          {/* 1. Trust – who is this artisan */}
          <VendorHeader vendor={vendor} />

          {/* 2. About – artisan introduction */}
          <VendorAbout vendor={vendor} />

          {/* 3. Featured Work – first 3 services as a temporary placeholder */}
          <VendorFeaturedServices services={pinnedServices || []} />

          {/* 4. Customer Reviews – with initial collapse + expand */}
          <ReviewsSection
            reviews={vendor.reviews || []}
            reviewStats={vendor.reviewStats}
          />

          {/* 5. All Services – full grid with progressive reveal */}
          <VendorServices services={vendor.services || []} />
        </div>
      ) : null}
    </PublicLayout>
  );
}
