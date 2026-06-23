// import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Marketplace",
    links: [
      { label: "Home", to: "/" },
      { label: "Market", to: "/market" },
      { label: "Categories", to: "/market" },
    ],
  },
  {
    title: "Customers",
    links: [
      { label: "Browse Services", to: "/market" },
      { label: "Find Artisans", to: "/market" },
      { label: "How Booking Works", to: "/" },
    ],
  },
  {
    title: "Vendors",
    links: [
      { label: "Become a Vendor", to: "/register" },
      { label: "Vendor Dashboard", to: "/dashboard" },
      { label: "Vendor Guide", to: "/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/" },
      { label: "Contact", to: "/" },
      { label: "Privacy Policy", to: "/" },
      { label: "Terms", to: "/" },
    ],
  },
];

const socialLinks = [
  { label: "Facebook", icon: "f" },
  { label: "Twitter", icon: "t" },
  { label: "Instagram", icon: "i" },
  { label: "LinkedIn", icon: "l" },
];

export default function Footer() {
  return (
    <footer className="relative left-1/2 w-screen -translate-x-1/2 bg-slate-950 px-4 py-10 text-slate-300 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[80rem]">
        <div className="grid grid-cols-2 gap-8 border-b border-white/10 pb-8 sm:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-bold text-white">{column.title}</h2>
              <nav className="mt-3 space-y-2" aria-label={`${column.title} links`}>
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block text-xs font-medium text-slate-400 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Artisan Market. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <button
                  key={social.label}
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                  aria-label={social.label}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
