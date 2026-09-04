import React from 'react';

function JourneyAnalytics({ topRoutes = [], zoneHeatmaps = [] }) {
  const getZoneColor = (zone) => {
    switch (zone) {
      case 'Entrance': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' };
      case 'Checkout': return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8' };
      case 'Shelf A': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' };
      case 'Shelf B': return { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8' };
    }
  };

  const renderRoutePills = (routeStr) => {
    const zones = routeStr.split(' → ');
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        {zones.map((z, i) => {
          const colors = getZoneColor(z);
          return (
            <React.Fragment key={i}>
              <span style={{
                background: colors.bg,
                color: colors.text,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {z}
              </span>
              {i < zones.length - 1 && <span style={{ color: '#475569', fontSize: '0.65rem' }}>▶</span>}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    }}>
      {/* Top Customer Routes */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(51, 65, 85, 0.6)',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: '600' }}>
          🛣️ Common Aggregate In-Store Routes
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '16px' }}>
          Top navigation sequences across all shopper sessions
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {topRoutes.map((r, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.4)',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>{renderRoutePills(r.route)}</div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8' }}>
                  {r.share_pct}%
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                  ({r.count} journeys)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Dwell Heatmap Table */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(51, 65, 85, 0.6)',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: '600' }}>
          🔥 Zone Density & Dwell Intensity
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '16px' }}>
          Footfall volume and average dwell time per zone
        </span>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Store Zone</th>
              <th style={{ padding: '8px' }}>Visits</th>
              <th style={{ padding: '8px' }}>Avg Dwell</th>
              <th style={{ padding: '8px' }}>Heat Status</th>
            </tr>
          </thead>
          <tbody>
            {zoneHeatmaps.map((z, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                <td style={{ padding: '10px 8px', fontWeight: '600', color: '#f8fafc' }}>
                  {z.zone}
                </td>
                <td style={{ padding: '10px 8px', color: '#cbd5e1' }}>
                  {z.visits}
                </td>
                <td style={{ padding: '10px 8px', color: '#38bdf8', fontWeight: '600' }}>
                  {z.avg_dwell}s
                </td>
                <td style={{ padding: '10px 8px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    background: z.heat_level === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: z.heat_level === 'High' ? '#f87171' : '#38bdf8',
                    border: `1px solid ${z.heat_level === 'High' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
                  }}>
                    {z.heat_level} Intensity
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

export default JourneyAnalytics;
