import { useEffect, useState } from "react";
import { http } from "../lib/http";
import { Link } from "react-router-dom";

const ORG_LABELS = {
  hospital: "Hospital",
  clinic: "Clinic",
  personal: "Personal",
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [tab, setTab] = useState("addresses");

  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  const [edit, setEdit] = useState({
    full_name: "",
    org_type: "",
    specialization: "",
  });

  async function load() {
    const p = await http.get("/profile/");
    setProfile(p.data);

    setEdit({
      full_name: p.data.full_name || "",
      org_type: p.data.org_type || "",
      specialization: p.data.specialization || "",
    });

    const a = await http.get("/address/");
    setAddresses(a.data);

    const o = await http.get("/orders/");
    setOrders(o.data);
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    await http.put("/profile/", edit);

    setSaving(false);
    setEditingProfile(false);
    setSuccess(true);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  if (!profile) return <div>Loading…</div>;

  const isValid = edit.full_name && edit.org_type;

  const completion =
    [profile.full_name, profile.org_type, profile.specialization].filter(
      Boolean
    ).length;

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">My Account</h1>

      {/* PROFILE CARD */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        {!editingProfile ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                {(profile.full_name || profile.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-semibold">
                {profile.full_name || "Unnamed User"}
              </h2>

              <div className="text-sm text-gray-600">{profile.email}</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-gray-500">Organization Type</span>
                  <div className="font-medium">
                    {ORG_LABELS[profile.org_type] || "-"}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Specialization</span>
                  <div className="font-medium">
                    {profile.specialization || "-"}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Profile completion: {completion}/3
              </div>

              {success && (
                <div className="text-green-600 text-sm font-medium">
                  Profile updated successfully
                </div>
              )}
            </div>

            {/* Action */}
            <div className="self-start">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={() => setEditingProfile(true)}
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={saveProfile} className="max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Edit Profile</h2>

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className="border rounded-lg w-full p-2 mt-1"
                value={edit.full_name}
                onChange={(e) =>
                  setEdit({ ...edit, full_name: e.target.value })
                }
              />
            </div>

            {/* Org Type */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Organization Type <span className="text-red-500">*</span>
              </label>
              <select
                className="border rounded-lg w-full p-2 mt-1"
                value={edit.org_type}
                onChange={(e) =>
                  setEdit({ ...edit, org_type: e.target.value })
                }
              >
                <option value="">Select who you are</option>
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            {/* Specialization */}
            {edit.org_type !== "personal" && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Specialization
                </label>
                <input
                  className="border rounded-lg w-full p-2 mt-1"
                  value={edit.specialization}
                  onChange={(e) =>
                    setEdit({ ...edit, specialization: e.target.value })
                  }
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!isValid || saving}
                className={`px-4 py-2 rounded-lg text-white ${
                  saving || !isValid
                    ? "bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                className="border px-4 py-2 rounded-lg"
                onClick={() => setEditingProfile(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* TABS */}
      <div className="border-b flex gap-6">
        <button
          className={`pb-2 ${
            tab === "addresses"
              ? "border-b-2 border-blue-600 font-medium"
              : "text-gray-500"
          }`}
          onClick={() => setTab("addresses")}
        >
          Addresses
        </button>

        <button
          className={`pb-2 ${
            tab === "orders"
              ? "border-b-2 border-blue-600 font-medium"
              : "text-gray-500"
          }`}
          onClick={() => setTab("orders")}
        >
          Orders
        </button>
      </div>

      {/* ADDRESSES */}
      {tab === "addresses" && (
        <div className="space-y-4">
          {!addresses.length && (
            <div className="text-gray-500">No saved addresses yet.</div>
          )}

          {addresses.map((a) => (
            <div
              key={a.id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="font-medium">{a.full_name}</div>
              <div>{a.address_line1}</div>
              {a.address_line2 && <div>{a.address_line2}</div>}
              <div>
                {a.city}, {a.state} — {a.pincode}
              </div>
              <div>{a.phone}</div>
            </div>
          ))}

          <Link
            to="/addresses"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
          >
            Manage Addresses
          </Link>
        </div>
      )}

      {/* ORDERS */}
      {tab === "orders" && (
        <div className="space-y-5">
          <div className="flex gap-3 flex-wrap">
            {["all", "pending", "completed", "cancelled"].map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1 rounded border ${
                  filter === k ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>

          {!filteredOrders.length && (
            <div className="text-gray-500">No orders found.</div>
          )}

          {filteredOrders.map((o) => (
            <div
              key={o.id}
              className="border rounded-xl p-4 bg-white shadow-sm flex justify-between"
            >
              <div>
                <div className="font-medium">{o.order_number}</div>
                <div className="text-sm text-gray-600">₹{o.total}</div>
                <div className="text-sm font-medium mt-1">
                  {o.status.toUpperCase()}
                </div>
              </div>

              <Link
                to={`/orders/${o.id}`}
                className="text-blue-600 self-center"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
