import React from 'react';
import { Download, Eye, Filter } from 'lucide-react';

export default function IntelligenceFilterBar({ filters, onViewReport, onExportReport }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
          <Filter className="w-4 h-4 text-purple-400" />
          Retail Intelligence Filters
        </div>
      </div>

      {/* Action Buttons: View & Export Report */}
      <div className="flex items-center gap-2 shrink-0">
        {onViewReport && (
          <button
            onClick={() => onViewReport(filters?.date)}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" /> View Report
          </button>
        )}

        {onExportReport && (
          <button
            onClick={() => onExportReport(filters?.date)}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-black bg-purple-400 hover:bg-purple-300 px-4 py-1.5 rounded-lg transition shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
        )}
      </div>
    </div>
  );
}
