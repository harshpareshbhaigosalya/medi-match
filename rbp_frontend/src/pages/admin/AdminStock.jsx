import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import { FileText, Search, ChevronDown, ChevronRight, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function AdminStock() {
    const [stockData, setStockData] = useState({}); // { "Category": [products...] }
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedCats, setExpandedCats] = useState({});

    async function load() {
        try {
            const res = await http.get("/admin/products/stock-report");
            setStockData(res.data);
            // Default expand all
            const allKeys = Object.keys(res.data).reduce((acc, k) => ({ ...acc, [k]: true }), {});
            setExpandedCats(allKeys);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    // Filter logic
    // If search matches product or variant, keep product.
    // If category has any matching product, keep category.
    const filteredData = {};
    Object.entries(stockData).forEach(([cat, products]) => {
        const matchingProducts = products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.variants.some(v => v.variant_name.toLowerCase().includes(search.toLowerCase()))
        );
        if (matchingProducts.length > 0) {
            filteredData[cat] = matchingProducts;
        }
    });

    function toggleCat(cat) {
        setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
    }

    function downloadPDF() {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Stock & Sales Report - MediMatch", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        let yPos = 35;

        Object.entries(filteredData).forEach(([cat, products]) => {
            // Category Header
            doc.setFontSize(14);
            doc.setTextColor(37, 99, 235); // Blue
            doc.text(cat, 14, yPos);
            yPos += 5;

            const tableBody = [];
            products.forEach(p => {
                if (p.variants.length > 0) {
                    p.variants.forEach((v, idx) => {
                        tableBody.push([
                            idx === 0 ? p.name : "", // Show product name only on first variant line
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
                columnStyles: {
                    0: { fontStyle: 'bold' } // Product name bold
                },
                didDrawPage: (d) => { yPos = d.cursor.y } // Update cursor
            });

            yPos = doc.lastAutoTable.finalY + 15; // Space between tables

            // Add new page if too low
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
        });

        doc.save("stock_sales_report.pdf");
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-blue-600">
            <Package className="w-12 h-12 mb-4 animate-bounce" />
            <div className="font-bold text-xl">Analyzing Inventory...</div>
        </div>
    );

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight font-heading">Stock Management</h1>
                    <p className="text-gray-500 mt-2 text-lg">Track inventory levels and sales performance across all categories.</p>
                </div>
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl active:scale-95"
                >
                    <FileText size={20} /> Export Report
                </button>
            </div>

            {/* SEARCH */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                <input
                    type="text"
                    placeholder="Search products, variants..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl border border-gray-200 bg-white shadow-sm focus:shadow-md focus:border-blue-500 outline-none font-medium text-lg text-gray-800 transition-all"
                />
            </div>

            {/* CONTENT GROUPED BY CATEGORY */}
            <div className="space-y-8">
                {Object.entries(filteredData).length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No products found</h3>
                    </div>
                ) : (
                    Object.entries(filteredData).map(([cat, products]) => (
                        <div key={cat} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* CATEGORY HEADER */}
                            <button
                                onClick={() => toggleCat(cat)}
                                className="w-full flex items-center justify-between p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                                        <Package size={20} />
                                    </span>
                                    <h2 className="text-xl font-bold text-gray-800">{cat}</h2>
                                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{products.length} Products</span>
                                </div>
                                {expandedCats[cat] ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                            </button>

                            {/* PRODUCTS TABLE */}
                            {expandedCats[cat] && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white border-b border-gray-100">
                                            <tr>
                                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest w-1/3">Product</th>
                                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Variant</th>
                                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">In Stock</th>
                                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Unit Sold</th>
                                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {products.map((p) => {
                                                const hasVariants = p.variants?.length > 0;
                                                return hasVariants ? (
                                                    p.variants.map((v, idx) => (
                                                        <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                                                            {/* Product Name (Show once) */}
                                                            {idx === 0 && (
                                                                <td rowSpan={p.variants.length} className="p-6 align-top border-r border-gray-50/50">
                                                                    <div className="font-bold text-gray-900 text-lg">{p.name}</div>
                                                                    {p.sku && <div className="text-xs text-gray-400 font-mono mt-1">SKU: {p.sku}</div>}
                                                                </td>
                                                            )}

                                                            {/* Variant Details */}
                                                            <td className="p-6 font-medium text-gray-600">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                                                    {v.variant_name}
                                                                </div>
                                                            </td>

                                                            {/* Stock Level */}
                                                            <td className="p-6 text-center">
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${v.stock < 10
                                                                        ? 'bg-red-50 text-red-600 border border-red-100'
                                                                        : 'bg-green-50 text-green-600 border border-green-100'
                                                                    }`}>
                                                                    {v.stock < 10 && <AlertTriangle size={12} />}
                                                                    {v.stock}
                                                                </span>
                                                            </td>

                                                            {/* Sold Count */}
                                                            <td className="p-6 text-center">
                                                                <div className="inline-flex items-center gap-1.5 text-gray-700 font-bold bg-gray-100 px-3 py-1 rounded-lg">
                                                                    <TrendingUp size={14} className="text-blue-500" />
                                                                    {v.sold || 0}
                                                                </div>
                                                            </td>

                                                            <td className="p-6 text-right font-bold text-gray-900">
                                                                ₹{v.price.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr key={p.id}>
                                                        <td className="p-6 text-gray-900 font-bold opacity-60">{p.name}</td>
                                                        <td colSpan="4" className="p-6 text-gray-400 italic text-center text-sm bg-gray-50/50 m-2 rounded-xl">
                                                            No variants configured
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
