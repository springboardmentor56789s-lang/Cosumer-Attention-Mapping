import React, { useState } from 'react';
import { ShoppingBag, Eye, Move, BarChart2, Search, Filter, ArrowUpRight, Sparkles, X, Check } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([
    {
      id: 'prod-1',
      name: 'Organic Cold-Pressed Juice 1L',
      brand: 'Aether Organics',
      shelf: 'Shelf B3 (Eye Level)',
      visibilityScore: 94,
      engagementRating: 'High Focus (4.8s avg)',
      image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500',
      price: '$4.99',
    },
    {
      id: 'prod-2',
      name: 'Hydrating Facial Serum 50ml',
      brand: 'Lumiere Botanicals',
      shelf: 'Shelf C1 (Top Shelf)',
      visibilityScore: 68,
      engagementRating: 'Moderate (2.4s avg)',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      price: '$24.50',
    },
    {
      id: 'prod-3',
      name: 'RedBull Energy Drink 250ml',
      brand: 'RedBull',
      shelf: 'Shelf B3 (Eye Level)',
      visibilityScore: 91,
      engagementRating: 'High Focus (4.2s avg)',
      image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=500',
      price: '$2.99',
    },
    {
      id: 'prod-4',
      name: 'Kettle Cooked Chips 150g',
      brand: 'Cape Cod',
      shelf: 'Shelf A2 (Mid Shelf)',
      visibilityScore: 82,
      engagementRating: 'Good Focus (3.1s avg)',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
      price: '$3.49',
    },
  ]);

  const [search, setSearch] = useState('');
  const [moveModalProduct, setMoveModalProduct] = useState(null);
  const [targetShelf, setTargetShelf] = useState('Shelf B3 (Eye Level)');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmMove = () => {
    if (!moveModalProduct) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === moveModalProduct.id ? { ...p, shelf: targetShelf } : p))
    );
    setMoveModalProduct(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Product Attention Dashboard</h1>
          </div>
          <p className="text-xs text-slate-400">
            Track spatial visibility scores and shopper engagement metrics per SKU
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or brand..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">Total SKUs: <strong className="text-slate-100">{products.length}</strong></span>
      </div>

      {/* Product Cards Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between group"
          >
            <div>
              {/* Product Thumbnail */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                <div className="absolute top-3 right-3 px-2 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-bold text-white font-mono">
                  {p.price}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                    {p.brand}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.shelf}</p>
                </div>

                {/* Visibility Score Meter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Visibility Score</span>
                    <strong className="text-blue-400 font-mono">{p.visibilityScore} / 100</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${p.visibilityScore}%` }}></div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-mono">
                  Engagement: <strong className="text-emerald-400">{p.engagementRating}</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => setMoveModalProduct(p)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition flex items-center justify-center gap-1 text-[11px]"
              >
                <Move className="w-3.5 h-3.5" /> Move Shelf
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Move Shelf Modal */}
      {moveModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl p-6 relative space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Move className="w-4 h-4 text-blue-400" />
                Re-assign Product Shelf
              </h3>
              <button onClick={() => setMoveModalProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              Select new shelf target for <strong>{moveModalProduct.name}</strong>:
            </p>

            <select
              value={targetShelf}
              onChange={(e) => setTargetShelf(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Shelf B3 (Eye Level)">Shelf B3 (Eye Level - High Fixation)</option>
              <option value="Shelf A2 (Mid Shelf)">Shelf A2 (Mid Shelf)</option>
              <option value="Shelf C1 (Top Shelf)">Shelf C1 (Top Shelf)</option>
              <option value="Endcap Promo A">Endcap Promo A (Peak Exposure)</option>
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setMoveModalProduct(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMove}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
