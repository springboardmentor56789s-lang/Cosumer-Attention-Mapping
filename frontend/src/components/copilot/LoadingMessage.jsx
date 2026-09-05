import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

export default function LoadingMessage() {
  return (
    <div className="flex gap-3 justify-start animate-pulse">
      <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none text-xs text-slate-300 flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
        <span>AI Copilot is verifying video telemetry & evidence...</span>
      </div>
    </div>
  );
}
