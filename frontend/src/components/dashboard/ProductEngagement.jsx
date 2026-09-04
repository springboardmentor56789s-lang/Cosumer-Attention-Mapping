import React from 'react';

function ProductEngagement({ products = [], onSelectProduct = null }) {
  if (!products || products.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>
        No product engagement telemetry recorded yet.
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
            🛍️ Product Engagement & Conversion Rates
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Shopper interaction flow: Views ➔ Physical Pickups ➔ Checkout Conversion
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Click product to inspect 🔍
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Product</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Brand</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Views</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Pickups</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Purchases</th>
              <th style={{ padding: '10px 12px', fontWeight: '600' }}>Pickup ➔ Purchase Conv.</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr
                key={p.product_id || idx}
                onClick={() => onSelectProduct && onSelectProduct(p)}
                style={{
                  borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                  cursor: onSelectProduct ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px', fontWeight: '600', color: '#f8fafc' }}>
                  {p.name}
                </td>
                <td style={{ padding: '12px', color: '#94a3b8' }}>
                  {p.brand}
                </td>
                <td style={{ padding: '12px', color: '#cbd5e1' }}>
                  👁️ {p.views}
                </td>
                <td style={{ padding: '12px', color: '#f59e0b', fontWeight: '600' }}>
                  🛒 {p.pickups}
                </td>
                <td style={{ padding: '12px', color: '#22c55e', fontWeight: '600' }}>
                  💳 {p.purchases}
                </td>
                <td style={{ padding: '12px', width: '28%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, background: 'rgba(30, 41, 59, 0.8)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, p.conversion_rate)}%`,
                        height: '100%',
                        background: p.conversion_rate > 50 ? '#22c55e' : p.conversion_rate > 20 ? '#38bdf8' : '#ef4444',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: p.conversion_rate > 50 ? '#4ade80' : p.conversion_rate > 20 ? '#38bdf8' : '#f87171', minWidth: '42px' }}>
                      {p.conversion_rate}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductEngagement;
