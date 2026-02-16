import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { http } from "../lib/http";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await http.get(`/products/${id}`);
      const data = res.data;
      setProduct(data);
      if (data.product_variants?.length) {
        setVariant(data.product_variants[0]);
      }
    }
    load();
  }, [id]);

  if (!product) return <div className="p-10">Loading…</div>;

  const mainImage =
    variant?.product_images?.[0]?.image_url ||
    product.product_images?.[0]?.image_url ||
    "/no-image.png";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-16">
      
      {/* TOP SECTION */}
      <div className="grid lg:grid-cols-2 gap-14 items-start">
        
        {/* IMAGE (STICKY) */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-blue-50 rounded-3xl p-10 flex items-center justify-center">
            <img
              src={mainImage}
              className="max-h-[420px] w-full object-contain"
            />
          </div>
        </div>

        {/* PRODUCT SUMMARY */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">
            {product.name}
          </h1>

          {/* Rating (UI only) */}
          <div className="flex items-center gap-3">
            <div className="text-yellow-400 text-lg">
              ★ ★ ★ ★ ☆
            </div>
            <span className="text-sm text-gray-500">
              4.2 (124 reviews)
            </span>
          </div>

          {/* PRICE */}
          {variant && (
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-blue-700">
                  ₹{variant.price}
                </span>
                <span className="line-through text-gray-400">
                  ₹{Math.round(variant.price * 1.2)}
                </span>
                <span className="text-green-600 font-semibold">
                  20% OFF
                </span>
              </div>
              <p className="text-sm text-green-700">
                Inclusive of all taxes
              </p>
            </div>
          )}

          {/* KEY FEATURES (SHORT, SAFE) */}
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Key Features
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Hospital-grade quality</li>
              <li>Certified for medical use</li>
              <li>Durable & long-lasting</li>
              <li>Easy maintenance</li>
            </ul>
          </div>

          {/* VARIANTS */}
          {product.product_variants?.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Select Variant
              </h3>
              <div className="flex flex-wrap gap-4">
                {product.product_variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariant(v)}
                    className={`px-5 py-3 rounded-xl border font-medium transition ${
                      v.id === variant?.id
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {v.variant_name}
                    <div className="text-sm font-semibold">
                      ₹{v.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-4 pt-4">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow transition"
              onClick={async () => {
                await http.post("/cart/add", {
                  variant_id: variant.id,
                  quantity: 1
                });
                alert("Added to cart");
              }}
            >
              Add to Cart
            </button>

            <button className="px-6 py-4 rounded-xl border border-gray-300 hover:border-blue-500 transition">
              ♡
            </button>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-sm text-gray-600">
            <div>✔ ISO Certified</div>
            <div>✔ Secure Payments</div>
            <div>✔ Fast Delivery</div>
            <div>✔ Medical Approved</div>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION (LONG CONTENT SAFE) */}
      {/* DETAILS SECTION (LONG CONTENT SAFE) */}
<div className="bg-white rounded-3xl p-8 shadow-sm">
  <h2 className="text-2xl font-bold mb-4">
    Product Details
  </h2>

  <div
    className="text-gray-700 leading-relaxed"
    dangerouslySetInnerHTML={{
      __html: variant?.description || product.description
    }}
  />
</div>

    </div>
  );
}
