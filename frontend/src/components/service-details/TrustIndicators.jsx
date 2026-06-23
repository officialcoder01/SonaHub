import { BadgeCheck, Contact, Headset, ShieldCheck } from "lucide-react";

const indicators = [
  {
    title: "Trusted",
    text: "Reviewed marketplace vendor",
    Icon: BadgeCheck,
    iconClassName: "bg-blue-50 text-blue-700",
  },
  {
    title: "Quick Response",
    text: "Clear next steps after inquiry",
    Icon: Contact,
    iconClassName: "bg-sky-50 text-sky-700",
  },
  {
    title: "24/7 Support",
    text: "Help available when you need it",
    Icon: Headset,
    iconClassName: "bg-cyan-50 text-cyan-700",
  },
  {
    title: "Verified Vendor",
    text: "Identity and profile signals checked",
    Icon: ShieldCheck,
    iconClassName: "bg-indigo-50 text-indigo-700",
  },
];

export default function TrustIndicators({ isVerified }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {indicators.map((indicator) => (
        <article
          key={indicator.title}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${indicator.iconClassName}`}
          >
            <indicator.Icon size={25} strokeWidth={2.4} />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-950">
            {indicator.title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {indicator.title === "Verified Vendor" && !isVerified
              ? "Profile details available"
              : indicator.text}
          </p>
        </article>
      ))}
    </section>
  );
}
