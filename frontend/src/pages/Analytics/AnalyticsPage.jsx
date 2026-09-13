import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  ShoppingBag,
  Filter,
  Calendar,
  Layers,
  MapPin,
  Grid,
  Package,
  Flame,
  ArrowUpRight,
  Activity,
  Sparkles,
  CheckCircle2,
  Sliders,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell
} from 'recharts';
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
    { time: '08:00', shoppers: 24, checkout_queue: 3, conversion_rate: '42%' },
    { time: '10:00', shoppers: 58, checkout_queue: 6, conversion_rate: '54%' },
    { time: '12:00', shoppers: 112, checkout_queue: 14, conversion_rate: '68%' },
    { time: '14:00', shoppers: 95, checkout_queue: 9, conversion_rate: '61%' },
    { time: '16:00', shoppers: 140, checkout_queue: 18, conversion_rate: '74%' },
    { time: '18:00', shoppers: 185, checkout_queue: 24, conversion_rate: '82%' },
    { time: '20:00', shoppers: 92, checkout_queue: 8, conversion_rate: '58%' }
  ];

  // 2. Dwell Time Distribution Data
  const dwellData = [
    { range: '0-15s', shoppers: 42, label: 'Browsers', color: '#6366F1' },
    { range: '15-30s', shoppers: 88, label: 'Standard', color: '#3B82F6' },
    { range: '30-60s', shoppers: 124, label: 'Engaged', color: '#10B981' },
    { range: '60-120s', shoppers: 52, label: 'High Focus', color: '#F59E0B' },
    { range: '>120s', shoppers: 18, label: 'Decision Stalled', color: '#EF4444' }
  ];

  // 3. Attention Trend Data
  const attentionTrendData = [
    { frame: '00:30', gaze_index: 68, attention_events: 12, dwell_peak: 24 },
    { frame: '01:00', gaze_index: 74, attention_events: 19, dwell_peak: 32 },
    { frame: '01:30', gaze_index: 89, attention_events: 34, dwell_peak: 48 },
    { frame: '02:00', gaze_index: 94, attention_events: 48, dwell_peak: 56 },
    { frame: '02:30', gaze_index: 82, attention_events: 28, dwell_peak: 38 }
  ];

  // 4. Product Ranking Data (Vertical representation)
  const productRankingData = [
    { name: 'Sparkling Lemonade 6-Pack', score: 94.2, views: 245, pickups: 184, conversion: '75.1%' },
    { name: 'boAt Rockerz 255 Earphones', score: 88.5, views: 198, pickups: 142, conversion: '71.7%' },
    { name: 'Stainless Steel Knife Set', score: 84.1, views: 165, pickups: 112, conversion: '67.8%' },
    { name: 'Crispy Potato Chips 150g', score: 79.4, views: 310, pickups: 210, conversion: '67.7%' },
    { name: 'Organic Cold Brew Coffee', score: 76.0, views: 142, pickups: 89, conversion: '62.6%' }
  ];

  // 5. Shelf Comparison Data
  const shelfComparisonData = [
    { shelf: 'Shelf B (Beverages)', visits: 248, attention: 94.2, dwell_sec: 48, engagement: 92.4 },
    { shelf: 'Shelf A (Snacks)', visits: 210, attention: 88.5, dwell_sec: 34, engagement: 86.1 },
    { shelf: 'Shelf D (Electronics)', visits: 180, attention: 95.8, dwell_sec: 52, engagement: 94.0 },
    { shelf: 'Shelf C (Utensils)', visits: 142, attention: 82.1, dwell_sec: 29, engagement: 79.5 }
  ];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <Breadcrumbs
        title="Centralized Visualization & Analytics Module"
        subtitle="Vertical unified analytics stream, multi-level store filter controls, gaze trend analysis, and heatmaps"
      />

      {/* TOP VERTICAL METRICS OVERVIEW STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Store Shoppers</span>
            <div className="text-xl font-black text-white">706 <span className="text-xs font-normal text-emerald-400 font-mono">+14.2%</span></div>
          </div>
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#111827] border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Avg Dwell Duration</span>
            <div className="text-xl font-black text-white">48.2s <span className="text-xs font-normal text-purple-400 font-mono">+6.4s</span></div>
          </div>
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#111827] border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Peak Gaze Fixation</span>
            <div className="text-xl font-black text-white">94.2/100 <span className="text-xs font-normal text-cyan-400 font-mono">High</span></div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#111827] border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Top Converting Zone</span>
            <div className="text-xl font-black text-white">Beverages <span className="text-xs font-normal text-amber-400 font-mono">Shelf B</span></div>
          </div>
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* MULTI-LEVEL FILTER BAR (PRD Section 6 Compliance) */}
      <div className="p-5 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Multi-Level Analytics Filter Bar</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Vertical Layout Stream Active</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Filtered
            </span>
          </div>
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

      {/* VERTICAL ANALYTICS STREAM (All Analytics Vertical Layout) */}
      <div className="flex flex-col gap-8">

        {/* MODULE 1: Shopper Traffic & Hourly Footfall Stream */}
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                1. Shopper Traffic & Hourly Footfall Analysis
              </h3>
              <p className="text-xs text-slate-400">Vertical timeline tracking total in-store shoppers and checkout queue bottleneck density</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono rounded-xl font-bold">
                Vertical Area Stream
              </span>
              <span className="text-xs text-slate-400 font-mono">Peak: 18:00 (185 Shoppers)</span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorShoppers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '13px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area type="monotone" dataKey="shoppers" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorShoppers)" name="Total Shoppers Footfall" />
                <Area type="monotone" dataKey="checkout_queue" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorQueue)" name="Checkout Queue Bottleneck" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MODULE 2: Dwell-Time Distribution Analysis */}
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                2. Dwell-Time Duration & Engagement Histogram
              </h3>
              <p className="text-xs text-slate-400">Vertical distribution of shopper dwell duration segments across all active shelves</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono rounded-xl font-bold">
                Vertical Bar Histogram
              </span>
              <span className="text-xs text-slate-400 font-mono">Dominant Segment: 30-60s (Engaged)</span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dwellData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="range" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '13px' }}
                />
                <Bar dataKey="shoppers" name="Shopper Count" radius={[8, 8, 0, 0]}>
                  {dwellData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dwell Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {dwellData.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">{item.range}</div>
                <div className="text-lg font-bold text-white">{item.shoppers}</div>
                <div className="text-[10px] font-semibold" style={{ color: item.color }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MODULE 3: Attention Fixation & Gaze Index Trend */}
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                3. Attention Fixation & Gaze Trend Over Time
              </h3>
              <p className="text-xs text-slate-400">Continuous gaze index score and recorded attention fixation events across surveillance frames</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono rounded-xl font-bold">
                Vertical Gaze Line
              </span>
              <span className="text-xs text-slate-400 font-mono">Max Gaze Index: 94/100</span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attentionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="frame" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '13px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="gaze_index" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} name="Gaze Index Score (0-100)" />
                <Line type="monotone" dataKey="attention_events" stroke="#06B6D4" strokeWidth={3} dot={{ r: 5 }} name="Attention Fixation Events" />
                <Line type="monotone" dataKey="dwell_peak" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" name="Dwell Peak Intensity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MODULE 4: Product Attractiveness & Conversion Ranking */}
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                4. Vertical Product Attractiveness & Pickup Ranking
              </h3>
              <p className="text-xs text-slate-400">Algorithmic weighted scoring based on shopper product views, physical pickups, and gaze duration</p>
            </div>
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono rounded-xl font-bold">
              Vertical Ranking Stream
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Chart Column */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={productRankingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis type="number" stroke="#64748B" fontSize={12} domain={[0, 100]} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={150} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '13px' }}
                  />
                  <Bar dataKey="score" fill="#06B6D4" radius={[0, 8, 8, 0]} name="Attractiveness Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Vertical Cards Breakdown */}
            <div className="space-y-3">
              {productRankingData.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-extrabold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400">Views: {item.views} • Pickups: {item.pickups}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-extrabold text-cyan-300">{item.score}/100</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">{item.conversion} Conv.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODULE 5: Shelf Performance & Engagement Comparison */}
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-amber-400" />
                5. Shelf Performance & Spatial Engagement Comparison
              </h3>
              <p className="text-xs text-slate-400">Comparative metrics across store shelf units evaluating total visits vs spatial engagement score</p>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono rounded-xl font-bold">
              Multi-Metric Vertical Bar
            </span>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelfComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="shelf" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '13px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="visits" fill="#3B82F6" name="Total Visits" radius={[6, 6, 0, 0]} />
                <Bar dataKey="attention" fill="#10B981" name="Attention Score" radius={[6, 6, 0, 0]} />
                <Bar dataKey="engagement" fill="#F59E0B" name="Engagement Score" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MODULE 6: Multi-Layer Spatial Heatmaps Module */}
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                6. Multi-Layer Spatial Heatmaps Module
              </h3>
              <p className="text-xs text-slate-400">Interactive vertical floorplan visualization of Movement, Attention Gaze, and Shelf Engagement heatmaps</p>
            </div>

            {/* Heatmap Mode Selector */}
            <div className="flex bg-slate-900 p-1 border border-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveHeatmapType('movement')}
                className={`px-3 py-1.5 rounded-lg transition ${activeHeatmapType === 'movement' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Movement Heatmap
              </button>
              <button
                onClick={() => setActiveHeatmapType('attention')}
                className={`px-3 py-1.5 rounded-lg transition ${activeHeatmapType === 'attention' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Attention Heatmap
              </button>
              <button
                onClick={() => setActiveHeatmapType('shelf')}
                className={`px-3 py-1.5 rounded-lg transition ${activeHeatmapType === 'shelf' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Shelf Engagement
              </button>
            </div>
          </div>

          {/* Interactive Heatmap Floorplan Representation */}
          <div className="relative h-80 w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-purple-950/20 to-rose-950/20 pointer-events-none"></div>

            {/* Active Mode Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-700 text-slate-200 rounded-full text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Active Layer: <span className="text-white font-bold capitalize">{activeHeatmapType} Engine</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Resolution: 1920x1080 Spatial Grid</span>
            </div>

            {/* Simulated Heatmap Zones */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-56 relative z-10 text-xs font-mono font-bold pt-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col justify-between text-blue-300 shadow-lg hover:border-blue-400 transition">
                <div className="flex items-center justify-between">
                  <span>Entrance Zone</span>
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-blue-200">Density: 24%</div>
                  <span className="text-[11px] text-blue-400 font-normal">Low Flow Intensity</span>
                </div>
              </div>

              <div className="p-4 bg-rose-500/30 border border-rose-500/60 rounded-2xl flex flex-col justify-between text-rose-100 shadow-lg hover:border-rose-400 transition animate-pulse">
                <div className="flex items-center justify-between">
                  <span>Beverage Zone</span>
                  <Flame className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">Heat Intensity: 94%</div>
                  <span className="text-[11px] font-bold text-rose-300">🔥 Critical Hotspot Zone</span>
                </div>
              </div>

              <div className="p-4 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex flex-col justify-between text-amber-200 shadow-lg hover:border-amber-400 transition">
                <div className="flex items-center justify-between">
                  <span>Snack Zone</span>
                  <Grid className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-amber-200">Density: 68%</div>
                  <span className="text-[11px] text-amber-400 font-normal">Medium Engagement</span>
                </div>
              </div>

              <div className="p-4 bg-purple-500/20 border border-purple-500/40 rounded-2xl flex flex-col justify-between text-purple-200 shadow-lg hover:border-purple-400 transition">
                <div className="flex items-center justify-between">
                  <span>Checkout Zone</span>
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-purple-200">Density: 58%</div>
                  <span className="text-[11px] text-purple-400 font-normal">Queue Concentration</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
