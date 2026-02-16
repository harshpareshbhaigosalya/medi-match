import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const img =
    product.product_images?.[0]?.image_url ||
    "/no-image.png";

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col"
    >
      <div className="bg-blue-50 p-4 rounded-t-3xl">
        <img
          src={img}
          className="h-40 w-full object-contain group-hover:scale-105 transition"
          alt={product.name}
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-base line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto pt-4 text-blue-600 font-semibold text-sm">
          View Details →
        </div>
      </div>
    </Link>
  );
}
