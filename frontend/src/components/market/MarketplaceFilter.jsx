export default function MarketplaceFilter({
  categories = [],
  states = [],
  lgas = [],
  values,
  onChange,
  onClear,
  idPrefix = "market",
}) {
  const categoryId = `${idPrefix}-category`;
  const stateId = `${idPrefix}-state`;
  const lgaId = `${idPrefix}-lga`;
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
        <label className="form-label" htmlFor={stateId}>
          State
        </label>
        <select
          id={stateId}
          className="form-input"
          value={values.state}
          onChange={(event) => onChange("state", event.target.value)}
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={lgaId}>
          Local Government Area
        </label>
        <select
          id={lgaId}
          className="form-input"
          value={values.lga}
          onChange={(event) => onChange("lga", event.target.value)}
          disabled={!values.state}
        >
          <option value="">
            {values.state ? "All LGAs" : "Select a state first"}
          </option>
          {lgas.map((lga) => (
            <option key={lga} value={lga}>
              {lga}
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
