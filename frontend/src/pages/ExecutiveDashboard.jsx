import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { parseJwt } from '../components/ProtectedRoute';

import KPIGrid from '../components/dashboard/KPIGrid';
import TrafficChart from '../components/dashboard/TrafficChart';
import ShelfPerformance from '../components/dashboard/ShelfPerformance';
import ProductEngagement from '../components/dashboard/ProductEngagement';
import ConversionFunnel from '../components/dashboard/ConversionFunnel';
import ConsumerSegments from '../components/dashboard/ConsumerSegments';
import JourneyAnalytics from '../components/dashboard/JourneyAnalytics';
import MarketingVisibility from '../components/dashboard/MarketingVisibility';
import SystemStatus from '../components/dashboard/SystemStatus';
import DashboardFilters from '../components/dashboard/DashboardFilters';

import {
  generateStoreManagerReport,
  generateRetailAnalystReport,
  generateMarketingManagerReport,
  generateAdminReport,
} from '../utils/executiveReportGenerator';

import {
  exportStoreManagerCsv,
  exportRetailAnalystCsv,
  exportMarketingManagerCsv,
  exportAdminCsv,
} from '../utils/csvExporter';

function ExecutiveDashboard() {
  const token = localStorage.getItem('token');
  const userPayload = token ? parseJwt(token) : null;
  const userRole = userPayload?.role || 'Store Manager';

  // All possible role tabs
  const allRoleTabs = [
    { id: 'store-manager', label: '🏪 Store Manager', roles: ['Store Manager', 'Admin'] },
    { id: 'retail-analyst', label: '🔬 Retail Analyst', roles: ['Retail Analyst', 'Admin'] },
    { id: 'marketing-manager', label: '📢 Marketing Manager', roles: ['Marketing Manager', 'Admin'] },
    { id: 'admin', label: '⚙️ Administrator', roles: ['Admin'] }
  ];

  // Filter tabs: Admin sees all, others see only their role's tab
  const roleTabs = allRoleTabs.filter(tab =>
    tab.roles.some(r => r.toLowerCase() === userRole.toLowerCase())
  );

  // Initial tab matches user's role
  const getInitialTab = () => {
    if (userRole.toLowerCase().includes('admin')) return 'store-manager';
    if (userRole.toLowerCase().includes('analyst')) return 'retail-analyst';
    if (userRole.toLowerCase().includes('market')) return 'marketing-manager';
    return 'store-manager';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [timeRange, setTimeRange] = useState('today');

  // Data states per role
  const [storeManagerData, setStoreManagerData] = useState(null);
  const [retailAnalystData, setRetailAnalystData] = useState(null);
  const [marketingManagerData, setMarketingManagerData] = useState(null);
  const [adminData, setAdminData] = useState(null);

  // Status states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drill-down modal state
  const [drillDownItem, setDrillDownItem] = useState(null);

  // Fetch stores list once
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.get('/dashboard/stores');
        setStores(res.data);
      } catch (err) {
        console.error('Failed to load stores list', err);
      }
    };
    fetchStores();
  }, []);

  // Fetch dashboard payload for current tab
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedStoreId) params.store_id = selectedStoreId;
      if (timeRange) params.time_range = timeRange;

      if (activeTab === 'store-manager') {
        const res = await api.get('/dashboard/store-manager', { params });
        setStoreManagerData(res.data);
      } else if (activeTab === 'retail-analyst') {
        const res = await api.get('/dashboard/retail-analyst', { params });
        setRetailAnalystData(res.data);
      } else if (activeTab === 'marketing-manager') {
        const res = await api.get('/dashboard/marketing-manager', { params });
        setMarketingManagerData(res.data);
      } else if (activeTab === 'admin') {
        const res = await api.get('/dashboard/admin');
        setAdminData(res.data);
      }
    } catch (err) {
      console.error('Dashboard aggregation fetch failed', err);
      setError('Failed to fetch aggregated dashboard metrics from the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, selectedStoreId, timeRange]);

  // Format Store Manager KPIs for KPIGrid
  const getStoreManagerKPIs = () => {
    if (!storeManagerData?.kpis) return [];
    const k = storeManagerData.kpis;
    return [
      {
        title: 'Total Shoppers',
        value: k.total_shoppers,
        subtext: `${k.active_shoppers} currently active in store`,
        icon: '👥',
        color: '#38bdf8'
      },
      {
        title: 'Avg Journey Time',
        value: k.avg_journey_seconds,
        unit: 'sec',
        subtext: 'Average in-store duration',
        icon: '⏱️',
        color: '#22d3ee'
      },
      {
        title: 'Avg Dwell Duration',
        value: k.avg_dwell_seconds,
        unit: 'sec',
        subtext: 'Shelf zone attention dwell',
        icon: '👁️',
        color: '#a855f7'
      },
      {
        title: 'Top Attention Shelf',
        value: k.top_shelf?.name || 'N/A',
        subtext: `${k.top_shelf?.attention_seconds || 0}s gaze capture`,
        icon: '🗄️',
        color: '#f59e0b'
      },
      {
        title: 'Checkout Conversion',
        value: `${k.conversion_rate_pct}%`,
        subtext: 'Footfall to checkout ratio',
        icon: '💳',
        color: '#22c55e'
      }
    ];
  };

  // Format Marketing KPIs for KPIGrid
  const getMarketingKPIs = () => {
    if (!marketingManagerData?.kpis) return [];
    const k = marketingManagerData.kpis;
    return [
      {
        title: 'Catalog Attention Avg',
        value: `${k.catalog_attention_avg}%`,
        subtext: 'Mean gaze attention score',
        icon: '👁️',
        color: '#38bdf8'
      },
      {
        title: 'High Visibility SKUs',
        value: k.high_visibility_skus_count,
        subtext: '> 60% attention capture',
        icon: '🌟',
        color: '#22c55e'
      },
      {
        title: 'Unmonetized Anomalies',
        value: k.unmonetized_attention_count,
        subtext: 'High attention / low purchase',
        icon: '💡',
        color: '#f87171'
      },
      {
        title: 'Repeat Engagement',
        value: `${k.repeat_engagement_rate}%`,
        subtext: 'Customer revisit frequency',
        icon: '❤️',
        color: '#a855f7'
      }
    ];
  };

  // ── Export Handlers ──
  const handleDownloadPdf = () => {
    const exportMap = {
      'store-manager': () => generateStoreManagerReport(storeManagerData || {}),
      'retail-analyst': () => generateRetailAnalystReport(retailAnalystData || {}),
      'marketing-manager': () => generateMarketingManagerReport(marketingManagerData || {}),
      'admin': () => generateAdminReport(adminData || {}),
    };
    const fn = exportMap[activeTab];
    if (fn) fn();
  };

  const handleExportCsv = () => {
    const exportMap = {
      'store-manager': () => exportStoreManagerCsv(storeManagerData || {}),
      'retail-analyst': () => exportRetailAnalystCsv(retailAnalystData || {}),
      'marketing-manager': () => exportMarketingManagerCsv(marketingManagerData || {}),
      'admin': () => exportAdminCsv(adminData || {}),
    };
    const fn = exportMap[activeTab];
    if (fn) fn();
  };

  const exportBtnStyle = {
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.2s ease',
  };

  return (
    <div className="dashboard-content" style={{ color: '#f8fafc', paddingBottom: '40px' }}>
      {/* Header & Subtitle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', margin: 0, color: '#f8fafc', fontWeight: '700' }}>
            👔 Executive Intelligence Hub
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Role-tailored decision dashboards powered by computer vision & behavioral intelligence
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={loading}
            style={{
              ...exportBtnStyle,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(239, 68, 68, 0.3)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(239, 68, 68, 0.15)'; }}
          >
            📄 PDF Report
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCsv}
            disabled={loading}
            style={{
              ...exportBtnStyle,
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(34, 197, 94, 0.3)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(34, 197, 94, 0.15)'; }}
          >
            📊 CSV Export
          </button>

          {/* Role Badge */}
          <span style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '700',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            {userRole}
          </span>
        </div>
      </div>

      {/* Role View Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #334155',
        marginBottom: '20px',
        overflowX: 'auto'
      }}>
        {roleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                border: 'none',
                borderBottom: `2px solid ${isActive ? '#38bdf8' : 'transparent'}`,
                padding: '10px 18px',
                fontSize: '0.9rem',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Global Filter Bar (Stores & Period) - except for Admin view */}
      {activeTab !== 'admin' && (
        <DashboardFilters
          stores={stores}
          selectedStoreId={selectedStoreId}
          onStoreChange={setSelectedStoreId}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onRefresh={fetchDashboardData}
          loading={loading}
        />
      )}

      {/* State: Error */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>⚠️ {error}</span>
          <button
            onClick={fetchDashboardData}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* State: Loading */}
      {loading && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: '#94a3b8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '2rem' }}>🔄</div>
          <span>Loading aggregated executive analytics...</span>
        </div>
      )}

      {/* State: Content (when not loading) */}
      {!loading && !error && (
        <>
          {/* ══════════════ 1. STORE MANAGER VIEW ══════════════ */}
          {activeTab === 'store-manager' && storeManagerData && (
            <div>
              <KPIGrid kpis={getStoreManagerKPIs()} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <TrafficChart trafficData={storeManagerData.hourly_traffic} />
                <ConversionFunnel funnel={storeManagerData.conversion_funnel} />
              </div>

              <ShelfPerformance
                shelves={storeManagerData.shelf_performance}
                onSelectShelf={(s) => setDrillDownItem({ type: 'Shelf', data: s })}
              />

              <ProductEngagement
                products={storeManagerData.product_engagement}
                onSelectProduct={(p) => setDrillDownItem({ type: 'Product', data: p })}
              />
            </div>
          )}

          {/* ══════════════ 2. RETAIL ANALYST VIEW ══════════════ */}
          {activeTab === 'retail-analyst' && retailAnalystData && (
            <div>
              <ConsumerSegments segments={retailAnalystData.consumer_segments} />
              <JourneyAnalytics
                topRoutes={retailAnalystData.top_routes}
                zoneHeatmaps={retailAnalystData.zone_heatmaps}
              />
            </div>
          )}

          {/* ══════════════ 3. MARKETING MANAGER VIEW ══════════════ */}
          {activeTab === 'marketing-manager' && marketingManagerData && (
            <div>
              <KPIGrid kpis={getMarketingKPIs()} />
              <MarketingVisibility
                recommendations={marketingManagerData.promotional_recommendations}
                productVisibility={marketingManagerData.product_visibility}
                categoryMetrics={marketingManagerData.category_metrics}
              />
            </div>
          )}

          {/* ══════════════ 4. ADMINISTRATOR VIEW ══════════════ */}
          {activeTab === 'admin' && adminData && (
            <div>
              <SystemStatus
                platformMetrics={adminData.platform_metrics}
                cameras={adminData.cameras}
                servicesHealth={adminData.services_health}
              />
            </div>
          )}
        </>
      )}

      {/* Drill-Down Modal */}
      {drillDownItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.2rem' }}>
                🔍 {drillDownItem.type} Detailed Analytics
              </h3>
              <button
                onClick={() => setDrillDownItem(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div style={{ padding: '8px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Identifier: </span>
                <strong style={{ color: '#f8fafc' }}>{drillDownItem.data.name}</strong>
              </div>

              {drillDownItem.type === 'Shelf' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Total Shopper Visits:</span>
                    <strong style={{ color: '#cbd5e1' }}>{drillDownItem.data.visits}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Gaze Attention Duration:</span>
                    <strong style={{ color: '#38bdf8' }}>{drillDownItem.data.attention_seconds}s</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Overall Attention Share:</span>
                    <strong style={{ color: '#22c55e' }}>{drillDownItem.data.share_pct}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Efficiency Rating:</span>
                    <strong style={{ color: '#f59e0b' }}>{drillDownItem.data.efficiency}</strong>
                  </div>
                </>
              )}

              {drillDownItem.type === 'Product' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Brand:</span>
                    <strong style={{ color: '#cbd5e1' }}>{drillDownItem.data.brand}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Gaze Views:</span>
                    <strong style={{ color: '#38bdf8' }}>{drillDownItem.data.views}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Physical Pickups:</span>
                    <strong style={{ color: '#f59e0b' }}>{drillDownItem.data.pickups}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Completed Purchases:</span>
                    <strong style={{ color: '#22c55e' }}>{drillDownItem.data.purchases}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Conversion Rate:</span>
                    <strong style={{ color: '#4ade80' }}>{drillDownItem.data.conversion_rate}%</strong>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setDrillDownItem(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExecutiveDashboard;
