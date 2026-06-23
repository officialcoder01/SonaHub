import { useNavigate } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { getFirstImageUrl, getCategoryName, getVendorName, formatPrice } from "../../utils/serviceHelpers";

export default function ServiceCard({
  service,
  actions,
  compactMobile = false,
  dense = false,
  homepageFeatured = false,
}) {
  const featuredLayout = dense || homepageFeatured;

  const styles = {
    body: featuredLayout
      ? "flex flex-1 flex-col p-2.5"
      : compactMobile
        ? "space-y-3 p-3 sm:space-y-4 sm:p-5"
        : "space-y-4 p-5",

    meta: featuredLayout
      ? "mb-1.5 flex items-center gap-1.5"
      : compactMobile
        ? "mb-1 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
        : "mb-2 flex items-center justify-between gap-3",

    category: featuredLayout
      ? "inline-block py-1 text-sm font-semibold uppercase text-blue-700"
      : compactMobile
        ? "inline-block py-1 text-sm font-semibold uppercase text-blue-700"
        : "rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700",

    price: featuredLayout
      ? "mt-1 text-2xl text-blue-600"
      : compactMobile
        ? "mt-1 text-2xl text-blue-600"
        : "text-sm font-semibold text-slate-950",

    title: featuredLayout
      ? "mb-2 text-xl leading-[18px] text-slate-950"
      : compactMobile
        ? "mb-1 text-xl leading-[18px] text-slate-950"
        : "line-clamp-2 text-lg",

    vendor: featuredLayout
      ? "mt-0.5 line-clamp-1 text-[15px] font-medium text-slate-500"
      : compactMobile
        ? "mt-0.5 mb-0.5 line-clamp-1 text-[15px] font-medium text-slate-500"
        : "mt-1 text-sm font-medium text-slate-500",

    description: featuredLayout
      ? "mt-1 mb-4 line-clamp-2 text-sm leading-4 text-slate-500"
      : compactMobile
        ? "mt-1 line-clamp-2 text-sm leading-4 text-slate-500"
        : "line-clamp-3 text-sm leading-6 text-slate-600",

    actionWrap: featuredLayout
      ? "mt-auto flex items-center gap-2 pt-2"
      : compactMobile
        ? "mt-auto flex items-center gap-2 pt-2"
        : "flex gap-2 border-t border-slate-100 pt-4",

    defaultAction: featuredLayout
      ? "inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition group-hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      : compactMobile
        ? "btn-secondary flex-1 bg-blue-600 px-2 text-xs text-white hover:bg-blue-700 focus:ring-blue-500 sm:px-4 sm:text-sm"
        : "btn-secondary flex-1",

    card: featuredLayout
      ? "group flex h-full min-h-[282px] min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      : "group min-w-0 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",

    image: featuredLayout
      ? "relative h-[154px] overflow-hidden bg-slate-100 sm:h-[166px] lg:h-[174px]"
      : "aspect-[4/3] overflow-hidden bg-slate-100",
  };

  const navigate = useNavigate();
  const imageUrl = getFirstImageUrl(service);
  const categoryName = getCategoryName(service);
  const vendorName = getVendorName(service);
  const rating = Number(service?.reviewStats?.averageRating || service?.rating || 0).toFixed(1);
  const totalReview = service?.reviewStats?.totalReviews || service?.reviews?.length || 0;
  const cardActions = actions || [];
  const serviceDetailsPath = service?.id ? `/market/services/${service.id}` : "";

  const openServiceDetails = () => {
    if (serviceDetailsPath) {
      navigate(serviceDetailsPath);
    }
  };

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openServiceDetails();
    }
  };

  return (
    <article
      className={styles.card}
      role="link"
      tabIndex={0}
      aria-label={`View details for ${service.title}`}
      onClick={openServiceDetails}
      onKeyDown={handleCardKeyDown}
    >
      <div className={styles.image}>
        {homepageFeatured ? (
          <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-700 px-2 py-0.5 text-[12px] font-bold text-white shadow-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            Featured
          </span>
        ) : null}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 px-6 text-center text-sm font-medium text-slate-400">
            No image added
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div>
          <div className={styles.meta}>
            <span className={styles.category}>{categoryName}</span>
          </div>
          <h2 className={styles.title}>{service.title}</h2>
          <p className={styles.vendor}>
            {vendorName}
          </p>

          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            {service?.vendor?.location || service?.location || "Location unavailable"}
          </div>
        </div>

        <p className={styles.description}>
          {service.description || "No description provided for this service."}
        </p>

        <span className="inline-flex shrink-0 gap-1.5 items-center text-[15px] font-bold text-slate-700">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          {rating}
          <span className="text-[15px] font-normal text-slate-500">({totalReview})</span>
        </span>

        <p className={styles.price}>{formatPrice(service.price)}</p>

        {cardActions.length > 0 ? (
          <div className={styles.actionWrap}>
            {cardActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={
                  action.variant === "danger"
                    ? "inline-flex flex-1 items-center justify-center rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    : styles.defaultAction
                }
                onClick={(event) => {
                  event.stopPropagation();
                  action.onClick?.(service);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
