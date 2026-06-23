/**
 * BookingCardSkeleton renders a placeholder matching the exact layout and height
 * of a customer booking card to prevent layout shifts.
 */
export default function BookingCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Service Image Skeleton */}
        <div className="h-24 w-full shrink-0 rounded-xl bg-slate-200 sm:w-32" />

        {/* Content Skeleton */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-2">
            {/* Top row: Category and Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-6 w-24 rounded-full bg-slate-200" />
            </div>

            {/* Title */}
            <div className="h-6 w-3/4 rounded bg-slate-200" />

            {/* Vendor & Date details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-200" />
            </div>
          </div>

          {/* Action Button Skeleton */}
          <div className="mt-4 flex justify-end">
            <div className="h-9 w-28 rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
