import MarketplaceFilter from "./MarketplaceFilter";

export default function FilterSidebar(props) {
  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">Filters</h2>
        </div>
        <MarketplaceFilter {...props} idPrefix="desktop-market" />
      </div>
    </aside>
  );
}
