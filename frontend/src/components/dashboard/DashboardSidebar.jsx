import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { dashboardNavigationItems } from "./dashboardNavigation";

export default function DashboardSidebar() {
  const linkClassName = ({ isActive }) =>
    `group flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-blue-600 text-white shadow-sm shadow-blue-950/20"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
      <div className="border-b border-slate-800 px-5 py-5">
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

      {/* Navigation colors intentionally separate the premium sidebar from the light workspace. */}
      <nav className="space-y-1 px-3 py-5" aria-label="Vendor dashboard">
        {dashboardNavigationItems.map((item) => {
          const Icon = item.icon;
          return item.comingSoon ? (
            <div
              key={item.label}
              className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-500"
              aria-disabled="true"
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
    </aside>
  );
}
