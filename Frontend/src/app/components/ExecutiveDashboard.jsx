import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Eye, Users, ShoppingBag, Activity, ShieldCheck, Video, Award } from 'lucide-react';

const COLOR_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ExecutiveDashboard() {
  const [activeRole, setActiveRole] = useState('store_manager');
  const [storeId, setStoreId] = useState('STORE_001');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData(activeRole);
  }, [activeRole, storeId]);

  const fetchDashboardData = async (role) => {
    setLoading(true);
    try {
      const endpointMap = {
        store_manager: `/api/v1/dashboards/store-manager?store_id=${storeId}`,
        retail_analyst: `/api/v1/dashboards/retail-analyst?store_id=${storeId}`,
        marketing_manager: `/api/v1/dashboards/marketing-manager?store_id=${storeId}`,
        admin: `/api/v1/dashboards/admin`
      };
      // Fetch logic (replace mock with actual API call)
      const res = await fetch(endpointMap[role]);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="text-blue-500" /> Consumer Attention Intelligence Platform
          </h1>
          <p className="text-slate-400 text-sm">Executive Analytics & Merchandising Insights Dashboard</p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          {[
            { id: 'store_manager', label: 'Store Manager' },
            { id: 'retail_analyst', label: 'Retail Analyst' },
            { id: 'marketing_manager', label: 'Marketing' },
            { id: 'admin', label: 'System Admin' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRole(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeRole === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="flex justify-center items-center h-64 text-slate-400">Loading metrics...</div>
      ) : (
        <>
          {/* Store Manager View */}
          {activeRole === 'store_manager' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Total Foot Traffic" value={data.total_foot_traffic} icon={<Users className="text-blue-400" />} />
                <MetricCard title="Avg Dwell Time" value={`${data.avg_dwell_time_seconds}s`} icon={<Activity className="text-emerald-400" />} />
                <MetricCard title="Product Pickups" value={data.total_product_pickups} icon={<ShoppingBag className="text-amber-400" />} />
                <MetricCard title="Conversion Rate" value={`${data.conversion_rate_percentage}%`} icon={<Award className="text-purple-400" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">Hourly Store Traffic</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.hourly_traffic}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">Top Performing Shelves</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.top_performing_shelves}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="shelf_id" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
                        <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retail Analyst View */}
          {activeRole === 'retail_analyst' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">Shopper Segmentation distribution</h3>
                  <div className="h-64 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(data.consumer_segments).map(([name, value]) => ({ name, value }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {Object.keys(data.consumer_segments).map((_, idx) => (
                            <Cell key={idx} fill={COLOR_PALETTE[idx % COLOR_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">Shopper Funnel Dropoff (%)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={Object.entries(data.journey_dropoff_rates).map(([stage, rate]) => ({ stage, rate }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" stroke="#94a3b8" />
                        <YAxis type="category" dataKey="stage" stroke="#94a3b8" width={140} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
                        <Bar dataKey="rate" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marketing Manager View */}
          {activeRole === 'marketing_manager' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard title="Active Campaigns" value={data.active_campaigns} icon={<Activity className="text-blue-400" />} />
                <MetricCard title="Promo Visibility Score" value={`${data.promotional_visibility_score}%`} icon={<Eye className="text-amber-400" />} />
                <MetricCard title="Engagement Rate" value={`${data.campaign_engagement_rate}%`} icon={<Award className="text-emerald-400" />} />
              </div>
            </div>
          )}

          {/* System Admin View */}
          {activeRole === 'admin' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Active Cameras" value={`${data.active_cameras} / ${data.total_cameras}`} icon={<Video className="text-emerald-400" />} />
                <MetricCard title="System Latency" value={`${data.system_latency_ms} ms`} icon={<Activity className="text-blue-400" />} />
                <MetricCard title="API Requests (24h)" value={data.api_request_count} icon={<ShieldCheck className="text-purple-400" />} />
                <MetricCard title="System Health" value="OPTIMAL" icon={<ShieldCheck className="text-emerald-400" />} />
              </div>

              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Edge Camera Stream Status</h3>
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-700/50 uppercase text-xs text-slate-400">
                    <tr>
                      <th className="p-3">Camera Node ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Stream FPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {data.camera_status_list.map((cam, i) => (
                      <tr key={i}>
                        <td className="p-3 font-medium">{cam.camera_id}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${cam.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {cam.status}
                          </span>
                        </td>
                        <td className="p-3">{cam.fps} FPS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex justify-between items-center">
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="p-3 bg-slate-700/50 rounded-lg">{icon}</div>
    </div>
  );
}