import React from 'react';

function ShelfPerformance({ shelves = [], onSelectShelf = null }) {
  if (!shelves || shelves.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>
        No shelf performance data available.
      </div>
    );
  }

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
            🗄️ Shelf Performance & Attention Share
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Attention duration, visit count, and relative visual capture efficiency
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Click shelf to drill down 🔍
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Shelf Name</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Visits</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Attention Duration</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Attention Share</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {shelves.map((s, idx) => (
              <tr
                key={s.shelf_id || idx}
                onClick={() => onSelectShelf && onSelectShelf(s)}
                style={{
                  borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                  cursor: onSelectShelf ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px', fontWeight: '600', color: '#f8fafc' }}>
                  {s.name}
                </td>
                <td style={{ padding: '12px', color: '#cbd5e1' }}>
                  {s.visits}
                </td>
                <td style={{ padding: '12px', color: '#38bdf8', fontWeight: '600' }}>
                  {s.attention_seconds}s
                </td>
                <td style={{ padding: '12px', width: '35%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, background: 'rgba(30, 41, 59, 0.8)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, s.share_pct)}%`,
                        height: '100%',
                        background: s.share_pct > 40 ? '#22c55e' : s.share_pct > 20 ? '#38bdf8' : '#f59e0b',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', minWidth: '35px' }}>
                      {s.share_pct}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    background: s.efficiency === 'High' ? 'rgba(34, 197, 94, 0.15)' : s.efficiency === 'Medium' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: s.efficiency === 'High' ? '#4ade80' : s.efficiency === 'Medium' ? '#38bdf8' : '#f87171',
                    border: `1px solid ${s.efficiency === 'High' ? 'rgba(34, 197, 94, 0.3)' : s.efficiency === 'Medium' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}>
                    {s.efficiency}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShelfPerformance;
