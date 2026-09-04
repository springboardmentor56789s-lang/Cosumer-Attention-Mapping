import React from 'react';

function MarketingVisibility({ recommendations = [], productVisibility = {}, categoryMetrics = [] }) {
  const highVis = productVisibility?.high_visibility || [];
  const lowVis = productVisibility?.low_visibility || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
      {/* AI Promotional Recommendations */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(51, 65, 85, 0.6)',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', fontWeight: '600' }}>
              💡 Promotional AI Suggestions & Repositioning Opportunities
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Automated anomaly detection: High attention with low conversion, or high conversion hidden gems
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
            Action Required
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {recommendations.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No promotional anomalies detected currently.</div>
          ) : (
            recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  background: rec.priority === 'High' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(56, 189, 248, 0.08)',
                  border: `1px solid ${rec.priority === 'High' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: rec.priority === 'High' ? '#ef4444' : '#0284c7',
                    color: 'white'
                  }}>
                    {rec.type}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f8fafc' }}>
                    {rec.product}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '10px', lineHeight: '1.4' }}>
                  {rec.insight}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '600', display: 'flex', gap: '6px' }}>
                  <span>🎯</span>
                  <span>{rec.action}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Visibility Matrix + Category Share */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Product Visibility Comparison */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: '600' }}>
            👁️ High vs. Low Attention SKUs
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '16px' }}>
            Products capturing over 60% of gaze attention vs under 40%
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>
              🌟 High Visibility SKUs
            </span>
            {highVis.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '4px', fontSize: '0.85rem' }}>
                <span style={{ color: '#f8fafc', fontWeight: '600' }}>{p.name}</span>
                <span style={{ color: '#38bdf8', fontWeight: '700' }}>{p.attention_score}% Attn</span>
              </div>
            ))}

            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginTop: '12px' }}>
              🌑 Low Visibility SKUs (Potential Hidden Gems)
            </span>
            {lowVis.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '4px', fontSize: '0.85rem' }}>
                <span style={{ color: '#cbd5e1' }}>{p.name}</span>
                <span style={{ color: '#94a3b8', fontWeight: '700' }}>{p.attention_score}% Attn</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: '600' }}>
            🏷️ Category Engagement & Share
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '16px' }}>
            Attention captured vs overall customer engagement lift
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryMetrics.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: '600', color: '#f8fafc' }}>{cat.category}</span>
                  <span style={{ color: '#38bdf8', fontWeight: '700' }}>{cat.attention_share}% Share</span>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.8)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${cat.attention_share}%`,
                    height: '100%',
                    background: cat.status === 'Strong Driver' ? '#22c55e' : cat.status === 'Moderate' ? '#38bdf8' : '#f59e0b',
                    borderRadius: '4px'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                  <span>Engagement: {cat.engagement_rate}%</span>
                  <span style={{ color: cat.status === 'Strong Driver' ? '#4ade80' : '#cbd5e1' }}>{cat.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketingVisibility;
