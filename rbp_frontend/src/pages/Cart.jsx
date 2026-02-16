import { useEffect, useState } from "react";
import { http } from "../lib/http";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, FileText, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const navigate = useNavigate();

  async function load() {
    try {
      const res = await http.get("/cart/");
      setCart(res.data);
      const rec = await http.get("/products/recommended");
      setRecommended(rec.data || []);
    } catch (err) {
      console.error("Cart load error", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateQty(itemId, qty) {
    if (qty < 1) return;
    await http.put("/cart/update", { item_id: itemId, quantity: qty });
    load();
  }

  async function removeItem(itemId) {
    await http.delete(`/cart/remove/${itemId}`);
    load();
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
    const apiUrl = import.meta.env.VITE_API_URL || "/api";
    window.open(`${apiUrl}/cart/quotation/${quote.id}/pdf?token=${token}`, "_blank");
  }

  async function handleCheckout() {
    try {
      const res = await http.get("/address/");
      if (!res.data.length) return navigate("/addresses?redirect=checkout");
      navigate("/checkout");
    } catch (err) {
      alert("Could not load addresses");
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!cart?.items?.length) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-6">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
        <ShoppingBag size={48} />
      </div>
      <h2 className="text-3xl font-black text-gray-900">Your cart is empty</h2>
      <p className="text-gray-500 font-medium max-w-xs">Looks like you haven't added any premium medical equipment yet.</p>
      <button onClick={() => navigate("/products")} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">Start Shopping</button>
    </div>
  );

  const total = cart.items.reduce((sum, item) => sum + item.product_variants.price * item.quantity, 0);

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-12 font-heading tracking-tight">Shopping <span className="text-blue-600">Cart</span></h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cart.items.map((item) => {
                const variant = item.product_variants;
                const img = variant?.product_images?.[0]?.image_url || variant.products.product_images?.[0]?.image_url || "/no-image.png";
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-xl transition-all"
                  >
                    <div className="w-full sm:w-40 h-40 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={img} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt={variant.products.name} />
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                      <h3 className="text-xl font-black text-gray-900 leading-tight">{variant.products.name}</h3>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{variant.variant_name}</p>
                      <div className="text-2xl font-black text-blue-600">₹{variant.price.toLocaleString()}</div>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-2 hover:bg-white rounded-lg transition-colors"><Minus size={16} /></button>
                        <span className="w-12 text-center font-black">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-2 hover:bg-white rounded-lg transition-colors"><Plus size={16} /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 space-y-6 sticky top-32">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Order Summary</h2>

              <div className="space-y-4 border-b border-gray-50 pb-6">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-3xl font-black text-gray-900">
                <span>Total</span>
                <span className="text-blue-600">₹{total.toLocaleString()}</span>
              </div>

              <div className="pt-4 space-y-3">
                <button onClick={handleCheckout} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex justify-center items-center gap-3">
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
            </div>

            {/* Support Box */}
            <div className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <h3 className="font-black text-lg">Need Assistance?</h3>
                <p className="text-blue-100 text-sm font-medium">Bulk orders or specific fabrication requirements?</p>
                <div className="pt-4 font-black">Call: +91 94267 57975</div>
              </div>
              <ShoppingBag size={80} className="absolute -bottom-4 -right-4 opacity-10" />
            </div>
          </div>
        </div>

        {/* Recommended Slider */}
        {recommended.length > 0 && (
          <div className="mt-24 space-y-8">
            <h2 className="text-3xl font-black text-gray-900 font-heading tracking-tight text-center md:text-left">Frequently Bought <span className="text-blue-600">Together</span></h2>
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
              {recommended.map(prod => {
                const img = prod.product_images?.[0]?.image_url || "/no-image.png";
                return (
                  <div key={prod.id} className="min-w-[280px] bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all snap-start group">
                    <img src={img} className="w-full h-40 object-contain rounded-xl mb-4 group-hover:scale-105 transition-transform" alt={prod.name} />
                    <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{prod.name}</div>
                    <div className="text-lg font-black text-blue-700 mt-1">₹{prod.price.toLocaleString()}</div>
                    <button onClick={() => navigate(`/products/${prod.id}`)} className="mt-4 w-full bg-gray-50 text-gray-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">View Details</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
