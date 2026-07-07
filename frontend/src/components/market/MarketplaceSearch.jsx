import { Search } from "lucide-react";

export default function MarketplaceSearch({ value, onChange, isLoading = false }) {
  return (
    <label className="block">
      <span className="sr-only">Search services</span>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search services by title"
          className="form-input h-12 pl-10 pr-4"
          aria-label="Search services by title"
        />
        {isLoading ? (
          <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-600" />
        ) : null}
      </div>
    </label>
  );
}
