import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MobileDashboardDrawer from "../components/dashboard/MobileDashboardDrawer";

export default function VendorDashboardLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:h-screen lg:overflow-hidden">
      {/* Desktop uses fixed navigation chrome so only the workspace content scrolls. */}
      <div className="flex min-h-screen lg:h-screen lg:overflow-hidden">
        <DashboardSidebar />

        <div className="min-w-0 flex-1 lg:pl-64">
          <DashboardHeader onOpenMenu={() => setIsDrawerOpen(true)} />

          <main className="lg:h-screen lg:overflow-y-auto lg:pt-16">
            {/* The constrained inner shell mirrors the prototype while still scaling down cleanly on phones. */}
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile navigation is isolated so desktop layout never pays for drawer spacing. */}
      <MobileDashboardDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
