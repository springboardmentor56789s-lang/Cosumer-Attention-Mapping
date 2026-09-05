import React, { useState } from 'react';
import { BarChart3, TrendingUp, Eye, Clock, ShoppingBag, Filter, Calendar, Layers, MapPin, Grid, Package, Flame } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import Breadcrumbs from '../../components/layout/Breadcrumbs';

export default function AnalyticsPage() {
  // Multi-Level Filter Controls (PRD Section 6 Compliance)
  const [selectedStore, setSelectedStore] = useState('D-Mart Flagship Superstore');
  const [selectedVideo, setSelectedVideo] = useState('Surveillance_Clip_01.mp4');
  const [selectedDate, setSelectedDate] = useState('2026-09-04');
  const [selectedTimeRange, setSelectedTimeRange] = useState('17:00 - 19:00');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [selectedShelf, setSelectedShelf] = useState('All Shelves');
  const [selectedProduct, setSelectedProduct] = useState('All Products');

  // Interactive Heatmap Toggle State
  const [activeHeatmapType, setActiveHeatmapType] = useState('movement'); // movement, attention, shelf

  // 1. Shopper Traffic Data
  const trafficData = [
    { time: '08:00', shoppers: 24, checkout_queue: 3 },
    { time: '10:00', shoppers: 58, checkout_queue: 6 },
    { time: '12:00', shoppers: 112, checkout_queue: 14 },
    { time: '14:00', shoppers: 95, checkout_queue: 9 },
    { time: '16:00', shoppers: 140, checkout_queue: 18 },
    { time: '18:00', shoppers: 185, checkout_queue: 24 },
    { time: '20:00', shoppers: 92, checkout_queue: 8 }
  ];

  // 2. Dwell Time Distribution Data
  const dwellData = [
    { range: '0-15s', shoppers: 42, label: 'Browsers' },
    { range: '15-30s', shoppers: 88, label: 'Standard' },
    { range: '30-60s', shoppers: 124, label: 'Engaged' },
    { range: '60-120s', shoppers: 52, label: 'High Focus' },
    { range: '>120s', shoppers: 18, label: 'Decision Stalled' }
  ];

  // 3. Attention Trend Data
  const attentionTrendData = [
    { frame: '00:30', gaze_index: 68, attention_events: 12 },
    { frame: '01:00', gaze_index: 74, attention_events: 19 },
    { frame: '01:30', gaze_index: 89, attention_events: 34 },
    { frame: '02:00', gaze_index: 94, attention_events: 48 },
    { frame: '02:30', gaze_index: 82, attention_events: 28 }
  ];

  // 4. Product Ranking Data
  const productRankingData = [
    { name: 'Sparkling Lemonade 6-Pack', score: 94.2, views: 245, pickups: 184 },
    { name: 'boAt Rockerz 255 Earphones', score: 88.5, views: 198, pickups: 142 },
    { name: 'Stainless Steel Knife Set', score: 84.1, views: 165, pickups: 112 },
    { name: 'Crispy Potato Chips 150g', score: 79.4, views: 310, pickups: 210 },
    { name: 'Organic Cold Brew Coffee', score: 76.0, views: 142, pickups: 89 }
  ];

  // 5. Shelf Comparison Data
  const shelfComparisonData = [
    { shelf: 'Shelf B (Beverages)', visits: 248, attention: 94.2, dwell_sec: 48, engagement: 92.4 },
    { shelf: 'Shelf A (Snacks)', visits: 210, attention: 88.5, dwell_sec: 34, engagement: 86.1 },
    { shelf: 'Shelf D (Electronics)', visits: 180, attention: 95.8, dwell_sec: 52, engagement: 94.0 },
    { shelf: 'Shelf C (Utensils)', visits: 142, attention: 82.1, dwell_sec: 29, engagement: 79.5 }
  ];

  return (
    <div className="space-y-6 font-sans">
      <Breadcrumbs
        title="Centralized Visualization & Analytics Module"
        subtitle="Multi-level store filter controls, shopper traffic, gaze trend analysis, and heatmaps"
      />

      {/* MULTI-LEVEL FILTER BAR (PRD Section 6 Compliance) */}
      <div className="p-5 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Multi-Level Analytics Filter Bar</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Dynamic KPI & Visualization Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {/* Filter 1: Store */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono block mb-1">Store</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option>D-Mart Flagship Superstore</option>
              <option>D-Mart Express Counter 1</option>
              <option>D-Mart Westside Supercenter</option>
            </select>
          </div>

          {/* Filter 2: Video */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono block mb-1">Video</label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option>Surveillance_Clip_01.mp4</option>
              <option>Entrance_Gate_A_Stream.mp4</option>
              <option>Row_2_Utensils_Aisle.mp4</option>
            </select>
          </div>

          {/* Filter 3: Date */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono block mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>

          {/* Filter 4: Time Range */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono block mb-1">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option>17:00 - 19:00</option>
              <option>08:00 - 12:00</option>
              <option>12:00 - 17:00</option>
              <option>Full Operating Hours</option>
            </select>
          </div>

          {/* Filter 5: Zone */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono block mb-1">Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option>All Zones</option>
              <option>Entrance Zone</option>
              <option>Beverage Zone</option>
              <option>Snack Zone</option>
              <option>Checkout Zone</option>
            </select>
          </div>

          {/* Filter 6: Shelf */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono block mb-1">Shelf</label>
            <select
              value={selectedShelf}
              onChange={(e) => setSelectedShelf(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option>All Shelves</option>
              <option>Shelf B (Beverages)</option>
              <option>Shelf A (Snacks)</option>
              <option>Shelf D (Electronics)</option>
            </select>
          </div>

          {/* Filter 7: Product */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono block mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option>All Products</option>
              <option>Sparkling Lemonade 6-Pack</option>
              <option>boAt Rockerz 255 Earphones</option>
              <option>Crispy Potato Chips 150g</option>
            </select>
          </div>
        </div>
      </div>

      {/* VISUALIZATION MODULE GRID (6 Visualizations - PRD Section 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Shopper Traffic Chart */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                1. Shopper Traffic & Hourly Footfall
              </h3>
              <p className="text-xs text-slate-400">Total shoppers and queue length over operating hours</p>
            </div>
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono rounded-lg">
              Hourly Area Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Area type="monotone" dataKey="shoppers" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Total Shoppers" />
                <Area type="monotone" dataKey="checkout_queue" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} name="Checkout Queue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Dwell-Time Distribution */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                2. Dwell-Time Distribution
              </h3>
              <p className="text-xs text-slate-400">Shopper dwell duration breakdown across store shelves</p>
            </div>
            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono rounded-lg">
              Distribution Histogram
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dwellData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="range" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="shoppers" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Shopper Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Attention Trend */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                3. Attention Fixation Trend Over Time
              </h3>
              <p className="text-xs text-slate-400">Real-time gaze index and attention event count</p>
            </div>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono rounded-lg">
              Line Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attentionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="frame" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Line type="monotone" dataKey="gaze_index" stroke="#10B981" strokeWidth={2} name="Gaze Index (0-100)" />
                <Line type="monotone" dataKey="attention_events" stroke="#06B6D4" strokeWidth={2} name="Attention Fixations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Product Ranking */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                4. Product Attractiveness Ranking
              </h3>
              <p className="text-xs text-slate-400">Weighted scoring (Views, Pickups & Gaze Duration)</p>
            </div>
            <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono rounded-lg">
              Horizontal Ranking Bar
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={productRankingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="score" fill="#06B6D4" radius={[0, 6, 6, 0]} name="Attractiveness Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Shelf Comparison */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-amber-400" />
                5. Shelf Performance Comparison
              </h3>
              <p className="text-xs text-slate-400">Visits, attention score, dwell, and engagement score</p>
            </div>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono rounded-lg">
              Multi-Metric Bar Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelfComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="shelf" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="visits" fill="#3B82F6" name="Visits" radius={[4, 4, 0, 0]} />
                <Bar dataKey="engagement" fill="#F59E0B" name="Engagement Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Multi-layer Heatmaps Engine */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                6. Multi-Layer Spatial Heatmaps Module
              </h3>
              <p className="text-xs text-slate-400">Switch between Movement, Attention, and Shelf Engagement heatmaps</p>
            </div>

            {/* Heatmap Type Selector */}
            <div className="flex bg-slate-900 p-1 border border-slate-800 rounded-xl text-[10px] font-semibold">
              <button
                onClick={() => setActiveHeatmapType('movement')}
                className={`px-2.5 py-1 rounded-lg transition ${activeHeatmapType === 'movement' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                Movement
              </button>
              <button
                onClick={() => setActiveHeatmapType('attention')}
                className={`px-2.5 py-1 rounded-lg transition ${activeHeatmapType === 'attention' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
              >
                Attention
              </button>
              <button
                onClick={() => setActiveHeatmapType('shelf')}
                className={`px-2.5 py-1 rounded-lg transition ${activeHeatmapType === 'shelf' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
              >
                Shelf Engagement
              </button>
            </div>
          </div>

          {/* Interactive Heatmap Floorplan Representation */}
          <div className="relative h-64 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-purple-950/20 to-rose-950/20 pointer-events-none"></div>

            {/* Simulated Heatmap Zones */}
            <div className="grid grid-cols-4 gap-2 h-full text-[11px] font-mono font-bold">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex flex-col justify-between text-blue-300">
                <span>Entrance Zone</span>
                <span className="text-xs text-blue-400">Low Intensity (0.24)</span>
              </div>
              <div className="p-3 bg-rose-500/30 border border-rose-500/50 rounded-xl flex flex-col justify-between text-rose-200 animate-pulse">
                <span>Beverage Zone</span>
                <span className="text-xs font-extrabold text-rose-400">🔥 High Heat (0.94)</span>
              </div>
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl flex flex-col justify-between text-amber-300">
                <span>Snack Zone</span>
                <span className="text-xs text-amber-400">Medium Heat (0.68)</span>
              </div>
              <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-xl flex flex-col justify-between text-purple-300">
                <span>Checkout Zone</span>
                <span className="text-xs text-purple-400">Moderate (0.58)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
