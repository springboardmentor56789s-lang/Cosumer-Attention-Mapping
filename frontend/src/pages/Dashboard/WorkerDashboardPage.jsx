import React, { useState, useEffect } from 'react';
import { HardHat, CheckCircle2, Upload, Plus, Edit3, Trash2, Layers, MapPin, LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask } from '../../services/dataService';

export default function WorkerDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    aisle: 'Aisle 1 - Beverages',
    priority: 'High',
  });

  const [uploadingTaskId, setUploadingTaskId] = useState(null);

  useEffect(() => {
    const baseTasks = getTasks();
    const managerAssigned = JSON.parse(localStorage.getItem('worker_assigned_tasks') || '[]');
    setTasks([...managerAssigned, ...baseTasks]);
  }, []);


  // CREATE TASK
  const handleCreateTask = (e) => {
    e.preventDefault();
    const updated = createTask({
      ...taskForm,
      assignedBy: user?.full_name || 'Store Manager',
    });
    setTasks(updated);
    setShowAddModal(false);
    setTaskForm({ title: '', aisle: 'Aisle 1 - Beverages', priority: 'High' });
  };

  // UPDATE TASK STATUS & DETAILS
  const handleUpdateStatus = (taskId, newStatus) => {
    const updated = updateTask(taskId, { status: newStatus });
    setTasks(updated);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      aisle: task.aisle,
      priority: task.priority,
    });
  };

  const handleSaveEditTask = (e) => {
    e.preventDefault();
    if (!editingTask) return;
    const updated = updateTask(editingTask.id, {
      title: taskForm.title,
      aisle: taskForm.aisle,
      priority: taskForm.priority,
    });
    setTasks(updated);
    setEditingTask(null);
  };

  // DELETE TASK
  const handleConfirmDelete = () => {
    if (!deletingTaskId) return;
    const updated = deleteTask(deletingTaskId);
    setTasks(updated);
    setDeletingTaskId(null);
  };

  const handleUploadEvidence = (taskId) => {
    setUploadingTaskId(taskId);
    setTimeout(() => {
      const updated = updateTask(taskId, {
        status: 'Completed',
        evidenceUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=300',
      });
      setTasks(updated);
      setUploadingTaskId(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 font-sans space-y-6">
      {/* Top Worker Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded text-[10px]">
                Role: Worker
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {user?.employee_id || 'EMP-5092'}</span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-0.5">{user?.full_name || 'Worker User'}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Assigned Store: <strong className="text-slate-200">{user?.assigned_store || 'Store #101 (Flagship Seattle)'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setTaskForm({ title: '', aisle: 'Aisle 1 - Beverages', priority: 'High' });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Task (Create)
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Logout Worker
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 font-mono">Pending Tasks</span>
          <div className="text-2xl font-extrabold text-amber-400">
            {tasks.filter((t) => t.status === 'Pending').length}
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 font-mono">In Progress</span>
          <div className="text-2xl font-extrabold text-blue-400">
            {tasks.filter((t) => t.status === 'In Progress').length}
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 font-mono">Completed Today</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            {tasks.filter((t) => t.status === 'Completed').length}
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          Assigned Store Operations Tasks (CRUD Operations Active)
        </h2>

        <div className="space-y-4">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      t.priority === 'High'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {t.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{t.id}</span>
                  <span className="text-xs text-slate-500">• {t.aisle}</span>
                </div>

                <h3 className="text-sm font-bold text-white">{t.title}</h3>
                <p className="text-xs text-slate-400">Assigned by: {t.assignedBy}</p>

                {t.evidenceUrl && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Completion Evidence Uploaded
                  </div>
                )}
              </div>

              {/* Status Update & CRUD Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {t.status === 'Pending' && (
                  <button
                    onClick={() => handleUpdateStatus(t.id, 'In Progress')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition"
                  >
                    Start Task
                  </button>
                )}

                {t.status === 'In Progress' && (
                  <button
                    onClick={() => handleUploadEvidence(t.id)}
                    disabled={uploadingTaskId === t.id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingTaskId === t.id ? 'Uploading...' : 'Upload Evidence & Complete'}
                  </button>
                )}

                {t.status === 'Completed' && (
                  <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                )}

                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl border border-slate-700"
                  title="Edit Task Details (UPDATE)"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeletingTaskId(t.id)}
                  className="p-1.5 bg-slate-800 hover:bg-rose-900/30 text-rose-400 rounded-xl border border-slate-700"
                  title="Delete Task (DELETE)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" /> Create Store Operation Task
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Move Cold Pressed Juices to Eye Level"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Aisle Location</label>
                <input
                  type="text"
                  value={taskForm.aisle}
                  onChange={(e) => setTaskForm({ ...taskForm, aisle: e.target.value })}
                  placeholder="Aisle 1 - Beverages"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
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
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" /> Edit Task Details
              </h3>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Aisle Location</label>
                <input
                  type="text"
                  value={taskForm.aisle}
                  onChange={(e) => setTaskForm({ ...taskForm, aisle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Save Task Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#131927] border border-rose-500/30 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Delete Operation Task?</h3>
            <p className="text-slate-400">Are you sure you want to delete this task?</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingTaskId(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow"
              >
                Yes, Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
