import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function TrafficChart({ trafficData = [] }) {
  if (!trafficData || trafficData.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>
        No traffic telemetry available for this window.
      </div>
    );
  }

  const labels = trafficData.map(d => d.hour);
  const dataValues = trafficData.map(d => d.shoppers);

  const data = {
    labels,
    datasets: [
      {
        label: 'In-Store Shoppers',
        data: dataValues,
        backgroundColor: 'rgba(56, 189, 248, 0.65)',
        borderColor: '#38bdf8',
        borderWidth: 1.5,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(34, 211, 238, 0.9)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#38bdf8',
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.25)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.25)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
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
            📈 Store Footfall by Hour
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Real-time customer volume across store operating hours
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: '600' }}>
          Peak Detection Active
        </span>
      </div>

      <div style={{ height: '220px', width: '100%' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default TrafficChart;
