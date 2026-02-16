import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText, Search, ChevronDown, ChevronRight, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { apiUrl, http } from "../../lib/http";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function Reports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loadingReport, setLoadingReport] = useState("");

  // Stock Report State
  const [stockData, setStockData] = useState({});
  const [stockLoading, setStockLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState({});

  const base = `${apiUrl}/admin/reports`;
  const token = localStorage.getItem("token");

  // Load Stock Data initially or when tab selected? Let's load initially for simplicity
  useEffect(() => {
    async function loadStock() {
      setStockLoading(true);
      try {
        const res = await http.get("/admin/products/stock-report");
        setStockData(res.data);
        const allKeys = Object.keys(res.data).reduce((acc, k) => ({ ...acc, [k]: true }), {});
        setExpandedCats(allKeys);
      } catch (err) {
        console.error(err);
      } finally {
        setStockLoading(false);
      }
    }
    loadStock();
  }, []);

  function download(url) {
    window.open(
      `${url}${url.includes("?") ? "&" : "?"}token=${token}`,
      "_blank"
    );
    setLoadingReport("");
  }

  function handleDownload(url, type) {
    setLoadingReport(type);
    setTimeout(() => download(url), 1200);
  }

  function downloadSales() {
    if (!start || !end) {
      alert("Select start and end date");
      return;
    }
    handleDownload(`${base}/sales?start=${start}&end=${end}`, "sales");
  }

  // Stock Filtering
  const filteredStock = {};
  Object.entries(stockData).forEach(([cat, products]) => {
    const matchingProducts = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.variants.some(v => v.variant_name.toLowerCase().includes(search.toLowerCase()))
    );
    if (matchingProducts.length > 0) {
      filteredStock[cat] = matchingProducts;
    }
  });

  function toggleCat(cat) {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  }

  function downloadStockPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Stock & Sales Report - MediMatch", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    let yPos = 35;

    Object.entries(filteredStock).forEach(([cat, products]) => {
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text(cat, 14, yPos);
      yPos += 5;

      const tableBody = [];
      products.forEach(p => {
        if (p.variants.length > 0) {
          p.variants.forEach((v, idx) => {
            tableBody.push([
              idx === 0 ? p.name : "",
              v.variant_name,
              v.stock,
              v.sold || 0,
              `Rs. ${v.price}`
            ]);
          });
        } else {
          tableBody.push([p.name, "No Variants", 0, 0, "-"]);
        }
      });

      doc.autoTable({
        startY: yPos,
        head: [["Product", "Variant", "Stock", "Sold Qty", "Price"]],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold' } },
        didDrawPage: (d) => { yPos = d.cursor.y }
      });

      yPos = doc.lastAutoTable.finalY + 15;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save("stock_sales_report.pdf");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black text-blue-900 mb-6 font-heading"
      >
        📊 Comprehensive Reports
      </motion.h1>

      {/* SALES REPORT SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-100 rounded-[32px] shadow-lg p-8 space-y-6"
      >
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sales Analytics</h2>
            <p className="text-gray-500 font-medium">Generate financial reports for specific periods.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Start Date</label>
            <input
              type="date"
              className="w-full border-2 border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition-all font-medium text-gray-700"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">End Date</label>
            <input
              type="date"
              className="w-full border-2 border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition-all font-medium text-gray-700"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <button
            onClick={downloadSales}
            disabled={loadingReport === "sales"}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loadingReport === "sales" ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            {loadingReport === "sales" ? "Generating..." : "Download Sales Report"}
          </button>
        </div>
      </motion.div>

      {/* QUICK REPORTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { name: "Product Performance", url: `${base}/products`, key: "products", desc: "Top selling items" },
          { name: "Customers List", url: `${base}/customers`, key: "customers", desc: "All registered users" },
          { name: "Order Logs", url: `${base}/orders`, key: "orders", desc: "Full order history" },
        ].map((report) => (
          <button
            key={report.key}
            onClick={() => handleDownload(report.url, report.key)}
            disabled={loadingReport === report.key}
            className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group flex items-start gap-4"
          >
            <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-blue-50 transition-colors text-gray-400 group-hover:text-blue-600">
              {loadingReport === report.key ? <Loader2 className="animate-spin" /> : <FileText />}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{report.name}</h3>
              <p className="text-sm text-gray-400 font-medium">{report.desc}</p>
            </div>
          </button>
        ))}
      </motion.div>

      {/* STOCK REPORT SECTION (INTEGRATED) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 font-heading">Stock & Inventory</h2>
            <p className="text-gray-500 font-medium mt-1">Real-time tracking of stock levels and unit sales.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <button
              onClick={downloadStockPDF}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg"
            >
              <FileText size={18} /> Export PDF
            </button>
          </div>
        </div>

        {stockLoading ? (
          <div className="py-20 text-center animate-pulse text-gray-400 font-medium">Loading Inventory Data...</div>
        ) : Object.keys(filteredStock).length === 0 ? (
          <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            No stock data found. Try refreshing or check product inventory.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredStock).map(([cat, products]) => (
              <div key={cat} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-700 p-2 rounded-lg"><Package size={18} /></span>
                    <span className="font-bold text-gray-800 text-lg">{cat}</span>
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-full text-xs font-bold text-gray-500">{products.length} Items</span>
                  </div>
                  {expandedCats[cat] ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                </button>

                {expandedCats[cat] && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left bg-white">
                      <thead className="bg-white border-b border-gray-100 text-gray-400 text-xs font-black uppercase tracking-widest">
                        <tr>
                          <th className="p-4 w-1/3">Product</th>
                          <th className="p-4">Variant</th>
                          <th className="p-4 text-center">In Stock</th>
                          <th className="p-4 text-center">Sales</th>
                          <th className="p-4 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-sm">
                        {products.map(p => (
                          p.variants?.length > 0 ? p.variants.map((v, idx) => (
                            <tr key={v.id} className="hover:bg-blue-50/20">
                              {idx === 0 && (
                                <td rowSpan={p.variants.length} className="p-4 font-bold text-gray-900 align-top border-r border-gray-50/50">
                                  {p.name}
                                </td>
                              )}
                              <td className="p-4 text-gray-600 font-medium">{v.variant_name}</td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${v.stock < 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                  {v.stock < 10 && <AlertTriangle size={10} />} {v.stock}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-bold">{v.sold || 0}</span>
                              </td>
                              <td className="p-4 text-right font-bold text-gray-900">₹{v.price.toLocaleString()}</td>
                            </tr>
                          )) : (
                            <tr key={p.id}>
                              <td className="p-4 font-bold text-gray-900 opacity-50">{p.name}</td>
                              <td colSpan="4" className="p-4 text-gray-400 italic text-center">No variants</td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
