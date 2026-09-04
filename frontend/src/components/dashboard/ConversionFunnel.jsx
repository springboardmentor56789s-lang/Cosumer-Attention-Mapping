import React from 'react';

function ConversionFunnel({ funnel = [] }) {
  if (!funnel || funnel.length === 0) return null;

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
            🎯 Retail AIDA Conversion Funnel
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Drop-off progression from Store Entry to Final Purchase
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '600', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
          Overall Conversion: {funnel[funnel.length - 1]?.pct}%
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {funnel.map((step, idx) => {
          const prevStep = idx > 0 ? funnel[idx - 1] : null;
          const dropOff = prevStep ? Math.max(0, prevStep.count - step.count) : 0;
          const dropOffPct = prevStep && prevStep.count > 0 ? ((dropOff / prevStep.count) * 100).toFixed(1) : 0;

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: '600', color: '#f8fafc' }}>{step.stage}</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: '600' }}>{step.count} shoppers</span>
                  <span style={{ color: step.color, fontWeight: '700', minWidth: '45px', textAlign: 'right' }}>
                    {step.pct}%
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.8)', height: '14px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.max(5, step.pct)}%`,
                  height: '100%',
                  background: step.color,
                  borderRadius: '6px',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>

              {idx > 0 && dropOff > 0 && (
                <div style={{ fontSize: '0.7rem', color: '#f87171', display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                  <span>⚠️ Drop-off from prior stage:</span>
                  <span style={{ fontWeight: '700' }}>-{dropOffPct}% ({dropOff} lost)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConversionFunnel;
