import { useEffect, useState, useMemo } from "react";
import { http } from "../lib/http";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronRight, Star, ShoppingCart, Filter, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState("");
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    async function loadCategories() {
        try {
            const res = await http.get("/categories");
            setCategories(res.data);
        } catch (e) {
            console.error("Categories failed", e);
        }
    }

    async function loadProducts(cat = "") {
        setLoading(true);
        try {
            const res = await http.get(cat ? `/products?category=${cat}` : "/products");
            if (typeof res.data === 'string' && res.data.startsWith("<!DOCTYPE")) {
                throw new Error("Invalid Response");
            }
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to load products", err);
            setProducts([]);
        } finally {
            // Small artificial delay for smooth transition and to show premium loader
            setTimeout(() => setLoading(false), 400);
        }
    }

    useEffect(() => {
        loadCategories();
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let list = [...products];
        if (search) {
            list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (sort === "price_asc") {
            list.sort((a, b) => (a.product_variants?.[0]?.price || 0) - (b.product_variants?.[0]?.price || 0));
        }
        if (sort === "price_desc") {
            list.sort((a, b) => (b.product_variants?.[0]?.price || 0) - (a.product_variants?.[0]?.price || 0));
        }
        return list;
    }, [products, search, sort]);

    // Skeleton Loader for premium feel
    const Skeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-4 animate-pulse">
                    <div className="bg-slate-100 rounded-[40px] aspect-square w-full" />
                    <div className="h-6 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-4 bg-slate-50 rounded-full w-1/2" />
                    <div className="h-12 bg-slate-100 rounded-2xl w-full" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-[#fcfdff] min-h-screen">
            {/* Premium Deep Industrial Header */}
            <section className="relative pt-40 pb-24 px-6 overflow-hidden bg-[#0a0c10]">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-l from-blue-500/20 to-transparent" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                            <span className="w-8 h-[1px] bg-blue-500" /> Professional Equipment
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white font-heading tracking-tight leading-[1.1]">
                            Engineered <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600">Precision.</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
                            Explore our ISO-certified collection of stainless steel medical furnishings and pharmaceutical grade equipment.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 mb-32">
                {/* Advanced Interactive Control Bar */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-6 md:p-8 border border-white flex flex-col lg:flex-row gap-6 items-center">
                    <div className="flex-1 w-full relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by model name or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[24px] py-5 pl-16 pr-8 outline-none font-bold text-slate-800 transition-all placeholder:text-slate-400 placeholder:font-medium"
                        />
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 md:flex-none md:w-64">
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            <select
                                value={selected}
                                onChange={(e) => {
                                    setSelected(e.target.value);
                                    loadProducts(e.target.value);
                                }}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 rounded-[24px] py-5 pl-14 pr-10 outline-none font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                        </div>

                        <div className="relative flex-1 md:flex-none md:w-64">
                            <SlidersHorizontal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 rounded-[24px] py-5 pl-14 pr-10 outline-none font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Default Sorting</option>
                                <option value="price_asc">Price: Ascending</option>
                                <option value="price_desc">Price: Descending</option>
                            </select>
                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Dynamic Product Grid Context */}
                <div className="mt-20">
                    {loading ? (
                        <Skeleton />
                    ) : (
                        <>
                            <AnimatePresence mode="wait">
                                {filteredProducts.length > 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
                                    >
                                        {filteredProducts.map((p, index) => {
                                            const firstVariant = p.product_variants?.[0];
                                            const img = firstVariant?.product_images?.[0]?.image_url || p.product_images?.[0]?.image_url || "/no-image.png";
                                            return (
                                                <motion.div
                                                    key={p.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: (index % 4) * 0.1 }}
                                                    className="group flex flex-col h-full bg-white rounded-[40px] p-2 border border-slate-100 hover:border-blue-100 hover:shadow-[0_32px_64px_-24px_rgba(0,102,255,0.12)] transition-all duration-500"
                                                >
                                                    <Link to={`/products/${p.id}`} className="relative block aspect-square rounded-[36px] overflow-hidden bg-slate-50 items-center justify-center p-8 group">
                                                        <img
                                                            src={img}
                                                            alt={p.name}
                                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                                                        />
                                                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-500" />
                                                        <div className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur shadow-xl rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                                            <ArrowUpRight className="text-blue-600" size={18} />
                                                        </div>
                                                    </Link>

                                                    <div className="p-6 flex flex-col flex-1">
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-50 px-3 py-1 rounded-full">Medical Standard</span>
                                                                <div className="flex items-center gap-1">
                                                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                                    <span className="text-[10px] font-bold text-slate-400">4.8</span>
                                                                </div>
                                                            </div>
                                                            <Link to={`/products/${p.id}`} className="block">
                                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight min-h-[3rem]">
                                                                    {p.name}
                                                                </h3>
                                                            </Link>
                                                            {firstVariant && (
                                                                <div className="text-2xl font-black text-slate-900 pt-2 flex items-baseline gap-1">
                                                                    <span className="text-sm font-bold text-blue-600 uppercase">₹</span>
                                                                    {firstVariant.price.toLocaleString()}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Link to={`/products/${p.id}`} className="mt-8 block">
                                                            <button className="w-full bg-slate-900 group-hover:bg-blue-600 text-white font-black py-4.5 rounded-[20px] text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300">
                                                                Configure <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-40 space-y-6"
                                    >
                                        <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                                            <Search size={40} className="text-slate-300" />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900">No results match your criteria</h2>
                                        <p className="text-slate-500 font-medium max-w-xs mx-auto">Try adjusting your filters or search terms for broader results.</p>
                                        <button
                                            onClick={() => { setSearch(""); setSort(""); loadProducts(""); setSelected(""); }}
                                            className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline pt-4"
                                        >
                                            Clear all filters
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </div>

            {/* Industrial Trust Ticker */}
            <div className="bg-[#0a0c10] py-10 overflow-hidden flex whitespace-nowrap border-y border-white/5">
                <div className="flex animate-marquee">
                    {[1, 2, 3, 4].map(i => (
                        <span key={i} className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.5em] mx-16 flex items-center gap-6">
                            ISO 9001:2015 CERTIFIED • SS 304 GRADE FABRICATION • PRECISION MEDICAL ENGINEERING • NATIONWIDE LOGISTICS
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .py-4\.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
      `}</style>
        </div>
    );
}
