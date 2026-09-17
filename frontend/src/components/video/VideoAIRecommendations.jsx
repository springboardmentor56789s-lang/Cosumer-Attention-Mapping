import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function VideoAIRecommendations({ isAnalyzed, analysisData }) {
  if (!isAnalyzed || !analysisData) return null;

  const recommendations = analysisData.aiRecommendations || [];

  return (
    <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Evidence-Based AI Operational Recommendations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recommendations are generated ONLY when supported by events detected in the processed video
          </p>
        </div>
        <span className="text-xs text-purple-300 font-mono">
          {recommendations.length} {recommendations.length === 1 ? 'Insight' : 'Insights'} Generated
        </span>
      </div>

      {recommendations.length === 0 || (recommendations.length === 1 && recommendations[0].id === 'rec-none') ? (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
          <div className="text-sm font-bold text-slate-300">
            No operational recommendations generated from the uploaded video.
          </div>
          <p className="text-xs text-slate-500">
            All detected video events remain within standard operating threshold parameters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {recommendations.map((r) => (
            <div
              key={r.id}
              className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Detected Event</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${r.badgeColor || 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                    {r.impact || 'Verified Event'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono">
                    <strong className="text-amber-400">Condition:</strong> {r.condition}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{r.recommendation}</h3>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl text-[11px] font-mono text-slate-300 space-y-0.5">
                  <div className="text-emerald-400 font-bold">Supporting Evidence:</div>
                  <div>{r.evidence}</div>
                </div>
              </div>

              <button
                onClick={() => alert(`Action Executed: ${r.actionText}`)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-xl transition flex items-center justify-center gap-1.5 mt-2"
              >
                <span>{r.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
