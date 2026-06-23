import { getFirstImageUrl, getCategoryName, formatPrice } from "../../utils/serviceHelpers.js"

export default function VendorServiceCard({ service, onEdit, onDelete }) {
  const imageUrl = getFirstImageUrl(service);
  const categoryName = getCategoryName(service);
  const status = service.status || "Active";

  return (
    <article className="flex min-h-[292px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="h-36 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4 text-center text-sm font-semibold text-slate-400">
            No image added
          </div>
        )}
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
