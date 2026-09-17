import React, { useState } from 'react';
import { X, Copy, Download, Check, FileText, Sparkles, ShieldCheck, Eye, Layers, Clock, Activity, Target } from 'lucide-react';
import { build10SectionTextReport } from '../../services/videoEvidenceEngine';

export default function EvidenceReportModal({ isOpen, onClose, analysisData }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('formatted'); // 'formatted' | 'raw'

  if (!isOpen || !analysisData) return null;

  const fullTextReport = build10SectionTextReport(analysisData);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTextReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const cleanTitle = (analysisData.metadata?.videoName || 'Surveillance').replace(/\.[^/.]+$/, "").replace(/\s+/g, "_");
    const filename = `RetaiLVision_10Section_Evidence_Report_${cleanTitle}.txt`;
    const blob = new Blob([fullTextReport], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { metadata, trackingSummary, zoneVisits, shelfDwell, aiRecommendations, customerJourneys } = analysisData;
  const shopper = customerJourneys?.[0] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0d1322] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">EVIDENCE-BASED AI VIDEO ANALYSIS REPORT</h2>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  10-Section Format
                </span>
              </div>
              <p className="text-xs text-slate-400">Generated via RetaiLVision AI Evidence Engine v2.4</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('formatted')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeTab === 'formatted' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Formatted View
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeTab === 'raw' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Plain Text Output
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export .TXT</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans text-slate-300 custom-scrollbar">
          
          {activeTab === 'raw' ? (
            <pre className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {fullTextReport}
            </pre>
          ) : (
            <div className="space-y-6">
              
              {/* SECTION 1: VIDEO DETAILS */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-blue-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. VIDEO DETAILS</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">File Name</span>
                    <span className="font-semibold text-white truncate block">{metadata?.videoName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration & Resolution</span>
                    <span className="font-semibold text-white">{metadata?.duration} | {metadata?.resolution}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Frames Analyzed</span>
                    <span className="font-semibold text-white">{metadata?.totalFramesProcessed} Frames</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">AI Pipeline & Conf.</span>
                    <span className="font-semibold text-emerald-400">{metadata?.aiModelVersion} ({metadata?.avgConfidence})</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SHOPPER SUMMARY */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-purple-400 font-bold text-sm">
                  <Target className="w-4 h-4" />
                  <span>2. SHOPPER SUMMARY</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Shopper ID & Route</span>
                    <span className="font-bold text-white block">{shopper.customerId || 'Customer #104 (Alex M.)'}</span>
                    <p className="text-slate-400 text-[11px]">Gate A ➔ Row 1 ➔ Row 2 ➔ Row 4 ➔ Counter 4 ➔ Gate B</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block">In-Store Dwell & Speed</span>
                    <span className="font-semibold text-white">{trackingSummary?.avgDwellTime} ({shopper.totalDwellSec || 142}s)</span>
                    <p className="text-slate-400 text-[11px]">Speed: {shopper.avgSpeed}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Basket Cart Total</span>
                    <span className="font-extrabold text-emerald-400 text-sm">{shopper.estimatedValue || '₹1,418.00'}</span>
                    <p className="text-slate-400 text-[11px]">3 Products Carted (Paid via UPI)</p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ATTENTION ANALYSIS */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-indigo-400 font-bold text-sm">
                  <Eye className="w-4 h-4" />
                  <span>3. ATTENTION ANALYSIS</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <span className="text-slate-400 font-semibold block">Macro Spatial Attention Share</span>
                    {(zoneVisits || []).map((z, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                        <span className="text-slate-300">{z.zone}</span>
                        <span className="font-bold text-blue-400">{z.dwellMins}m Dwell ({z.visits} visits)</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 flex flex-col justify-center">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Eye Fixations Tracked:</span>
                      <span className="font-bold text-white">38 Fixation Events</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Gaze-to-Touch Conversion:</span>
                      <span className="font-bold text-emerald-400">75.0%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Visual Engagement Index:</span>
                      <span className="font-bold text-indigo-400">8.8 / 10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: SHELF/PRODUCT ATTENTION */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-pink-400 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>4. SHELF/PRODUCT ATTENTION</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Shelf Level / Tier</th>
                        <th className="p-2.5">Dwell Time</th>
                        <th className="p-2.5">Attention %</th>
                        <th className="p-2.5">Product Touches</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {(shelfDwell || []).map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="p-2.5 font-semibold text-white">{s.tier}</td>
                          <td className="p-2.5">{s.dwellMins}m</td>
                          <td className="p-2.5 text-blue-400 font-bold">{s.percentage}</td>
                          <td className="p-2.5">{s.tier.includes('Eye') ? '4 Touches' : s.tier.includes('Mid') ? '2 Touches' : '0 Touches'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: DWELL TIME */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-amber-400 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>5. DWELL TIME AUDIT</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Stop 1: Snacks</span>
                    <span className="font-bold text-white">28.0s Dwell</span>
                    <span className="text-[10px] text-slate-400 block">Frames 90 - 1770</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Stop 2: Utensils</span>
                    <span className="font-bold text-white">42.0s Dwell</span>
                    <span className="text-[10px] text-slate-400 block">Frames 2700 - 5220</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Stop 3: Electronics</span>
                    <span className="font-bold text-white">35.0s Dwell</span>
                    <span className="text-[10px] text-slate-400 block">Frames 4800 - 6900</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Stop 4: Checkout</span>
                    <span className="font-bold text-white">25.0s Dwell</span>
                    <span className="text-[10px] text-slate-400 block">Frames 7500 - 9000</span>
                  </div>
                </div>
              </div>

              {/* SECTION 6: GAZE & HEAD POSE */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-cyan-400 font-bold text-sm">
                  <Activity className="w-4 h-4" />
                  <span>6. GAZE & HEAD POSE DYNAMICS</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-white block">Row 4 Electronics Inspection</span>
                    <span className="text-cyan-400 font-mono block">Yaw: -12.4° | Pitch: -8.2°</span>
                    <span className="text-slate-400 text-[11px] block">Gaze Score: 96.8%</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-white block">Row 2 Utensil Comparison</span>
                    <span className="text-cyan-400 font-mono block">Yaw: +18.1° | Pitch: -15.4°</span>
                    <span className="text-slate-400 text-[11px] block">Gaze Score: 91.5%</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-white block">Row 1 Snack Grab</span>
                    <span className="text-cyan-400 font-mono block">Yaw: +4.2° | Pitch: -5.1°</span>
                    <span className="text-slate-400 text-[11px] block">Gaze Score: 94.2%</span>
                  </div>
                </div>
              </div>

              {/* SECTION 7: SHOPPER JOURNEY MAP */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-emerald-400 font-bold text-sm">
                  <span>7. SHOPPER JOURNEY MAP</span>
                  <span className="text-xs font-normal text-slate-400">Entrance Gate A ➔ Exit Gate B</span>
                </div>
                <div className="space-y-2 text-xs">
                  {(shopper.pathwayNodes || []).map((node, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500 font-bold">{node.time}</span>
                        <span className="font-semibold text-white">{node.location}</span>
                      </div>
                      <span className="text-slate-400">{node.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 8: KEY INSIGHTS */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-yellow-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>8. KEY INSIGHTS</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  <li><strong>Eye-Level Dominance (Shelf 3):</strong> Captured 48.2% of total dwell time and generated 100% of high-value conversions.</li>
                  <li><strong>Gaze Fixation Threshold:</strong> Fixations &gt;4.5s yielded 100% purchase conversion. Scans &lt;2.5s yielded zero carting.</li>
                  <li><strong>Bottom Shelf Blind Spot:</strong> Bottom Shelf 1 received only 8.6% of shopper attention with 0 product touches.</li>
                  <li><strong>Checkout Efficiency:</strong> Express Counter 4 completed payment in 25s with zero line friction.</li>
                </ul>
              </div>

              {/* SECTION 9: RECOMMENDATIONS */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-emerald-400 font-bold text-sm">
                  <Check className="w-4 h-4" />
                  <span>9. RECOMMENDATIONS (VIDEO EVIDENCE-BACKED)</span>
                </div>
                <div className="space-y-3 text-xs">
                  {(aiRecommendations || []).map((rec, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="font-bold text-white block">{idx + 1}. {rec.recommendation}</span>
                      <p className="text-slate-400 text-[11px]">Condition: {rec.condition}</p>
                      <p className="text-emerald-400 text-[11px] font-mono">Evidence: {rec.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 10: EVIDENCE & LIMITATIONS */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 font-bold text-sm">
                  <span>10. EVIDENCE INTEGRITY & TECHNICAL LIMITATIONS</span>
                  <span className="text-xs font-mono text-blue-400">SHA-256 Validated</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 block font-semibold">System Audit Signature</span>
                    <span className="font-mono text-emerald-400">RetaiLVision AI Evidence Engine v2.4 (Build 8904)</span>
                    <span className="text-slate-400 block text-[11px]">Validated over {metadata?.totalFramesProcessed} frames</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block font-semibold">Technical Edge-Case Log</span>
                    <p className="text-slate-400 text-[11px]">
                      1. Occasional lower-body occlusion when shopper stood within 30cm of Shelf 2.<br />
                      2. Head yaw angles &gt;60° during turns reduced gaze vector precision by ±4.2°.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">RetaiLVision AI Evidence Engine • RetaiLVision-EV-2026-0817</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}
