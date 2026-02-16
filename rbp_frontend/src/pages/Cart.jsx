import { useEffect, useState } from "react";
import { http } from "../lib/http";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const navigate = useNavigate();

  async function load() {
    const res = await http.get("/cart/");
    setCart(res.data);
    setLoading(false);

    // Fetch recommended products
    const rec = await http.get("/products/recommended");
    setRecommended(rec.data || []);
  }

  async function updateQty(itemId, qty) {
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
    window.open(
      `http://localhost:5000/api/cart/quotation/${quote.id}/pdf?token=${token}`,
      "_blank"
    );
  }

  async function handleCheckout() {
    try {
      const res = await http.get("/address/");
      if (!res.data.length) return navigate("/addresses?redirect=checkout");
      navigate("/checkout");
    } catch (err) {
      console.log(err);
      alert("Could not load addresses");
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="text-center py-20">Loading…</div>;
  if (!cart.items?.length) return <div className="text-center py-20 text-gray-500 text-lg">Your cart is empty</div>;

  const total = cart.items.reduce((sum, item) => sum + item.product_variants.price * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">

      <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>

      {/* Cart Items */}
      <div className="space-y-4">
        {cart.items.map((item) => {
          const variant = item.product_variants;
          const img = variant?.product_images?.[0]?.image_url || variant.products.product_images?.[0]?.image_url || "/no-image.png";

          return (
            <div key={item.id} className="flex flex-col md:flex-row items-center justify-between border rounded-2xl p-4 bg-white shadow hover:shadow-xl transition duration-300 relative">
              
              {/* Discount Badge */}
              {variant.discount_percentage && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                  {variant.discount_percentage}% OFF
                </div>
              )}

              {/* Product Info */}
              <div className="flex items-center gap-4 flex-1">
                <img src={img} className="w-32 h-32 object-cover rounded-xl border" alt={variant.products.name} />
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-gray-900">{variant.products.name}</div>
                  <div className="text-gray-500">{variant.variant_name}</div>
                  <div className="text-blue-700 font-bold mt-1">₹{variant.price}</div>
                  {variant.is_bestseller && (
                    <span className="text-yellow-600 font-semibold text-sm mt-1">Best Seller</span>
                  )}
                </div>
              </div>

              {/* Quantity & Remove */}
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <input type="number" min={1} value={item.quantity} className="border rounded-xl w-20 p-2 text-center" onChange={(e) => updateQty(item.id, Number(e.target.value))} />
                <button onClick={() => removeItem(item.id)} className="text-red-600 font-semibold hover:text-red-800 transition">Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quotation Card */}
      <div className="bg-gradient-to-r from-indigo-100 to-indigo-200 border-l-4 border-indigo-500 p-6 rounded-2xl shadow flex flex-col md:flex-row justify-between items-center gap-4 animate-fadeIn">
        <div className="text-lg md:text-xl font-semibold text-gray-800">
          {quote ? `Quotation Generated: #${quote.id}` : "Generate a Quotation for this Cart"}
        </div>
        <div className="flex gap-3 flex-col md:flex-row">
          {!quote && (
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition transform hover:scale-105" onClick={createQuotation}>
              Generate Quotation
            </button>
          )}
          {quote && (
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition transform hover:scale-105" onClick={downloadQuotation}>
              Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Total & Checkout */}
      <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center text-lg font-semibold bg-white p-4 rounded-2xl shadow">
        <span>Total</span>
        <span className="text-2xl text-blue-700">₹{total}</span>
      </div>

      <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl w-full md:w-auto font-semibold transition transform hover:scale-105" onClick={handleCheckout}>
        Proceed to Checkout
      </button>

      {/* Recommended Products Slider */}
      {recommended.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">You might also like</h2>
          <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory">
            {recommended.map(prod => {
              const img = prod.product_images?.[0]?.image_url || "/no-image.png";
              return (
                <div key={prod.id} className="min-w-[200px] bg-white border rounded-2xl p-3 shadow hover:shadow-lg transition transform hover:scale-105 flex-shrink-0 snap-start">
                  <img src={img} className="w-full h-40 object-cover rounded-lg mb-2" alt={prod.name} />
                  <div className="font-semibold text-gray-800">{prod.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-blue-700 font-bold">₹{prod.price}</div>
                    {prod.discount_percentage && (
                      <div className="text-red-500 text-sm font-semibold">{prod.discount_percentage}% OFF</div>
                    )}
                  </div>
                  <button className="mt-2 w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition">Add to Cart</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  );
}
