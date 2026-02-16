import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  AlertCircle,
  TrendingUp,
  Star,
  ArrowLeft
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [drillDown, setDrillDown] = useState(false); // toggle drill-down
  const [selectedProduct, setSelectedProduct] = useState(null);

  async function load() {
    try {
      setError(null);
      const res = await http.get("/admin/dashboard/");
      setData(res.data);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.statusText || err.message || "Failed to load dashboard";
      setError(msg);
      setData({});
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (!data)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-blue-600 font-semibold text-lg animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );

  if (error || !data || Object.keys(data).length === 0)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="max-w-xl text-center p-6 bg-white rounded shadow">
          <div className="text-red-600 font-semibold text-lg">{error || "No data available"}</div>
          <div className="mt-3 text-sm text-gray-600">You might need to login as an admin.</div>
          <button onClick={load} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Retry</button>
        </div>
      </div>
    );

  const { kpis = {}, charts = {}, alerts = { low_stock: [] }, insights = {} } = data;

  const pieColors = ["#2563EB", "#16A34A", "#FACC15", "#DC2626", "#6B7280"];
  const kpiIcons = {
    total_sales: <DollarSign className="text-blue-500 w-6 h-6" />,
    orders: <ShoppingCart className="text-blue-500 w-6 h-6" />,
    customers: <Users className="text-blue-500 w-6 h-6" />,
    products: <Package className="text-blue-500 w-6 h-6" />,
    low_stock: <AlertCircle className="text-red-500 w-6 h-6" />
  };

  // Handle click on revenue line chart
  const handleRevenueClick = (productName) => {
    setSelectedProduct(productName);
    setDrillDown(true);
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {Object.entries(kpis).map(([k, v]) => (
          <div
            key={k}
            className="bg-white shadow-md rounded-lg p-5 border-l-4 border-blue-500 hover:shadow-xl transition-shadow flex flex-col space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500 capitalize">
                {k.replace("_", " ")}
              </div>
              {kpiIcons[k] && kpiIcons[k]}
            </div>
            <div className="text-2xl font-bold text-gray-800">{v}</div>
          </div>
        ))}
      </div>

      {/* INSIGHTS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 flex items-center space-x-3">
          <TrendingUp className="text-blue-500 w-6 h-6" />
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-1">
              Revenue Growth
            </h2>
            <div className="text-gray-700 text-lg">
              <span
                className={
                  insights.revenue_growth >= 0
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {insights.revenue_growth}%
              </span>{" "}
              vs last month
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 flex items-center space-x-3">
          <ShoppingCart className="text-blue-500 w-6 h-6" />
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-1">
              Total Orders
            </h2>
            <div className="text-gray-700 text-lg font-bold">{kpis.orders}</div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 flex items-center space-x-3">
          <Star className="text-blue-500 w-6 h-6" />
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-1">
              Top Product
            </h2>
            <div className="text-gray-700 text-lg font-bold">
              {alerts.top_selling?.name || "No data"}
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE / DRILL-DOWN CHART */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-blue-700">
            {drillDown
              ? `Sales Details: ${selectedProduct}`
              : "Revenue (Last 30 Days)"}
          </h2>
          {drillDown && (
            <button
              onClick={() => setDrillDown(false)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>
          )}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={
              drillDown && selectedProduct
                ? charts.product_sales_last_30[selectedProduct] || []
                : charts.revenue_last_30
            }
            onClick={(e) => {
              if (!drillDown && e?.activeLabel) {
                const productName =
                  charts.top_products?.[e.activeLabel] ||
                  Object.keys(charts.product_sales_last_30)[0];
                handleRevenueClick(productName);
              }
            }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#374151" }}
              stroke="#CBD5E1"
            />
            <YAxis tick={{ fontSize: 12, fill: "#374151" }} stroke="#CBD5E1" />
            <Tooltip
              contentStyle={{ borderRadius: "8px", borderColor: "#2563EB" }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ r: 3 }}
              name={drillDown ? selectedProduct : "Revenue"}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ORDER STATUS PIE */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-blue-700 mb-3">
          Orders by Status
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={Object.entries(charts.orders_by_status).map(([k, v]) => ({
                name: k,
                value: v
              }))}
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {Object.entries(charts.orders_by_status).map((_, idx) => (
                <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "8px", borderColor: "#2563EB" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LOW STOCK ALERTS */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-red-600 mb-3">
          Low Stock Alerts
        </h2>
        {alerts.low_stock.length === 0 ? (
          <div className="text-green-600 font-medium">All good 👍</div>
        ) : (
          <ul className="space-y-2">
            {alerts.low_stock.map((v) => (
              <li
                key={v.id}
                className="text-gray-700 bg-red-50 rounded px-3 py-2 border-l-4 border-red-400 flex justify-between items-center hover:bg-red-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{v.variant_name}</span>
                  <button
                    onClick={async () => {
                      const val = prompt(`Update stock for ${v.variant_name}`, String(v.stock || 0));
                      if (val === null) return;
                      const n = parseInt(val);
                      if (isNaN(n) || n < 0) return alert("Invalid stock");
                      try {
                        const res = await http.post(`/admin/variants/${v.id}/stock`, { stock: n });
                        if (res.data && res.data.updated) {
                          load();
                        } else {
                          alert("Failed to update stock: " + (res.data && res.data.error ? res.data.error : "unknown"));
                        }
                      } catch (err) {
                        const msg = err?.response?.data?.error || err.message || "Failed to update stock";
                        alert(msg);
                      }
                    }}
                    className="text-sm text-blue-600 underline"
                  >
                    Edit Stock
                  </button>
                </div>
                <span className="font-bold">{v.stock} left</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
