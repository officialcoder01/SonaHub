export default function MarketplacePagination({
  currentPage = 1,
  totalPages = 1,
  onPrevious,
  onNext,
}) {
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <nav
      className="flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row"
      aria-label="Marketplace pagination"
    >
      <button
        type="button"
        className="btn-secondary w-full sm:w-auto"
        onClick={onPrevious}
        disabled={currentPage <= 1}
      >
        Previous
      </button>

      <p className="text-sm font-medium text-slate-600">
        Page {currentPage} of {safeTotalPages}
      </p>

      <button
        type="button"
        className="btn-secondary w-full sm:w-auto"
        onClick={onNext}
        disabled={currentPage >= safeTotalPages}
      >
        Next
      </button>
    </nav>
  );
}
