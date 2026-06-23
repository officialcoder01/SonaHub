export const getFirstImageUrl = (service) => {
  const firstImage = service?.images?.[0];

  if (!firstImage) {
    return "";
  }

  return typeof firstImage === "string" ? firstImage : firstImage.url;
};

export const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  return typeof image === "string" ? image : image.url;
};

export const getCategoryName = (service) => {
  if (typeof service?.category === "string") {
    return service.category;
  }

  return service?.category?.name || "Uncategorized";
};

export const getVendorName = (service) => {
  return (
    service?.vendor?.businessName ||
    service?.businessName ||
    service?.vendorBusinessName ||
    "Your business"
  );
};

export const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price));
};

export const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Recently added";
  }

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
};
