import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axiosConfig';
import './Heatmaps.css';

const HEATMAP_INFO = [
  {
    file: 'heatmap_1_store.png',
    title: 'Store Presence Heatmap',
    icon: '🏬',
    color: '#e05252',
    meaning: 'This shows the overall footprint of every shopper tracked in the store — where they physically stood the most, regardless of what they were looking at.',
    howToRead: 'Red/warm areas = high foot traffic. Cool/faded areas = rarely visited spots.',
  },
  {
    file: 'heatmap_2_shelves.png',
    title: 'Shelf Dwell Time',
    icon: '⏱️',
    color: '#1c7bb0',
    meaning: 'This measures how long shoppers stayed near each specific shelf — a direct measure of shelf-level attention, not just presence.',
    howToRead: 'Taller bars = shoppers lingered longer at that shelf, suggesting stronger interest.',
  },
  {
    file: 'heatmap_3_product_attention.png',
    title: 'Product Attention Matrix',
    icon: '🎯',
    color: '#1f9d55',
    meaning: 'This breaks down exactly what kind of interaction happened at each shelf — viewed, picked up, compared, purchased, or returned.',
    howToRead: 'Darker cells = more of that specific interaction type occurred at that shelf.',
  },
  {
    file: 'heatmap_4_traffic.png',
    title: 'Customer Traffic Heatmap',
    icon: '🚶',
    color: '#f2a35c',
    meaning: 'This shows movement density across the whole store — the paths and areas shoppers passed through most, whether they stopped or not.',
    howToRead: 'Bright zones = high-traffic walkways. Useful for planning store layout and aisle placement.',
  },
];

function Heatmaps() {
  const [generating, setGenerating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/heatmaps/generate');
      setRefreshKey(Date.now());
    } catch (err) {
      console.error(err);
      alert('Failed to generate heatmaps. Make sure tracking data exists.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="heatmaps-page">
      <Navbar />
      <main className="heatmaps-content">
        <div className="heatmaps-header">
          <div>
            <h2>Attention Heatmaps</h2>
            <p className="heatmaps-subtitle">Visual analysis of shopper attention and movement patterns — explained below for anyone new to the project.</p>
          </div>
          <button onClick={handleRegenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Regenerate Heatmaps'}
          </button>
        </div>

        <div className="heatmaps-explained-grid">
          {HEATMAP_INFO.map((h) => (
            <div key={h.file} className="heatmap-explained-card" style={{ borderTopColor: h.color }}>
              <div className="heatmap-explained-image">
                <img
                  src={`${api.defaults.baseURL}/heatmaps/${h.file}?t=${refreshKey}`}
                  alt={h.title}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="heatmap-explained-body">
                <div className="heatmap-title-row">
                  <span className="heatmap-icon" style={{ background: h.color }}>{h.icon}</span>
                  <h3>{h.title}</h3>
                </div>
                <p className="heatmap-meaning">{h.meaning}</p>
                <div className="heatmap-notation">
                  <span className="notation-label">How to read it</span>
                  <p>{h.howToRead}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Heatmaps;