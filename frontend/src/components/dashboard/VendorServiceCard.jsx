import { useEffect, useRef, useState } from "react";
import { MoreVertical, Star } from "lucide-react";
import { getFirstImageUrl, getCategoryName, formatPrice } from "../../utils/serviceHelpers.js"

export default function VendorServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleFeatured,
  isFeatureUpdating,
}) {
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const imageUrl = getFirstImageUrl(service);
  const categoryName = getCategoryName(service);
  const status = service.status || "Active";
  const isFeatured = Boolean(service.isPinned);

  useEffect(() => {
    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const closeMenuOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeMenuOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, []);

  const handleFeatureToggle = async () => {
    await onToggleFeatured(service);
    setIsMenuOpen(false);
  };

  return (
    <article className="group flex h-full min-h-[282px] min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4 text-center text-sm font-semibold text-slate-400">
            No image added
          </div>
        )}

        <div className="absolute right-2 top-2 z-30 flex justify-end" ref={menuRef}>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`${isFeatured ? "Remove" : "Feature"} ${service.title}`}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
            disabled={isFeatureUpdating}
          >
            <MoreVertical className="h-5 w-5" aria-hidden="true" />
          </button>

          {isMenuOpen ? (
            <div
              className="absolute right-0 top-full z-10 mt-1 w-56 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-950/10"
              role="menu"
            >
              <button
                type="button"
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isFeatured
                    ? "text-blue-700 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                role="menuitem"
                onClick={handleFeatureToggle}
                disabled={isFeatureUpdating}
              >
                <Star
                  className="h-4 w-4 shrink-0"
                  fill="currentColor"
                  aria-hidden="true"
                />
                {isFeatured ? "Remove from featured" : "Feature Service"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-base font-semibold text-slate-950">
              {service.title}
            </h2>
            <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-blue-700">
              {categoryName}
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold text-slate-950">
            {formatPrice(service.price)}
          </p>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
          {service.description || "No description added yet."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            {status}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() => onEdit(service)}
            >
              Edit
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={() => onDelete(service)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
