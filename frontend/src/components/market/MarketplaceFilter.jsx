export default function MarketplaceFilter({
  categories = [],
  locations = [],
  values,
  onChange,
  onClear,
  idPrefix = "market",
}) {
  const categoryId = `${idPrefix}-category`;
  const locationId = `${idPrefix}-location`;
  const sortId = `${idPrefix}-sort`;

  return (
    <div className="space-y-5">
      <div className="form-field">
        <label className="form-label" htmlFor={categoryId}>
          Category
        </label>
        <select
          id={categoryId}
          className="form-input"
          value={values.category}
          onChange={(event) => onChange("category", event.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={locationId}>
          Location
        </label>
        <select
          id={locationId}
          className="form-input"
          value={values.location}
          onChange={(event) => onChange("location", event.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={sortId}>
          Sort
        </label>
        <select
          id={sortId}
          className="form-input"
          value={values.sort}
          onChange={(event) => onChange("sort", event.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <button type="button" className="btn-secondary w-full" onClick={onClear}>
        Clear Filters
      </button>
    </div>
  );
}
