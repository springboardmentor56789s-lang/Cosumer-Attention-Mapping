"use client";
import React from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { StatCard, Card, Badge, AIInsightCard, BarChartVisual, COLORS } from "@/app/components/UI";

export default function StoreManagerDashboard() {
  const recommendations = [
    "Shelf B receives 34% lower attention than average. Move high-margin beverages closer to the entrance.",
    "Increase promotional signage on Aisle 2 to convert high dwell time into sales.",
    "Rotate Product X with Product Y to optimize eye-level attention.",
  ];

  return (
    <DashboardLayout activeTab="Dashboard" role="Store Manager">
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: COLORS.textPrimary }}>Smart Store Command Center</h1>
          <p style={{ color: COLORS.textSecondary, margin: "4px 0 0 0", fontSize: "14px" }}>Live camera feeds, floor traffic monitoring, and shelf optimization.</p>
        </div>
        <select style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
          <option>Store #101 - Downtown Hyderabad</option>
          <option>Store #102 - Jubilee Hills</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px" }}>
        <StatCard label="Visitors Today" value="1,420" trend="14%" isPositive={true} />
        <StatCard label="Avg Dwell Time" value="4m 12s" trend="5%" isPositive={true} />
        <StatCard label="Interactions" value="3,890" trend="8%" isPositive={true} />
        <StatCard label="Conversion Rate" value="24.8%" trend="2.1%" isPositive={true} accentColor={COLORS.green} />
        <StatCard label="Active Cameras" value="12/12" accentColor={COLORS.green} />
        <StatCard label="Attention Score" value="88/100" trend="3 pts" isPositive={true} />
      </div>

      {/* Traffic & Shelf Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <Card title="Hourly Store Traffic" subtitle="Footfall trends across operating hours">
          <BarChartVisual
            data={[
              { label: "09 AM", value: 120 },
              { label: "11 AM", value: 340 },
              { label: "01 PM", value: 450 },
              { label: "03 PM", value: 290 },
              { label: "05 PM", value: 580 },
              { label: "07 PM", value: 410 },
            ]}
          />
        </Card>

        <Card title="Shelf Performance Breakdown" subtitle="Attention vs Interaction density">
          <BarChartVisual
            data={[
              { label: "Shelf A (Snacks)", value: 92, color: COLORS.green },
              { label: "Shelf B (Drinks)", value: 45, color: COLORS.red },
              { label: "Shelf C (Electronics)", value: 78, color: COLORS.primary },
              { label: "Shelf D (Apparel)", value: 64, color: COLORS.orange },
            ]}
          />
        </Card>
      </div>

      {/* Live Cameras & Heatmap Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Camera Grid & Heatmap */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card title="Today's Live Attention Heatmap" subtitle="Overlay of consumer focal points">
            <div
              style={{
                height: "220px",
                borderRadius: "12px",
                background: "radial-gradient(circle at 30% 40%, rgba(220,38,38,0.6) 0%, rgba(245,158,11,0.4) 30%, rgba(37,99,235,0.1) 70%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <span style={{ backgroundColor: "rgba(255,255,255,0.9)", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}>
                🔥 Live Thermal Heatmap Stream Active
              </span>
            </div>
          </Card>

          <Card title="Live Camera Status Grid">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { name: "CAM-01 (Entrance)", status: "Online", health: "98%" },
                { name: "CAM-02 (Aisle 1)", status: "Online", health: "95%" },
                { name: "CAM-03 (Checkout)", status: "Offline", health: "0%" },
              ].map((c, i) => (
                <div key={i} style={{ padding: "12px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>{c.name}</span>
                    <Badge status={c.status} />
                  </div>
                  <span style={{ fontSize: "11px", color: COLORS.textSecondary }}>Signal Quality: {c.health}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Recommendations & Live Alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <AIInsightCard title="Store Manager Recommendations" recommendations={recommendations} />

          <Card title="Live Store Alerts">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(220,38,38,0.08)", borderLeft: `4px solid ${COLORS.red}`, fontSize: "12px" }}>
                <strong>⚠ Camera Offline:</strong> CAM-03 (Checkout) disconnected 5m ago.
              </div>
              <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(245,158,11,0.08)", borderLeft: `4px solid ${COLORS.orange}`, fontSize: "12px" }}>
                <strong>⚠ Crowded Zone:</strong> Entrance aisle density exceeded threshold.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}