import React, { useState } from 'react';
import { Sliders, Sparkles, HelpCircle } from 'lucide-react';

export default function AttractivenessScore({ weights, onWeightsChange }) {
  const [showModal, setShowModal] = useState(false);
  const [w1, setW1] = useState(weights?.w1 || 0.30);
  const [w2, setW2] = useState(weights?.w2 || 0.30);
  const [w3, setW3] = useState(weights?.w3 || 0.20);
  const [w4, setW4] = useState(weights?.w4 || 0.20);

  const handleSave = () => {
    if (onWeightsChange) {
      onWeightsChange({ w1, w2, w3, w4 });
    }
    setShowModal(false);
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Observed Visual Attractiveness Formula
          </h3>
          <p className="text-xs text-zinc-400">Relative composite score formula & configurable parameter weights</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono transition"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          Configure Weights
        </button>
      </div>

      {/* Formula Box */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
        <div className="text-xs font-mono text-indigo-300 font-semibold">
          Score = ({w1} × AttnFreq) + ({w2} × AttnDuration) + ({w3} × VisitFreq) + ({w4} × RepeatAttn)
        </div>
        <p className="text-[11px] text-zinc-400">
          *Note: Per PRD Section 22, this metric is described strictly as an <strong>Observed Visual Attractiveness Score</strong> based on visual gaze and dwell duration evidence, and does not claim purchase probability.
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="text-sm font-bold text-white">Configure Attractiveness Weights</h4>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-mono">W1: Attention Frequency ({w1})</label>
                <input type="range" min="0" max="1" step="0.05" value={w1} onChange={e => setW1(parseFloat(e.target.value))} className="w-full accent-amber-400" />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-mono">W2: Attention Duration ({w2})</label>
                <input type="range" min="0" max="1" step="0.05" value={w2} onChange={e => setW2(parseFloat(e.target.value))} className="w-full accent-amber-400" />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-mono">W3: Visit Frequency ({w3})</label>
                <input type="range" min="0" max="1" step="0.05" value={w3} onChange={e => setW3(parseFloat(e.target.value))} className="w-full accent-amber-400" />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-mono">W4: Repeat Attention ({w4})</label>
                <input type="range" min="0" max="1" step="0.05" value={w4} onChange={e => setW4(parseFloat(e.target.value))} className="w-full accent-amber-400" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg">Apply Weights</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
