import React from 'react';

function KPIGrid({ kpis = [] }) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(51, 65, 85, 0.6)',
            borderRadius: '10px',
            padding: '16px 20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Top accent glow line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: kpi.color || '#38bdf8'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {kpi.title}
            </span>
            <span style={{ fontSize: '1.25rem' }}>{kpi.icon || '📊'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f8fafc' }}>
              {kpi.value}
            </span>
            {kpi.unit && (
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{kpi.unit}</span>
            )}
          </div>

          {kpi.subtext && (
            <div style={{ fontSize: '0.75rem', color: kpi.subtextColor || '#38bdf8', fontWeight: '500' }}>
              {kpi.subtext}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default KPIGrid;
