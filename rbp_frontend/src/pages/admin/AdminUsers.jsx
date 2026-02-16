import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);

  async function loadUsers() {
    try {
      const res = await http.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }

  async function loadUserOrders(userId) {
    const res = await http.get(`/admin/users/${userId}/orders`);
    const flatOrders = res.data.orders;

    // group by order_id
    const ordersMap = {};
    flatOrders.forEach((item) => {
      if (!ordersMap[item.id]) {
        ordersMap[item.id] = {
          ...item,
          items: item.order_items || [],
          total: item.total,
        };
      }
    });

    const orders = Object.values(ordersMap);

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);

    setUserOrders(orders);
    setOrderSummary({ totalOrders, totalSpent });
  }

  async function toggleBlock(id, blocked) {
    await http.put(`/admin/users/${id}/block`, { blocked });
    loadUsers();
  }

  async function loadUserDetails(userId) {
    try {
      const res = await http.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);

      // Load orders for this user
      loadUserOrders(userId);
    } catch (err) {
      console.error("Failed to load user details:", err);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Summary counts
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.blocked).length;
  const blockedUsers = users.filter((u) => u.blocked).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  // Search + filter + sort
  const filteredUsers = users
    .filter((u) => (u.full_name || "").toLowerCase().includes(search.toLowerCase()))
    .filter((u) => (filterRole ? u.role === filterRole : true))
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  // Charts
  const pieData = [
    { name: "Active", value: activeUsers },
    { name: "Blocked", value: blockedUsers },
    { name: "Admins", value: adminUsers },
  ];
  const pieColors = ["#34D399", "#F87171", "#FBBF24"];

  const barData = [
    { name: "Total Users", count: totalUsers },
    { name: "Active Users", count: activeUsers },
    { name: "Blocked Users", count: blockedUsers },
    { name: "Admins", count: adminUsers },
  ];

  const growthData = users
    .reduce((acc, u) => {
      const date = new Date(u.created_at || Date.now());
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const existing = acc.find((item) => item.month === month);
      if (existing) existing.count += 1;
      else acc.push({ month, count: 1 });
      return acc;
    }, [])
    .sort((a, b) => new Date(a.month) - new Date(b.month));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-800 text-center mb-6">
        Admin Users Dashboard
      </h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg shadow text-center">
          <div className="text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-blue-800">{totalUsers}</div>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow text-center">
          <div className="text-gray-600">Active Users</div>
          <div className="text-2xl font-bold text-green-800">{activeUsers}</div>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow text-center">
          <div className="text-gray-600">Blocked Users</div>
          <div className="text-2xl font-bold text-red-800">{blockedUsers}</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow text-center">
          <div className="text-gray-600">Admins</div>
          <div className="text-2xl font-bold text-yellow-800">{adminUsers}</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2 text-center">User Status</h3>
          <PieChart width={250} height={250}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2 text-center">User Summary</h3>
          <BarChart width={250} height={250} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2 text-center">Growth Over Time</h3>
          <LineChart width={250} height={250} data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#10B981" />
          </LineChart>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full sm:max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* USERS TABLE */}
      <section className="space-y-4">
        <div className="overflow-x-auto bg-white shadow rounded-lg mt-4">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("id")}>
                  ID {sortBy === "id" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("full_name")}
                >
                  Name {sortBy === "full_name" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("role")}>
                  Role {sortBy === "role" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("blocked")}
                >
                  Status {sortBy === "blocked" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("total_orders")}
                >
                  Orders {sortBy === "total_orders" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("total_spent")}
                >
                  Total Spent {sortBy === "total_spent" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => loadUserDetails(u.id)}
                >
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2">{u.full_name || "No Name"}</td>
                  <td className="px-4 py-2">{u.role || "User"}</td>
                  <td className="px-4 py-2 text-center">{u.blocked ? "Blocked" : "Active"}</td>
                  <td className="px-4 py-2">{u.total_orders}</td>
                  <td className="px-4 py-2">₹{u.total_spent}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBlock(u.id, !u.blocked);
                      }}
                      className={`px-3 py-1 rounded font-semibold text-white transition ${
                        u.blocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {u.blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-2 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="px-3 py-1">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </section>

      {/* USER DETAILS PANEL */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-start pt-10 p-4 z-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
              className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                <X />
              </button>

              <h2 className="text-2xl font-bold mb-4">{selectedUser.full_name || "No Name"}</h2>

              {/* BASIC INFO */}
              <div className="space-y-2 text-sm mb-4">
                <div>
                  <strong>ID:</strong> {selectedUser.id}
                </div>
                <div>
                  <strong>Role:</strong> {selectedUser.role}
                </div>
                <div>
                  <strong>Status:</strong> {selectedUser.blocked ? "Blocked" : "Active"}
                </div>
                <div>
                  <strong>Joined:</strong>{" "}
                  {new Date(selectedUser.created_at).toLocaleString()}
                </div>
                <div>
                  <strong>Total Orders:</strong> {orderSummary?.totalOrders || 0}
                </div>
                <div>
                  <strong>Total Spent:</strong> ₹{orderSummary?.totalSpent || 0}
                </div>
              </div>

              {/* ADDRESSES */}
              <div className="space-y-4 mb-4">
                <h3 className="font-semibold text-lg text-blue-700">Addresses</h3>
                {selectedUser.addresses?.length > 0 ? (
                  selectedUser.addresses.map((addr, idx) => (
                    <div key={addr.id} className="border rounded p-3 bg-gray-50 text-sm">
                      <div className="font-semibold mb-1">Address {idx + 1}</div>
                      <div>
                        <strong>Name:</strong> {addr.full_name}
                      </div>
                      <div>
                        <strong>Phone:</strong> {addr.phone}
                      </div>
                      <div className="mt-1">
                        <strong>Address:</strong>
                        <div>{addr.address_line1}</div>
                        {addr.address_line2 && <div>{addr.address_line2}</div>}
                        <div>
                          {addr.city}, {addr.state} – {addr.pincode}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No addresses found</div>
                )}
              </div>

              {/* ORDERS */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-green-700">Orders</h3>
                {userOrders.length > 0 ? (
                  userOrders.map((order) => (
                    <div key={order.id} className="border rounded p-3 bg-gray-50 text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <strong>Order ID:</strong> {order.id}
                        </div>
                        <div>
                          <strong>Date:</strong>{" "}
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <strong>Items:</strong>
                        <table className="w-full text-sm mt-1 border">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-1 border">Product</th>
                              <th className="px-2 py-1 border">Qty</th>
                              <th className="px-2 py-1 border">Price</th>
                              <th className="px-2 py-1 border">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-2 py-1 border">{item.product_name}</td>
                                <td className="px-2 py-1 border">{item.quantity}</td>
                                <td className="px-2 py-1 border">₹{item.price}</td>
                                <td className="px-2 py-1 border">₹{item.price * item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="text-right font-semibold mt-1">
                          Total: ₹{order.total}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No orders found</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
