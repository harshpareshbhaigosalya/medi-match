import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingCart, User, Phone, Menu, X, ShieldCheck, Mail, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const NavLink = ({ to, children, icon: Icon }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm
          ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"}`}
      >
        {Icon && <Icon size={18} />}
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Professional Bar */}
      <div className="bg-gray-900 text-white py-2 px-6 hidden lg:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
              <ShieldCheck size={14} /> ISO 9001:2015 Certified
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Mail size={14} /> sales@rbpanchal.com
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
              <Headphones size={14} /> Support: +91 94267 57975
            </div>
          </div>
        </div>
      </div>

      {/* STICKY NAVBAR */}
      <header className={`sticky top-0 z-[100] transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-xl py-2" : "bg-white py-4"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="https://www.rbpanchal.com/images/logo.png?new"
              alt="RB Panchal Logo"
              className="h-10 md:h-12 object-contain hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            <NavLink to="/" icon={Home}>Home</NavLink>
            <NavLink to="/products">Catalog</NavLink>
            <NavLink to="/cart" icon={ShoppingCart}>Cart</NavLink>
            <NavLink to="/contactus" icon={Phone}>Contact</NavLink>

            <div className="h-6 w-[1px] bg-gray-200 mx-2" />

            {!token ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 px-4">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Get Started</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <NavLink to="/profile" icon={User}>Account</NavLink>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2 text-gray-900" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Expansion */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t px-6 py-8 space-y-4 shadow-2xl"
            >
              <Link to="/" onClick={() => setMobileMenu(false)} className="block text-2xl font-black text-gray-900 italic">Home</Link>
              <Link to="/products" onClick={() => setMobileMenu(false)} className="block text-2xl font-black text-gray-900 italic">Products</Link>
              <Link to="/cart" onClick={() => setMobileMenu(false)} className="block text-2xl font-black text-gray-900 italic">My Cart</Link>
              <Link to="/contactus" onClick={() => setMobileMenu(false)} className="block text-2xl font-black text-gray-900 italic">Contact</Link>
              <div className="pt-6 border-t border-gray-100">
                <button onClick={logout} className="text-red-600 font-black uppercase text-xs tracking-widest">Logout Account</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      {/* PREMIUM FOOTER */}
      <footer className="bg-gray-950 text-white pt-24 pb-12 w-full">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <img
                src="https://www.rbpanchal.com/images/logo.png?new"
                alt="RB Panchal Logo"
                className="h-12 object-contain mb-6 brightness-0 invert"
              />
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                Pioneering quality stainless steel solutions for India's healthcare and pharmaceutical sectors since 2001. Leading by excellence.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-6 font-heading">Sitemap</h3>
              <ul className="space-y-3">
                {["Home", "Products", "Cart", "Contact Us"].map(link => (
                  <li key={link}><Link to={link === "Home" ? "/" : `/${link.toLowerCase().replace(" ", "")}`} className="text-gray-400 hover:text-white transition-colors text-sm font-bold">{link}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-6 font-heading">Contact Direct</h3>
              <ul className="space-y-4">
                <li className="text-sm font-bold text-gray-400">Headquarters:<br /><span className="text-white text-xs">Ahmedabad, Gujarat, India</span></li>
                <li className="text-sm font-bold text-blue-400">+91 94267 57975</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-6 font-heading">Certification</h3>
              <img
                src="https://www.rbpanchal.com/images/certificate.png"
                alt="ISO Certified"
                className="h-12 opacity-80"
              />
              <div className="mt-4 text-[10px] font-black text-gray-500 uppercase">Registered Trademark</div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">© {new Date().getFullYear()} RB PANCHAL MEDICAL GEAR. ENGINEERED IN INDIA.</p>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-tighter text-gray-500">
              <a href="#" className="hover:text-blue-500">Privacy Policy</a>
              <a href="#" className="hover:text-blue-500">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
