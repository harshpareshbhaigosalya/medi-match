import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart
} from "recharts";

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const MarkdownResponse = ({ text }) => {
  if (!text || typeof text !== 'string') return null;

  // Simple regex-based formatter for Gemini output
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        let content = line.trim();
        if (!content) return <div key={i} className="h-2" />;

        // Bullet points
        const isBullet = content.startsWith('* ') || content.startsWith('- ');
        if (isBullet) content = content.substring(2);

        // Bold text
        const parts = content.split(/(\*\*.*?\*\*)/g);
        const formatted = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-blue-900 font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        return (
          <div key={i} className={`flex gap-2 ${isBullet ? 'pl-4' : ''}`}>
            {isBullet && <span className="text-blue-500 font-bold">•</span>}
            <span className="text-gray-700 leading-relaxed overflow-hidden break-words">{formatted}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function AdminAISuggestions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [askPrompt, setAskPrompt] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askResponse, setAskResponse] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/admin/dashboard/predictions");
      setData(res.data);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.response?.statusText || err.message || "Failed to load suggestions";
      setError(msg);
      setData({ error: msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function askGemini() {
    if (!askPrompt || askPrompt.trim().length === 0) return;
    setAskLoading(true);
    setAskResponse(null);
    try {
      const res = await http.post('/admin/dashboard/predictions', { prompt: askPrompt });
      const reply = res?.data?.llm_response || res?.data?.text_insights || res?.data?.analysis || res?.data;
      setAskResponse(reply);
    } catch (err) {
      console.error(err);
      setAskResponse({ error: err?.response?.data || err.message });
    } finally {
      setAskLoading(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-blue-600 font-semibold">Loading AI Insights...</div>
        </div>
      </div>
    );

  if (!data) return <div className="text-center p-6">No data available</div>;

  if (data.error || error)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="max-w-xl text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 font-semibold text-lg mb-2">{error || data.error}</div>
          <div className="text-sm text-gray-600 mb-4">Check your authentication or server logs.</div>
          <button onClick={load} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );

  const userSeries = data?.ctx?.user_series || data?.ctx?.monthly_users || data?.monthly_series || data?.ctx?.monthly_series;

  // Prepare data for product distribution pie chart
  const productDistribution = data.ctx?.top_products?.slice(0, 5).map(p => ({
    name: p.name,
    value: p.sold
  })) || [];

  // Prepare combined revenue data
  const revenueData = data.monthly_series?.map((item, idx) => ({
    month: item.month,
    sales: item.sales,
    revenue: (item.sales || 0) * 100 // Mock revenue calculation
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Analytics Dashboard
              </h1>
              <p className="text-gray-500 mt-1">Intelligent insights powered by {data.source || 'AI'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={load}
                className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-400 px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "ai_suggestions.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-1.5">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: 'Products' },
              { id: 'users', label: 'Users' },
              { id: 'ai', label: 'AI Insights' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3.5 rounded-lg font-semibold text-sm transition-all ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-102'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Business Heath Bar - Highlight Signal Indicators */}
        {data?.signals && (
          <div className="flex flex-wrap gap-2">
            {data.signals.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-white border border-blue-100 text-blue-600 rounded-full text-xs font-semibold shadow-sm animate-pulse capitalize">
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-100 text-sm font-medium">Total Orders</div>
                    <div className="text-3xl font-bold mt-2">{data?.ctx?.kpis?.total_orders ?? '—'}</div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-100 text-sm font-medium">Total Revenue</div>
                    <div className="text-3xl font-bold mt-2">
                      {typeof data?.ctx?.kpis?.total_revenue === 'number' ? `₹${data.ctx.kpis.total_revenue.toLocaleString()}` : '—'}
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-purple-100 text-sm font-medium">Total Users</div>
                    <div className="text-3xl font-bold mt-2">{data?.ctx?.kpis?.total_users ?? '—'}</div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-orange-100 text-sm font-medium">Avg Order Value</div>
                    <div className="text-3xl font-bold mt-2">
                      {typeof data?.ctx?.kpis?.avg_order_value === 'number'
                        ? `₹${Math.round(data.ctx.kpis.avg_order_value).toLocaleString()}`
                        : '—'}
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Strategy Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Inventory Turnover Risk</h3>
                    <p className="text-xs text-gray-500 mt-1">Days since last sale for top items</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                {data.ctx?.inventory_aging && data.ctx.inventory_aging.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data.ctx.inventory_aging} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="days_idle" name="Days Idle" radius={[0, 4, 4, 0]}>
                        {data.ctx.inventory_aging.map((entry, index) => (
                          <Cell key={index} fill={entry.days_idle > 30 ? '#EF4444' : '#F59E0B'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">No aging data</div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Order Size Distribution</h3>
                    <p className="text-xs text-gray-500 mt-1">Classification of purchases by value</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                  </div>
                </div>
                {data.ctx?.order_value_dist && data.ctx.order_value_dist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={data.ctx.order_value_dist}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        nameKey="bucket"
                        label={({ bucket, percent }) => `${bucket}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.ctx.order_value_dist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">No distribution data</div>
                )}
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                    <p className="text-xs text-gray-500 mt-1">Monthly revenue performance</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#2563EB" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">No revenue data</div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Peak Hours Distribution</h3>
                    <p className="text-xs text-gray-500 mt-1">Order activity by hour</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                {data.peak_hours && data.peak_hours.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data.peak_hours.map(h => ({ hour: `${h.hour}:00`, orders: h.orders }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Bar dataKey="orders" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">No peak hour data</div>
                )}
              </div>
            </div>

            {/* Sales vs Orders Comparison */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Sales Performance Overview</h3>
                  <p className="text-xs text-gray-500 mt-1">Monthly sales trend analysis</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              {data.monthly_series && data.monthly_series.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={data.monthly_series}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="sales" stroke="#16A34A" fill="url(#colorSales)" name="Sales" />
                    <Line type="monotone" dataKey="sales" stroke="#16A34A" strokeWidth={3} dot={{ fill: '#16A34A', r: 5 }} name="Trend" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">No sales data</div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Product Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Top Product</div>
                    <div className="text-2xl font-bold text-gray-900">{data?.ctx?.top_products?.[0]?.name ?? '—'}</div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="text-sm font-semibold text-green-600">
                        {data?.ctx?.top_products?.[0]?.sold ?? 0} units
                      </div>
                      <span className="text-xs text-gray-500">sold</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-200/50 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Total Products</div>
                    <div className="text-2xl font-bold text-gray-900">{data?.ctx?.top_products?.length ?? 0}</div>
                    <div className="text-sm text-purple-600 mt-3 font-medium">In catalog</div>
                  </div>
                  <div className="w-12 h-12 bg-purple-200/50 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border border-red-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Low Stock</div>
                    <div className="text-2xl font-bold text-gray-900">{data?.ctx?.low_stock?.length ?? 0}</div>
                    <div className="text-sm text-red-600 mt-3 font-medium">Require attention</div>
                  </div>
                  <div className="w-12 h-12 bg-red-200/50 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
                    <p className="text-xs text-gray-500 mt-1">Best performers this period</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
                {data.ctx?.top_products && data.ctx.top_products.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data.ctx.top_products.slice(0, 8)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="sold" fill="#2563EB" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-400">No product data</div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Product Distribution</h3>
                    <p className="text-xs text-gray-500 mt-1">Sales share by product</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                </div>
                {productDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={productDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {productDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-400">No distribution data</div>
                )}
              </div>
            </div>

            {/* Product Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Least Selling Products</h3>
                    <p className="text-xs text-gray-500 mt-1">Items needing attention</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>
                {data.least_sellers && data.least_sellers.length > 0 ? (
                  <div className="space-y-3">
                    {data.least_sellers.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-semibold text-sm">
                            {i + 1}
                          </div>
                          <span className="font-medium text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-red-600 font-semibold">{item.sold} sold</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">No data available</div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">New Arrivals</h3>
                    <p className="text-xs text-gray-500 mt-1">Last 90 days</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                {data.ctx?.new_arrivals && data.ctx.new_arrivals.length > 0 ? (
                  <div className="space-y-3">
                    {data.ctx.new_arrivals.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-colors">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {item.created_at?.slice(0, 10)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">No recent arrivals</div>
                )}
              </div>
            </div>

            {/* Product Forecast */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Sales Forecast</h3>
                  <p className="text-xs text-gray-500 mt-1">Predicted units for next 30 days</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              {data.expected_sales && data.expected_sales.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.expected_sales.map((item, i) => (
                    <div key={i} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="font-medium text-gray-800">{item.product}</div>
                      <div className="text-2xl font-bold text-green-600 mt-2">{item.expected_next_30_days}</div>
                      <div className="text-xs text-gray-600 mt-1">Expected units</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No forecast available</div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Insights KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Total Account Holder</div>
                <div className="text-3xl font-bold text-gray-900">{data?.ctx?.kpis?.total_users ?? '—'}</div>
                <div className="text-xs text-gray-500 mt-2">Historical database total</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">New (Last 30d)</div>
                <div className="text-3xl font-bold text-gray-900">{data?.ctx?.user_insights?.new_last_30 ?? '—'}</div>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs font-bold ${data?.ctx?.user_insights?.growth_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data?.ctx?.user_insights?.growth_pct >= 0 ? '↑' : '↓'} {Math.abs(data?.ctx?.user_insights?.growth_pct ?? 0)}%
                  </span>
                  <span className="text-xs text-gray-500">vs prev 30d</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200">
                <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Repeat Rate</div>
                <div className="text-3xl font-bold text-gray-900">{data?.ctx?.kpis?.repeat_rate ?? '0'}%</div>
                <div className="text-xs text-gray-500 mt-2">Customers with &gt;1 order</div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-md p-6 border border-indigo-200">
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Avg Purchase</div>
                <div className="text-3xl font-bold text-gray-900">₹{Math.round(data?.ctx?.kpis?.avg_order_value ?? 0).toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-2">Revenue / Total Orders</div>
              </div>
            </div>

            {/* Signup Sources & Strategy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Acquisition Channels</h3>
                    <p className="text-xs text-gray-500 mt-1">Where your customers are coming from</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {data.ctx?.user_insights?.top_sources?.map((s, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{s.source}</span>
                        <span className="font-bold">{s.count} users</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${(s.count / data.ctx.kpis.total_users) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Growth Strategy</h3>
                    <p className="text-xs text-gray-500 mt-1">AI-suggested acquisition focus</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {data.recommendations?.filter(r => r.type === 'promo' || r.type === 'bundle').slice(0, 3).map((r, i) => (
                    <div key={i} className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                      <div className="font-bold text-purple-700 text-sm">{r.product || 'General Strategy'}</div>
                      <div className="text-xs text-gray-600 mt-1">{r.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">User Visits Trend</h3>
                    <p className="text-xs text-gray-500 mt-1">Visitor activity over time</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {userSeries && userSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={userSeries}>
                      <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey={userSeries[0].visitors !== undefined ? 'visitors' : 'sales'}
                        stroke="#0EA5E9"
                        fillOpacity={1}
                        fill="url(#colorVisitors)"
                      />
                      <Line
                        type="monotone"
                        dataKey={userSeries[0].visitors !== undefined ? 'visitors' : 'sales'}
                        stroke="#0EA5E9"
                        strokeWidth={3}
                        dot={{ fill: '#0EA5E9', r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">No user data</div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Conversion Trend</h3>
                    <p className="text-xs text-gray-500 mt-1">Monthly conversion performance</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
                {data.monthly_series && data.monthly_series.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.monthly_series}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">No conversion data</div>
                )}
              </div>
            </div>

            {/* User Forecast */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">User Forecast</h3>
                  <p className="text-xs text-gray-500 mt-1">Predicted metrics for next 30 days</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              {data?.user_forecast && data.user_forecast.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.user_forecast.map((item, i) => (
                    <div key={i} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="text-sm text-gray-600 mb-1">{item.metric}</div>
                      <div className="text-2xl font-bold text-purple-600">{item.predicted}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No forecast available</div>
              )}
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* AI Summary Card */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl shadow-2xl p-8 text-white border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI-Powered Analysis</h2>
                  <p className="text-blue-100 mt-1">Intelligent insights generated by {data.source || 'AI Engine'}</p>
                </div>
              </div>
            </div>

            {/* Text Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Key Insights</h3>
                  <p className="text-xs text-gray-500 mt-1">AI-generated recommendations</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              {data.text_insights ? (
                <div className="space-y-6">
                  {Array.isArray(data.text_insights) ? (
                    <div className="space-y-3">
                      {data.text_insights.map((insight, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </div>
                          <p className="text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <MarkdownResponse text={data.text_insights} />
                    </div>
                  )}

                  {data.growth_tactics && (
                    <div className="mt-8">
                      <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Growth Tactics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.growth_tactics.map((tactic, i) => (
                          <div key={i} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl shadow-sm">
                            <div className="text-green-700 font-bold text-sm mb-1">Action {i + 1}</div>
                            <div className="text-gray-700 text-sm leading-snug">{tactic}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No insights available</div>
              )}
            </div>

            {/* Ask AI Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Ask AI Agent</h3>
                  <p className="text-xs text-gray-500 mt-1">Get personalized insights and recommendations</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <textarea
                  value={askPrompt}
                  onChange={(e) => setAskPrompt(e.target.value)}
                  rows={4}
                  placeholder="Ask anything... e.g., 'If sales drop 20% next month, what actions should I take?' or 'What are the top 3 opportunities for growth?'"
                  className="w-full border-2 border-gray-200 rounded-lg p-4 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
                <div className="flex gap-3">
                  <button
                    onClick={askGemini}
                    disabled={askLoading || !askPrompt.trim()}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {askLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Ask AI
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setAskPrompt(''); setAskResponse(null); }}
                    className="px-6 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* AI Response */}
                <div className="mt-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="font-bold text-gray-900">AI Response</span>
                  </div>
                  {askResponse ? (
                    <MarkdownResponse text={typeof askResponse === 'string' ? askResponse : JSON.stringify(askResponse, null, 2)} />
                  ) : (
                    <div className="text-gray-400 italic">
                      No response yet. Ask a question above to get AI-powered insights.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Seasonality */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Monthly Seasonality Pattern</h3>
                  <p className="text-xs text-gray-500 mt-1">Historical sales trends</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {data.monthly_series && data.monthly_series.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.monthly_series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#16A34A"
                      strokeWidth={3}
                      dot={{ fill: '#16A34A', r: 5 }}
                      name="Sales"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">No seasonality data</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}