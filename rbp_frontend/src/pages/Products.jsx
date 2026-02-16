import { useEffect, useState, useMemo } from "react";
import { http } from "../lib/http";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";

const badgeTypes = [
  { text: "Best Seller", class: "bg-red-500 shadow-red-100" },
  { text: "Hospital Use", class: "bg-blue-600 shadow-blue-100" },
  { text: "Limited Stock", class: "bg-orange-500 shadow-orange-100" },
  { text: "New Arrival", class: "bg-purple-600 shadow-purple-100" }
];

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  async function loadCategories() {
    const res = await http.get("/categories");
    setCategories(res.data);
  }

  async function loadProducts(cat = "") {
    const res = await http.get(cat ? `/products?category=${cat}` : "/products");
    setProducts(res.data);
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

  const promoProducts = products.slice(0, 8);

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <section className="bg-gray-950 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white font-heading tracking-tight"
          >
            Equipment <span className="text-blue-500">Catalog</span>
          </motion.h1>
          <p className="text-gray-400 font-medium max-w-xl mx-auto">
            Browse our comprehensive range of ISO certified medical and pharmaceutical furniture.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-10 mb-24">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-6 border border-gray-100 mb-12">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none font-bold text-gray-800 transition-all"
              />
            </div>

            <div className={`flex flex-col sm:flex-row gap-4 lg:flex ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  loadProducts(e.target.value);
                }}
                className="bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 px-6 outline-none font-bold text-gray-800 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 px-6 outline-none font-bold text-gray-800 transition-all appearance-none cursor-pointer"
              >
                <option value="">Default Sorting</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-black py-4 rounded-2xl"
            >
              <SlidersHorizontal size={20} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Categories Pills (Mobile Only) */}
        {!selected && (
          <div className="flex lg:hidden overflow-x-auto gap-3 pb-6 no-scrollbar">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelected(c.id); loadProducts(c.id); }}
                className="whitespace-nowrap px-6 py-3 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-full font-bold text-sm transition-all shadow-sm"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {filteredProducts.map((p, index) => {
            const firstVariant = p.product_variants?.[0];
            const img = firstVariant?.product_images?.[0]?.image_url || p.product_images?.[0]?.image_url || "/no-image.png";
            const badge = badgeTypes[index % badgeTypes.length];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group flex flex-col"
              >
                <Link to={`/products/${p.id}`} className="relative bg-gray-50 rounded-[40px] p-6 md:p-8 overflow-hidden aspect-square flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <div className={`absolute top-6 left-6 ${badge.class} text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-10 shadow-lg`}>
                    {badge.text}
                  </div>
                  <img
                    src={img}
                    alt={p.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                </Link>

                <div className="pt-6 space-y-2">
                  <Link to={`/products/${p.id}`} className="block">
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {p.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    {firstVariant && (
                      <div className="text-xl font-black text-gray-900">
                        ₹{firstVariant.price.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Rated</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-gray-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] group-hover:bg-blue-600 transition-all transform group-hover:-translate-y-1">
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <div className="text-6xl">🔍</div>
            <h2 className="text-2xl font-black text-gray-900">No products found</h2>
            <p className="text-gray-500 font-medium">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(""); setSort(""); loadProducts(""); setSelected(""); }} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline pt-4">Clear All Filters</button>
          </div>
        )}
      </div>

      {/* Decorative Ticker */}
      {filteredProducts.length > 0 && (
        <div className="bg-blue-600 py-6 overflow-hidden flex whitespace-nowrap border-y border-white/10 mt-12 mb-24">
          <div className="flex animate-marquee">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className="text-white font-black uppercase text-sm tracking-[0.4em] mx-12 flex items-center gap-4">
                <Sparkles size={16} /> ISO CERTIFIED MANUFACTURING • PREMIUM SS 304 GRADE • NATIONWIDE DELIVERY
              </span>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
