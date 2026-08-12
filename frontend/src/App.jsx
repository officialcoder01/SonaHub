import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Market from "./pages/Market";
import CreateService from "./pages/dashboard/CreateService";
import EditService from "./pages/dashboard/EditService";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import CustomerBookingsPage from "./pages/CustomerBookingsPage";
import VendorDashboardLayout from "./layouts/VendorDashboardLayout";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import BookingsPage from "./pages/dashboard/BookingsPage";
import OverviewPage from "./pages/dashboard/OverviewPage";
import ReviewsPage from "./pages/dashboard/ReviewsPage";
import ServicesPage from "./pages/dashboard/ServicesPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import VendorProfilePage from "./pages/dashboard/VendorProfilePage";
import EditVendorProfile from "./pages/dashboard/EditVendorProfile";
import VendorPublicProfilePage from "./pages/VendorProfilePage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/market/services/:id" element={<ServiceDetailsPage />} />
          {/* Public vendor profile page — no auth required */}
          <Route path="/vendors/:id" element={<VendorPublicProfilePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "VENDOR"]}>
                <CustomerBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["VENDOR"]}>
                <VendorDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:id/edit" element={<EditService />} />
            <Route path="create-service" element={<CreateService />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="vendor-profile" element={<VendorProfilePage />} />
            <Route path="profile/edit" element={<EditVendorProfile />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
