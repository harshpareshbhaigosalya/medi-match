import { useEffect, useState } from "react";
import { http } from "../lib/http";
import { useNavigate } from "react-router-dom";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const navigate = useNavigate();

  async function load() {
    const res = await http.get("/address/");
    setAddresses(res.data);
    if (res.data.length) setSelected(res.data[0]);
  }

  async function addAddress(e) {
    e.preventDefault();
    await http.post("/address/", form);
    setForm({
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
    });
    setShowForm(false);
    load();
  }

  function continueToCheckout() {
    if (!selected) {
      alert("Select an address first");
      return;
    }
    navigate("/checkout", { state: { address: selected } });
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Select Delivery Address</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div
            key={a.id}
            onClick={() => setSelected(a)}
            className={`border rounded-lg p-4 cursor-pointer transition shadow-sm hover:shadow-md ${
              selected?.id === a.id ? "border-blue-600 ring-2 ring-blue-400" : ""
            }`}
          >
            <div className="font-semibold">{a.full_name}</div>
            <div>{a.address_line1}</div>
            {a.address_line2 && <div>{a.address_line2}</div>}
            <div>
              {a.city}, {a.state} — {a.pincode}
            </div>
            <div>{a.phone}</div>
          </div>
        ))}
      </div>

      <button
        className="text-blue-700 underline font-semibold"
        onClick={() => setShowForm(!showForm)}
      >
        + Add New Address
      </button>

      {showForm && (
        <form onSubmit={addAddress} className="space-y-3 border p-4 rounded shadow mt-3">
          <input
            className="border p-2 w-full rounded"
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="Address Line 1"
            value={form.address_line1}
            onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="Address Line 2"
            value={form.address_line2}
            onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold">
            Save Address
          </button>
        </form>
      )}

      <button
        className="bg-green-600 text-white px-4 py-2 rounded w-full font-semibold mt-4 hover:bg-green-700 transition"
        onClick={continueToCheckout}
      >
        Continue to Checkout
      </button>
    </div>
  );
}
