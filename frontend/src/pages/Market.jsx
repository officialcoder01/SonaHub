import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FilterSidebar from "../components/market/FilterSidebar";
import MarketplacePagination from "../components/market/MarketplacePagination";
import MarketplaceSearch from "../components/market/MarketplaceSearch";
import MobileFilterDropdown from "../components/market/MobileFilterDropdown";
import ServiceCardSkeleton from "../components/dashboard/ServiceCardSkeleton";
import ServiceGrid from "../components/service/ServiceGrid";
import PublicLayout from "../layouts/PublicLayout";
import { getCategories, getServices } from "../services/serviceService";

const SERVICES_PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 400;

const parsePositivePage = (value) => {
  const parsedValue = Number.parseInt(value, 10);
  return parsedValue > 0 ? parsedValue : 1;
};

export default function Market() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: SERVICES_PER_PAGE,
  });
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchInput, setSearchInput] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [error, setError] = useState("");
  const queryString = searchParams.toString();

  const filters = useMemo(() => {
    const params = new URLSearchParams(queryString);

    return {
      search: params.get("search") || "",
      category: params.get("category") || "",
      location: params.get("location") || "",
      sort: params.get("sort") === "oldest" ? "oldest" : "newest",
      page: parsePositivePage(params.get("page")),
    };
  }, [queryString]);

  const visibleSearch = searchInput ?? filters.search;

  const updateQueryParams = useCallback(
    (updates, { resetPage = true } = {}) => {
      const nextParams = new URLSearchParams(queryString);

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          nextParams.set(key, String(value));
        } else {
          nextParams.delete(key);
        }
      });

      //////////////////////////////////////////////////
      // Any filter change starts browsing from the first
      // backend page so users do not land on empty later pages.
      //////////////////////////////////////////////////
      if (resetPage) {
        nextParams.delete("page");
      }

      setSearchParams(nextParams);
    },
    [queryString, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchInput(null);
    setSearchParams(new URLSearchParams());
    setIsMobileFilterOpen(false);
  }, [setSearchParams]);

  useEffect(() => {
    if (searchInput === null) {
      return undefined;
    }

    const trimmedSearch = searchInput.trim();

    if (trimmedSearch === filters.search) {
      return undefined;
    }

    //////////////////////////////////////////////////
    // Debounce search before touching the URL, which prevents
    // a backend request for every keystroke.
    //////////////////////////////////////////////////
    const debounceTimer = window.setTimeout(() => {
      updateQueryParams({ search: trimmedSearch }, { resetPage: true });
      setSearchInput(null);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(debounceTimer);
  }, [filters.search, searchInput, updateQueryParams]);

  useEffect(() => {
    let isActive = true;

    const loadFilterData = async () => {
      try {
        const [categoriesResponse, locationsResponse] = await Promise.all([
          getCategories(),
          getServices({ page: 1, limit: 1000 }),
        ]);

        if (!isActive) {
          return;
        }

        const locationOptions = Array.from(
          new Set(
            (locationsResponse.services || [])
              .map((service) => service?.vendor?.location || service?.location)
              .filter(Boolean),
          ),
        ).sort((first, second) => first.localeCompare(second));

        setCategories(categoriesResponse?.categories || []);
        setLocations(locationOptions);
      } catch {
        if (isActive) {
          setCategories([]);
          setLocations([]);
        }
      }
    };

    loadFilterData();

    return () => {
      isActive = false;
    };
  }, []);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getServices({
        search: filters.search,
        category: filters.category,
        location: filters.location,
        sort: filters.sort,
        page: filters.page,
        limit: SERVICES_PER_PAGE,
      });

      setServices(response.services || []);
      setPagination(
        response.pagination || {
          totalItems: response.services?.length || 0,
          totalPages: 1,
          currentPage: filters.page,
          pageSize: SERVICES_PER_PAGE,
        },
      );
    } catch (err) {
      setError(err.message || "Unable to load services");
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.category,
    filters.location,
    filters.page,
    filters.search,
    filters.sort,
  ]);

  useEffect(() => {
    let isActive = true;

    const loadCurrentServices = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getServices({
          search: filters.search,
          category: filters.category,
          location: filters.location,
          sort: filters.sort,
          page: filters.page,
          limit: SERVICES_PER_PAGE,
        });

        if (!isActive) {
          return;
        }

        setServices(response.services || []);
        setPagination(
          response.pagination || {
            totalItems: response.services?.length || 0,
            totalPages: 1,
            currentPage: filters.page,
            pageSize: SERVICES_PER_PAGE,
          },
        );
      } catch (err) {
        if (isActive) {
          setError(err.message || "Unable to load services");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadCurrentServices();

    return () => {
      isActive = false;
    };
  }, [filters]);

  const filterValues = useMemo(
    () => ({
      category: filters.category,
      location: filters.location,
      sort: filters.sort,
    }),
    [filters.category, filters.location, filters.sort],
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      updateQueryParams({ [key]: value }, { resetPage: true });
    },
    [updateQueryParams],
  );

  const goToPreviousPage = useCallback(() => {
    updateQueryParams({ page: Math.max(1, filters.page - 1) }, { resetPage: false });
  }, [filters.page, updateQueryParams]);

  const goToNextPage = useCallback(() => {
    updateQueryParams(
      { page: Math.min(pagination.totalPages || 1, filters.page + 1) },
      { resetPage: false },
    );
  }, [filters.page, pagination.totalPages, updateQueryParams]);

  const actions = useMemo(
    () => [
      {
        label: "View Details",
        onClick: (service) => {
          navigate(`/market/services/${service.id}`);
        },
      },
    ],
    [navigate],
  );

  const filterProps = {
    categories,
    locations,
    values: filterValues,
    onChange: handleFilterChange,
    onClear: clearFilters,
  };

  return (
    <PublicLayout contentClassName="max-w-[80rem] pb-10 pt-20 lg:pt-20">
      <div className="mb-8 mt-4 lg:mt-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Marketplace
        </p>
        <h1 className="mt-2">Browse Services</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <FilterSidebar {...filterProps} />

        <section className="min-w-0 flex-1 space-y-4">
            <MarketplaceSearch
              value={visibleSearch}
              onChange={setSearchInput}
              isLoading={isLoading}
            />
            <MobileFilterDropdown
              isOpen={isMobileFilterOpen}
              onOpen={() => setIsMobileFilterOpen(true)}
              onClose={() => setIsMobileFilterOpen(false)}
              {...filterProps}
            />

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {Array.from({ length: SERVICES_PER_PAGE }).map((_, index) => (
                <ServiceCardSkeleton key={index} />
              ))}
            </div>
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
            <section className="page-panel text-center">
              <h2>No services match your current filters.</h2>
              <p className="mt-2">
                Try a different search, category, location, or sort order.
              </p>
              <button
                type="button"
                className="btn-primary mt-5"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </section>
          ) : null}

          {!isLoading && !error && services.length > 0 ? (
            <div className="space-y-8">
              <ServiceGrid
                services={services}
                actions={actions}
                compactMobile
                mobileColumns={2}
              />

              <MarketplacePagination
                currentPage={pagination.currentPage || filters.page}
                totalPages={pagination.totalPages || 1}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
              />
            </div>
          ) : null}
        </section>
      </div>
    </PublicLayout>
  );
}
