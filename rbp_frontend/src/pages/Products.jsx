import { useEffect, useState, useMemo } from "react";
import { http } from "../lib/http";
import { Link } from "react-router-dom";

/* Badge logic */
const badgeTypes = [
  { text: "Best Seller", class: "bg-red-500" },
  { text: "Hospital Use", class: "bg-blue-600" },
  { text: "Limited Stock", class: "bg-orange-500" },
  { text: "New Arrival", class: "bg-purple-600" }
];

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  async function loadCategories() {
    const res = await http.get("/categories");
    setCategories(res.data);
  }

  async function loadProducts(cat = "") {
    const res = await http.get(
      cat ? `/products?category=${cat}` : "/products"
    );
    setProducts(res.data);
  }

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === "price_asc") {
      list.sort(
        (a, b) =>
          (a.product_variants?.[0]?.price || 0) -
          (b.product_variants?.[0]?.price || 0)
      );
    }

    if (sort === "price_desc") {
      list.sort(
        (a, b) =>
          (b.product_variants?.[0]?.price || 0) -
          (a.product_variants?.[0]?.price || 0)
      );
    }

    return list;
  }, [products, search, sort]);

  const featuredProducts = products.slice(0, 6);
  const promoProducts = products.slice(6, 14); // next 8 products as promoted

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20">

        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-3xl p-12 text-white shadow-xl">
          <h1 className="text-4xl font-bold">
            Medical Equipment
          </h1>
          <p className="mt-3 text-blue-100 max-w-2xl">
            Trusted by hospitals, clinics & healthcare professionals
          </p>
        </div>

        {/* FEATURED PRODUCTS (Top) */}
        {/* <div className="space-y-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Featured Products
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {featuredProducts.map((p, i) => {
              const img = p.product_images?.[0]?.image_url || "/no-image.png";
              const badge = badgeTypes[i % badgeTypes.length];
              return (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="min-w-[280px] bg-white rounded-3xl shadow hover:shadow-xl transition"
                >
                  <div className="bg-blue-50 p-5 rounded-t-3xl relative">
                    <span
                      className={`absolute top-4 left-4 ${badge.class} text-white text-xs px-3 py-1 rounded-full`}
                    >
                      {badge.text}
                    </span>
                    <img
                      src={img}
                      className="h-40 w-full object-contain"
                    />
                  </div>
                  <div className="p-5 font-semibold text-gray-800 line-clamp-2">
                    {p.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div> */}

        {/* PRODUCT GRID (Middle) */}
        <div className="bg-white rounded-3xl shadow-sm p-8 space-y-10">

          {/* FILTER BAR */}
          <div className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search medical equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:col-span-2 border border-gray-300 rounded-xl px-4 py-3"
            />
            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                loadProducts(e.target.value);
              }}
              className="border border-gray-300 rounded-xl px-4 py-3"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3"
            >
              <option value="">Sort by</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {filteredProducts.map((p, index) => {
              const firstVariant = p.product_variants?.[0];
              const img = firstVariant?.product_images?.[0]?.image_url || p.product_images?.[0]?.image_url || "/no-image.png";
              const showBadge = index % 4 === 0;
              const badge = badgeTypes[index % badgeTypes.length];
              return (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="group bg-white rounded-3xl border border-gray-100 hover:shadow-2xl transition"
                >
                  <div className="bg-blue-50 rounded-t-3xl p-5 relative">
                    {showBadge && (
                      <span
                        className={`absolute top-4 right-4 ${badge.class} text-white text-xs px-3 py-1 rounded-full`}
                      >
                        {badge.text}
                      </span>
                    )}
                    <img
                      src={img}
                      className="h-44 w-full object-contain group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-6 space-y-2">
                    <div className="font-semibold text-gray-900 line-clamp-2">
                      {p.name}
                    </div>
                    {firstVariant && (
                      <div className="text-lg font-bold text-blue-700">
                        ₹{firstVariant.price}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* PROMO / ADVERTISED PRODUCTS (Bottom Auto-Scroll) */}
        {promoProducts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-900">
              Special Offers
            </h2>

            <div className="relative overflow-hidden">
              <div className="flex gap-6 animate-scroll">
                {[...promoProducts, ...promoProducts].map((p, i) => {
                  const img = p.product_images?.[0]?.image_url || "/no-image.png";
                  const badge = badgeTypes[i % badgeTypes.length];
                  const showBadge = i % 2 === 0; // only some badges
                  return (
                    <Link
                      key={p.id + i}
                      to={`/products/${p.id}`}
                      className="min-w-[260px] bg-white rounded-2xl shadow hover:shadow-xl transition"
                    >
                      <div className="bg-blue-50 p-4 rounded-t-2xl relative">
                        {showBadge && (
                          <span
                            className={`absolute top-3 left-3 ${badge.class} text-white text-xs px-2 py-1 rounded-full`}
                          >
                            {badge.text}
                          </span>
                        )}
                        <img
                          src={img}
                          className="h-36 w-full object-contain"
                        />
                      </div>
                      <div className="p-4 font-semibold text-gray-800 line-clamp-2">
                        {p.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <style>
          {`
            .animate-scroll {
              animation: scroll 28s linear infinite;
            }
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}
        </style>
      </div>
    </div>
  );
}
