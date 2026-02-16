import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import { motion } from "framer-motion";

const STATUS_FLOW = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [details, setDetails] = useState(null);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  async function loadOrders() {
    const res = await http.get(`/admin/orders/?status=${filter || ""}`);
    setOrders(res.data);

    // compute summary
    const sum = {
      totalOrders: res.data.length,
      pending: res.data.filter(o => o.status === "pending").length,
      confirmed: res.data.filter(o => o.status === "confirmed").length,
      shipped: res.data.filter(o => o.status === "shipped").length,
      delivered: res.data.filter(o => o.status === "delivered").length,
      cancelled: res.data.filter(o => o.status === "cancelled").length,
      totalRevenue: res.data.reduce((acc, o) => acc + o.total, 0),
    };
    setSummary(sum);
  }

  async function loadDetails(id) {
    try {
      const res = await http.get(`/admin/orders/${id}`);
      setDetails(res.data);
    } catch (e) {
      alert("Failed loading order");
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await http.put(`/admin/orders/${id}/status`, { status: newStatus });
      loadOrders();
      loadDetails(id);
    } catch (e) {
      alert("Failed to update status");
    }
  }

  useEffect(() => {
    loadOrders();
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-gray-500 mt-1">Track and update customer procurements.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase px-2">Filter</span>
          <select
            className="border-none bg-transparent font-bold text-blue-600 focus:ring-0 cursor-pointer"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_FLOW.map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Total", val: summary.totalOrders, color: "bg-white", text: "text-gray-900" },
          { label: "Pending", val: summary.pending, color: "bg-amber-50", text: "text-amber-700" },
          { label: "Confirmed", val: summary.confirmed, color: "bg-blue-50", text: "text-blue-700" },
          { label: "Shipped", val: summary.shipped, color: "bg-indigo-50", text: "text-indigo-700" },
          { label: "Delivered", val: summary.delivered, color: "bg-emerald-50", text: "text-emerald-700" },
          { label: "Cancelled", val: summary.cancelled, color: "bg-rose-50", text: "text-rose-700" },
        ].map(item => (
          <div key={item.label} className={`${item.color} border border-gray-100 p-4 rounded-3xl shadow-sm`}>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</div>
            <div className={`text-2xl font-black ${item.text}`}>{item.val}</div>
          </div>
        ))}
        <div className="bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-200 col-span-2 lg:col-span-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-1">Revenue</div>
          <div className="text-xl font-black text-white">₹{summary.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ORDERS LIST */}
        <div className="lg:col-span-4 space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[32px] border border-dashed text-gray-400 font-bold">
              No orders found
            </div>
          ) : (
            orders.map(o => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={o.id}
                onClick={() => loadDetails(o.id)}
                className={`p-5 rounded-[32px] cursor-pointer transition-all border-2 ${details?.id === o.id
                  ? "bg-white border-blue-600 shadow-xl shadow-blue-50 translate-x-2"
                  : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                  }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="font-black text-gray-800">#{o.id.slice(-6).toUpperCase()}</div>
                  <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter
                    ${o.status === "pending" ? "bg-amber-100 text-amber-700" : ""}
                    ${o.status === "confirmed" ? "bg-blue-100 text-blue-700" : ""}
                    ${o.status === "shipped" ? "bg-indigo-100 text-indigo-700" : ""}
                    ${o.status === "delivered" ? "bg-emerald-100 text-emerald-700" : ""}
                    ${o.status === "cancelled" ? "bg-rose-100 text-rose-700" : ""}`}>
                    {o.status}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-xs text-gray-400 font-bold">
                    {new Date(o.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-lg font-black text-gray-900">₹{o.total.toLocaleString()}</div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ORDER DETAILS */}
        <div className="lg:col-span-8">
          {details ? (
            <div className="space-y-6">
              {/* ACTION: UPDATE STATUS */}
              <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-black text-2xl text-gray-900">Order Journey</h2>
                  <div className="flex gap-2">
                    {STATUS_FLOW.map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(details.id, s)}
                        disabled={details.status === s}
                        className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight transition-all
                          ${details.status === s
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between relative px-4">
                  <div className="absolute top-[15px] left-0 right-0 h-1 bg-gray-100" />
                  {STATUS_FLOW.map((s, idx) => {
                    const active = STATUS_FLOW.indexOf(details.status) >= idx;
                    const isCurrent = details.status === s;
                    return (
                      <div key={s} className="flex-1 flex flex-col items-center relative z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-500
                          ${active ? "bg-blue-600 text-white scale-110" : "bg-white text-gray-300 border-2 border-gray-100"}
                          ${isCurrent ? "ring-4 ring-blue-100 ring-offset-2" : ""}`}
                        >
                          {idx + 1}
                        </div>
                        <div className={`text-[10px] mt-2 font-black uppercase tracking-tighter ${active ? "text-blue-600" : "text-gray-300"}`}>
                          {s}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* USER ADDRESS */}
              {details.user_addresses && (
                <div className="border border-gray-100 rounded-[40px] p-8 bg-white shadow-lg space-y-4">
                  <h2 className="font-black text-xl text-gray-900">Customer Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-black uppercase text-gray-400">Full Name</div>
                      <div className="font-bold text-gray-800">{details.user_addresses.full_name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-gray-400">Phone</div>
                      <div className="font-bold text-gray-800">{details.user_addresses.phone}</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-50">
                    <div className="text-[10px] font-black uppercase text-gray-400">Shipping Address</div>
                    <div className="text-sm text-gray-600 font-medium">
                      <div>{details.user_addresses.address_line1}</div>
                      {details.user_addresses.address_line2 && <div>{details.user_addresses.address_line2}</div>}
                      <div>{details.user_addresses.city}, {details.user_addresses.state} – {details.user_addresses.pincode}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS */}
              <div className="border border-gray-100 rounded-[40px] p-8 bg-white shadow-lg space-y-6">
                <h2 className="font-black text-xl text-gray-900">Products</h2>
                <div className="space-y-4">
                  {details.order_items.map(item => (
                    <div key={item.id} className="flex bg-gray-50 rounded-3xl p-4 items-center gap-6 border border-transparent hover:border-blue-100 transition-all">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center font-bold text-gray-300 border shadow-sm">
                        IMG
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-gray-800">{item.product_name}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{item.variant_name}</div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md">QTY: {item.quantity}</div>
                          <div className="text-lg font-black text-gray-900">₹{item.price.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Order Total</div>
                  <div className="text-3xl font-black text-blue-600">₹{details.total.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border border-dashed border-gray-200 shadow-inner">
              <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-6">
                <span className="text-4xl text-gray-300">📦</span>
              </div>
              <h3 className="text-xl font-black text-gray-800 italic">No Order Selected</h3>
              <p className="text-gray-400 font-bold max-w-xs mx-auto mt-2 uppercase tracking-tight">Select an order from the left panel to manage status and view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
