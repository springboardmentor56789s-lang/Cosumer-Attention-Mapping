import React, { useState, useEffect } from 'react';
import { Layers, Eye, Plus, Edit3, Trash2, Search, CheckCircle2, TrendingUp, Sparkles, MapPin, X, PackageCheck, Info, ShoppingBag } from 'lucide-react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';

const SHELVES_STORAGE_KEY = 'retail_shelves_dmart_v5';

const INITIAL_SHELVES = [
  {
    id: 'sh-dmart-101',
    name: 'Row 1 Side A - Milk & Dairy Shelf',
    aisle: 'Row 1 Side A: Milk & Dairy',
    products: 'Fresh Milk 1L, Curd 400g, Amul Butter 500g, Paneer, Cheese, Ghee',
    image: '/images/shelves/dairy.jpg',
    tier: 'Eye-Level (Shelf 3)',
    heightCm: 145,
    gazeFixationRate: 94.2,
    avgDwellSec: 4.8,
    assignedSkusCount: 14,
    status: 'High Performance',
    consistingItems: [
      { id: 'item-101-1', name: 'Fresh Milk 1L Bottle', category: 'Dairy', price: '₹66', stock: 'In Stock', confidence: '98%', attentionScore: 94.2 },
      { id: 'item-101-2', name: 'Fresh Curd 400g Tub', category: 'Dairy', price: '₹45', stock: 'In Stock', confidence: '96%', attentionScore: 91.0 },
      { id: 'item-101-3', name: 'Amul Pasteurised Butter 500g', category: 'Dairy', price: '₹275', stock: 'In Stock', confidence: '99%', attentionScore: 95.8 },
      { id: 'item-101-4', name: 'Fresh Malai Paneer 200g', category: 'Dairy', price: '₹95', stock: 'In Stock', confidence: '94%', attentionScore: 88.4 },
      { id: 'item-101-5', name: 'Processed Cheese Slices 200g', category: 'Dairy', price: '₹140', stock: 'Low Stock', confidence: '95%', attentionScore: 87.2 },
      { id: 'item-101-6', name: 'Pure Cow Ghee 1L Jar', category: 'Dairy', price: '₹650', stock: 'In Stock', confidence: '97%', attentionScore: 92.5 }
    ]
  },
  {
    id: 'sh-dmart-102',
    name: 'Row 1 Side B - Packaged Snacks Shelf',
    aisle: 'Row 1 Side B: Snacks',
    products: 'Biscuits 300g, Potato Chips 150g, Namkeen 400g, Cookies',
    image: '/images/shelves/snacks.jpg',
    tier: 'Eye-Level (Shelf 3)',
    heightCm: 140,
    gazeFixationRate: 91.5,
    avgDwellSec: 4.2,
    assignedSkusCount: 18,
    status: 'High Performance',
    consistingItems: [
      { id: 'item-102-1', name: 'Crispy Potato Chips 150g', category: 'Snacks', price: '₹35', stock: 'In Stock', confidence: '97%', attentionScore: 93.4 },
      { id: 'item-102-2', name: 'Butter Cookies 300g Pack', category: 'Snacks', price: '₹120', stock: 'In Stock', confidence: '95%', attentionScore: 89.1 },
      { id: 'item-102-3', name: 'Spicy Namkeen Mixture 400g', category: 'Snacks', price: '₹85', stock: 'In Stock', confidence: '94%', attentionScore: 88.0 },
      { id: 'item-102-4', name: 'Choco Chip Delight Cookies 250g', category: 'Snacks', price: '₹150', stock: 'In Stock', confidence: '96%', attentionScore: 92.0 }
    ]
  },
  {
    id: 'sh-dmart-201',
    name: 'Row 2 Side A - Cooking Items & Staples Shelf',
    aisle: 'Row 2 Side A: Cooking Items',
    products: 'Fortune Basmati Rice 5kg, Rice Flour 1kg, Wheat Atta 10kg, Pulses',
    image: '/images/shelves/staples.jpg',
    tier: 'Mid Shelf (Shelf 2)',
    heightCm: 110,
    gazeFixationRate: 86.4,
    avgDwellSec: 3.5,
    assignedSkusCount: 22,
    status: 'High Performance',
    consistingItems: [
      { id: 'item-201-1', name: 'Fortune Royal Basmati Rice 5kg', category: 'Staples', price: '₹649', stock: 'In Stock', confidence: '98%', attentionScore: 87.5 },
      { id: 'item-201-2', name: 'Chakki Fresh Wheat Atta 10kg', category: 'Staples', price: '₹420', stock: 'In Stock', confidence: '99%', attentionScore: 89.2 },
      { id: 'item-201-3', name: 'Fine Rice Flour 1kg', category: 'Staples', price: '₹55', stock: 'In Stock', confidence: '93%', attentionScore: 81.0 },
      { id: 'item-201-4', name: 'Organic Toor Dal Pulses 1kg', category: 'Staples', price: '₹165', stock: 'In Stock', confidence: '96%', attentionScore: 85.4 }
    ]
  },
  {
    id: 'sh-dmart-202',
    name: 'Row 2 Side B - Cooking Utensils Shelf',
    aisle: 'Row 2 Side B: Utensils',
    products: 'Stainless Steel Knives, Gas Lighters, Chopping Boards, Spatulas',
    image: '/images/shelves/utensils.jpg',
    tier: 'Eye-Level (Shelf 3)',
    heightCm: 135,
    gazeFixationRate: 88.9,
    avgDwellSec: 3.9,
    assignedSkusCount: 16,
    status: 'High Performance',
    consistingItems: [
      { id: 'item-202-1', name: 'Stainless Steel Chef Knife Set', category: 'Utensils', price: '₹349', stock: 'In Stock', confidence: '94%', attentionScore: 88.0 },
      { id: 'item-202-2', name: 'Kitchen Electronic Gas Lighter', category: 'Utensils', price: '₹199', stock: 'In Stock', confidence: '92%', attentionScore: 85.5 },
      { id: 'item-202-3', name: 'Bamboo Wood Chopping Board', category: 'Utensils', price: '₹299', stock: 'In Stock', confidence: '95%', attentionScore: 91.2 },
      { id: 'item-202-4', name: 'Silicone Non-Stick Spatula 3-Piece', category: 'Utensils', price: '₹249', stock: 'In Stock', confidence: '93%', attentionScore: 87.0 }
    ]
  },
  {
    id: 'sh-dmart-301',
    name: 'Row 3 Side A - Books & Stationery Shelf',
    aisle: 'Row 3 Side A: Books & Stationery',
    products: 'Classmate Registers 6-Pack, Ballpoint Pens, Pencils, Art Books',
    image: '/images/shelves/stationery.jpg',
    tier: 'Mid Shelf (Shelf 2)',
    heightCm: 120,
    gazeFixationRate: 82.1,
    avgDwellSec: 3.1,
    assignedSkusCount: 25,
    status: 'Moderate Focus',
    consistingItems: [
      { id: 'item-301-1', name: 'Classmate Long Notebook 6-Pack', category: 'Stationery', price: '₹280', stock: 'In Stock', confidence: '96%', attentionScore: 83.5 },
      { id: 'item-301-2', name: 'Smooth Gel Pen 10-Pack', category: 'Stationery', price: '₹100', stock: 'In Stock', confidence: '95%', attentionScore: 80.0 },
      { id: 'item-301-3', name: 'HB Graphite Pencils & Erasers', category: 'Stationery', price: '₹60', stock: 'In Stock', confidence: '92%', attentionScore: 78.4 },
      { id: 'item-301-4', name: 'A4 Sketch Pad & Art Book', category: 'Stationery', price: '₹180', stock: 'In Stock', confidence: '94%', attentionScore: 82.0 }
    ]
  },
  {
    id: 'sh-dmart-302',
    name: 'Row 3 Side B - Face Wash & Soaps Shelf',
    aisle: 'Row 3 Side B: Hygiene & Soaps',
    products: 'Himalaya Face Wash 150ml, Dove Bathing Soaps 4-Pack, Surf Excel',
    image: '/images/shelves/hygiene.jpg',
    tier: 'Eye-Level (Shelf 3)',
    heightCm: 142,
    gazeFixationRate: 89.6,
    avgDwellSec: 4.1,
    assignedSkusCount: 20,
    status: 'High Performance',
    consistingItems: [
      { id: 'item-302-1', name: 'Himalaya Purifying Neem Face Wash 150ml', category: 'Hygiene', price: '₹195', stock: 'In Stock', confidence: '97%', attentionScore: 90.8 },
      { id: 'item-302-2', name: 'Dove Cream Beauty Bathing Bar 4x100g', category: 'Hygiene', price: '₹240', stock: 'In Stock', confidence: '98%', attentionScore: 92.1 },
      { id: 'item-302-3', name: 'Surf Excel Easy Wash Detergent 1kg', category: 'Hygiene', price: '₹145', stock: 'In Stock', confidence: '96%', attentionScore: 86.4 }
    ]
  },
  {
    id: 'sh-dmart-401',
    name: 'Row 4 Side A - Earphones & Speakers Shelf',
    aisle: 'Row 4 Side A: Electronics',
    products: 'boAt Wireless Earphones, Bluetooth Speakers, Audio Headsets',
    image: '/images/shelves/electronics.jpg',
    tier: 'Eye-Level (Shelf 3)',
    heightCm: 150,
    gazeFixationRate: 95.8,
    avgDwellSec: 5.4,
    assignedSkusCount: 12,
    status: 'High Performance',
    consistingItems: [
      { id: 'item-401-1', name: 'boAt Rockerz 255 Wireless Earphones', category: 'Electronics', price: '₹999', stock: 'In Stock', confidence: '99%', attentionScore: 96.5 },
      { id: 'item-401-2', name: 'Portable 10W Bass Bluetooth Speaker', category: 'Electronics', price: '₹1,499', stock: 'In Stock', confidence: '97%', attentionScore: 94.8 },
      { id: 'item-401-3', name: 'Over-Ear HD Audio Headset', category: 'Electronics', price: '₹1,999', stock: 'Low Stock', confidence: '96%', attentionScore: 93.0 }
    ]
  },
  {
    id: 'sh-dmart-402',
    name: 'Row 4 Side B - Powerbanks & Chargers Shelf',
    aisle: 'Row 4 Side B: Gadget Accessories',
    products: 'Mi 20000mAh Power Banks, Fast Chargers, Type-C Cables',
    image: '/images/shelves/accessories.jpg',
    tier: 'Eye-Level (Shelf 3)',
    heightCm: 148,
    gazeFixationRate: 93.4,
    avgDwellSec: 4.9,
    assignedSkusCount: 15,
    status: 'High Performance',
    consistingItems: [
      { id: 'item-402-1', name: 'Mi 20000mAh Power Bank 3i Fast Charge', category: 'Accessories', price: '₹1,899', stock: 'In Stock', confidence: '98%', attentionScore: 94.5 },
      { id: 'item-402-2', name: '65W GaN Fast Wall Charger Adapter', category: 'Accessories', price: '₹1,299', stock: 'In Stock', confidence: '95%', attentionScore: 91.0 },
      { id: 'item-402-3', name: 'Braided Type-C Fast Data Cable 1.5m', category: 'Accessories', price: '₹299', stock: 'In Stock', confidence: '94%', attentionScore: 89.2 }
    ]
  },
  {
    id: 'sh-dmart-403',
    name: 'Row 4 Bottom Tier - Heavy Appliances & Kitchen Storage',
    aisle: 'Row 4 Bottom: Kitchen Storage',
    products: 'Mixer Grinder 750W, Digital Air Fryer 4.2L, Storage Container Sets',
    image: '/images/shelves/appliances.jpg',
    tier: 'Bottom Shelf (Shelf 1)',
    heightCm: 45,
    gazeFixationRate: 64.2,
    avgDwellSec: 2.1,
    assignedSkusCount: 10,
    status: 'Needs Optimization',
    consistingItems: [
      { id: 'item-403-1', name: '750W Heavy Duty Mixer Grinder 3-Jar', category: 'Appliances', price: '₹3,499', stock: 'In Stock', confidence: '95%', attentionScore: 68.0 },
      { id: 'item-403-2', name: 'Digital Touch Screen Air Fryer 4.2L', category: 'Appliances', price: '₹5,999', stock: 'In Stock', confidence: '94%', attentionScore: 65.4 },
      { id: 'item-403-3', name: 'Airtight Kitchen Plastic Storage Containers 12-Piece', category: 'Appliances', price: '₹899', stock: 'In Stock', confidence: '92%', attentionScore: 61.2 }
    ]
  }
];

