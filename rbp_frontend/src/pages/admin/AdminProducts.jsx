// AdminProducts.jsx
import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import AdminVariants from "./AdminVariants";

export default function AdminProducts() {
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    base_price: "",
    sku: "",
    category_id: ""
  });
  const [editing, setEditing] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null); // product showing variants

  async function loadCategories() {
    const res = await http.get("/admin/categories/");
    setCategories(res.data);
  }

  async function loadProducts(catId) {
    const res = await http.get(`/admin/products/?category_id=${catId || ""}`);
    setProducts(res.data);
  }

  async function save(e) {
    e.preventDefault();
    if (!form.category_id) {
      alert("Select category first");
      return;
    }
    const payload = { ...form, image_url: imageUrl };
    if (editing) {
      await http.put(`/admin/products/${editing}`, payload);
    } else {
      await http.post("/admin/products/", payload);
    }
    reset();
    loadProducts(selectedCat);
  }

  function reset() {
    setEditing(null);
    setImageUrl("");
    setForm({
      name: "",
      description: "",
      base_price: "",
      sku: "",
      category_id: selectedCat
    });
  }

  async function remove(id) {
    if (!confirm("Delete product?")) return;
    await http.delete(`/admin/products/${id}`);
    loadProducts(selectedCat);
  }

  function startEdit(prod) {
    setEditing(prod.id);
    setForm({
      name: prod.name,
      description: prod.description || "",
      base_price: prod.base_price || "",
      sku: prod.sku,
      category_id: prod.category_id
    });
    setImageUrl(prod.image_url || "");
  }

  function toggleVariants(id) {
    setExpandedProduct(expandedProduct === id ? null : id);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCat) {
      loadProducts(selectedCat);
      setForm(f => ({ ...f, category_id: selectedCat }));
    }
  }, [selectedCat]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-800 text-center">Manage Products</h1>

      {/* CATEGORY SELECTOR */}
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">Select Category</h2>
        <select
          className="w-full border border-blue-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedCat}
          onChange={e => setSelectedCat(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* FORM */}
      {selectedCat && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            {editing ? "Edit Product" : "Add Product"}
          </h2>
          <form className="space-y-4" onSubmit={save}>
            <input
              className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Product Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Image URL"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
            <input
              className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Base Price"
              type="number"
              value={form.base_price}
              onChange={e => setForm({ ...form, base_price: e.target.value })}
            />
            <input
              className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="SKU"
              value={form.sku}
              onChange={e => setForm({ ...form, sku: e.target.value })}
            />
            <div className="flex gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                {editing ? "Update" : "Create"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={reset}
                  className="border border-blue-300 px-4 py-2 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* PRODUCTS GRID */}
      <div className="space-y-4">
        {products.map(p => (
          <div key={p.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex gap-4 p-4 items-center">
              <img
                src={p.image_url || "https://via.placeholder.com/120x120?text=No+Image"}
                alt={p.name}
                className="w-32 h-32 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-semibold text-lg">{p.name}</div>
                <div className="text-gray-600">SKU: {p.sku}</div>
                <div className="text-blue-700 font-semibold mt-1">₹ {p.base_price}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => toggleVariants(p.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    {expandedProduct === p.id ? "Hide Variants" : "View Variants"}
                  </button>
                </div>
              </div>
            </div>

            {/* VARIANTS BELOW PRODUCT */}
            {expandedProduct === p.id && (
              <div className="p-4 border-t bg-blue-50">
                <AdminVariants product={p} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
