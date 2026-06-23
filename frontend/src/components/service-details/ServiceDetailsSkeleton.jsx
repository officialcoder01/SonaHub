const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

export default function ServiceDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-5 w-48" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-4">
          <SkeletonBlock className="aspect-[4/3] w-full sm:aspect-[16/11]" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-16 w-20" />
            <SkeletonBlock className="h-16 w-20" />
            <SkeletonBlock className="h-16 w-20" />
          </div>
        </div>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <SkeletonBlock className="h-6 w-32" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="h-20 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </div>
      <SkeletonBlock className="h-32 w-full" />
      <SkeletonBlock className="h-48 w-full" />
    </div>
  );
}
