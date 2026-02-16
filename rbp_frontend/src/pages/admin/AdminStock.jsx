import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import { FileText, Search } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function AdminStock() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    async function load() {
        try {
            const res = await http.get("/products/");
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    function downloadPDF() {
        const doc = new jsPDF();
        doc.text("Stock Report - MediMatch", 14, 20);

        const tableData = [];
        filteredProducts.forEach((p) => {
            if (p.product_variants && p.product_variants.length > 0) {
                p.product_variants.forEach(v => {
                    tableData.push([
                        p.name,
                        v.variant_name,
                        v.stock,
                        `Rs. ${v.price}`
                    ])
                });
            } else {
                tableData.push([p.name, "No Variants", "0", "-"]);
            }
        });

        doc.autoTable({
            head: [["Product Name", "Variant", "Stock Level", "Price"]],
            body: tableData,
            startY: 30,
        });

        doc.save("stock_report.pdf");
    }

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Stock Data...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 font-heading">Stock Management</h1>
                    <p className="text-gray-500 font-medium">Real-time inventory levels</p>
                </div>
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105"
                >
                    <FileText size={20} /> Download Report
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                />
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Variant</th>
                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Stock Level</th>
                            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map((p) => (
                            // If variants exist, verify we are mapping them; else show placeholder or nothing
                            (p.product_variants?.length > 0) ? (
                                p.product_variants.map((v) => (
                                    <tr key={v.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="p-6 font-bold text-gray-900">{p.name}</td>
                                        <td className="p-6 font-medium text-gray-600">{v.variant_name}</td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${v.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                }`}>
                                                {v.stock} Units
                                            </span>
                                        </td>
                                        <td className="p-6 font-black text-gray-900">₹{v.price.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr key={p.id}>
                                    <td className="p-6 font-bold text-gray-900 opacity-50">{p.name}</td>
                                    <td colSpan="3" className="p-6 text-gray-400 italic">No variants configured</td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="text-center p-12 text-gray-400 font-medium">No products matching "{search}"</div>
                )}
            </div>
        </div>
    );
}
