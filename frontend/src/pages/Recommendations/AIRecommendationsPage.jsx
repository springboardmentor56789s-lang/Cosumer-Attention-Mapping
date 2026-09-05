import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Plus, Edit3, Trash2, CheckCircle2, Zap, X } from 'lucide-react';
import { getRecommendations, createRecommendation, updateRecommendation, deleteRecommendation } from '../../services/dataService';

export default function AIRecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRec, setEditingRec] = useState(null);
  const [deletingRecId, setDeletingRecId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Planogram Re-alignment',
    impact: '+25.0% Sales Lift',
    score: 94,
    description: '',
    rationale: '',
    action: 'Apply Auto-Planogram Blueprint',
  });

  useEffect(() => {
    setRecommendations(getRecommendations());
  }, []);

  // CREATE RECOMMENDATION
  const handleCreateRec = (e) => {
    e.preventDefault();
    const updated = createRecommendation(formData);
    setRecommendations(updated);
    setShowAddModal(false);
    setFormData({
      title: '',
      category: 'Planogram Re-alignment',
      impact: '+25.0% Sales Lift',
      score: 94,
      description: '',
      rationale: '',
      action: 'Apply Auto-Planogram Blueprint',
    });
  };

  // UPDATE RECOMMENDATION
  const handleOpenEdit = (rec) => {
    setEditingRec(rec);
    setFormData({
      title: rec.title,
      category: rec.category,
      impact: rec.impact,
      score: rec.score,
      description: rec.description,
      rationale: rec.rationale,
      action: rec.action,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingRec) return;
    const updated = updateRecommendation(editingRec.id, formData);
    setRecommendations(updated);
    setEditingRec(null);
  };

  // DELETE / DISMISS RECOMMENDATION
  const handleConfirmDelete = () => {
    if (!deletingRecId) return;
    const updated = deleteRecommendation(deletingRecId);
    setRecommendations(updated);
    setDeletingRecId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">AI Recommendations Engine (CRUD Enabled)</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time Spatial Attention Insights & Automated Merchandising Optimization
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => {
              setFormData({
                title: '',
                category: 'Planogram Re-alignment',
                impact: '+25.0% Sales Lift',
                score: 94,
                description: '',
                rationale: '',
                action: 'Apply Auto-Planogram Blueprint',
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Recommendation (Create)
          </button>
        </div>
      </div>

      {/* Top Section: Metrics Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 font-mono">Product Visibility Score</span>
          <div className="text-2xl font-extrabold text-blue-400">92.4 / 100</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[92%]"></div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 font-mono font-bold">Active Suggestions</span>
          <div className="text-2xl font-extrabold text-emerald-400">{recommendations.length} Active</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[88%]"></div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 font-mono">Dwell-to-Purchase Ratio</span>
          <div className="text-2xl font-extrabold text-purple-400">41.4%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[41%]"></div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-slate-400 font-mono">Projected Revenue Lift</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">+$14,280 / mo</div>
          <p className="text-[10px] text-slate-500">Across active recommendations</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommendation Cards List (Full width) */}
        <div className="lg:col-span-12 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            Active Planogram & Attention Suggestions
          </h2>

          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-6 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-4 backdrop-blur-xl transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
                      {rec.category}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded ${rec.badgeColor || 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                      {rec.badge || 'High Impact'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{rec.title}</h3>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-400">{rec.impact}</div>
                  <div className="text-[10px] text-slate-400 font-mono">AI Score: {rec.score}/100</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-xs">
                <div className="font-semibold text-slate-200">{rec.description}</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{rec.rationale}</p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified by Spatial Gaze AI
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(rec)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700"
                    title="Edit Recommendation (UPDATE)"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingRecId(rec.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-900/30 text-rose-400 rounded-lg border border-slate-700"
                    title="Dismiss Recommendation (DELETE)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const existingTasks = JSON.parse(localStorage.getItem('worker_assigned_tasks') || '[]');
                      const newTask = {
                        id: Date.now(),
                        title: `Execute: ${rec.title}`,
                        category: rec.category,
                        assigned_to: 'Worker Team',
                        status: 'Pending',
                        priority: 'High',
                        due_time: 'Today 18:00',
                        description: rec.description,
                        created_at: new Date().toISOString()
                      };
                      localStorage.setItem('worker_assigned_tasks', JSON.stringify([newTask, ...existingTasks]));
                      alert(`Task successfully assigned to Worker team! Task ID: #${newTask.id}`);
                    }}
                    className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
                  >
                    Assign Task to Worker
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition">
                    {rec.action}
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" /> Create Custom Recommendation
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRec} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Eye Level Placement for Cold Brew"
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Move item from Shelf 1 to Shelf 3"
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">AI Rationale</label>
                <textarea
                  rows={2}
                  value={formData.rationale}
                  onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                  placeholder="High gaze duration detected during peak hours"
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Impact Tag</label>
                  <input
                    type="text"
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Score (0-100)</label>
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow"
                >
                  Create Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" /> Edit Recommendation
              </h3>
              <button onClick={() => setEditingRec(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">AI Rationale</label>
                <textarea
                  rows={2}
                  value={formData.rationale}
                  onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRec(null)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow"
                >
                  Save Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingRecId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#131927] border border-rose-500/30 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Dismiss Recommendation?</h3>
            <p className="text-slate-400">Are you sure you want to dismiss this recommendation?</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingRecId(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow"
              >
                Yes, Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
