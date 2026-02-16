import { useEffect, useState } from "react";
import { http } from "../lib/http";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cart, setCart] = useState(null);
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

    try {
      const res = await http.post("/cart/checkout-direct", {
        address: selected,
        payment_method: paymentMethod
      });

      const { order, stripe_url } = res.data;

      if (paymentMethod === "online" && stripe_url) {
        // Redirect to Stripe Checkout
        window.location.href = stripe_url;
      } else {
        navigate(`/orders/${order.id}`);
      }
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to place order");
    }
  }

  useEffect(() => {
    loadAddresses();
    loadCart();
  }, []);

  const total = cart?.items.reduce((sum, item) => sum + item.product_variants.price * item.quantity, 0) || 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>

      {/* Address Selection */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Select Delivery Address</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              className={`border rounded-2xl p-4 cursor-pointer transition shadow hover:shadow-md ${selected?.id === a.id ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <div className="font-semibold">{a.full_name}</div>
              <div>{a.address_line1}</div>
              {a.address_line2 && <div>{a.address_line2}</div>}
              <div>{a.city}, {a.state} — {a.pincode}</div>
              <div className="text-gray-500">{a.phone}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="text-blue-700 underline font-semibold mt-2"
        >
          + Add New Address
        </button>

        {showForm && (
          <form onSubmit={addAddress} className="space-y-3 border p-4 rounded-2xl shadow mt-2">
            <input
              className="border p-2 w-full rounded"
              placeholder="Full Name"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Address Line 1"
              value={form.address_line1}
              onChange={e => setForm({ ...form, address_line1: e.target.value })}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Address Line 2"
              value={form.address_line2}
              onChange={e => setForm({ ...form, address_line2: e.target.value })}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="City"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="State"
              value={form.state}
              onChange={e => setForm({ ...form, state: e.target.value })}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Pincode"
              value={form.pincode}
              onChange={e => setForm({ ...form, pincode: e.target.value })}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold">Save Address</button>
          </form>
        )}
      </div>

      {/* Payment Options */}
      <div className="border rounded-2xl p-4 bg-white shadow space-y-3">
        <h2 className="font-semibold text-lg">Payment Options</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
          Cash on Delivery
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="radio" name="payment" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
          Online Payment (Stripe)
        </label>
      </div>

      {/* Cart Summary */}
      <div className="border rounded-2xl p-4 bg-white shadow">
        <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
        {cart?.items.map(item => (
          <div key={item.id} className="flex justify-between py-1">
            <div>{item.product_variants.products.name} × {item.quantity}</div>
            <div>₹{item.product_variants.price * item.quantity}</div>
          </div>
        ))}
        <div className="border-t mt-2 pt-2 font-bold flex justify-between">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button onClick={placeOrder} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl w-full font-semibold transition">
        Place Order
      </button>
    </div>
  );
}
