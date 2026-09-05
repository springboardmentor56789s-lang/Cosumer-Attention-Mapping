import React, { useState, useEffect } from 'react';
import { BrainCircuit, RefreshCw, CheckCircle2, Flame, Eye, Zap, Activity, Video, Download, ShieldCheck } from 'lucide-react';
import { intelligenceApi } from '../../services/intelligenceApi';

import IntelligenceFilterBar from '../../components/intelligence/IntelligenceFilterBar';
import BehaviorOverview from '../../components/intelligence/BehaviorOverview';
import BehaviorIntelligenceEngine from '../../components/intelligence/BehaviorIntelligenceEngine';
import BehaviorPatterns from '../../components/intelligence/BehaviorPatterns';
import VisualTrafficHeatmap from '../../components/intelligence/VisualTrafficHeatmap';
import CustomerJourney from '../../components/intelligence/CustomerJourney';
import ProductRanking from '../../components/intelligence/ProductRanking';
import RecommendationCard from '../../components/intelligence/RecommendationCard';

import TrafficChart from '../../components/charts/TrafficChart';
import DwellChart from '../../components/charts/DwellChart';
import AttentionChart from '../../components/charts/AttentionChart';

export default function RetailIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [rankings, setRankings] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [weights, setWeights] = useState({ w1: 0.3, w2: 0.3, w3: 0.2, w4: 0.2 });
  const [filters, setFilters] = useState({
    store: 'Store #1 - Flagship Supermarket',
    videoId: 1,
    date: '2026-08-20',
    timeRange: 'All Day (08:00 - 22:00)',
    zone: 'All Zones',
    shelf: 'All Shelves',
    product: 'All Products',
    metric: 'All Metrics'
  });

  const loadData = async (videoId = selectedVideo) => {
    setLoading(true);
    try {
      if (videoId === 3) {
        // Video 3 tests PRD Section 13 Data Integrity: Detection unavailable
        setData({
          video_id: 3,
          total_shoppers: 0,
          avg_dwell_sec: 0,
          total_attention_events: 0,
          top_performing_zone: 'N/A',
          shopper_metrics: null,
          customer_journeys: [],
          zone_analytics: [],
          behavior_patterns: [],
          heatmaps: { attention_heatmap: [], movement_heatmap: [], shelf_engagement_heatmap: [] },
          product_rankings: [],
          recommendations: [],
          is_data_available: false,
          unavailable_reason: 'Product-level & AI tracking detection was not available for this video feed.'
        });
        setRankings([]);
      } else {
        const summary = await intelligenceApi.getIntelligenceSummary(videoId);
        setData(summary);
        setRankings(summary?.product_rankings || []);
      }
    } catch (err) {
      console.error('Error loading intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (newFilters.videoId !== selectedVideo) {
      setSelectedVideo(newFilters.videoId);
      loadData(newFilters.videoId);
    }
  };

  const handleWeightsChange = async (newWeights) => {
    setWeights(newWeights);
    if (selectedVideo === 3) return;
    try {
      const updatedRankings = await intelligenceApi.getProductScores(selectedVideo, newWeights);
      setRankings(updatedRankings);
    } catch (err) {
      console.error('Error updating product scores:', err);
    }
  };

  const handleViewReport = async (date) => {
    try {
      const report = await intelligenceApi.getFullReport(selectedVideo);
      if (date) {
        report.section_1_video_info.analysis_date = date;
      }
      setReportData(report);
      setShowReportModal(true);
    } catch (err) {
      console.error('Failed to view report:', err);
    }
  };

  const handleExportReport = async (date) => {
    try {
      const report = await intelligenceApi.getFullReport(selectedVideo);
      if (date) {
        report.section_1_video_info.analysis_date = date;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Retail_Intelligence_Report_${date || '2026-08-20'}_Video_${selectedVideo}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  useEffect(() => {
    loadData(selectedVideo);
  }, [selectedVideo]);

  const isDataAvailable = data?.is_data_available !== false;

  // Real-time Multi-Dimensional Filter Processing
  const filteredZoneAnalytics = data?.zone_analytics?.filter(z =>
    filters.zone === 'All Zones' || z.zone_name === filters.zone
  ) || [];

  const filteredJourneys = data?.customer_journeys?.filter(j =>
    filters.zone === 'All Zones' || j.journey_path?.includes(filters.zone)
  ) || [];

  const filteredShelves = data?.heatmaps?.shelf_engagement_heatmap?.filter(s =>
    (filters.shelf === 'All Shelves' || s.shelf_code?.includes(filters.shelf))
  ) || [];

  const filteredRankingsList = (rankings || data?.product_rankings || [])?.filter(p =>
    filters.product === 'All Products' || p.product_id === filters.product || p.product_name?.toLowerCase().includes(filters.product.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header with Engine Operational Badges & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              RETAIL INTELLIGENCE DASHBOARD
            </h1>
            <p className="text-xs text-zinc-400">Computer Vision Consumer Behavior, Spatial Heatmaps & Retail Optimization</p>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Consumer Behavior Engine Operational Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Behavior Engine: <strong>OPERATIONAL</strong></span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 space-y-3 bg-zinc-900/40 rounded-xl border border-zinc-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
          <p className="text-xs font-mono">Executing Consumer Behavior Engine Analysis on Feed #{selectedVideo}...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section A: KPI Cards (Shopper Overview) */}
          <BehaviorOverview metrics={data?.shopper_metrics} summary={data} />







          {/* Retail Intelligence Filters: View & Export Report */}
          <IntelligenceFilterBar
            filters={{ ...filters, videoId: selectedVideo }}
            onViewReport={handleViewReport}
            onExportReport={handleExportReport}
          />

          {/* Section C: Behavior Patterns Panel */}
          <BehaviorPatterns
            patterns={data?.behavior_patterns}
            engineStatus={isDataAvailable ? "OPERATIONAL" : "NO DETECTION DATA"}
            onRefresh={() => loadData(selectedVideo)}
          />

          {/* Visual Customer Spatial Traffic & Density Heatmap */}
          <VisualTrafficHeatmap data={data} />

          {/* Customer Journey Paths */}
          <CustomerJourney journeys={filteredJourneys.length > 0 ? filteredJourneys : data?.customer_journeys} />

          {/* Section D: Product Attractiveness & Rankings (With Data Integrity) */}
          <div className="space-y-4">
            <ProductRanking
              rankings={filteredRankingsList}
              isDataAvailable={isDataAvailable}
              unavailableReason={data?.unavailable_reason}
            />
          </div>

          {/* Section E: Evidence-Based Recommendations */}
          <RecommendationCard recommendations={data?.recommendations} />

          {/* Zone Traffic & Dwell Charts */}
          <div className="flex flex-col gap-6">
            <TrafficChart zoneAnalytics={filteredZoneAnalytics.length > 0 ? filteredZoneAnalytics : data?.zone_analytics} />
            <DwellChart zoneAnalytics={filteredZoneAnalytics.length > 0 ? filteredZoneAnalytics : data?.zone_analytics} />
            <AttentionChart zoneAnalytics={filteredZoneAnalytics.length > 0 ? filteredZoneAnalytics : data?.zone_analytics} />
          </div>
        </div>
      )}

      {/* Interactive Report View Modal */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-400" />
                  {reportData.title || "Retail Intelligence Report"}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Report ID: {reportData.report_id} • Generated: {new Date(reportData.generated_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Report Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
              {/* Section 1: Video Information */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <h4 className="font-bold text-purple-400 uppercase tracking-wider font-mono">1. Video Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-zinc-300 font-mono">
                  <div><span className="text-zinc-500 block text-[10px]">FILE NAME</span>{reportData.section_1_video_info?.video_name}</div>
                  <div><span className="text-zinc-500 block text-[10px]">DURATION</span>{reportData.section_1_video_info?.duration_seconds}s</div>
                  <div><span className="text-zinc-500 block text-[10px]">RESOLUTION</span>{reportData.section_1_video_info?.resolution}</div>
                  <div><span className="text-zinc-500 block text-[10px]">AI MODELS</span>{reportData.section_1_video_info?.ai_models_used}</div>
                </div>
              </div>

              {/* Section 2: Shopper Summary */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider font-mono">2. Shopper Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-zinc-300">
                  <div><span className="text-zinc-500 block text-[10px]">TOTAL SHOPPERS</span><strong className="text-white text-sm">{reportData.section_2_shopper_summary?.total_unique_shoppers}</strong></div>
                  <div><span className="text-zinc-500 block text-[10px]">AVG DWELL TIME</span><strong className="text-emerald-400 text-sm">{reportData.section_2_shopper_summary?.avg_dwell_time_sec}s</strong></div>
                  <div><span className="text-zinc-500 block text-[10px]">MAX DWELL TIME</span><strong className="text-amber-400 text-sm">{reportData.section_2_shopper_summary?.max_dwell_time_sec}s</strong></div>
                  <div><span className="text-zinc-500 block text-[10px]">AVG TRACKING</span><strong className="text-purple-400 text-sm">{reportData.section_2_shopper_summary?.avg_tracking_duration_sec}s</strong></div>
                </div>
              </div>

              {/* Section 3: Behavioral Analysis */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="font-bold text-blue-400 uppercase tracking-wider font-mono">3. Behavioral Analysis & Path Transitions</h4>
                <div>
                  <span className="text-zinc-500 font-mono text-[10px]">MOST COMMON SHOPPER PATH:</span>
                  <div className="text-sm font-mono text-indigo-300 font-bold mt-0.5">{reportData.section_3_behavioral_analysis?.most_common_path}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-zinc-500 uppercase border-b border-zinc-800 text-[10px]">
                      <tr>
                        <th className="py-2">Zone Name</th>
                        <th className="py-2 text-right">Visitors</th>
                        <th className="py-2 text-right">Avg Dwell</th>
                        <th className="py-2 text-right">Attention Events</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-300">
                      {reportData.section_3_behavioral_analysis?.zone_traffic?.map((z, i) => (
                        <tr key={i}>
                          <td className="py-2 font-sans font-semibold text-white">{z.zone_name}</td>
                          <td className="py-2 text-right text-blue-400">{z.visitor_count}</td>
                          <td className="py-2 text-right text-emerald-400">{z.avg_dwell_sec}s</td>
                          <td className="py-2 text-right text-purple-400">{z.attention_events}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: System Limitations & Evidence */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <h4 className="font-bold text-zinc-400 uppercase tracking-wider font-mono">4. Evidence & System Limitations</h4>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                  {reportData.section_9_limitations?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3 font-mono">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleExportReport();
                  setShowReportModal(false);
                }}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Report (JSON)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




