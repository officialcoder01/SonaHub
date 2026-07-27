import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

// This component is intentionally prop-driven so pages can decide
// what navigation state to show without hiding that logic here.
export default function Navbar({ isAuthenticated, isVendor, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block rounded-md px-3 py-3 text-base font-semibold transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
    }`;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigationItems = (
    <>
      <NavLink to="/" className={navLinkClass}>
        Home
      </NavLink>
      <NavLink to="/market" className={navLinkClass}>
        Market
      </NavLink>
      {isVendor ? (
        <NavLink to="/dashboard" className={navLinkClass}>
          Dashboard
        </NavLink>
      ) : null}
      {isAuthenticated ? (
        <NavLink to="/bookings" className={navLinkClass}>
          My Bookings
        </NavLink>
      ) : null}
    </>
  );

  return (
    <>
      <nav className="fixed left-0 top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid min-h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:min-h-20 lg:px-8">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-blue-700"
            onClick={closeMenu}
          >
            Sona<span className="hidden min-[390px]:inline text-red-500">Hub</span>
          </Link>

          <div className="hidden justify-center lg:flex">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1">
              {navigationItems}
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                className="btn-secondary px-3 sm:px-4"
                onClick={onLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="inline-flex items-center justify-center rounded-md px-2 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-4"
                  onClick={closeMenu}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="btn-primary px-2 sm:px-4"
                  onClick={closeMenu}
                >
                  Register
                </NavLink>
              </>
            )}

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 lg:hidden"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span className="sr-only">
                {isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-l border-slate-200 bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-extrabold tracking-tight text-blue-700">
                Sona<span className="hidden min-[390px]:inline text-red-500">Hub</span>
              </p>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Close navigation menu"
                onClick={closeMenu}
              >
                X
              </button>
            </div>
            <div className="mt-8 space-y-1">
              <NavLink to="/" className={mobileNavLinkClass} onClick={closeMenu}>
                Home
              </NavLink>
              <NavLink
                to="/market"
                className={mobileNavLinkClass}
                onClick={closeMenu}
              >
                Market
              </NavLink>
              {isVendor ? (
                <NavLink
                  to="/dashboard"
                  className={mobileNavLinkClass}
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
              ) : null}
              {isAuthenticated ? (
                <NavLink
                  to="/bookings"
                  className={mobileNavLinkClass}
                  onClick={closeMenu}
                >
                  My Bookings
                </NavLink>
              ) : null}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </>
  );
}
