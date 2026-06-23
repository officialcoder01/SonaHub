import { useMemo, useState } from "react";
import { getImageUrl } from "../../utils/serviceHelpers";

export default function ServiceGallery({ images = [], title }) {
  const imageUrls = useMemo(
    () => images.map((image) => getImageUrl(image)).filter(Boolean),
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = imageUrls[activeIndex];

  return (
    <section className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm sm:aspect-[16/11]">
        {activeImage ? (
          <img
            key={activeImage}
            src={activeImage}
            alt={title}
            className="h-full w-full object-cover opacity-100 transition duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm font-semibold text-slate-400">
            No image added for this service yet
          </div>
        )}
      </div>

      {imageUrls.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageUrls.map((imageUrl, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={imageUrl}
                type="button"
                aria-label={`Show service image ${index + 1}`}
                className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border bg-white transition duration-200 hover:-translate-y-0.5 sm:h-20 sm:w-28 ${
                  isActive
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-slate-200 hover:border-blue-300"
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <img
                  src={imageUrl}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
