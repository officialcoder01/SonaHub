export default function VendorAbout({ vendor }) {
  const about = vendor?.about || vendor?.bio || "";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        About
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-950">
        Meet the Artisan
      </h2>

      {/* Show the about text or a meaningful empty state – section is never hidden */}
      {about ? (
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
          {about}
        </p>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-600">
            This vendor hasn&apos;t added an introduction yet.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Check back soon – artisans are actively building their profiles.
          </p>
        </div>
      )}
    </section>
  );
}
