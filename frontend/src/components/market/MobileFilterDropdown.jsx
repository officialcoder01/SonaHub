import { SlidersHorizontal, X } from "lucide-react";
import MarketplaceFilter from "./MarketplaceFilter";

export default function MobileFilterDropdown({ isOpen, onOpen, onClose, ...filterProps }) {
  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="btn-secondary w-full gap-2"
        onClick={onOpen}
        aria-expanded={isOpen}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filter
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 px-3 pb-3">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close filters"
            onClick={onClose}
          />
          <section className="relative w-full rounded-t-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-950">Filters</h2>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
                aria-label="Close filters"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <MarketplaceFilter {...filterProps} idPrefix="mobile-market" />
          </section>
        </div>
      ) : null}
    </div>
  );
}
