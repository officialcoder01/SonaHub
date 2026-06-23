import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, Clock, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

const metrics = [
  { label: "Artisan Vendors", value: "500+", icon: Users },
  { label: "Avg Rating", value: "4.8", icon: Star },
  { label: "Booking Success", value: "85%", icon: CheckCircle2 },
];

function DashboardPreviewCard({ children, className = "" }) {
  return (
    <div className={`rounded-lg bg-white p-3 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export default function CTASection() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto grid max-w-[80rem] gap-9 lg:grid-cols-[1fr_0.92fr] lg:items-center"
      >
        <div className="max-w-xl">
          <h2 className="max-w-md text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Turn Your Skill Into A Business
          </h2>
          <p className="mt-4 text-sm leading-6 text-blue-100 sm:text-base sm:leading-7">
            Create your artisan profile, showcase your services, receive booking requests,
            build your reputation, and grow your customer base.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-950"
            >
              Become a Vendor
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/market"
              className="inline-flex items-center justify-center rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-950"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div key={metric.label} className="text-center sm:text-left">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-blue-100 sm:mx-0">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <strong className="mt-2 block text-lg font-bold text-white">
                    {metric.value}
                  </strong>
                  <span className="block text-[11px] font-medium text-blue-100">
                    {metric.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-xl border border-white/25 bg-white/10 p-3 shadow-2xl backdrop-blur">
          <DashboardPreviewCard>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                SM
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-sm font-bold text-slate-950">
                    Sarah Mitchell
                  </h3>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    Active
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  Monthly Revenue: ₦450,000
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[82%] rounded-full bg-blue-600" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-500">
              <span>Profile Score</span>
              <span>4.9/5</span>
            </div>
          </DashboardPreviewCard>

          <DashboardPreviewCard className="mt-3">
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="font-semibold text-slate-700">Recent Bookings</span>
              <span className="font-bold text-slate-950">12</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                  Wedding Dress
                </span>
                <span className="font-bold text-emerald-600">Accepted</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <Clock className="h-3 w-3 text-amber-500" aria-hidden="true" />
                  Suit Alteration
                </span>
                <span className="font-bold text-amber-600">Pending</span>
              </div>
            </div>
          </DashboardPreviewCard>

          <DashboardPreviewCard className="mt-3 bg-emerald-500 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-emerald-50">
                  Total Revenue This Month
                </p>
                <strong className="mt-1 block text-2xl font-bold">₦450,000</strong>
              </div>
              <BarChart3 className="h-8 w-8 text-emerald-100" aria-hidden="true" />
            </div>
          </DashboardPreviewCard>
        </div>
      </motion.div>
    </section>
  );
}
