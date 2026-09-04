import React from 'react';

function SystemStatus({ platformMetrics = {}, cameras = [], servicesHealth = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
      {/* Platform & Infrastructure Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '8px', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>TOTAL USERS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>{platformMetrics.total_users || 0}</div>
          <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Admins & Staff</span>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '8px', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>ACTIVE STORES</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>{platformMetrics.total_stores || 0}</div>
          <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>Online Locations</span>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '8px', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>VISION CAMERAS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>{platformMetrics.total_cameras || 0}</div>
          <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>CCTV Ingest Active</span>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '8px', padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>SESSIONS LOGGED</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>{platformMetrics.total_sessions || 0}</div>
          <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>ByteTrack Sessions</span>
        </div>
      </div>

      {/* Services Health + Connected Cameras */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Core Services Health */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: '600' }}>
            ⚡ System & AI Services Health
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '16px' }}>
            Real-time status of backend pipelines and AI inference engines
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {servicesHealth.map((srv, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: '6px',
                  border: '1px solid rgba(51, 65, 85, 0.4)'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '0.85rem' }}>{srv.service}</div>
                  {srv.engine && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{srv.engine}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {srv.latency && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{srv.latency}</span>}
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    ● {srv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registered Cameras */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: '600' }}>
            📹 Active Retail Vision Cameras
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '16px' }}>
            Camera feeds connected to real-time YOLOv8 & Gaze ingestion
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cameras.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No cameras registered.</div>
            ) : (
              cameras.map((cam, idx) => {
                const isStreaming = cam.status?.includes('Streaming');
                // Truncate long file paths — only show the filename
                const displayAddress = cam.ip_address && cam.ip_address.includes('/')
                  ? cam.ip_address.split('/').pop()
                  : cam.ip_address;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(30, 41, 59, 0.4)',
                      borderRadius: '8px',
                      border: `1px solid ${isStreaming ? 'rgba(34, 197, 94, 0.3)' : 'rgba(51, 65, 85, 0.4)'}`,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '0.88rem', marginBottom: '2px' }}>
                        {cam.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📍 {cam.store_name}  •  {displayAddress || 'Local Feed'}
                      </div>
                    </div>

                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      background: isStreaming ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: isStreaming ? '#4ade80' : '#38bdf8',
                      border: `1px solid ${isStreaming ? 'rgba(34, 197, 94, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                    }}>
                      {isStreaming ? '● Streaming' : '● Configured'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemStatus;
