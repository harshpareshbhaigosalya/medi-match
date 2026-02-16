import { useEffect, useState } from "react";
import { http } from "../lib/http";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await http.get("/orders/");
      setOrders(res.data);
    }

    load();
  }, []);

  if (!orders.length) return <div>No orders yet.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your Orders</h1>

      {orders.map(o => (
        <Link
          key={o.id}
          to={`/orders/${o.id}`}
          className="block border rounded p-4"
        >
          <div>Order #{o.id}</div>
          <div>Total: ₹{o.total}</div>
        </Link>
      ))}
    </div>
  );
}
