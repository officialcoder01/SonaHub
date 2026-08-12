import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarCheck,
  Star,
  BarChart3,
  UserRound,
  Settings,
  MessageSquare,
} from "lucide-react";

////////////////////////////////////////////////////////////////////////////////
// NAVIGATION CONFIGURATION STRUCTURE
// 
// The `dashboardNavigationItems` array defines the navigation configuration 
// for the Vendor Dashboard. Each item contains:
// - `label`: The display name of the navigation item
// - `to`: The route path
// - `icon`: The Lucide React icon component reference
// - `comingSoon` (optional): If true, indicates a feature that is not yet ready
//
// WHY ICON REFERENCES ARE STORED IN THE CONFIGURATION:
// Storing component references directly in the navigation metadata decouples 
// the visual details (which icon to display) from the layout components (Sidebar, Drawer).
// This makes the navigation menu easily extendable, reusable, and dynamically-driven.
////////////////////////////////////////////////////////////////////////////////
export const dashboardNavigationItems = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "Services", to: "/dashboard/services", icon: BriefcaseBusiness },
  { label: "Bookings", to: "/dashboard/bookings", icon: CalendarCheck },
  { label: "Reviews", to: "/dashboard/reviews", icon: Star },
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { label: "Vendor Profile", to: "/dashboard/vendor-profile", icon: UserRound },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
  { label: "Messages", to: "/dashboard/messages", icon: MessageSquare, comingSoon: true },
];

