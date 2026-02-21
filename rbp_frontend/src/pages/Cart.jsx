import { useEffect, useState } from "react";
import { http, apiUrl } from "../lib/http";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, FileText, ShoppingBag, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth(); // Ensure we have user context if needed

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await http.get("/cart/");
      // Check if response is valid JSON
      if (typeof res.data === 'string' && res.data.includes("<!DOCTYPE")) {
        throw new Error("Invalid API Response");
      }
      setCart(res.data);

      try {
        const rec = await http.get("/products/");
        // Just take first 4 as simulation of recommended
        setRecommended(rec.data.slice(0, 4) || []);
      } catch (e) {
        console.log("Recommended products load failed", e);
      }
    } catch (err) {
      console.error("Cart load error", err);
      // Don't show critical error for empty cart 404, just set empty
      if (err.response && err.response.status === 404) {
        setCart({ items: [] });
      } else {
        setError("Could not stream cart data. Backend might be waking up.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function updateQty(itemId, qty) {
    if (qty < 1) return;
    try {
      await http.put("/cart/update", { item_id: itemId, quantity: qty });
      load(true); // Reload to get fresh calculations silently
    } catch (e) {
      alert("Failed to update quantity");
    }
  }

  async function removeItem(itemId) {
    try {
      await http.delete(`/cart/remove/${itemId}`);
      load(true);
    } catch (e) {
      alert("Failed to remove item");
    }
  }

  async function createQuotation() {
    try {
      const res = await http.post("/cart/quotation");
      setQuote(res.data[0]);
    } catch {
      alert("Failed to create quotation");
    }
  }

  function downloadQuotation() {
    if (!quote) return;
    const token = localStorage.getItem("token");
    window.open(`${apiUrl}/cart/quotation/${quote.id}/pdf?token=${token}`, "_blank");
  }

  async function handleCheckout() {
    try {
      const res = await http.get("/address/");
      if (!res.data.length) return navigate("/addresses?redirect=checkout");
      navigate("/checkout");
    } catch (err) {
      alert("Could not load addresses for checkout");
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 size={48} className="animate-spin text-blue-600" />
      <p className="text-gray-500 font-medium animate-pulse">Syncing Cart...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-6 text-center">
      <div className="bg-red-50 p-6 rounded-3xl">
        <h3 className="text-red-600 font-bold mb-2">Connection Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={load} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">Retry</button>
      </div>
    </div>
  );

  if (!cart?.items?.length) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-300"
      >
        <ShoppingBag size={48} />
      </motion.div>
      <h2 className="text-3xl font-black text-gray-900 font-heading">Your cart is empty</h2>
      <p className="text-gray-500 font-medium max-w-xs mx-auto">Looks like you haven't added any premium medical equipment yet.</p>
      <button onClick={() => navigate("/products")} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:scale-105">
        Start Shopping
      </button>
    </div>
  );

  const total = cart.items.reduce((sum, item) => sum + (item.product_variants?.price || 0) * item.quantity, 0);

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-gray-900 mb-12 font-heading tracking-tight"
        >
          Shopping <span className="text-blue-600">Cart</span>
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cart.items.map((item) => {
                const variant = item.product_variants || {};
                const product = variant.products || {};
                const img = variant?.product_images?.[0]?.image_url || product.product_images?.[0]?.image_url || "/no-image.png";

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-xl transition-all"
                  >
                    <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 relative">
                      <img src={img} className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-transform duration-500" alt={product.name || 'Product'} />
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                      <h3 className="text-lg font-black text-gray-900 leading-tight line-clamp-2">{product.name || 'Unknown Item'}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{variant.variant_name || 'Standard'}</p>
                      <div className="text-xl font-black text-blue-600">₹{(variant.price || 0).toLocaleString()}</div>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-30"><Minus size={14} /></button>
                        <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={item.quantity >= (variant.stock || 0)} className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-30"><Plus size={14} /></button>
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 mt-1">
                        Max: {variant.stock || 0}
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 space-y-6 sticky top-32"
            >
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Order Summary</h2>

              <div className="space-y-4 border-b border-gray-50 pb-6">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Shipping</span>
                  <span className="text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-3xl font-black text-gray-900">
                <span>Total</span>
                <span className="text-blue-600">₹{total.toLocaleString()}</span>
              </div>

              <div className="pt-4 space-y-3">
                <button onClick={handleCheckout} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition-all flex justify-center items-center gap-3">
                  Checkout Now <ArrowRight size={20} />
                </button>

                {!quote ? (
                  <button onClick={createQuotation} className="w-full bg-gray-50 text-gray-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all flex justify-center items-center gap-2">
                    <FileText size={18} /> Generate Quotation
                  </button>
                ) : (
                  <button onClick={downloadQuotation} className="w-full bg-green-50 text-green-600 border-2 border-green-100 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-100 transition-all flex justify-center items-center gap-2">
                    <FileText size={18} /> Download Quote PDF
                  </button>
                )}
              </div>
            </motion.div>

            {/* Support Box */}
            <div className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg shadow-blue-200">
              <div className="relative z-10 space-y-2">
                <h3 className="font-black text-lg">Need Assistance?</h3>
                <p className="text-blue-100 text-sm font-medium">Bulk orders or specific fabrication requirements?</p>
                <div className="pt-4 font-black">Call: +91 94267 57975</div>
              </div>
              <ShoppingBag size={80} className="absolute -bottom-4 -right-4 opacity-10 rotate-12" />
            </div>
          </div>
        </div>

        {/* Recommended Slider Placeholder */}
        {recommended.length > 0 && (
          <div className="mt-24 space-y-8">
            <h2 className="text-3xl font-black text-gray-900 font-heading tracking-tight text-center md:text-left">You Might Also <span className="text-blue-600">Need</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommended.map(prod => {
                const img = prod.product_images?.[0]?.image_url || "/no-image.png";
                const price = prod.product_variants?.[0]?.price || 0;
                return (
                  <div key={prod.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                    <div className="bg-gray-50 rounded-2xl h-40 mb-4 flex items-center justify-center p-4">
                      <img src={img} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" alt={prod.name} />
                    </div>
                    <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{prod.name}</div>
                    <div className="text-lg font-black text-blue-700 mt-1">₹{price.toLocaleString()}</div>
                    <button onClick={() => navigate(`/products/${prod.id}`)} className="mt-4 w-full bg-gray-50 text-gray-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">View Details</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
