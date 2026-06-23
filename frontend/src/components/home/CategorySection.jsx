import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Camera,
  ChefHat,
  Hammer,
  Paintbrush,
  Scissors,
  Sparkles,
  Wrench,
} from "lucide-react";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const categoryIcons = [
  Scissors,
  Paintbrush,
  Camera,
  Sparkles,
  Hammer,
  ChefHat,
  Wrench,
  Sparkles,
];

const getServiceCount = (category) => {
  const count =
    category.serviceCount ||
    category.servicesCount ||
    category._count?.services ||
    category.services?.length ||
    0;

  return `${count} ${Number(count) === 1 ? "Service" : "Services"}`;
};

export default function CategorySection({ categories = [], isLoading, error }) {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-slate-100/80 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-[80rem] space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 text-center">
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Browse Categories
            </h2>
          </div>
        </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[68px] animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && categories.length > 0 ? (
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];

            return (
              <motion.button
                key={category.id || category.name}
                type="button"
                variants={cardVariants}
                className="group flex h-[78px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-950">
                    {category.name}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-slate-500">
                    {getServiceCount(category)}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      ) : null}

        <div className="flex justify-center">
          <Link to="/market" className="btn-secondary">
            Explore all categories
          </Link>
        </div>
      </div>
    </section>
  );
}
