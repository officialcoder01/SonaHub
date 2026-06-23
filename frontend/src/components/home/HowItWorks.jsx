import { CheckCircle2, ChevronRight, Search, Send } from "lucide-react";

const steps = [
  {
    title: "Browse Services",
    text: "Explore trusted artisan services across marketplace categories and find the perfect match for your needs.",
    icon: Search,
  },
  {
    title: "Send Booking Request",
    text: "Contact vendors, discuss your requirements, and send booking requests with specific details.",
    icon: Send,
  },
  {
    title: "Get The Job Done",
    text: "Work with skilled professionals, track progress, and enjoy results from verified local artisans.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-[80rem]">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            How It Works
          </h2>
        </div>

        <div className="relative mx-auto mt-8 grid max-w-4xl gap-8 md:grid-cols-3 md:gap-6">
          <div className="absolute left-[16.5%] right-[16.5%] top-9 hidden h-px bg-slate-300 md:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm ring-8 ring-white">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-950">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[15rem] text-xs leading-5 text-slate-500">
                  {step.text}
                </p>
                {index < steps.length - 1 ? (
                  <ChevronRight
                    className="absolute right-[-18px] top-[28px] hidden h-5 w-5 bg-white text-slate-400 md:block"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
