import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardHeader({ onOpenMenu }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const displayName = user?.name || user?.email || "Vendor";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openMarketplace = () => {
    setIsUserMenuOpen(false);
    navigate("/market");
  };

  const logoutFromMenu = () => {
    setIsUserMenuOpen(false);
    handleLogout();
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      // Close the lightweight menu when a pointer click lands outside the profile trigger area.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:fixed lg:left-64 lg:right-0">
      <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 lg:hidden"
          aria-label="Open dashboard navigation"
          onClick={onOpenMenu}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>

        <label className="sr-only" htmlFor="dashboard-search">
          Search dashboard
        </label>
        <input
          id="dashboard-search"
          type="search"
          placeholder="Search services, bookings, customers..."
          className="hidden h-10 w-full max-w-md rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 sm:block"
        />

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="btn-primary px-3"
            onClick={() => navigate("/dashboard/create-service")}
          >
            Add Service
          </button>
 
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-2 pr-3"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              onClick={() => setIsUserMenuOpen((current) => !current)}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-700 md:block">
                {displayName}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isUserMenuOpen ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 top-full z-50 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-950/10"
                role="menu"
              >
                {/* Menu actions close after selection so keyboard and pointer flows feel predictable. */}
                <button
                  type="button"
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 focus:bg-slate-50 focus:outline-none"
                  role="menuitem"
                  onClick={openMarketplace}
                >
                  Marketplace
                </button>
                <button
                  type="button"
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                  role="menuitem"
                  onClick={logoutFromMenu}
                >
                  Logout
                </button>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
