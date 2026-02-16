import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Home,
  Layers,
  Box,
  ShoppingCart,
  Users,
  FileText,
} from "lucide-react";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    navigate("/login");
  }

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { to: "/admin/ai-suggestions", label: "AI Suggestions", icon: <FileText className="w-5 h-5" /> },
    { to: "/admin/categories", label: "Categories", icon: <Layers className="w-5 h-5" /> },
    { to: "/admin/products", label: "Products", icon: <Box className="w-5 h-5" /> },
    { to: "/admin/orders", label: "Orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { to: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { to: "/admin/reports", label: "Reports", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

          <nav className="flex flex-col space-y-2 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-3 py-2 rounded hover:bg-blue-700 transition ${location.pathname === link.to ? "bg-blue-800 font-semibold" : ""
                  }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={logout}
          className="mt-6 bg-red-600 w-full py-2 rounded hover:bg-red-700 transition text-white font-medium"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
