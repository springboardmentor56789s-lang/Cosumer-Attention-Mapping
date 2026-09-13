import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EvidenceCard({ evidence, confidence, actionLink, type }) {
  const navigate = useNavigate();

  const isMissing = type === 'missing_data' || type === 'unsupported';

  return (
    <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-[11px]">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          {isMissing ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{isMissing ? 'Data Availability Status' : 'Empirical Evidence Verification'}</span>
        </div>

        {confidence !== undefined && (
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 ${
              confidence >= 0.9
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            <CheckCircle2 className="w-2.5 h-2.5" />
            {Math.round(confidence * 100)}% Verified
          </span>
        )}
      </div>

      {/* Bullet points */}
      {evidence && evidence.length > 0 && (
        <ul className="space-y-1 text-slate-300">
          {evidence.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-purple-400 font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Action Link Button */}
      {actionLink && actionLink.route && (
        <div className="pt-1">
          <button
            onClick={() => navigate(actionLink.route)}
            className="w-full py-1.5 px-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-purple-200 rounded-lg transition font-semibold flex items-center justify-center gap-1 text-[11px]"
          >
            <span>{actionLink.label || 'View Detailed Analytics'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
