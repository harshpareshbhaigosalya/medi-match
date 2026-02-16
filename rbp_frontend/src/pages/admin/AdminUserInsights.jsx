import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export default function AdminUserInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await http.get("/admin/dashboard/user-insights");
      setData(res.data);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.statusText || err.message || "Failed to load";
      setError(msg);
      setData({ error: msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading)
    return (
      <div className="p-6 text-center">
        <div className="text-blue-600 font-semibold">Loading user insights…</div>
      </div>
    );

  if (!data) return null;

  if (data.error || error) return <div className="p-6 text-center text-red-600">{error || data.error}</div>;

  const ctx = data.ctx || {};

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">User Growth & Retention</h1>
          <div className="text-sm text-gray-500">Fresh insights to help acquisition & retention</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="bg-white border px-3 py-2 rounded shadow hover:bg-gray-50">Refresh</button>
          <button onClick={() => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'user_insights.json'; a.click(); URL.revokeObjectURL(url);
          }} className="bg-blue-600 text-white px-3 py-2 rounded shadow">Download JSON</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-2xl font-bold">{ctx.total_users}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">New Users (Last 30d)</div>
          <div className="text-2xl font-bold">{ctx.new_last_30}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Growth vs Prev 30d</div>
          <div className="text-2xl font-bold">{ctx.growth_pct != null ? `${ctx.growth_pct}%` : "N/A"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Top Signup Sources</h3>
          <ul className="space-y-2">
            {(ctx.top_sources || []).map((s, i) => (
              <li key={i} className="flex justify-between">
                <div>{s.source}</div>
                <div className="font-semibold">{s.count}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Avg Order Value</h3>
          <div className="text-2xl font-bold">₹ {ctx.avg_order_value}</div>
          <div className="text-sm text-gray-600">Repeat Rate: {ctx.repeat_rate}%</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Growth Suggestions</h3>
        {data.suggestions ? (
          Array.isArray(data.suggestions) ? (
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {data.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          ) : (
            <div className="text-sm text-gray-700">{data.suggestions}</div>
          )
        ) : (
          <div className="text-gray-600">No suggestions</div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={load} className="bg-blue-600 text-white px-3 py-1 rounded">Refresh</button>
        <button onClick={() => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'user_insights.json'; a.click(); URL.revokeObjectURL(url);
        }} className="border px-3 py-1 rounded">Download JSON</button>
      </div>
    </div>
  );
}
