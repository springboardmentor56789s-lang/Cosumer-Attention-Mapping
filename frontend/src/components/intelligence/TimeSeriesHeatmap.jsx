import React, { useState, useMemo } from 'react';
import {
  Clock, Calendar, Footprints, Eye, Sparkles, Flame, Trophy,
  Info, Filter, Activity, TrendingUp, ArrowUpRight, Zap, Layers
} from 'lucide-react';

/**
 * @typedef {Object} TimeSeriesDataPoint
 * @property {string} zoneId - Zone Identifier
 * @property {string} zoneName - Zone Display Name
 * @property {string} timeSlot - Time Slot (e.g. '13:00')
 * @property {number} value - Metric Index Value (0-100)
 * @property {number} shopperCount - Estimated Cohort Shoppers
 */

/**
 * @typedef {'footfall' | 'gaze' | 'dwell'} MetricType
 * @typedef {'today' | 'yesterday' | 'avg7d'} DateFilterType
 */

export default function TimeSeriesHeatmap() {
  const [selectedMetric, setSelectedMetric] = useState('footfall');
  const [selectedDate, setSelectedDate] = useState('today');
  const [colorPalette, setColorPalette] = useState('thermal'); // 'thermal', 'cyber', 'plasma', 'emerald'
  const [hoveredCell, setHoveredCell] = useState(null);

  // Operational Time Slots (X-Axis)
  const timeSlots = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];

  // Store Zones (Y-Axis)
  const storeZones = [
    { id: 'z1', name: 'Row 1 Snacks' },
    { id: 'z2', name: 'Row 2 Utensils' },
    { id: 'z3', name: 'Row 3 Apparel' },
    { id: 'z4', name: 'Row 4 Electronics' },
    { id: 'z5', name: 'Checkout 4' },
    { id: 'z6', name: 'Gate A Entry' },
    { id: 'z7', name: 'Promo Stand' },
    { id: 'z8', name: 'Bakery Aisle' }
  ];

  // Comprehensive Mock Time-Series Matrix Dataset
  const matrixDataset = useMemo(() => ({
    today: {
      footfall: {
        z1: { '09:00': 42, '11:00': 68, '13:00': 85, '15:00': 74, '17:00': 92, '19:00': 88, '21:00': 55 },
        z2: { '09:00': 35, '11:00': 58, '13:00': 90, '15:00': 88, '17:00': 96, '19:00': 78, '21:00': 40 },
        z3: { '09:00': 18, '11:00': 32, '13:00': 45, '15:00': 40, '17:00': 52, '19:00': 48, '21:00': 22 },
        z4: { '09:00': 50, '11:00': 75, '13:00': 88, '15:00': 94, '17:00': 98, '19:00': 90, '21:00': 62 },
        z5: { '09:00': 60, '11:00': 82, '13:00': 95, '15:00': 90, '17:00': 99, '19:00': 92, '21:00': 70 },
        z6: { '09:00': 88, '11:00': 94, '13:00': 98, '15:00': 92, '17:00': 96, '19:00': 85, '21:00': 65 },
        z7: { '09:00': 45, '11:00': 62, '13:00': 82, '15:00': 78, '17:00': 89, '19:00': 75, '21:00': 48 },
        z8: { '09:00': 52, '11:00': 70, '13:00': 76, '15:00': 68, '17:00': 82, '19:00': 64, '21:00': 38 }
      },
      gaze: {
        z1: { '09:00': 50, '11:00': 72, '13:00': 88, '15:00': 80, '17:00': 94, '19:00': 90, '21:00': 58 },
        z2: { '09:00': 48, '11:00': 65, '13:00': 94, '15:00': 92, '17:00': 98, '19:00': 84, '21:00': 45 },
        z3: { '09:00': 25, '11:00': 38, '13:00': 50, '15:00': 44, '17:00': 60, '19:00': 52, '21:00': 28 },
        z4: { '09:00': 62, '11:00': 84, '13:00': 96, '15:00': 98, '17:00': 100, '19:00': 95, '21:00': 70 },
        z5: { '09:00': 40, '11:00': 55, '13:00': 72, '15:00': 68, '17:00': 78, '19:00': 70, '21:00': 48 },
        z6: { '09:00': 35, '11:00': 42, '13:00': 48, '15:00': 45, '17:00': 50, '19:00': 42, '21:00': 30 },
        z7: { '09:00': 58, '11:00': 76, '13:00': 90, '15:00': 86, '17:00': 95, '19:00': 88, '21:00': 56 },
        z8: { '09:00': 60, '11:00': 74, '13:00': 80, '15:00': 75, '17:00': 86, '19:00': 72, '21:00': 42 }
      },
      dwell: {
        z1: { '09:00': 28, '11:00': 45, '13:00': 74, '15:00': 62, '17:00': 82, '19:00': 78, '21:00': 44 },
        z2: { '09:00': 55, '11:00': 78, '13:00': 98, '15:00': 95, '17:00': 99, '19:00': 88, '21:00': 52 },
        z3: { '09:00': 15, '11:00': 24, '13:00': 38, '15:00': 32, '17:00': 44, '19:00': 36, '21:00': 18 },
        z4: { '09:00': 48, '11:00': 70, '13:00': 86, '15:00': 90, '17:00': 94, '19:00': 85, '21:00': 58 },
        z5: { '09:00': 65, '11:00': 84, '13:00': 96, '15:00': 92, '17:00': 98, '19:00': 90, '21:00': 68 },
        z6: { '09:00': 12, '11:00': 18, '13:00': 25, '15:00': 20, '17:00': 28, '19:00': 22, '21:00': 14 },
        z7: { '09:00': 32, '11:00': 54, '13:00': 70, '15:00': 66, '17:00': 78, '19:00': 68, '21:00': 38 },
        z8: { '09:00': 40, '11:00': 58, '13:00': 65, '15:00': 60, '17:00': 72, '19:00': 58, '21:00': 32 }
      }
    },
    yesterday: {
      footfall: {
        z1: { '09:00': 38, '11:00': 62, '13:00': 80, '15:00': 70, '17:00': 88, '19:00': 82, '21:00': 50 },
        z2: { '09:00': 30, '11:00': 52, '13:00': 84, '15:00': 82, '17:00': 90, '19:00': 72, '21:00': 36 },
        z3: { '09:00': 15, '11:00': 28, '13:00': 40, '15:00': 36, '17:00': 48, '19:00': 42, '21:00': 20 },
        z4: { '09:00': 45, '11:00': 70, '13:00': 82, '15:00': 88, '17:00': 92, '19:00': 84, '21:00': 58 },
        z5: { '09:00': 55, '11:00': 78, '13:00': 90, '15:00': 85, '17:00': 94, '19:00': 88, '21:00': 64 },
        z6: { '09:00': 82, '11:00': 90, '13:00': 94, '15:00': 88, '17:00': 92, '19:00': 80, '21:00': 60 },
        z7: { '09:00': 40, '11:00': 58, '13:00': 76, '15:00': 72, '17:00': 84, '19:00': 70, '21:00': 42 },
        z8: { '09:00': 48, '11:00': 65, '13:00': 72, '15:00': 64, '17:00': 78, '19:00': 60, '21:00': 34 }
      },
      gaze: {
        z1: { '09:00': 45, '11:00': 68, '13:00': 82, '15:00': 76, '17:00': 88, '19:00': 84, '21:00': 52 },
        z2: { '09:00': 42, '11:00': 60, '13:00': 88, '15:00': 86, '17:00': 92, '19:00': 78, '21:00': 40 },
        z3: { '09:00': 20, '11:00': 32, '13:00': 44, '15:00': 38, '17:00': 54, '19:00': 46, '21:00': 24 },
        z4: { '09:00': 56, '11:00': 78, '13:00': 90, '15:00': 92, '17:00': 96, '19:00': 88, '21:00': 64 },
        z5: { '09:00': 36, '11:00': 50, '13:00': 66, '15:00': 62, '17:00': 72, '19:00': 64, '21:00': 42 },
        z6: { '09:00': 30, '11:00': 38, '13:00': 44, '15:00': 40, '17:00': 46, '19:00': 38, '21:00': 26 },
        z7: { '09:00': 52, '11:00': 70, '13:00': 84, '15:00': 80, '17:00': 90, '19:00': 82, '21:00': 50 },
        z8: { '09:00': 54, '11:00': 68, '13:00': 75, '15:00': 70, '17:00': 80, '19:00': 66, '21:00': 38 }
      },
      dwell: {
        z1: { '09:00': 24, '11:00': 40, '13:00': 68, '15:00': 58, '17:00': 76, '19:00': 72, '21:00': 38 },
        z2: { '09:00': 50, '11:00': 72, '13:00': 92, '15:00': 90, '17:00': 94, '19:00': 82, '21:00': 46 },
        z3: { '09:00': 12, '11:00': 20, '13:00': 32, '15:00': 28, '17:00': 38, '19:00': 30, '21:00': 15 },
        z4: { '09:00': 42, '11:00': 64, '13:00': 80, '15:00': 84, '17:00': 88, '19:00': 78, '21:00': 52 },
        z5: { '09:00': 60, '11:00': 78, '13:00': 90, '15:00': 86, '17:00': 92, '19:00': 84, '21:00': 62 },
        z6: { '09:00': 10, '11:00': 15, '13:00': 20, '15:00': 18, '17:00': 24, '19:00': 18, '21:00': 12 },
        z7: { '09:00': 28, '11:00': 48, '13:00': 64, '15:00': 60, '17:00': 72, '19:00': 62, '21:00': 32 },
        z8: { '09:00': 35, '11:00': 52, '13:00': 60, '15:00': 55, '17:00': 66, '19:00': 52, '21:00': 28 }
      }
    },
    avg7d: {
      footfall: {
        z1: { '09:00': 40, '11:00': 65, '13:00': 82, '15:00': 72, '17:00': 90, '19:00': 85, '21:00': 52 },
        z2: { '09:00': 32, '11:00': 55, '13:00': 87, '15:00': 85, '17:00': 93, '19:00': 75, '21:00': 38 },
        z3: { '09:00': 16, '11:00': 30, '13:00': 42, '15:00': 38, '17:00': 50, '19:00': 45, '21:00': 21 },
        z4: { '09:00': 48, '11:00': 72, '13:00': 85, '15:00': 91, '17:00': 95, '19:00': 87, '21:00': 60 },
        z5: { '09:00': 58, '11:00': 80, '13:00': 92, '15:00': 88, '17:00': 96, '19:00': 90, '21:00': 67 },
        z6: { '09:00': 85, '11:00': 92, '13:00': 96, '15:00': 90, '17:00': 94, '19:00': 82, '21:00': 62 },
        z7: { '09:00': 42, '11:00': 60, '13:00': 79, '15:00': 75, '17:00': 86, '19:00': 72, '21:00': 45 },
        z8: { '09:00': 50, '11:00': 68, '13:00': 74, '15:00': 66, '17:00': 80, '19:00': 62, '21:00': 36 }
      },
      gaze: {
        z1: { '09:00': 48, '11:00': 70, '13:00': 85, '15:00': 78, '17:00': 91, '19:00': 87, '21:00': 55 },
        z2: { '09:00': 45, '11:00': 62, '13:00': 91, '15:00': 89, '17:00': 95, '19:00': 81, '21:00': 42 },
        z3: { '09:00': 22, '11:00': 35, '13:00': 47, '15:00': 41, '17:00': 57, '19:00': 49, '21:00': 26 },
        z4: { '09:00': 59, '11:00': 81, '13:00': 93, '15:00': 95, '17:00': 98, '19:00': 91, '21:00': 67 },
        z5: { '09:00': 38, '11:00': 52, '13:00': 69, '15:00': 65, '17:00': 75, '19:00': 67, '21:00': 45 },
        z6: { '09:00': 32, '11:00': 40, '13:00': 46, '15:00': 42, '17:00': 48, '19:00': 40, '21:00': 28 },
        z7: { '09:00': 55, '11:00': 73, '13:00': 87, '15:00': 83, '17:00': 92, '19:00': 85, '21:00': 53 },
        z8: { '09:00': 57, '11:00': 71, '13:00': 77, '15:00': 72, '17:00': 83, '19:00': 69, '21:00': 40 }
      },
      dwell: {
        z1: { '09:00': 26, '11:00': 42, '13:00': 71, '15:00': 60, '17:00': 79, '19:00': 75, '21:00': 41 },
        z2: { '09:00': 52, '11:00': 75, '13:00': 95, '15:00': 92, '17:00': 96, '19:00': 85, '21:00': 49 },
        z3: { '09:00': 14, '11:00': 22, '13:00': 35, '15:00': 30, '17:00': 41, '19:00': 33, '21:00': 16 },
        z4: { '09:00': 45, '11:00': 67, '13:00': 83, '15:00': 87, '17:00': 91, '19:00': 81, '21:00': 55 },
        z5: { '09:00': 62, '11:00': 81, '13:00': 93, '15:00': 89, '17:00': 95, '19:00': 87, '21:00': 65 },
        z6: { '09:00': 11, '11:00': 16, '13:00': 22, '15:00': 19, '17:00': 26, '19:00': 20, '21:00': 13 },
        z7: { '09:00': 30, '11:00': 51, '13:00': 67, '15:00': 63, '17:00': 75, '19:00': 65, '21:00': 35 },
        z8: { '09:00': 37, '11:00': 55, '13:00': 62, '15:00': 57, '17:00': 69, '19:00': 55, '21:00': 30 }
      }
    }
  }), []);

  // Compute Active Matrix Data based on Filters
  const activeMatrix = useMemo(() => {
    return matrixDataset[selectedDate]?.[selectedMetric] || matrixDataset.today.footfall;
  }, [selectedDate, selectedMetric, matrixDataset]);

  // Compute Highest Traffic Peak Spike Cell Automatically
  const peakCell = useMemo(() => {
    let maxVal = -1;
    let maxZone = null;
    let maxTime = null;

    storeZones.forEach((z) => {
      timeSlots.forEach((t) => {
        const val = activeMatrix[z.id]?.[t] || 0;
        if (val > maxVal) {
          maxVal = val;
          maxZone = z;
          maxTime = t;
        }
      });
    });

    // Estimate cohort shopper count from value index
    const cohortShoppers = Math.round(maxVal * 1.85 + 24);

    return {
      val: maxVal,
      zoneId: maxZone?.id,
      zoneName: maxZone?.name,
      time: maxTime,
      cohortShoppers
    };
  }, [activeMatrix, storeZones, timeSlots]);

  // Multi-Palette Heatmap Color Interpolation
  const getHeatColor = (val) => {
    const norm = Math.max(0, Math.min(100, val)) / 100;
    
    if (colorPalette === 'cyber') {
      // Cyber Neon: Midnight #0f172a -> Cyan #06b6d4 -> Lime #a3e635
      if (norm <= 0.5) {
        const t = norm / 0.5;
        const r = Math.round(15 + t * (6 - 15));
        const g = Math.round(23 + t * (182 - 23));
        const b = Math.round(42 + t * (212 - 42));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const t = (norm - 0.5) / 0.5;
        const r = Math.round(6 + t * (163 - 6));
        const g = Math.round(182 + t * (230 - 182));
        const b = Math.round(212 + t * (53 - 212));
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else if (colorPalette === 'plasma') {
      // Plasma Sunset: Violet #2e1065 -> Magenta #c026d3 -> Sun Yellow #fde047
      if (norm <= 0.5) {
        const t = norm / 0.5;
        const r = Math.round(46 + t * (192 - 46));
        const g = Math.round(16 + t * (38 - 16));
        const b = Math.round(101 + t * (211 - 101));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const t = (norm - 0.5) / 0.5;
        const r = Math.round(192 + t * (253 - 192));
        const g = Math.round(38 + t * (224 - 38));
        const b = Math.round(211 + t * (71 - 211));
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else if (colorPalette === 'emerald') {
      // Emerald Mint: Dark Teal #042f2e -> Emerald #059669 -> Mint #34d399
      if (norm <= 0.5) {
        const t = norm / 0.5;
        const r = Math.round(4 + t * (5 - 4));
        const g = Math.round(47 + t * (150 - 47));
        const b = Math.round(46 + t * (105 - 46));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const t = (norm - 0.5) / 0.5;
        const r = Math.round(5 + t * (52 - 5));
        const g = Math.round(150 + t * (211 - 150));
        const b = Math.round(105 + t * (153 - 105));
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else {
      // Thermal Spectrum (Default): #1e1b4b -> #f59e0b -> #ef4444
      if (norm <= 0.5) {
        const t = norm / 0.5;
        const r = Math.round(30 + t * (245 - 30));
        const g = Math.round(27 + t * (158 - 27));
        const b = Math.round(75 + t * (11 - 75));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const t = (norm - 0.5) / 0.5;
        const r = Math.round(245 + t * (239 - 245));
        const g = Math.round(158 + t * (68 - 158));
        const b = Math.round(11 + t * (68 - 11));
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
  };

  // Text contrast utility
  const getTextColor = (val) => {
    return val >= 42 && val <= 72 ? '#0F172A' : '#FFFFFF';
  };

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl font-sans text-xs text-slate-100">
      {/* ---------------------------------------------------- */}
      {/* HEADER BAR & LIVE TELEMETRY BADGE */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold rounded-full text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" /> Time-Series Retail Density Matrix
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono text-[10px] font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" /> Operational Telemetry
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Hourly Store Zone Attention & Traffic Density
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Evaluating footfall movement, eye-level gaze fixation, and dwell stationary intervals across operational time slots.
          </p>
        </div>

        {/* Peak Spike Highlight Badge */}
        {peakCell && (
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-rose-500/40 flex items-center gap-3 shrink-0 shadow-lg font-mono">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">PEAK TRAFFIC SPIKE:</span>
                <span className="px-2 py-0.2 bg-rose-600 text-white rounded text-[9px] font-bold">
                  {peakCell.val} Index
                </span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">
                {peakCell.zoneName} @ {peakCell.time}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* FILTER & METRIC & STYLE CONTROLS BAR */}
      {/* ---------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col gap-4 font-mono">
        {/* Top Row: Metric & Style Palette Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-purple-400" /> Metric:
            </span>

            <button
              onClick={() => setSelectedMetric('footfall')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMetric === 'footfall'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" /> Footfall Traffic
            </button>

            <button
              onClick={() => setSelectedMetric('gaze')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMetric === 'gaze'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Gaze & Attention Index
            </button>

            <button
              onClick={() => setSelectedMetric('dwell')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMetric === 'dwell'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-400 font-extrabold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Average Dwell Time (s)
            </button>
          </div>

          {/* Color Style / Palette Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 border border-slate-800 rounded-xl text-xs shrink-0">
            <span className="text-slate-400 text-[11px] font-bold px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Style:
            </span>
            <button
              onClick={() => setColorPalette('thermal')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                colorPalette === 'thermal' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Thermal Red
            </button>
            <button
              onClick={() => setColorPalette('cyber')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                colorPalette === 'cyber' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cyber Neon
            </button>
            <button
              onClick={() => setColorPalette('plasma')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                colorPalette === 'plasma' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sunset Plasma
            </button>
            <button
              onClick={() => setColorPalette('emerald')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                colorPalette === 'emerald' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Emerald Mint
            </button>
          </div>
        </div>

        {/* Bottom Row: Date Filter Tabs */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
          <span className="text-slate-400 text-[11px]">Temporal Frame:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setSelectedDate('today')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDate === 'today' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today (Live)
            </button>
            <button
              onClick={() => setSelectedDate('yesterday')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDate === 'yesterday' ? 'bg-slate-800 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setSelectedDate('avg7d')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDate === 'avg7d' ? 'bg-slate-800 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              7-Day Average
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TIME-SERIES HEATMAP GRID */}
      {/* ---------------------------------------------------- */}
      <div className="overflow-x-auto p-4 bg-[#070A12] border border-slate-800/80 rounded-2xl">
        <div className="min-w-[700px] space-y-2">
          {/* X-Axis Header Time Slots */}
          <div className="flex items-center pb-2 border-b border-slate-800/80 font-mono">
            {/* Y-Axis Label Space */}
            <div className="w-36 sm:w-44 shrink-0 text-slate-500 font-bold text-[11px] uppercase tracking-wider pl-2">
              Store Zones / Aisles
            </div>

            {/* Time Slot Columns */}
            <div className="flex-1 grid grid-cols-7 gap-2 text-center text-slate-300 font-bold text-xs">
              {timeSlots.map((time) => (
                <div key={time} className="py-1 px-1 bg-slate-900/60 rounded-lg border border-slate-800/60 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Rows (Y-Axis Store Zones) */}
          <div className="space-y-2 font-mono">
            {storeZones.map((zone) => (
              <div key={zone.id} className="flex items-center">
                {/* Zone Name Label */}
                <div className="w-36 sm:w-44 shrink-0 font-bold text-slate-200 text-xs sm:text-sm tracking-tight truncate pr-4 text-right">
                  {zone.name}
                </div>

                {/* Heatmap Cells */}
                <div className="flex-1 grid grid-cols-7 gap-2">
                  {timeSlots.map((time) => {
                    const val = activeMatrix[zone.id]?.[time] || 0;
                    const isPeak = peakCell?.zoneId === zone.id && peakCell?.time === time;
                    const isHovered = hoveredCell?.zoneId === zone.id && hoveredCell?.time === time;

                    const bgColor = getHeatColor(val);
                    const textColor = getTextColor(val);
                    const cohortCount = Math.round(val * 1.85 + 24);

                    return (
                      <div
                        key={time}
                        onMouseEnter={() =>
                          setHoveredCell({
                            zoneId: zone.id,
                            zoneName: zone.name,
                            time,
                            val,
                            cohortCount
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{ backgroundColor: bgColor }}
                        className={`h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center font-bold transition-all transform cursor-pointer select-none relative border ${
                          isPeak
                            ? 'ring-2 ring-rose-400 border-rose-300 shadow-2xl scale-105 z-20'
                            : (isHovered ? 'ring-2 ring-white scale-105 z-20 shadow-xl' : 'border-transparent hover:opacity-90')
                        }`}
                      >
                        <span style={{ color: textColor }} className="text-sm font-mono tracking-tight">
                          {val}
                        </span>

                        {/* Peak Cell Icon Badge */}
                        {isPeak && (
                          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 shadow-lg border border-white">
                            <Flame className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* INTERACTIVE TOOLTIP TELEMETRY & LEGEND BAR */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
        {/* Tooltip Readout Card */}
        {hoveredCell ? (
          <div className="flex-1 p-4 rounded-2xl bg-slate-900 border border-purple-500/50 font-mono text-xs text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-purple-300 text-sm">{hoveredCell.zoneName}</strong>
                  <span className="text-slate-400">@ Window {hoveredCell.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cohort Shoppers: <strong className="text-emerald-400">{hoveredCell.cohortCount} shoppers</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">{selectedMetric} Index</span>
                <strong className="text-amber-400 text-base">{hoveredCell.val} / 100</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 font-mono text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-600" />
              Hover over any matrix cell to inspect zone time-window telemetry, index score, and cohort shopper counts.
            </span>
            <span className="text-[10px] text-slate-600">56 Data Points (8 x 7 Grid)</span>
          </div>
        )}

        {/* Horizontal Gradient Color Legend Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-center gap-2 font-mono shrink-0 min-w-[280px]">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
            <span>Density Scale ({colorPalette.toUpperCase()}):</span>
            <span className="text-slate-300">0 to 100 Index</span>
          </div>

          {/* Dynamic Palette Scale Bar */}
          <div
            className="h-3.5 rounded-lg border border-slate-700 shadow-inner"
            style={{
              background:
                colorPalette === 'cyber'
                  ? 'linear-gradient(to right, #0f172a, #06b6d4, #a3e635)'
                  : colorPalette === 'plasma'
                  ? 'linear-gradient(to right, #2e1065, #c026d3, #fde047)'
                  : colorPalette === 'emerald'
                  ? 'linear-gradient(to right, #042f2e, #059669, #34d399)'
                  : 'linear-gradient(to right, #1e1b4b, #f59e0b, #ef4444)'
            }}
          />

          <div className="flex items-center justify-between text-[9px] text-slate-400">
            <span>0 (Low)</span>
            <span>50 (Mid)</span>
            <span>100 (Peak)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
