import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function ConsumerSegments({ segments = [] }) {
  if (!segments || segments.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>
        No behavioral segment telemetry available.
      </div>
    );
  }

  const segmentColors = {
    'Explorer': '#10b981',
    'Quick Buyer': '#0ea5e9',
    'Comparison Shopper': '#8b5cf6',
    'Impulse Buyer': '#f59e0b',
    'Brand Loyal Customer': '#ef4444',
  };

  const chartData = {
    labels: segments.map(s => s.segment),
    datasets: [
      {
        data: segments.map(s => s.count || s.percentage),
        backgroundColor: segments.map(s => segmentColors[s.segment] || '#64748b'),
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#38bdf8',
        padding: 10
      }
    },
    cutout: '68%',
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(51, 65, 85, 0.6)',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', fontWeight: '600' }}>
            👥 Consumer Segmentation Breakdown
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Behavioral clustering based on dwell time, gaze paths, and interaction velocity
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '600' }}>
          5 Behavioral Archetypes
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px', alignItems: 'center' }}>
        {/* Doughnut Chart */}
        <div style={{ height: '240px', position: 'relative' }}>
          <Doughnut data={chartData} options={chartOptions} />
        </div>

        {/* Segment Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {segments.map((s, idx) => {
            const color = segmentColors[s.segment] || '#64748b';
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid rgba(51, 65, 85, 0.5)`,
                  borderLeft: `4px solid ${color}`,
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#f8fafc', fontSize: '0.85rem' }}>
                      {s.segment}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: color, fontWeight: '700' }}>
                      {s.percentage}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {s.description}
                  </div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#cbd5e1' }}>
                  {s.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ConsumerSegments;
