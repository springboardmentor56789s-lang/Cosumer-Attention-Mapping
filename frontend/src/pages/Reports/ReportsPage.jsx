import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, FileCode, CheckCircle2, Calendar, Filter, Search, Clock, Award, Sparkles, Trash2, X, Eye } from 'lucide-react';
import { generateVideoEvidenceReport, build10SectionTextReport } from '../../services/videoEvidenceEngine';

const INITIAL_REPORTS = [
  {
    id: 'rep-dmart-evidence-10sec',
    type: 'daily',
    title: 'Evidence-Based AI Video Analysis Report (10-Section Format)',
    category: 'RetaiLVision AI Evidence Engine',
    period: 'Single Video Session Audit (150s)',
    date: new Date().toISOString().split('T')[0],
    is10Section: true,
    description: 'Comprehensive 10-Section AI analysis report detailing Video Details, Shopper Summary, Attention Analysis, Shelf/Product Attention, Dwell Time, Gaze & Head Pose, Shopper Journey Map, Key Insights, Evidence-Backed Recommendations, and Technical Limitations.',
    metrics: {
      totalVisitors: 'Customer #104 (Alex M.)',
      avgFixationRate: '94.2% mAP Confidence',
      peakHour: 'Gate A to Exit Gate B',
      topShelf: 'Row 4 (Electronics) & Row 2 (Utensils)',
    },
    fileSize: '2.8 MB',
    recommendedFor: 'Executive Board & Store Operations Directors',
  },
  {
    id: 'rep-dmart-daily-1',
    type: 'daily',
    title: 'D-Mart Daily Store Footfall & Bilateral Row Gaze Report',
    category: 'Daily Analytics',
    period: 'Today (24 Hours)',
    date: new Date().toISOString().split('T')[0],
    description: 'Granular hourly breakdown of customer traffic across D-Mart Row 1 (Milk & Dairy / Snacks), Row 2 (Cooking & Utensils), Row 3 (Books & Soaps), and Row 4 (Electronics).',
    metrics: {
      totalVisitors: '4,892 Visitors',
      avgFixationRate: '94.2% Eye-Level',
      peakHour: '5:00 PM - 7:30 PM',
      topShelf: 'Row 4 (Electronics & Earphones)',
    },
    fileSize: '1.4 MB',
    recommendedFor: 'D-Mart Store Managers & Shift Supervisors',
  },
  {
    id: 'rep-dmart-monthly-1',
    type: 'monthly',
    title: 'D-Mart Monthly Executive Planogram & Row ROI Audit Report',
    category: 'Monthly Insights',
    period: 'July / August 2026 (30 Days)',
    date: '2026-08-01',
    description: 'Comprehensive 30-day executive audit tracking shelf space ROI across D-Mart Rows 1 to 4, customer dwell times, and AI planogram recommendations.',
    metrics: {
      totalVisitors: '142,500 Visitors',
      avgFixationRate: '91.8% Row Avg',
      revenueLift: '+₹2,45,000 / mo',
      topShelf: 'Row 1 Side A (Milk & Dairy)',
    },
    fileSize: '5.2 MB',
    recommendedFor: 'D-Mart Retail Executives & Category Managers',
  },
  {
    id: 'rep-dmart-daily-2',
    type: 'daily',
    title: 'D-Mart Express Checkout Registers Audit Log',
    category: 'Daily Operations',
    period: 'Today (24 Hours)',
    date: new Date().toISOString().split('T')[0],
    description: 'Real-time monitoring log of D-Mart Express Checkout Counters 1 to 8 dwell times, cashier line flow, and customer wait index.',
    metrics: {
      totalVisitors: '2,025 Checkout Visits',
      avgFixationRate: '1.4 min Avg Queue',
      peakHour: '6:00 PM - 8:00 PM',
      topShelf: 'Express Counters 1 – 4',
    },
    fileSize: '950 KB',
    recommendedFor: 'Store Operations & Cashier Supervisors',
  },
  {
    id: 'rep-dmart-monthly-2',
    type: 'monthly',
    title: 'D-Mart 4-Row Product Category Engagement Benchmarks',
    category: 'Monthly Insights',
    period: 'July / August 2026 (30 Days)',
    date: '2026-08-01',
    description: 'Cross-aisle comparative study analyzing customer eye retention across Dairy, Snacks, Cooking Staples, Utensils, Books, Hygiene, and Electronics.',
    metrics: {
      totalVisitors: '118,400 SKU Touches',
      avgFixationRate: '88.5% Category Avg',
      revenueLift: '+₹1,85,000 / mo',
      topShelf: 'Row 4 Both Sides (Electronics)',
    },
    fileSize: '4.1 MB',
    recommendedFor: 'Merchandising & Brand Category Leads',
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [activeTab, setActiveTab] = useState('all');
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingReportId, setDeletingReportId] = useState(null);

  // On-Demand Generator Form State (Only generates when user explicitly clicks Generate)
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genFormData, setGenFormData] = useState({
    title: 'Custom D-Mart Category Performance Report',
    type: 'daily',
    categoryFilter: 'All D-Mart Rows (1 - 4)',
    dateRange: new Date().toISOString().split('T')[0],
    format: 'csv'
  });


  const filteredReports = reports.filter((r) => {
    if (activeTab === 'daily') return r.type === 'daily';
    if (activeTab === 'monthly') return r.type === 'monthly';
    return true;
  });

  const handleDeleteReport = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setDeletingReportId(null);
  };

  // ON-DEMAND REPORT GENERATOR (Only compiles when user explicitly clicks "Generate Report")
  const handleGenerateNewReport = (e) => {
    if (e) e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const newReport = {
        id: 'rep-custom-' + Date.now(),
        type: genFormData.type,
        title: genFormData.title,
        category: `D-Mart ${genFormData.categoryFilter}`,
        period: `Range: ${genFormData.dateRange}`,
        date: genFormData.dateRange,
        description: `Custom spatial analytics report generated on demand for D-Mart Superstore focusing on ${genFormData.categoryFilter}.`,
        metrics: {
          totalVisitors: '3,450 Tracked Shoppers',
          avgFixationRate: '92.4% Gaze Score',
          peakHour: '4:00 PM - 6:30 PM',
          topShelf: genFormData.categoryFilter,
        },
        fileSize: '1.8 MB',
        recommendedFor: 'D-Mart Store Analyst & Executive Leads',
      };

      setReports((prev) => [newReport, ...prev]);
      setIsGenerating(false);
      setShowGenerateModal(false);

      // Trigger immediate download
      handleRealDownload(newReport, genFormData.format);
    }, 1200);
  };

  // REAL FILE DOWNLOAD HANDLER

  const handleRealDownload = (report, format = 'csv') => {
    setDownloadingId(report.id + '-' + format);

    setTimeout(() => {
      let content = '';
      let filename = `${report.title.replace(/\s+/g, '_')}_${report.date}.${format}`;
      let mimeType = 'text/csv;charset=utf-8;';

      if (report.is10Section) {
        const simData = generateVideoEvidenceReport({ name: 'D-Mart_Entrance_to_Exit_Shopping_Journey_CAM01_06.mp4', size: '52.4 MB' });
        if (format === 'txt') {
          mimeType = 'text/plain;charset=utf-8;';
          content = build10SectionTextReport(simData);
        } else if (format === 'json') {
          mimeType = 'application/json;charset=utf-8;';
          content = JSON.stringify(simData, null, 2);
        } else {
          mimeType = 'text/csv;charset=utf-8;';
          content = `RetaiLVision AI Evidence Engine - 10-SECTION VIDEO ANALYSIS AUDIT REPORT\n`;
          content += `Shopper ID,Entrance,Exit,Dwell Time,Stops Count,Items Carted,Grand Total,Confidence\n`;
          content += `"Customer #104 (Alex M.)","Gate A (10:14 AM)","Gate B (10:16 AM)","02m 30s","4 Stops","3 Products","₹1,418.00","94.2%"\n`;
        }
      } else if (format === 'csv') {
        content = `Report Title,Category,Period,Date,Total Visitors,Avg Eye Fixation,Peak / Lift,Top Shelf\n"${report.title}","${report.category}","${report.period}","${report.date}","${report.metrics.totalVisitors}","${report.metrics.avgFixationRate}","${report.metrics.peakHour || report.metrics.revenueLift}","${report.metrics.topShelf}"\n\nHourly Breakdown:\nHour,Gaze Score,Dwell Sec,Visitors\n09:00,45,2.1,120\n10:00,62,2.8,240\n11:00,85,3.2,380\n12:00,98,4.1,510\n13:00,75,3.0,420\n14:00,88,3.5,490\n15:00,95,3.9,530\n`;
      } else if (format === 'json') {
        mimeType = 'application/json;charset=utf-8;';
        content = JSON.stringify(report, null, 2);
      } else {
        mimeType = 'text/plain;charset=utf-8;';
        content = `====================================================\n${report.title.toUpperCase()}\n====================================================\nCategory: ${report.category}\nPeriod: ${report.period}\nDate Generated: ${report.date}\nRecommended For: ${report.recommendedFor}\n\nKEY METRICS:\n- Total Visitors: ${report.metrics.totalVisitors}\n- Eye-Level Fixation Rate: ${report.metrics.avgFixationRate}\n- Top Shelf Performance: ${report.metrics.topShelf}\n- Peak/Lift: ${report.metrics.peakHour || report.metrics.revenueLift}\n\nDESCRIPTION:\n${report.description}\n====================================================\nGenerated via RetaiLVision Spatial AI Engine v2.0\n`;
      }

      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadingId(null);
    }, 800);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Daily & Monthly Analytics Reports</h1>
          </div>
          <p className="text-xs text-slate-400">
            Download daily store traffic logs or monthly executive planogram audit reports directly to your computer
          </p>
        </div>

        {/* Actions & Tab Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate On-Demand Report</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1 ${
                activeTab === 'daily'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Daily Reports
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1 ${
                activeTab === 'monthly'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Monthly Reports
            </button>
          </div>
        </div>
      </div>


      {/* QUICK DOWNLOAD BANNER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Quick Download Card */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 rounded-2xl space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Daily Store Traffic & Gaze Report</h3>
                <span className="text-[10px] text-emerald-400 font-mono">Updated Every 24 Hours</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
              Daily Option
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Download today's complete hourly gaze fixation dataset, peak entrance footfall, and cashier line dwell time log.
          </p>

            <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 font-mono">Format: CSV / TXT (1.2 MB)</span>
            <button
              onClick={() => reports[0] && handleRealDownload(reports[0], 'csv')}
              disabled={!reports[0]}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download Daily Report
            </button>
          </div>
        </div>

        {/* Monthly Quick Download Card */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 rounded-2xl space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Monthly Executive Planogram Audit</h3>
                <span className="text-[10px] text-purple-300 font-mono">Updated 1st of Every Month</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded-full">
              Monthly Option
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Download the 30-day cumulative retail audit detailing shelf placement ROI, gaze conversion rates, and AI recommendations.
          </p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 font-mono">Format: CSV / TXT (4.8 MB)</span>
            <button
              onClick={() => reports[1] && handleRealDownload(reports[1], 'csv')}
              disabled={!reports[1]}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download Monthly Report
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Available Downloadable Report Archive ({filteredReports.length})
          </span>
        </h2>

        {filteredReports.length === 0 ? (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm font-bold text-slate-300">No Reports Available</div>
            <p className="text-xs text-slate-500">All reports in this view have been removed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        rep.type === 'daily'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      ● {rep.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" /> {rep.period}
                      </span>
                      <button
                        onClick={() => setDeletingReportId(rep.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 transition"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{rep.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{rep.description}</p>

                  {/* Key Summary Metrics Grid */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Volume</span>
                      <strong className="text-slate-200">{rep.metrics.totalVisitors}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Eye-Level Fixation</span>
                      <strong className="text-emerald-400">{rep.metrics.avgFixationRate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Top Shelf Tier</span>
                      <strong className="text-purple-400 truncate block">{rep.metrics.topShelf}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Peak / Lift</span>
                      <strong className="text-amber-400">{rep.metrics.peakHour || rep.metrics.revenueLift}</strong>
                    </div>
                  </div>
                </div>

                {/* Download buttons */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Recommended: {rep.recommendedFor}</span>
                    <span className="font-mono">{rep.fileSize}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => handleRealDownload(rep, 'csv')}
                      disabled={downloadingId === rep.id + '-csv'}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 font-semibold text-[11px]"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> CSV
                    </button>

                    <button
                      onClick={() => handleRealDownload(rep, 'txt')}
                      disabled={downloadingId === rep.id + '-txt'}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 font-semibold text-[11px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-400" /> Text Doc
                    </button>

                    <button
                      onClick={() => handleRealDownload(rep, 'json')}
                      disabled={downloadingId === rep.id + '-json'}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 font-semibold text-[11px]"
                    >
                      <FileCode className="w-3.5 h-3.5 text-amber-400" /> JSON
                    </button>
                  </div>

                  {downloadingId && downloadingId.startsWith(rep.id) && (
                    <div className="text-center text-[10px] text-blue-400 font-mono animate-pulse">
                      Preparing report download file...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deletingReportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#131927] border border-rose-500/30 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Delete Analytics Report?</h3>
            <p className="text-slate-400">
              Are you sure you want to delete this report from your archive? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingReportId(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReport(deletingReportId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow"
              >
                Yes, Delete Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ON-DEMAND CUSTOM REPORT GENERATOR MODAL */}

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-[#131927] border border-blue-500/40 rounded-3xl shadow-2xl p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Compile On-Demand D-Mart Analytics Report
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateNewReport} className="space-y-4 font-mono">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  value={genFormData.title}
                  onChange={(e) => setGenFormData({ ...genFormData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Row Category Filter</label>
                  <select
                    value={genFormData.categoryFilter}
                    onChange={(e) => setGenFormData({ ...genFormData, categoryFilter: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="All D-Mart Rows (1 - 4)">All D-Mart Rows (1 – 4)</option>
                    <option value="Row 1 Side A (Milk & Dairy)">Row 1 Side A (Milk & Dairy)</option>
                    <option value="Row 1 Side B (Snacks)">Row 1 Side B (Snacks)</option>
                    <option value="Row 2 Side A (Cooking Staples)">Row 2 Side A (Cooking Staples)</option>
                    <option value="Row 2 Side B (Utensils)">Row 2 Side B (Utensils)</option>
                    <option value="Row 3 Side A (Books & Stationery)">Row 3 Side A (Books & Stationery)</option>
                    <option value="Row 3 Side B (Face Wash & Soaps)">Row 3 Side B (Face Wash & Soaps)</option>
                    <option value="Row 4 (Electronics & Accessories)">Row 4 (Electronics & Accessories)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Report Period Type</label>
                  <select
                    value={genFormData.type}
                    onChange={(e) => setGenFormData({ ...genFormData, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="daily">Daily Report (24 Hours)</option>
                    <option value="monthly">Monthly Executive Report (30 Days)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Date Target</label>
                  <input
                    type="date"
                    value={genFormData.dateRange}
                    onChange={(e) => setGenFormData({ ...genFormData, dateRange: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Download Format</label>
                  <select
                    value={genFormData.format}
                    onChange={(e) => setGenFormData({ ...genFormData, format: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="csv">CSV / Excel Spreadsheet (.csv)</option>
                    <option value="json">JSON Raw Dataset (.json)</option>
                    <option value="txt">Formatted Document (.txt)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> Compiling Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Compile & Download Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

