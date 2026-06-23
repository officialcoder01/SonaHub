import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/ui/Navbar";

export default function PublicLayout({ children, contentClassName = "" }) {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const isAuthenticated = Boolean(user || token);
  const isVendor = user?.role === "VENDOR";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <Navbar
        isAuthenticated={isAuthenticated}
        isVendor={isVendor}
        onLogout={handleLogout}
      />
      <main
        className={`mx-auto w-full max-w-6xl px-4 pb-10 pt-15 sm:px-6 lg:px-8 lg:pt-15 ${contentClassName}`}
      >
        {children}
      </main>
    </div>
  );
}
