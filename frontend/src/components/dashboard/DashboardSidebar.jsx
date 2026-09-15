import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import logo from "../../assets/images/logo.png";
import { dashboardNavigationItems } from "./dashboardNavigation";
import { useAuth } from "../../context/AuthContext";

export default function DashboardSidebar({
  navigationItems = dashboardNavigationItems,
  workspaceLabel = "Vendor workspace",
  navigationLabel = "Vendor dashboard",
}) {
  const [expandedItems, setExpandedItems] = useState(() => new Set());
  const { user } = useAuth();

  const toggleItem = (label) => {
    setExpandedItems((currentItems) => {
      const nextItems = new Set(currentItems);
      if (nextItems.has(label)) {
        nextItems.delete(label);
      } else {
        nextItems.add(label);
      }
      return nextItems;
    });
  };

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
          {workspaceLabel}
        </p>
      </div>

      {/* Navigation colors intentionally separate the premium sidebar from the light workspace. */}
      <nav className="space-y-1 px-3 py-5" aria-label={navigationLabel}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const isExpanded = expandedItems.has(item.label);
            const childrenId = `${item.label.toLowerCase().replace(/\s+/g, "-")}-navigation`;

            return (
              <div key={item.label} className="py-1">
                <button
                  type="button"
                  onClick={() => toggleItem(item.label)}
                  aria-expanded={isExpanded}
                  aria-controls={childrenId}
                  className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    {Icon ? <Icon className="h-5 w-5" /> : null}
                    {item.label}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={childrenId}
                  className={`${isExpanded ? "mt-1" : "hidden"} ml-5 space-y-1 border-l border-slate-800 pl-3`}
                >
                  {item.children.map((child) => child.comingSoon ? (
                    <span key={child.label} className="block rounded-md px-3 py-2 text-xs font-semibold text-slate-500" aria-disabled="true">
                      {child.label}
                    </span>
                  ) : (
                    <NavLink key={child.label} to={child.to} className={linkClassName}>
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }

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
      
      <footer className="absolute bottom-0 w-full border-t border-slate-800 px-5 py-4 bg-gradient-to-r from-slate-800 to-blue-900 text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-700">
            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
              {user?.name?.slice(0, 1).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="truncate font-semibold text-slate-200">{user?.name}</span>
            <span className="truncate text-xs text-slate-400">{user?.email}</span>
          </div>
        </div>
      </footer>
    </aside>
  );
}
