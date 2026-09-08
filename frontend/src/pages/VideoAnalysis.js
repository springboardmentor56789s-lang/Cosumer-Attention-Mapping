import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axiosConfig';
import { useResults } from '../context/ResultsContext';
import './VideoAnalysis.css';

function VideoAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { videoAnalysisResults: results, setVideoAnalysisResults: setResults } = useResults();
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResults(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/analyze-video-full?clear_previous_data=true', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      let behaviorData = [];
      try {
        const behaviorRes = await api.get('/behavior-analysis-all');
        behaviorData = behaviorRes.data;
      } catch (bErr) {
        console.error('Behavior analysis fetch failed:', bErr);
      }

      setResults({ ...response.data, shoppers: behaviorData });
    } catch (err) {
      console.error(err);
      alert('Video analysis failed. This may take a minute for longer videos - please wait and try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (endpoint, filename) => {
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Download failed.');
    }
  };

  return (
    <div className="video-analysis-page">
      <Navbar />
      <main className="video-analysis-content">
        <h2>Full Video Analysis</h2>
        <p className="video-analysis-subtitle">
          Upload any store/mall video to run the complete detection, tracking, attention, and reporting pipeline.
        </p>

        <div className="upload-section">
          <label className="upload-box">
            <input type="file" accept="video/*" onChange={handleFileChange} hidden />
            {selectedFile ? <span>{selectedFile.name}</span> : <span>Click to select a video file</span>}
          </label>
          <button onClick={handleAnalyze} disabled={!selectedFile || loading}>
            {loading ? 'Analyzing... this may take a minute' : 'Run Full Analysis'}
          </button>
        </div>

        {results && (
          <div className="results-wrapper">

            <div className="overview-stats">
              <div className="overview-stat">
                <span className="overview-value">{results.unique_people_tracked}</span>
                <span className="overview-label">Unique People Tracked</span>
              </div>
              <div className="overview-stat">
                <span className="overview-value">{results.frames_processed}</span>
                <span className="overview-label">Frames Processed</span>
              </div>
              <div className="overview-stat">
                <span className="overview-value">{results.total_attention_time_seconds}s</span>
                <span className="overview-label">Total Attention Time</span>
              </div>
              <div className="overview-stat">
                <span className="overview-value">{results.total_attentive_events}</span>
                <span className="overview-label">Attentive Events</span>
              </div>
            </div>

            <div className="download-row">
              <button onClick={() => downloadFile(results.pdf_report_url, 'video_analysis_report.pdf')}>
                Download PDF Report
              </button>
              <button onClick={() => downloadFile(results.excel_report_url, 'video_analysis_report.xlsx')}>
                Download Excel Report
              </button>
            </div>

            <h3>1. Shelf Performance & Attractiveness Scores</h3>
            <div className="shelf-bar-chart-card">
              <ResponsiveContainer width="100%" height={Object.keys(results.shelf_scores).length * 90}>
                <BarChart
                  layout="vertical"
                  data={Object.entries(results.shelf_scores).map(([shelf, d]) => ({
                    shelf,
                    Score: d.attractiveness_score,
                    Visibility: d.shelf_visibility_score,
                    Engagement: d.engagement_score,
                    Conversion: d.conversion_potential_score,
                    Marketing: d.marketing_effectiveness_score,
                  }))}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  barGap={4}
                  barCategoryGap={24}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="shelf"
                    width={170}
                    tick={{ fontSize: 12, fill: '#14324d' }}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Score" fill="#1c7bb0" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="Visibility" fill="#7fc4ec" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="Engagement" fill="#1f9d55" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="Conversion" fill="#f2a35c" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="Marketing" fill="#ef6f6f" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h3>2. Product Engagement Summary</h3>
            <div className="engagement-pie-card">
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={Object.entries(results.interaction_summary).map(([type, count]) => ({
                      name: type.split('(')[0].trim(),
                      value: count
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {Object.entries(results.interaction_summary).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#1c7bb0', '#1f9d55', '#f2a35c', '#ef6f6f', '#7fc4ec'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <h3>3. Consumer Attention Summary</h3>
            <div className="summary-box">
              <p>Total recorded attention time: <strong>{results.total_attention_time_seconds} seconds</strong></p>
              <p>Total attentive events: <strong>{results.total_attentive_events}</strong></p>
            </div>

            <h3>Shopper Segment Breakdown</h3>
            <p className="data-source-note">
              📊 Based on {results.shoppers ? results.shoppers.length : 0} shoppers tracked from this video.
            </p>
            <div className="segment-summary-row">
              {['Explorer', 'Quick Buyer', 'Comparison Shopper', 'Impulse Buyer', 'Brand Loyal Customer'].map((seg) => {
                const count = results.shoppers ? results.shoppers.filter(s => s.segment === seg).length : 0;
                return (
                  <div key={seg} className="segment-box">
                    <span className="segment-value">{count}</span>
                    <span className="segment-name-label">{seg}</span>
                  </div>
                );
              })}
            </div>

            <h3>Consumer Behavior Intelligence</h3>
            <div className="behavior-intel-grid">

              <div className="intel-card">
                <span className="intel-icon">🚶</span>
                <h4>Movement Behavior</h4>
                <p className="intel-subtitle">Average zones visited per shopper type</p>
                {Object.entries(results.movement_analysis || {}).map(([seg, avg]) => (
                  <div key={seg} className="intel-row">
                    <span>{seg}</span><strong>{avg} zones</strong>
                  </div>
                ))}
              </div>

              <div className="intel-card">
                <span className="intel-icon">🛍️</span>
                <h4>Product Preference</h4>
                <p className="intel-subtitle">Most-visited shelf per shopper type</p>
                {Object.entries(results.top_preference_by_segment || {}).map(([seg, shelf]) => (
                  <div key={seg} className="intel-row">
                    <span>{seg}</span><strong>{shelf}</strong>
                  </div>
                ))}
              </div>

              <div className="intel-card">
                <span className="intel-icon">🗺️</span>
                <h4>Store Route Patterns</h4>
                <p className="intel-subtitle">
                  {results.total_unique_routes || 0} unique shelf-to-shelf routes observed
                </p>

                {(!results.most_frequent_routes || results.most_frequent_routes.length === 0) ? (
                  <p className="intel-empty">
                    Not enough shelf-to-shelf movement yet — try a longer video with more zone changes.
                  </p>
                ) : (
                  <>
                    <span className="route-section-label">Most Frequent</span>
                    {results.most_frequent_routes.map((r, i) => (
                      <div key={`most-${i}`} className="route-row">
                        <span className="route-rank">#{i + 1}</span>
                        <div className="route-path">
                          <span className="journey-chip">
                            {r.from.length > 14 ? r.from.substring(0, 14) + '…' : r.from}
                          </span>
                          <span className="journey-arrow-mini">→</span>
                          <span className="journey-chip">
                            {r.to.length > 14 ? r.to.substring(0, 14) + '…' : r.to}
                          </span>
                        </div>
                        <span className="route-count">{r.count}×</span>
                      </div>
                    ))}

                    {results.least_frequent_routes && results.least_frequent_routes.length > 0 && (
                      <>
                        <span className="route-section-label">Least Frequent</span>
                        {results.least_frequent_routes.map((r, i) => (
                          <div key={`least-${i}`} className="route-row">
                            <div className="route-path">
                              <span className="journey-chip chip-faded">
                                {r.from.length > 14 ? r.from.substring(0, 14) + '…' : r.from}
                              </span>
                              <span className="journey-arrow-mini">→</span>
                              <span className="journey-chip chip-faded">
                                {r.to.length > 14 ? r.to.substring(0, 14) + '…' : r.to}
                              </span>
                            </div>
                            <span className="route-count route-count-low">{r.count}×</span>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="intel-card">
                <span className="intel-icon">⏱️</span>
                <h4>Shopping Patterns</h4>
                <p className="intel-subtitle">Average total time spent, per shopper type</p>
                {Object.entries(results.shopping_pattern || {}).map(([seg, avg]) => (
                  <div key={seg} className="intel-row">
                    <span>{seg}</span><strong>{avg}s</strong>
                  </div>
                ))}
              </div>

            </div>

            <h3>4. Conversion Report</h3>
            <div className="conversion-chart-card">
              <ResponsiveContainer width="100%" height={Object.keys(results.shelf_scores).length * 70}>
                <BarChart
                  layout="vertical"
                  data={Object.entries(results.shelf_scores).map(([shelf, d]) => ({
                    shelf,
                    'Total Interactions': d.total_interactions,
                    'Purchased': d.purchased_count,
                  }))}
                  margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
                  barGap={4}
                  barCategoryGap={20}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="shelf"
                    width={170}
                    tick={{ fontSize: 12, fill: '#14324d' }}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Total Interactions" fill="#7fc4ec" radius={[0, 4, 4, 0]} barSize={16} />
                  <Bar dataKey="Purchased" fill="#1f9d55" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>

              <p className="conversion-insight">
                💡 The gap between the two bars shows how many interactions did <strong>not</strong> convert to a purchase — a large gap signals a conversion opportunity.
              </p>
            </div>

            <h3>5. Marketing Effectiveness Report</h3>
            <table className="report-table-full">
              <thead>
                <tr>
                  <th>Shelf</th>
                  <th>Compared</th>
                  <th>Purchased</th>
                  <th>Marketing Effectiveness</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results.shelf_scores).map(([shelf, d]) => (
                  <tr key={shelf}>
                    <td>{shelf}</td>
                    <td>{d.compared_count}</td>
                    <td>{d.purchased_count}</td>
                    <td>{d.marketing_effectiveness_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Attention Heatmaps</h3>
            <div className="video-heatmaps-grid">
              <img
                src={`${api.defaults.baseURL}/heatmaps/heatmap_1_store.png?t=${Date.now()}`}
                alt="Store heatmap"
              />
              <img
                src={`${api.defaults.baseURL}/heatmaps/heatmap_2_shelves.png?t=${Date.now()}`}
                alt="Shelf heatmap"
              />
              <img
                src={`${api.defaults.baseURL}/heatmaps/heatmap_3_product_attention.png?t=${Date.now()}`}
                alt="Product attention heatmap"
              />
              <img
                src={`${api.defaults.baseURL}/heatmaps/heatmap_4_traffic.png?t=${Date.now()}`}
                alt="Traffic heatmap"
              />
            </div>

            <h3>Recommendations</h3>
            <div className="rec-visual-grid">
              {results.recommendations.map((rec, i) => (
                <div key={i} className="rec-visual-card">
                  <div className="rec-visual-header">
                    <span className="rec-visual-shelf">{rec.shelf}</span>
                    <span className={`rec-visual-score-badge ${rec.attractiveness_score >= 50 ? 'score-high' : rec.attractiveness_score >= 20 ? 'score-mid' : 'score-low'}`}>
                      {rec.attractiveness_score}
                    </span>
                  </div>

                  <div className="rec-visual-list">
                    {rec.recommendations.map((r, j) => {
                      const icons = {
                        'Shelf Optimization': '📍',
                        'Product Placement': '🗂️',
                        'Promotional Placement': '📣',
                        'Consumer Engagement': '🤝',
                        'Layout Improvement': '🏬'
                      };

                      return (
                        <div key={j} className="rec-visual-item">
                          <span className="rec-visual-icon">{icons[r.type] || '•'}</span>
                          <div>
                            <span className="rec-visual-type">{r.type}</span>
                            <p className="rec-visual-text">{r.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default VideoAnalysis;