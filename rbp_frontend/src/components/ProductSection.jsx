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
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
      <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm">
        <div className="bg-blue-50 rounded-2xl p-6">
          <img
            src={mainImage}
            className="w-full h-96 object-contain"
          />
        </div>

        <div className="space-y-5">
          <h1 className="text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {variant && (
            <>
              <div className="text-2xl font-bold text-blue-700">
                ₹{variant.price}
              </div>

              <p className="text-gray-600 leading-relaxed">
                {variant.description || product.description}
              </p>

              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow transition"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
