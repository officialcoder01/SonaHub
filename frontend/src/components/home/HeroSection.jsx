import { motion } from "framer-motion";
import { Globe, UsersRound, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const marketHighlights = [
  { label: "Tailoring", meta: "From NGN 12,000" },
  { label: "Event styling", meta: "Popular this week" },
  { label: "Home repairs", meta: "Local professionals" },
];

const heroStats = [
  {
    value: "500+",
    label: "Artisans",
    Icon: UsersRound,
    iconClassName: "bg-blue-50 text-blue-700",
  },
  {
    value: "Local",
    label: "artisan network",
    Icon: Globe,
    iconClassName: "bg-sky-50 text-sky-700",
  },
  {
    value: "Fast",
    label: "service discovery",
    Icon: Zap,
    iconClassName: "bg-indigo-50 text-indigo-700",
  },
];

export default function HeroSection() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-18">
      <div className="mx-auto max-w-[80rem]">
        <div className="absolute left-8 top-16 hidden h-20 w-20 rounded-2xl border border-blue-100 bg-white/60 lg:block" />
        <div className="absolute bottom-16 right-12 hidden h-28 w-28 rounded-full border border-slate-200 bg-white/70 lg:block" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.p
            variants={itemVariants}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700"
          >
            Digital artisan marketplace
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
          >
            Find trusted artisans near you.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
          >
            Discover artisans and services near you, compare local expertise,
            and connect with reliable vendors for everyday projects, events,
            and creative work.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/market" className="btn-primary px-5 py-3">
              Explore Services
            </Link>
            <Link to="/register" className="btn-secondary px-5 py-3">
              Become a Vendor
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 grid max-w-2xl grid-cols-1 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3"
          >
            {heroStats.map(({ value, label, Icon, iconClassName }) => (
              <article
                key={label}
                className="flex h-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
                >
                  <Icon size={25} strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none text-slate-950">
                    {value}
                  </p>
                  <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                    {label}
                  </p>
                </div>
              </article>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.2 }}
          className="relative min-h-[380px] lg:min-h-[400px]"
        >
          <div className="absolute left-0 top-4 w-[82%] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:w-[72%]">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Marketplace pulse
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950">
                    Explore skilled makers
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {marketHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div>
                      <span className="block text-sm font-semibold text-slate-950">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-slate-500">
                        {item.meta}
                      </span>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-0 w-[68%] rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:w-[58%]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                SM
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Serah Mitchell
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Professional caterer and event stylist
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-lg font-bold text-blue-700">120+</p>
                <p className="text-xs font-medium text-blue-700/80">
                  Jobs completed
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-lg text-slate-950 font-semibold"><Star className="inline h-5 w-5 text-amber-400 fill-current" /> 4.9 Rating</span>
              </div>
            </div>
          </div>

          <div className="absolute right-10 top-0 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              New request
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              Wedding makeup artist
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
