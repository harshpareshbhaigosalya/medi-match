// AdminVariants.jsx
import { useEffect, useState } from "react";
import { http } from "../../lib/http";

export default function AdminVariants({ product }) {
  const [variants, setVariants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    variant_name: "",
    price: "",
    stock: 0,
    description: "",
    image_url: "",
    product_id: product?.id || ""
  });

  async function load() {
    if (!product?.id) return;
    const res = await http.get(`/admin/variants/?product_id=${product.id}`);
    setVariants(res.data);
  }

  async function save(e) {
    e.preventDefault();
    if (!form.variant_name) {
      alert("Variant name required");
      return;
    }
    const payload = { ...form };
    if (editing) {
      await http.put(`/admin/variants/${editing}`, payload);
    } else {
      await http.post("/admin/variants/", payload);
    }
    reset();
    load();
  }

  function reset() {
    setEditing(null);
    setForm({
      variant_name: "",
      price: "",
      stock: 0,
      description: "",
      image_url: "",
      product_id: product.id
    });
  }

  async function remove(id) {
    if (!confirm("Delete variant?")) return;
    await http.delete(`/admin/variants/${id}`);
    load();
  }

  function startEdit(v) {
    setEditing(v.id);
    setForm({
      variant_name: v.variant_name,
      price: v.price,
      stock: v.stock,
      description: v.description || "",
      image_url: v.image_url || "",
      product_id: v.product_id
    });
  }

  useEffect(() => {
    load();
  }, [product]);

  if (!product) return null;

  return (
    <div className="mt-2 border-t pt-2">
      <form onSubmit={save} className="space-y-2 mb-3">
        <input
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Variant Name"
          value={form.variant_name}
          onChange={e => setForm({ ...form, variant_name: e.target.value })}
        />
        <input
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Image URL"
          value={form.image_url || ""}
          onChange={e => setForm({ ...form, image_url: e.target.value })}
        />
        <input
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />
        <input
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: e.target.value })}
        />
        <textarea
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition">
            {editing ? "Update Variant" : "Add Variant"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={reset}
              className="border border-blue-300 px-3 py-1 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* VARIANTS LIST */}
      <div className="space-y-2">
        {variants.map(v => (
          <div key={v.id} className="flex justify-between items-start p-2 border rounded-md bg-blue-50">
            <div className="flex gap-2">
              {v.image_url && (
                <img src={v.image_url} alt={v.variant_name} className="w-16 h-16 object-cover rounded" />
              )}
              <div>
                <div className="font-semibold">{v.variant_name}</div>
                <div className="text-blue-700 font-semibold">₹ {v.price}</div>
                <div>Stock: {v.stock}</div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => startEdit(v)}
                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => remove(v.id)}
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
