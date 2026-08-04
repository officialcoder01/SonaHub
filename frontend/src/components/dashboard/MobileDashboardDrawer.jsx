import { motion } from "framer-motion";
import { NavLink, Link } from "react-router-dom";
import { X } from "lucide-react";
import logo from "../../assets/images/logo.png";
import { dashboardNavigationItems } from "./dashboardNavigation";

export default function MobileDashboardDrawer({ isOpen, onClose }) {
  const linkClassName = ({ isActive }) =>
    `flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-blue-600 text-white shadow-sm shadow-blue-950/20"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40"
        aria-label="Close dashboard navigation"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute left-0 top-0 flex h-full w-80 max-w-[86vw] flex-col border-r border-slate-800 bg-slate-950 shadow-xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-5">
          <div>
            <Link
              to="/"
              className="flex items-center"
            >
              <img src={logo} alt="SonaHub Logo" className="h-8 w-auto" />
            </Link>
            <p className="mt-3 text-xs font-medium text-blue-200">
              Vendor workspace
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close dashboard navigation"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 px-4 py-5" aria-label="Mobile vendor dashboard">
          {dashboardNavigationItems.map((item) => {
            const Icon = item.icon;
            return item.comingSoon ? (
              <div
                key={item.label}
                className="flex min-h-11 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-500"
              >
                <span className="flex items-center gap-3">
                  {Icon && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900">
                      <Icon className="h-5 w-5 text-slate-500" />
                    </span>
                  )}
                  {item.label}
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Soon
                </span>
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/dashboard"}
                className={linkClassName}
                onClick={onClose}
              >
                {Icon && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-current/10">
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </motion.aside>
    </div>
  );
}
