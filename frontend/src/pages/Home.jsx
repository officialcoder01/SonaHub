import { useEffect, useMemo, useState } from "react";
import CategorySection from "../components/home/CategorySection";
import CTASection from "../components/home/CTASection";
import FeaturedServices from "../components/home/FeaturedServices";
import FeaturedVendors from "../components/home/FeaturedVendors";
import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import TopRatedArtisans from "../components/home/TopRatedArtisans";
import PublicLayout from "../layouts/PublicLayout";
import { getCategories, getServices } from "../services/serviceService";
import { getVendors } from "../services/vendorService";
import { getTopRatedVendors } from "../services/recommendationService";

const initialHomeData = {
  categories: [],
  services: [],
  vendors: [],
  topRatedVendors: [],
};

const initialLoadingState = {
  categories: true,
  services: true,
  vendors: true,
  topRatedVendors: true,
};

const initialErrors = {
  categories: "",
  services: "",
  vendors: "",
  topRatedVendors: "",
};

export default function Home() {
  const [homeData, setHomeData] = useState(initialHomeData);
  const [isLoading, setIsLoading] = useState(initialLoadingState);
  const [errors, setErrors] = useState(initialErrors);

  useEffect(() => {
    let isActive = true;

    const loadHomeData = async () => {
      const [categoriesResult, servicesResult, vendorsResult, topRatedVendorsResult] =
        await Promise.allSettled([getCategories(), getServices(), getVendors(), getTopRatedVendors()]);

      if (!isActive) {
        return;
      }

      if (categoriesResult.status === "fulfilled") {
        setHomeData((current) => ({
          ...current,
          categories: categoriesResult.value.categories || [],
        }));
      } else {
        setErrors((current) => ({
          ...current,
          categories:
            categoriesResult.reason?.message || "Unable to load categories",
        }));
      }

      if (servicesResult.status === "fulfilled") {
        setHomeData((current) => ({
          ...current,
          services: servicesResult.value.services || [],
        }));
      } else {
        setErrors((current) => ({
          ...current,
          services: servicesResult.reason?.message || "Unable to load services",
        }));
      }

      if (vendorsResult.status === "fulfilled") {
        const vendors = Array.isArray(vendorsResult.value)
          ? vendorsResult.value
          : vendorsResult.value.vendors || [];

        setHomeData((current) => ({
          ...current,
          vendors,
        }));
      } else {
        setErrors((current) => ({
          ...current,
          vendors: vendorsResult.reason?.message || "Unable to load vendors",
        }));
      }

      if (topRatedVendorsResult.status === "fulfilled") {
        const topRatedVendors = Array.isArray(topRatedVendorsResult.value)
          ? topRatedVendorsResult.value
          : topRatedVendorsResult.value.vendors || [];

        setHomeData((current) => ({
          ...current,
          topRatedVendors,
        }));
      } else {
        setErrors((current) => ({
          ...current,
          topRatedVendors: topRatedVendorsResult.reason?.message || "Unable to load top rated vendors",
        }));
      }

      setIsLoading({
        categories: false,
        services: false,
        vendors: false,
        topRatedVendors: false,
      });
    };

    loadHomeData();

    return () => {
      isActive = false;
    };
  }, []);

  const visibleCategories = useMemo(
    () => homeData.categories.slice(0, 8),
    [homeData.categories],
  );

  const featuredServices = useMemo(
    () => homeData.services.slice(0, 8),
    [homeData.services],
  );

  const featuredVendors = useMemo(
    () => homeData.vendors.slice(0, 8),
    [homeData.vendors],
  );

  const topRatedVendors = useMemo(
    () => homeData.topRatedVendors,
    [homeData.topRatedVendors],
  );

  return (
    <PublicLayout contentClassName="max-w-[80rem] pb-0 pt-14 lg:pt-20">
      <div className="space-y-0">
        <HeroSection />

        <CategorySection
          categories={visibleCategories}
          isLoading={isLoading.categories}
          error={errors.categories}
        />

        <FeaturedServices
          services={featuredServices}
          isLoading={isLoading.services}
          error={errors.services}
        />

        <HowItWorks />

        <TopRatedArtisans
          vendors={topRatedVendors}
          isLoading={isLoading.topRatedVendors}
          error={errors.topRatedVendors}
        />

        <FeaturedVendors
          vendors={featuredVendors}
          isLoading={isLoading.vendors}
          error={errors.vendors}
        />

        <CTASection />
      </div>
    </PublicLayout>
  );
}
