import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { http } from "../lib/http";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    async function load() {
      const res = await http.get(`/orders/${id}`);
      setOrder(res.data);

      // Trigger confetti and banner
      setShowConfetti(true);

      // Stop confetti after 5s
      setTimeout(() => setShowConfetti(false), 5000);
    }
    load();
  }, [id]);

  if (!order) return <div className="text-center py-20">Loading…</div>;

  const items = order.cart_snapshot?.items || order.items || [];
  const address = order.cart_snapshot?.address;

  function downloadInvoice() {
    const token = localStorage.getItem("token");
    let baseUrl = import.meta.env.VITE_API_URL || "";
    if (baseUrl.includes("onrender.com") && !baseUrl.includes("/api")) {
      baseUrl = `${baseUrl.replace(/\/$/, "")}/api`;
    }
    if (!baseUrl) {
      baseUrl = window.location.origin.includes("localhost")
        ? "http://localhost:5000/api"
        : `${window.location.origin}/api`;
    }
    window.open(
      `${baseUrl}/cart/order/${order.id}/invoice?token=${token}`,
      "_blank"
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Confetti */}
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />}

      {/* Celebration Banner */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded shadow text-center font-semibold text-lg"
          >
            🎉 Order Placed Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Number & Status */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-bold text-gray-800 mb-2"
      >
        Order #{order.order_number}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-gray-600 mb-4"
      >
        Status: <span className="font-semibold">{order.status}</span>
      </motion.div>

      {/* Delivery Address */}
      {address && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="border rounded-2xl p-4 shadow bg-white"
        >
          <h2 className="font-bold text-lg mb-2">Delivery Address</h2>
          <div>{address.full_name}</div>
          <div>{address.address_line1}</div>
          {address.address_line2 && <div>{address.address_line2}</div>}
          <div>{address.city}, {address.state} — {address.pincode}</div>
          <div>{address.phone}</div>
        </motion.div>
      )}

      {/* Order Items */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + idx * 0.1 }}
            className="flex flex-col md:flex-row items-center justify-between border rounded-2xl p-4 bg-white shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4 flex-1">
              {item.product_image && (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              )}
              <div className="flex flex-col gap-1">
                <div className="font-semibold text-gray-900">{item.product_name}</div>
                <div className="text-gray-500">{item.variant_name}</div>
                <div className="text-blue-700 font-bold mt-1">₹{item.price}</div>
              </div>
            </div>
            <div className="text-gray-700 font-semibold mt-2 md:mt-0">
              Qty: {item.quantity} <br /> Total: ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="border-t pt-4 flex justify-between text-2xl font-bold"
      >
        <span>Total</span>
        <span>₹{order.total}</span>
      </motion.div>

      {/* Invoice Button */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={downloadInvoice}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl w-full md:w-auto font-semibold transition transform hover:scale-105"
      >
        Download Invoice
      </motion.button>
    </div>
  );
}
