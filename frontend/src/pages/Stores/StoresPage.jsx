import React, { useState, useEffect } from 'react';
import { Store, MapPin, Camera, Layers, Users, Plus, Search, Edit3, Trash2, BarChart2, Eye, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStores, createStore, updateStore, deleteStore } from '../../services/dataService';
import StoreBlueprintCanvas from '../../components/canvas/StoreBlueprintCanvas';


export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [deletingStoreId, setDeletingStoreId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    camerasCount: 6,
    shelvesCount: 15,
    status: 'Active',
  });

  useEffect(() => {
    setStores(getStores());
  }, []);

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase())
  );

  // CREATE ACTION
  const handleAddStore = (e) => {
    e.preventDefault();
    const updated = createStore(formData);
    setStores(updated);
    setShowAddModal(false);
    setFormData({ name: '', location: '', address: '', camerasCount: 6, shelvesCount: 15, status: 'Active' });
  };

  // UPDATE ACTION
  const handleOpenEdit = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      location: store.location,
      address: store.address,
      camerasCount: store.camerasCount,
      shelvesCount: store.shelvesCount,
      status: store.status || 'Active',
    });
  };

  const handleUpdateStore = (e) => {
    e.preventDefault();
    if (!editingStore) return;
    const updated = updateStore(editingStore.id, {
      name: formData.name,
      location: formData.location,
      address: formData.address,
      camerasCount: Number(formData.camerasCount),
      shelvesCount: Number(formData.shelvesCount),
      status: formData.status,
    });
    setStores(updated);
    setEditingStore(null);
  };

  // DELETE ACTION
  const ConfirmDeleteStore = () => {
    if (!deletingStoreId) return;
    const updated = deleteStore(deletingStoreId);
    setStores(updated);
    setDeletingStoreId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Store Network Management</h1>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', location: '', address: '', camerasCount: 6, shelvesCount: 15, status: 'Active' });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Store</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search store name or location..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-4">
          <span>Active Stores: <strong className="text-slate-100">{stores.length}</strong></span>
          <span>Total Cameras: <strong className="text-blue-400">
            {stores.reduce((acc, s) => acc + (s.camerasCount || 0), 0)} Streams
          </strong></span>
        </div>
      </div>

      {/* Modern Visual Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredStores.map((st) => (
          <div
            key={st.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between group"
          >
            <div>
              {/* Card Header */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl mt-0.5">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{st.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      {st.address}
                    </p>
                  </div>
                </div>

                <div
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full font-mono border shrink-0 ${
                    st.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  ● {st.status}
                </div>
              </div>

              {/* Card Metrics Grid */}
              <div className="p-5 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-mono">Cameras</div>
                  <div className="font-bold text-slate-100 mt-0.5 flex items-center justify-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    {st.camerasCount}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-mono">Shelves</div>
                  <div className="font-bold text-slate-100 mt-0.5 flex items-center justify-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    {st.shelvesCount}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-mono">Visitors</div>
                  <div className="font-bold text-slate-100 mt-0.5 flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    {st.activeVisitors}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-mono">Gaze Score</div>
                  <div className="font-bold text-blue-400 mt-0.5 font-mono">
                    {st.attentionScore}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
              <Link
                to="/"
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold rounded-lg transition flex items-center gap-1.5 text-[11px]"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </Link>

              <div className="flex items-center gap-2 text-slate-400">
                <button
                  onClick={() => handleOpenEdit(st)}
                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Edit Store details"
                >
                  <Edit3 className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => setDeletingStoreId(st.id)}
                  className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Delete Store"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* D-Mart Architectural CAD Blueprint Visualizer */}
      <StoreBlueprintCanvas showCameras={true} showHeatmap={true} showPaths={true} />



      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Create New Retail Store Location
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStore} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Metro Center Chicago"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Location City *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Chicago, IL"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="100 N Michigan Ave"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cameras Count</label>
                  <input
                    type="number"
                    value={formData.camerasCount}
                    onChange={(e) => setFormData({ ...formData, camerasCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Shelves Count</label>
                  <input
                    type="number"
                    value={formData.shelvesCount}
                    onChange={(e) => setFormData({ ...formData, shelvesCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow"
                >
                  Save New Store (Create)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE EDIT MODAL */}
      {editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                Edit Store Location Details
              </h3>
              <button onClick={() => setEditingStore(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStore} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Location City</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cameras</label>
                  <input
                    type="number"
                    value={formData.camerasCount}
                    onChange={(e) => setFormData({ ...formData, camerasCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow"
                >
                  Update Store (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingStoreId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#131927] border border-rose-500/30 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Delete Store Location?</h3>
            <p className="text-slate-400">
              Are you sure you want to delete this store from your active retail network? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingStoreId(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={ConfirmDeleteStore}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow"
              >
                Yes, Delete Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
