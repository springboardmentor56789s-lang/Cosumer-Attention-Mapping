import React from 'react';
import { Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';

export default function RecommendationCard({ recommendation }) {
  if (!recommendation) return null;

  const { category, condition, evidence, recommendation: actionText } = recommendation;

  return (
    <div className="mt-2 p-2.5 bg-slate-900/90 border border-purple-500/20 rounded-xl space-y-1 text-[11px]">
      <div className="flex items-center justify-between font-bold text-slate-200">
        <span className="flex items-center gap-1 text-purple-400">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> {category || 'Recommendation'}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">{condition}</span>
      </div>
      {evidence && <p className="text-slate-400 italic text-[10px]">Evidence: {evidence}</p>}
      {actionText && (
        <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800 text-slate-200 font-medium flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>{actionText}</span>
        </div>
      )}
    </div>
  );
}
