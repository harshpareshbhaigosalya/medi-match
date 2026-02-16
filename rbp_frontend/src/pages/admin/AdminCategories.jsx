import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import { Edit, Trash2, PlusCircle, X, Tag } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [totalCategories, setTotalCategories] = useState(0);

  async function load() {
    const res = await http.get("/admin/categories/");
    setCategories(res.data);
    setTotalCategories(res.data.length);
  }

  async function save(e) {
    e.preventDefault();
    if (editing) {
      await http.put(`/admin/categories/${editing}`, form);
    } else {
      await http.post("/admin/categories/", form);
    }
    setForm({ name: "", description: "" });
    setEditing(null);
    setModalOpen(false);
    load();
  }

  async function remove(id) {
    if (!confirm("Delete category?")) return;
    await http.delete(`/admin/categories/${id}`);
    load();
  }

  function startEdit(cat) {
    setEditing(cat.id);
    setForm({ name: cat.name, description: cat.description || "" });
    setModalOpen(true);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-800">Categories</h1>
        <button
          onClick={() => {
            setForm({ name: "", description: "" });
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* TOTAL CATEGORY STAT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center">
          <div className="text-gray-500 text-sm">Total Categories</div>
          <div className="text-2xl font-bold text-blue-600">{totalCategories}</div>
        </div>
      </div>

      {/* CATEGORY LIST */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 && (
          <div className="text-gray-500 text-center py-6 bg-white shadow rounded col-span-full">
            No categories found.
          </div>
        )}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white shadow-md rounded-lg p-5 flex flex-col justify-between hover:shadow-xl transition relative"
          >
            {/* Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
              <Tag className="w-3 h-3" />
              <span>Category</span>
            </div>

            <div className="mb-4">
              <div className="font-semibold text-gray-800 text-lg">{cat.name}</div>
              <div
                className="text-gray-500 text-sm line-clamp-3"
                title={cat.description || "No description"}
              >
                {cat.description || "No description"}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-auto">
              <button
                onClick={() => startEdit(cat)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => remove(cat.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editing ? "Edit Category" : "Create Category"}
            </h2>

            <form className="space-y-4" onSubmit={save}>
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Category Name</label>
                <input
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Category name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Description</label>
                <textarea
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
