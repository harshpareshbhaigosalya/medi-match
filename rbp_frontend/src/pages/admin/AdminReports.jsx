import { useState } from "react";
import { http } from "../../lib/http";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Reports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loadingReport, setLoadingReport] = useState("");

  const base = "http://localhost:5000/api/admin/reports";
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
        className="text-3xl font-bold text-blue-800 mb-6"
      >
        📊 Reports Dashboard
      </motion.h1>

      {/* SALES REPORT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border rounded-2xl shadow-md p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold text-blue-700">Sales Report</h2>
        <p className="text-gray-600">Select a date range to generate sales report</p>

        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="date"
            className="border p-2 rounded w-full md:w-auto"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded w-full md:w-auto"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />

          <button
            onClick={downloadSales}
            disabled={loadingReport === "sales"}
            className={`bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loadingReport === "sales" && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Loader2 size={20} />
              </motion.div>
            )}
            {loadingReport === "sales" ? "Generating..." : "Download"}
          </button>
        </div>
      </motion.div>

      {/* OTHER REPORTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border rounded-2xl shadow-md p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Other Reports</h2>
        <p className="text-gray-600">Click to download any report</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Product Performance", url: `${base}/products`, key: "products" },
            { name: "Customers", url: `${base}/customers`, key: "customers" },
            { name: "Orders (Detailed)", url: `${base}/orders`, key: "orders" },
          ].map((report) => (
            <button
              key={report.key}
              onClick={() => handleDownload(report.url, report.key)}
              disabled={loadingReport === report.key}
              className={`border p-3 rounded-xl text-center font-medium transition transform hover:scale-105 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loadingReport === report.key && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Loader2 size={18} />
                </motion.div>
              )}
              {loadingReport === report.key ? "Generating..." : report.name}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