export default function ShelvesPage() {
  const [shelves, setShelves] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const [deletingShelfId, setDeletingShelfId] = useState(null);
  const [viewingConsistingShelf, setViewingConsistingShelf] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    aisle: 'Row 1 Side A: Milk & Dairy',
    tier: 'Eye-Level (Shelf 3)',
    heightCm: 145,
    status: 'High Performance',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SHELVES_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(SHELVES_STORAGE_KEY, JSON.stringify(INITIAL_SHELVES));
        setShelves(INITIAL_SHELVES);
      } else {
        setShelves(JSON.parse(raw));
      }
    } catch (e) {
      setShelves(INITIAL_SHELVES);
    }
  }, []);

  const saveShelves = (updatedList) => {
    setShelves(updatedList);
    localStorage.setItem(SHELVES_STORAGE_KEY, JSON.stringify(updatedList));
  };

  const filteredShelves = shelves.filter(
    (sh) =>
      sh.name.toLowerCase().includes(search.toLowerCase()) ||
      sh.aisle.toLowerCase().includes(search.toLowerCase()) ||
      sh.tier.toLowerCase().includes(search.toLowerCase()) ||
      (sh.products && sh.products.toLowerCase().includes(search.toLowerCase()))
  );

  // CREATE SHELF
  const handleAddShelf = (e) => {
    e.preventDefault();
    const newShelf = {
      id: 'sh-' + Date.now(),
      name: formData.name,
      aisle: formData.aisle,
      tier: formData.tier,
      heightCm: Number(formData.heightCm || 120),
      image: '/images/shelves/snacks.jpg',
      gazeFixationRate: 75.0,
      avgDwellSec: 2.5,
      assignedSkusCount: 6,
      products: 'Custom Assigned SKUs, Store Products',
      status: formData.status || 'Active',
      consistingItems: [
        { id: 'item-new-1', name: 'Custom SKU Product 1', category: 'General', price: '₹199', stock: 'In Stock', confidence: '95%', attentionScore: 75.0 }
      ]
    };
    saveShelves([newShelf, ...shelves]);
    setShowAddModal(false);
    setFormData({ name: '', aisle: 'Row 1 Side A: Milk & Dairy', tier: 'Eye-Level (Shelf 3)', heightCm: 145, status: 'High Performance' });
  };

  // UPDATE SHELF
  const handleOpenEdit = (sh) => {
    setEditingShelf(sh);
    setFormData({
      name: sh.name,
      aisle: sh.aisle,
      tier: sh.tier,
      heightCm: sh.heightCm,
      status: sh.status,
    });
  };

  const handleUpdateShelf = (e) => {
    e.preventDefault();
    if (!editingShelf) return;
    const updated = shelves.map((sh) =>
      sh.id === editingShelf.id
        ? {
            ...sh,
            name: formData.name,
            aisle: formData.aisle,
            tier: formData.tier,
            heightCm: Number(formData.heightCm),
            status: formData.status,
          }
        : sh
    );
    saveShelves(updated);
    setEditingShelf(null);
  };

  // DELETE SHELF
  const handleConfirmDelete = () => {
    if (!deletingShelfId) return;
    const updated = shelves.filter((sh) => sh.id !== deletingShelfId);
    saveShelves(updated);
    setDeletingShelfId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      <Breadcrumbs title="Store Shelves & Spatial Tier Mapping" subtitle="Monitor eye-gaze fixation, dwell times, product planograms & shelf images" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Shelf Position & Product Attention Management</h1>
          </div>
          <p className="text-xs text-slate-400">
            View realistic product imagery of what consists on each shelf tier, monitor customer gaze fixations & planograms
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', aisle: 'Row 1 Side A: Milk & Dairy', tier: 'Eye-Level (Shelf 3)', heightCm: 145, status: 'High Performance' });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Shelf Position</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shelf name, products, aisle, or tier..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-4">
          <span>Total Shelves Mapped: <strong className="text-slate-100">{shelves.length}</strong></span>
          <span>Avg Gaze Capture: <strong className="text-purple-400">88.6%</strong></span>
        </div>
      </div>

      {/* Shelves Cards Grid with Visual Product Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShelves.map((sh) => (
          <div
            key={sh.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl transition flex flex-col justify-between group"
          >
            {/* Shelf Image Showcase */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-950">
              <img
                src={sh.image || '/images/shelves/snacks.jpg'}
                alt={sh.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold rounded-full shadow">
                  {sh.tier}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full shadow backdrop-blur-md ${
                    sh.status === 'High Performance'
                      ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/40'
                      : sh.status === 'Moderate Focus'
                      ? 'bg-blue-950/90 text-blue-400 border border-blue-500/40'
                      : 'bg-amber-950/90 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  ● {sh.status}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-base font-bold text-white leading-tight drop-shadow-md">{sh.name}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 drop-shadow">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {sh.aisle} • Height: {sh.heightCm}cm
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" /> Products Consisting in Shelf
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{sh.consistingItems ? sh.consistingItems.length : 4} Items</span>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <p className="text-[11px] text-emerald-400 font-mono font-medium leading-relaxed">
                    {sh.products}
                  </p>
                  
                  {/* Visual Badges of Consisting Items */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(sh.consistingItems || []).slice(0, 4).map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-700/60 text-slate-300 text-[10px] rounded-md font-sans">
                        📦 {item.name} ({item.price})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gaze metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-mono">Gaze Rate</div>
                  <div className="font-bold text-purple-400 mt-0.5">{sh.gazeFixationRate}%</div>
                </div>
                <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-mono">Avg Dwell</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{sh.avgDwellSec}s</div>
                </div>
                <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-mono">SKUs Placed</div>
                  <div className="font-bold text-blue-400 mt-0.5">{sh.assignedSkusCount}</div>
                </div>
              </div>

              {/* View Consisting Products Button */}
              <button
                onClick={() => setViewingConsistingShelf(sh)}
                className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <PackageCheck className="w-4 h-4 text-indigo-400" />
                <span>View Full Consisting Products Planogram</span>
              </button>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">ID: {sh.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(sh)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700 transition"
                    title="Edit Shelf"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingShelfId(sh.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-900/30 text-rose-400 rounded-lg border border-slate-700 transition"
                    title="Delete Shelf"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CONSISTING PRODUCTS PLANOGRAM MODAL */}
      {viewingConsistingShelf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#111623] border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden space-y-0 text-xs">
            {/* Modal Header */}
            <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
              <img
                src={viewingConsistingShelf.image || '/images/shelves/snacks.jpg'}
                alt={viewingConsistingShelf.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111623] via-[#111623]/60 to-transparent" />
              <button
                onClick={() => setViewingConsistingShelf(null)}
                className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-full border border-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold rounded-full">
                    {viewingConsistingShelf.tier}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">{viewingConsistingShelf.name}</h2>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {viewingConsistingShelf.aisle}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-purple-400 font-bold">{viewingConsistingShelf.gazeFixationRate}% Gaze Rate</div>
                  <div className="text-[11px] text-emerald-400">{viewingConsistingShelf.avgDwellSec}s Avg Dwell</div>
                </div>
              </div>
            </div>

            {/* Modal Body: Consisting Items List */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400" /> Consisting Products Planogram Inventory
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Total Items: {viewingConsistingShelf.consistingItems ? viewingConsistingShelf.consistingItems.length : 0}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(viewingConsistingShelf.consistingItems || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl space-y-2 transition flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] font-mono rounded">
                          {item.category}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${item.stock === 'In Stock' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {item.stock}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Price: <strong className="text-emerald-400">{item.price}</strong> • Detection Confidence: <strong className="text-blue-400">{item.confidence}</strong>
                      </p>
                    </div>

                    <div className="text-right pl-2 border-l border-slate-800">
                      <div className="text-[10px] text-slate-500 font-mono">Gaze Score</div>
                      <div className="font-bold text-purple-400 text-xs mt-0.5">{item.attentionScore}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">YOLOv8 AI Detection Verified • Updated Real-Time</span>
              <button
                onClick={() => setViewingConsistingShelf(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
              >
                Close Planogram View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Provision New Shelf Position
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddShelf} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Shelf Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shelf B3 - Eye Level"
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Aisle Location</label>
                <input
                  type="text"
                  value={formData.aisle}
                  onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                  placeholder="Aisle 1 - Beverages"
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Shelf Height Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  >
                    <option value="Eye-Level (Shelf 3)">Eye-Level (Shelf 3)</option>
                    <option value="Top Shelf (Shelf 4)">Top Shelf (Shelf 4)</option>
                    <option value="Mid Shelf (Shelf 2)">Mid Shelf (Shelf 2)</option>
                    <option value="Bottom Shelf (Shelf 1)">Bottom Shelf (Shelf 1)</option>
                    <option value="Endcap Promo">Endcap Promo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
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
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow"
                >
                  Save Shelf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingShelf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" /> Edit Shelf Details
              </h3>
              <button onClick={() => setEditingShelf(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShelf} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Shelf Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Aisle Location</label>
                <input
                  type="text"
                  value={formData.aisle}
                  onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShelf(null)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow"
                >
                  Update Shelf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingShelfId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#131927] border border-rose-500/30 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Delete Shelf Position?</h3>
            <p className="text-slate-400">Are you sure you want to delete this shelf position mapping?</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingShelfId(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow"
              >
                Yes, Delete Shelf
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
