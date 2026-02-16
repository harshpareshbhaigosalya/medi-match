import { useEffect, useState } from "react";
import { http } from "../lib/http";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, ChevronLeft, Loader2, CheckCircle2, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Checkout() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cart, setCart] = useState(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  async function loadAddresses() {
    const res = await http.get("/address/");
    setAddresses(res.data);
    if (res.data.length > 0) setSelected(res.data[0]);
  }

  async function loadCart() {
    const res = await http.get("/cart/");
    setCart(res.data);
  }

  async function addAddress(e) {
    e.preventDefault();
    await http.post("/address/", form);
    setForm({
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
    });
    setShowForm(false);
    loadAddresses();
  }

  async function placeOrder() {
    if (!selected) return alert("Select an address first");
    setIsPlacing(true);

    try {
      const res = await http.post("/cart/checkout-direct", {
        address: selected,
        payment_method: paymentMethod
      });

      const { order, stripe_url } = res.data;

      if (paymentMethod === "online" && stripe_url) {
        window.location.href = stripe_url;
      } else {
        navigate(`/orders/${order.id}`);
      }
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to place order");
      setIsPlacing(false);
    }
  }

  useEffect(() => {
    loadAddresses();
    loadCart();
  }, []);

  const total = cart?.items.reduce((sum, item) => sum + item.product_variants.price * item.quantity, 0) || 0;

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">

        <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors">
          <ChevronLeft size={16} /> Back to Cart
        </button>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-12 font-heading tracking-tight">Complete <span className="text-blue-600">Checkout</span></h1>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">

            {/* Address Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Shipping Address</h2>
                </div>
                {!showForm && (
                  <button onClick={() => setShowForm(true)} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                    + New Address
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showForm ? (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={addAddress}
                    className="bg-white border-2 border-dashed border-blue-200 p-8 rounded-[32px] space-y-4 shadow-sm"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input className="bg-gray-50 border-transparent focus:border-blue-500 rounded-xl p-4 font-bold outline-none" placeholder="Full Name" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                      <input className="bg-gray-50 border-transparent focus:border-blue-500 rounded-xl p-4 font-bold outline-none" placeholder="Phone" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <input className="w-full bg-gray-50 border-transparent focus:border-blue-500 rounded-xl p-4 font-bold outline-none" placeholder="Address Line 1" required value={form.address_line1} onChange={e => setForm({ ...form, address_line1: e.target.value })} />
                    <input className="w-full bg-gray-50 border-transparent focus:border-blue-500 rounded-xl p-4 font-bold outline-none" placeholder="Address Line 2 (Optional)" value={form.address_line2} onChange={e => setForm({ ...form, address_line2: e.target.value })} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <input className="bg-gray-50 border-transparent focus:border-blue-500 rounded-xl p-4 font-bold outline-none" placeholder="City" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                      <input className="bg-gray-50 border-transparent focus:border-blue-500 rounded-xl p-4 font-bold outline-none" placeholder="State" required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                      <input className="col-span-2 sm:col-span-1 bg-gray-50 border-transparent focus:border-blue-500 rounded-xl p-4 font-bold outline-none" placeholder="Pincode" required value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100">Save Address</button>
                      <button type="button" onClick={() => setShowForm(false)} className="px-8 bg-gray-100 text-gray-500 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all">Cancel</button>
                    </div>
                  </motion.form>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map(a => (
                      <motion.div
                        key={a.id}
                        layout
                        onClick={() => setSelected(a)}
                        className={`group relative bg-white border-2 p-6 rounded-[32px] cursor-pointer transition-all hover:shadow-xl ${selected?.id === a.id ? "border-blue-600 bg-blue-50/30" : "border-transparent shadow-sm"}`}
                      >
                        {selected?.id === a.id && <CheckCircle2 className="absolute top-4 right-4 text-blue-600" size={24} />}
                        <div className="font-black text-gray-900 text-lg mb-2">{a.full_name}</div>
                        <div className="text-sm font-medium text-gray-500 leading-relaxed">
                          {a.address_line1}<br />
                          {a.address_line2 && <>{a.address_line2}<br /></>}
                          {a.city}, {a.state} — {a.pincode}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
                          {a.phone}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Payment Method</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex flex-col gap-4 ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50/30 shadow-xl' : 'border-transparent bg-white shadow-sm'}`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-indigo-600 transition-colors">
                    <Truck size={20} />
                  </div>
                  <div>
                    <div className="font-black text-gray-900 uppercase text-xs tracking-widest">Pay on Delivery</div>
                    <div className="text-sm font-medium text-gray-500 mt-1">Pay when equipment arrives at your facility.</div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("online")}
                  className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex flex-col gap-4 ${paymentMethod === 'online' ? 'border-indigo-600 bg-indigo-50/30 shadow-xl' : 'border-transparent bg-white shadow-sm'}`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-indigo-600 transition-colors">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="font-black text-gray-900 uppercase text-xs tracking-widest">Card / Online</div>
                    <div className="text-sm font-medium text-gray-500 mt-1">Secure payment via Stripe gateway.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-gray-100 space-y-6 sticky top-32">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Order Details</h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {cart?.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <div className="text-xs font-black text-gray-900 uppercase tracking-tight line-clamp-1">{item.product_variants.products.name}</div>
                      <div className="text-[10px] font-bold text-gray-400 mt-0.5">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-black text-blue-600">₹{(item.product_variants.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                  <span className="font-black text-gray-900 uppercase">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-600 font-heading tracking-tight">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={isPlacing || !selected}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all flex justify-center items-center gap-3"
              >
                {isPlacing ? <Loader2 className="animate-spin" size={20} /> : "Validate & Pay"}
                {!isPlacing && <CheckCircle2 size={20} />}
              </button>

              <p className="text-[10px] text-center font-black text-gray-400 uppercase tracking-[0.2em] pt-4">Secured by SSL Encryption</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
