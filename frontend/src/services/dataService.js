// Central Data Service for Application CRUD Operations (Stores, Tasks, Recommendations)

const STORES_STORAGE_KEY = 'retail_stores_dmart_v4';
const TASKS_STORAGE_KEY = 'retail_worker_tasks_dmart_v3';
const RECS_STORAGE_KEY = 'retail_ai_recs_dmart_v3';

// SINGLE STORE DEFINITION: D-MART FLAGSHIP SUPERSTORE
const INITIAL_STORES = [
  {
    id: 'st-dmart-1',
    name: 'D-Mart Flagship Superstore',
    location: 'Mumbai, Maharashtra',
    address: 'D-Mart Central, Sector 15, Powai, Mumbai 400076',
    camerasCount: 24,
    shelvesCount: 48,
    activeVisitors: 284,
    attentionScore: 94.2,
    status: 'Active',
    storeManager: 'Rajesh Kumar (General Manager)',
    contactPhone: '+91 98200 12345',
    areaSqFt: '28,500 sq ft',
    blueprintVersion: 'D-Mart Architectural CAD Layout v4.2',
  }
];

// INITIAL SEED TASKS FOR D-MART WORKERS
const INITIAL_TASKS = [
  {
    id: 'tsk-101',
    title: 'Move "Organic Cold Brew Coffee" to Eye-Level Shelf B2',
    store: 'D-Mart Flagship Superstore',

    aisle: 'Aisle 1 - Beverages',
    priority: 'High',
    status: 'Pending',
    assignedBy: 'Manager Eleanor Vance',
    evidenceUrl: null,
  },
  {
    id: 'tsk-102',
    title: 'Restock Kettle Cooked Chips on Shelf A2',
    store: 'Store #101 (Flagship Seattle)',
    aisle: 'Aisle 2 - Snacks',
    priority: 'Medium',
    status: 'In Progress',
    assignedBy: 'Manager Marcus Sterling',
    evidenceUrl: null,
  },
  {
    id: 'tsk-103',
    title: 'Inspect Camera #04 Field of View on Cosmetics B2',
    store: 'Store #101 (Flagship Seattle)',
    aisle: 'Aisle 3 - Cosmetics',
    priority: 'Low',
    status: 'Completed',
    assignedBy: 'Manager Eleanor Vance',
    evidenceUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300',
  },
];

// INITIAL SEED RECOMMENDATIONS
const INITIAL_RECS = [
  {
    id: 'rec-1',
    title: 'Top Shelf Placement Recommendation',
    category: 'Planogram Re-alignment',
    impact: '+28.4% Sales Lift',
    score: 96,
    badge: 'High Impact',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Move "Organic Cold-Pressed Juice 1L" from Bottom Shelf (Shelf 1) to Eye-Level (Shelf 3).',
    rationale:
      'Customer gaze tracking indicates 84.2% eye-level focus vs only 14.6% bottom shelf attention. Product has a high 78% cart conversion rate once touched.',
    action: 'Apply Auto-Planogram Blueprint #104',
    status: 'Active',
  },
  {
    id: 'rec-2',
    title: 'Product Visibility Score Optimization',
    category: 'Gaze Focus',
    impact: '+18.2% Engagement',
    score: 88,
    badge: 'Medium Impact',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Adjust shelf lighting angle on Aisle 2 (Snacks) by +15° toward center display.',
    rationale:
      'Shadowing on Kettle Cooked Chips lowers eye fixation duration from 3.8s to 1.9s during afternoon lighting shifts.',
    action: 'Dispatch Store Technician Alert',
    status: 'Active',
  },
  {
    id: 'rec-3',
    title: 'Endcap Promotion Opportunity',
    category: 'Promotion',
    impact: '+34.0% Footfall Catch',
    score: 92,
    badge: 'High Impact',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Feature "Hydrating Serum 50ml" on Endcap Promo A during 5:00 PM - 7:00 PM peak hours.',
    rationale:
      'Personal care aisle footfall spikes by +65% during evening hours. Endcap gaze capture rate is 3.2x higher than standard aisles.',
    action: 'Schedule Promotional Display',
    status: 'Active',
  },
];

// --- STORES CRUD ---
export const getStores = () => {
  try {
    const raw = localStorage.getItem(STORES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(INITIAL_STORES));
      return INITIAL_STORES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_STORES;
  }
};

export const createStore = (storeData) => {
  const stores = getStores();
  const newStore = {
    id: 'st-' + Date.now(),
    name: storeData.name,
    location: storeData.location,
    address: storeData.address || storeData.location,
    camerasCount: Number(storeData.camerasCount || 6),
    shelvesCount: Number(storeData.shelvesCount || 15),
    activeVisitors: 0,
    attentionScore: 78.0,
    status: storeData.status || 'Active',
  };
  const updated = [newStore, ...stores];
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateStore = (id, updatedFields) => {
  const stores = getStores();
  const updated = stores.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteStore = (id) => {
  const stores = getStores();
  const updated = stores.filter((s) => s.id !== id);
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// --- WORKER TASKS CRUD ---
export const getTasks = () => {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_TASKS;
  }
};

export const createTask = (taskData) => {
  const tasks = getTasks();
  const newTask = {
    id: 'tsk-' + Math.floor(100 + Math.random() * 900),
    title: taskData.title,
    store: taskData.store || 'Store #101 (Flagship Seattle)',
    aisle: taskData.aisle || 'General Aisle',
    priority: taskData.priority || 'Medium',
    status: 'Pending',
    assignedBy: taskData.assignedBy || 'Store Manager',
    evidenceUrl: null,
  };
  const updated = [newTask, ...tasks];
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateTask = (id, updatedFields) => {
  const tasks = getTasks();
  const updated = tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteTask = (id) => {
  const tasks = getTasks();
  const updated = tasks.filter((t) => t.id !== id);
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// --- RECOMMENDATIONS CRUD ---
export const getRecommendations = () => {
  try {
    const raw = localStorage.getItem(RECS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RECS_STORAGE_KEY, JSON.stringify(INITIAL_RECS));
      return INITIAL_RECS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_RECS;
  }
};

export const createRecommendation = (recData) => {
  const recs = getRecommendations();
  const newRec = {
    id: 'rec-' + Date.now(),
    title: recData.title,
    category: recData.category || 'Planogram Optimization',
    impact: recData.impact || '+20.0% Sales Lift',
    score: Number(recData.score || 90),
    badge: recData.badge || 'High Impact',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: recData.description,
    rationale: recData.rationale || 'Generated via customer spatial attention analytics.',
    action: recData.action || 'Apply Recommendation',
    status: 'Active',
  };
  const updated = [newRec, ...recs];
  localStorage.setItem(RECS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateRecommendation = (id, updatedFields) => {
  const recs = getRecommendations();
  const updated = recs.map((r) => (r.id === id ? { ...r, ...updatedFields } : r));
  localStorage.setItem(RECS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteRecommendation = (id) => {
  const recs = getRecommendations();
  const updated = recs.filter((r) => r.id !== id);
  localStorage.setItem(RECS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
