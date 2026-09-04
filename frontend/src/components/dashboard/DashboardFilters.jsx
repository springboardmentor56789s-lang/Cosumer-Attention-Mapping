import React from 'react';

function DashboardFilters({
  stores = [],
  selectedStoreId = '',
  onStoreChange,
  timeRange = 'today',
  onTimeRangeChange,
  onRefresh,
  loading = false
}) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(51, 65, 85, 0.6)',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Filters Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Store Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>🏪 Store:</span>
          <select
            value={selectedStoreId}
            onChange={(e) => onStoreChange(e.target.value)}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Stores (Network Total)</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.location})
              </option>
            ))}
          </select>
        </div>

        {/* Time Range Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>⏱️ Period:</span>
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onTimeRangeChange(t.id)}
              style={{
                background: timeRange === t.id ? '#0284c7' : 'rgba(30, 41, 59, 0.7)',
                color: timeRange === t.id ? 'white' : '#94a3b8',
                border: `1px solid ${timeRange === t.id ? '#38bdf8' : '#334155'}`,
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Right */}
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          background: loading ? '#475569' : '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span>{loading ? '🔄 Refreshing...' : '🔄 Refresh Data'}</span>
      </button>
    </div>
  );
}

export default DashboardFilters;
