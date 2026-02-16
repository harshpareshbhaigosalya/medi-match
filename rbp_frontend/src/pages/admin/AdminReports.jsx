import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { apiUrl } from "../../lib/http";

export default function Reports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loadingReport, setLoadingReport] = useState("");

  /* let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  if (baseUrl.includes("onrender.com") && !baseUrl.includes("/api")) {
    baseUrl = `${baseUrl.replace(/\/$/, "")}/api`;
  } */
  const base = `${apiUrl}/admin/reports`;
  const token = localStorage.getItem("token");

  function download(url) {
    window.open(
      `${url}${url.includes("?") ? "&" : "?"}token=${token}`,
      "_blank"
    );
    setLoadingReport(""); // reset loading after download
  }

  function handleDownload(url, type) {
    setLoadingReport(type);
    setTimeout(() => download(url), 1200); // simulate loading animation
  }

  function downloadSales() {
    if (!start || !end) {
      alert("Select start and end date");
      return;
    }
    handleDownload(`${base}/sales?start=${start}&end=${end}`, "sales");
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-blue-800 mb-6 font-heading"
      >
        📊 Reports Dashboard
      </motion.h1>

      {/* SALES REPORT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border-2 border-gray-100 rounded-3xl shadow-xl shadow-gray-100 p-8 space-y-6"
      >
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Sales Analytics</h2>
        <p className="text-gray-500 font-medium">Select a date range to generate a comprehensive sales report PDF.</p>

        <div className="flex flex-col md:flex-row gap-4 items-center pt-2">
          <input
            type="date"
            className="border-2 border-gray-100 p-3 rounded-xl w-full md:w-auto focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            type="date"
            className="border-2 border-gray-100 p-3 rounded-xl w-full md:w-auto focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />

          <button
            onClick={downloadSales}
            disabled={loadingReport === "sales"}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loadingReport === "sales" && <Loader2 size={18} className="animate-spin" />}
            {loadingReport === "sales" ? "Generating..." : "Download Report"}
          </button>
        </div>
      </motion.div>

      {/* OTHER REPORTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border-2 border-gray-100 rounded-3xl shadow-xl shadow-gray-100 p-8 space-y-6"
      >
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Inventory & Logistics</h2>
        <p className="text-gray-500 font-medium tracking-tight">Quick access to product performance and customer metrics.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Product Performance", url: `${base}/products`, key: "products" },
            { name: "Customers List", url: `${base}/customers`, key: "customers" },
            { name: "Order Logs", url: `${base}/orders`, key: "orders" },
          ].map((report) => (
            <button
              key={report.key}
              onClick={() => handleDownload(report.url, report.key)}
              disabled={loadingReport === report.key}
              className="border-2 border-gray-100 p-6 rounded-2xl text-center font-bold text-gray-700 transition-all hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 flex flex-col items-center justify-center gap-3 group disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                {loadingReport === report.key ? (
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                ) : (
                  <span className="text-2xl">📋</span>
                )}
              </div>
              <span className="text-sm tracking-tight uppercase">{report.name}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
