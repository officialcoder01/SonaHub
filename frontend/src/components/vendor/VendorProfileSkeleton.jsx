// Reusable pulsing skeleton block following the existing project pattern
const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

// Skeleton that closely matches the VendorHeader layout to avoid layout shift
function VendorHeaderSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex gap-5">
        <SkeletonBlock className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-7 w-48" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-40" />
        </div>
        <SkeletonBlock className="h-10 w-32 shrink-0 rounded-md" />
      </div>
      <SkeletonBlock className="mt-5 h-16 w-full" />
    </div>
  );
}

// Skeleton for About, Reviews, and service section panels
function SectionSkeleton({ rows = 3 }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-6 w-48" />
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}

// Skeleton mimicking the featured services / all services card grid
function ServiceGridSkeleton({ count = 3 }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-6 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBlock className="aspect-[4/3] w-full" />
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Full-page skeleton for the Vendor Public Profile page
export default function VendorProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb placeholder */}
      <SkeletonBlock className="h-4 w-48" />

      <VendorHeaderSkeleton />
      <SectionSkeleton rows={2} />
      <ServiceGridSkeleton count={3} />
      <SectionSkeleton rows={4} />
      <ServiceGridSkeleton count={6} />
    </div>
  );
}
