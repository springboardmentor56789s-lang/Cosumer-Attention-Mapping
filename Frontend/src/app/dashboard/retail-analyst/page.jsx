"use client";
import React from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { StatCard, Card, AIInsightCard, BarChartVisual, Table, Row, Cell, COLORS } from "@/app/components/UI";

export default function RetailAnalystDashboard() {
  const journeySteps = [
    { name: "Entrance", pct: "100%" },
    { name: "Electronics", pct: "64%" },
    { name: "Offers Aisle", pct: "42%" },
    { name: "Checkout", pct: "28%" },
  ];

  const topProducts = [
    { name: "Wireless Headphones X", score: 96, category: "Electronics" },
    { name: "Smart Fitness Watch", score: 91, category: "Wearables" },
    { name: "Organic Coffee Beans", score: 82, category: "Groceries" },
    { name: "Ergonomic Desk Chair", score: 71, category: "Furniture" },
  ];

  return (
    <DashboardLayout activeTab="Analytics" role="Retail Analyst">
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: COLORS.textPrimary }}>Consumer Behavior & Attention Intelligence</h1>
        <p style={{ color: COLORS.textSecondary, margin: "4px 0 0 0", fontSize: "14px" }}>Deep-dive analysis of visual attention, dwell times, and shopper journeys.</p>
      </div>

      {/* KPI Row (6 Metrics) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px" }}>
        <StatCard label="Avg Attention Score" value="84/100" trend="5%" isPositive={true} />
        <StatCard label="Avg Dwell Time" value="3m 45s" trend="12s" isPositive={true} />
        <StatCard label="Product Engagement" value="68.2%" trend="4.1%" isPositive={true} />
        <StatCard label="Returning Visitors" value="31.4%" trend="1.8%" isPositive={true} />
        <StatCard label="Conversion Potential" value="High" accentColor={COLORS.green} />
        <StatCard label="Traffic Density" value="1.8 p/m²" subtext="Optimal range" />
      </div>

      {/* Customer Journey Flow & Attention Map */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Customer Journey Diagram */}
        <Card title="Customer Journey Flow Diagram" subtitle="Sequential traffic drop-off per zone">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px" }}>
            {journeySteps.map((step, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ width: "110px", fontSize: "13px", fontWeight: 600 }}>{step.name}</span>
                <div style={{ flex: 1, backgroundColor: COLORS.bg, borderRadius: "6px", height: "24px", overflow: "hidden" }}>
                  <div style={{ width: step.pct, backgroundColor: COLORS.primary, height: "100%", borderRadius: "6px", transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, width: "40px" }}>{step.pct}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Attention By Zone */}
        <Card title="Attention by Zone" subtitle="Average dwell duration per area">
          <BarChartVisual
            data={[
              { label: "Entrance", value: 25, color: COLORS.primary },
              { label: "Middle Aisle", value: 45, color: COLORS.green },
              { label: "Offers Zone", value: 85, color: COLORS.orange },
              { label: "Checkout", value: 30, color: COLORS.primary },
            ]}
          />
        </Card>
      </div>

      {/* Product Attractiveness & Segmentation */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <Card title="Product Attractiveness Ranking" subtitle="Based on attention vs interaction conversion index">
          <Table headers={["Product Name", "Category", "Attractiveness Score"]}>
            {topProducts.map((p, i) => (
              <Row key={i}>
                <Cell><strong>{p.name}</strong></Cell>
                <Cell>{p.category}</Cell>
                <Cell>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, backgroundColor: COLORS.bg, height: "8px", borderRadius: "4px" }}>
                      <div style={{ width: `${p.score}%`, backgroundColor: COLORS.green, height: "100%", borderRadius: "4px" }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "12px" }}>{p.score}</span>
                  </div>
                </Cell>
              </Row>
            ))}
          </Table>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <AIInsightCard
            title="Analyst Behavioral Insights"
            recommendations={[
              "Shoppers spend 42% more time near Shelf C when endcap displays are active.",
              "Promotional placement increased overall store engagement by 28%.",
            ]}
          />

          <Card title="Consumer Segmentation">
            <BarChartVisual
              data={[
                { label: "Explorers", value: 35, color: COLORS.primary },
                { label: "Quick Buyers", value: 25, color: COLORS.green },
                { label: "Impulse", value: 20, color: COLORS.orange },
                { label: "Loyalists", value: 20, color: COLORS.primary },
              ]}
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}