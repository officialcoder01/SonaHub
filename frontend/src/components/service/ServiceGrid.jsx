import ServiceCard from "./ServiceCard";

export default function ServiceGrid({
  services = [],
  actions,
  compactMobile = false,
  dense = false,
  homepageFeatured = false,
  mobileColumns = 0,
  columns = 0,
}) {
  const desktopColumns = columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  const gridClassName = dense
    ? `grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4 ${desktopColumns}`
    : mobileColumns === 2
    ? `grid grid-cols-2 gap-4 sm:gap-6 ${desktopColumns}`
    : `grid grid-cols-1 gap-6 sm:grid-cols-2 ${desktopColumns}`;

  return (
    <div className={gridClassName}>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          actions={actions}
          compactMobile={compactMobile}
          dense={dense}
          homepageFeatured={homepageFeatured}
        />
      ))}
    </div>
  );
}
