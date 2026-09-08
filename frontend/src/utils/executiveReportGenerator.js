import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);

// ═══════════════════════════════════════════════════════════════
//  RetailEye AI — Role-Specific Executive Report Generator
//  Generates professional PDF reports tailored to each dashboard role
// ═══════════════════════════════════════════════════════════════

const now = () => new Date();
const dateStr = () => now().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const timeStr = () => now().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

// ─── Color Palette ───
const C = {
  navy:      [15, 23, 42],
  darkSlate: [30, 41, 59],
  slate:     [51, 65, 85],
  muted:     [148, 163, 184],
  light:     [226, 232, 240],
  white:     [255, 255, 255],
  cyan:      [56, 189, 248],
  green:     [34, 197, 94],
  amber:     [234, 179, 8],
  orange:    [249, 115, 22],
  red:       [239, 68, 68],
  indigo:    [99, 102, 241],
  purple:    [168, 85, 247],
  bg:        [245, 248, 255],
};

// ═══════════════════════════════════════════════════════════════
//  SHARED HELPERS
// ═══════════════════════════════════════════════════════════════

function createDoc() {
  return new jsPDF("p", "mm", "a4");
}

function drawGradientRect(doc, x, y, w, h, c1, c2, steps = 40) {
  const stepH = h / steps;
  for (let i = 0; i < steps; i++) {
    const r = c1[0] + (c2[0] - c1[0]) * (i / steps);
    const g = c1[1] + (c2[1] - c1[1]) * (i / steps);
    const b = c1[2] + (c2[2] - c1[2]) * (i / steps);
    doc.setFillColor(r, g, b);
    doc.rect(x, y + i * stepH, w, stepH + 0.5, "F");
  }
}

function drawRoundedRect(doc, x, y, w, h, r, fillColor, borderColor) {
  if (fillColor) doc.setFillColor(...fillColor);
  if (borderColor) {
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, r, r, fillColor ? "FD" : "D");
  } else if (fillColor) {
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
}

function coverHeader(doc, title, subtitle, accentColor) {
  const pw = doc.internal.pageSize.getWidth();
  const margin = 18;

  drawGradientRect(doc, 0, 0, pw, 70, C.navy, [30, 58, 95]);
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, pw, 1.5, "F");

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("RetailEye AI", margin, 28);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...accentColor);
  doc.text("CONSUMER ATTENTION MAPPING", margin, 37);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text(title, margin, 52);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text(`${dateStr()}  |  ${timeStr()}`, margin, 62);

  drawRoundedRect(doc, pw - 60, 20, 45, 16, 3, accentColor, null);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.navy);
  doc.text(subtitle, pw - 37.5, 30, { align: "center" });

  return 82;
}

function sectionHeader(doc, y, title, icon, pw, margin) {
  if (y + 20 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    y = 18;
  }
  doc.setFillColor(...C.cyan);
  doc.rect(margin, y, 3, 9, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.navy);
  doc.text(`${icon}  ${title}`, margin + 6, y + 7);
  y += 14;
  doc.setDrawColor(...C.light);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pw - margin, y);
  return y + 5;
}

function kpiRow(doc, y, cards, margin, contentWidth) {
  const cardW = (contentWidth - 9) / cards.length;
  cards.forEach((card, i) => {
    const cx = margin + i * (cardW + 3);
    drawRoundedRect(doc, cx, y, cardW, 28, 3, C.bg, card.color);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...card.color);
    doc.text(String(card.value), cx + cardW / 2, y + 14, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.slate);
    doc.text(card.label, cx + cardW / 2, y + 22, { align: "center" });
  });
  return y + 38;
}

function checkBreak(doc, y, needed) {
  if (y + needed > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    return 18;
  }
  return y;
}

function addFooters(doc) {
  const total = doc.internal.getNumberOfPages();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(`RetailEye AI  •  Executive Report  •  ${dateStr()}`, 18, ph - 8);
    doc.text(`Page ${i} / ${total}`, pw - 18, ph - 8, { align: "right" });
    doc.setDrawColor(...C.cyan);
    doc.setLineWidth(0.6);
    doc.line(0, 0, pw, 0);
  }
}

function saveDoc(doc, prefix) {
  const d = now();
  const fn = `${prefix}_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}_${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}.pdf`;
  doc.save(fn);
}


// ═══════════════════════════════════════════════════════════════
//  1. STORE MANAGER REPORT
// ═══════════════════════════════════════════════════════════════

export function generateStoreManagerReport(data) {
  const doc = createDoc();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 18;
  const cw = pw - margin * 2;

  let y = coverHeader(doc, "Store Manager Report", "STORE OPS", C.green);

  // ── KPI Cards ──
  y = sectionHeader(doc, y, "Performance Overview", "📊", pw, margin);
  const kpis = data.kpis || {};
  y = kpiRow(doc, y, [
    { label: "Total Shoppers", value: kpis.total_shoppers ?? 0, color: C.cyan },
    { label: "Avg Journey", value: `${kpis.avg_journey_time ?? 0}s`, color: C.green },
    { label: "Avg Dwell", value: `${kpis.avg_dwell_time ?? 0}s`, color: C.amber },
    { label: "Conversion", value: `${kpis.conversion_rate ?? 0}%`, color: C.indigo },
  ], margin, cw);

  // ── Hourly Traffic ──
  y = sectionHeader(doc, y, "Hourly Traffic Pattern", "📈", pw, margin);
  const traffic = data.hourly_traffic || [];
  if (traffic.length > 0) {
    const maxVal = Math.max(...traffic.map(t => t.count), 1);
    traffic.forEach((t) => {
      y = checkBreak(doc, y, 12);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.navy);
      doc.text(`${t.hour}:00`, margin, y + 5);
      const barW = (cw - 45) * (t.count / maxVal);
      doc.setFillColor(230, 235, 245);
      doc.roundedRect(margin + 25, y, cw - 45, 7, 2, 2, "F");
      if (barW > 0) {
        doc.setFillColor(...C.cyan);
        doc.roundedRect(margin + 25, y, Math.max(barW, 4), 7, 2, 2, "F");
      }
      doc.setFontSize(7);
      doc.setTextColor(...C.slate);
      doc.text(`${t.count} visitors`, margin + cw - 18, y + 5, { align: "right" });
      y += 11;
    });
    y += 4;
  } else {
    doc.setFontSize(9); doc.setTextColor(...C.muted);
    doc.text("No hourly traffic data available.", margin, y); y += 10;
  }

  // ── Shelf Performance Table ──
  y = checkBreak(doc, y, 30);
  y = sectionHeader(doc, y, "Shelf Performance Ranking", "🗄️", pw, margin);
  const shelves = data.shelf_performance || [];
  if (shelves.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Shelf", "Visits", "Avg Dwell", "Attention Share"]],
      body: shelves.map(s => [
        s.name || `Shelf #${s.id}`,
        String(s.visit_count ?? 0),
        `${s.avg_dwell ?? 0}s`,
        `${s.attention_share ?? 0}%`
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 4, lineColor: C.light, lineWidth: 0.2 },
      headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.bg },
      columnStyles: { 3: { textColor: C.green, fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Conversion Funnel ──
  y = checkBreak(doc, y, 40);
  y = sectionHeader(doc, y, "AIDA Conversion Funnel", "🔄", pw, margin);
  const funnel = data.conversion_funnel || {};
  const stages = [
    { label: "Footfall", value: funnel.footfall ?? 0, color: C.cyan },
    { label: "Engagement", value: funnel.engagement ?? 0, color: C.green },
    { label: "Pickup", value: funnel.pickup ?? 0, color: C.amber },
    { label: "Purchase", value: funnel.purchase ?? 0, color: C.indigo },
  ];
  const maxFunnel = Math.max(...stages.map(s => s.value), 1);
  stages.forEach(stage => {
    y = checkBreak(doc, y, 14);
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...C.navy);
    doc.text(stage.label, margin, y + 6);
    const barW = (cw - 60) * (stage.value / maxFunnel);
    doc.setFillColor(230, 235, 245);
    doc.roundedRect(margin + 35, y, cw - 60, 8, 2, 2, "F");
    doc.setFillColor(...stage.color);
    doc.roundedRect(margin + 35, y, Math.max(barW, 4), 8, 2, 2, "F");
    doc.setFontSize(8); doc.setTextColor(...stage.color);
    doc.text(String(stage.value), margin + cw - 22, y + 6, { align: "right" });
    y += 13;
  });
  y += 4;

  // ── Product Engagement ──
  y = checkBreak(doc, y, 30);
  y = sectionHeader(doc, y, "Top Product Engagement", "📦", pw, margin);
  const products = data.product_engagement || [];
  if (products.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Product", "Views", "Pickups", "Purchases", "Conv. Rate"]],
      body: products.slice(0, 15).map(p => [
        p.name || "Unknown",
        String(p.views ?? 0),
        String(p.pickups ?? 0),
        String(p.purchases ?? 0),
        `${p.conversion_rate ?? 0}%`
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 7.5, cellPadding: 3, lineColor: C.light, lineWidth: 0.2 },
      headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.bg },
      columnStyles: { 4: { textColor: C.green, fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  addFooters(doc);
  saveDoc(doc, "StoreManager_Report");
}


// ═══════════════════════════════════════════════════════════════
//  2. RETAIL ANALYST REPORT
// ═══════════════════════════════════════════════════════════════

export function generateRetailAnalystReport(data) {
  const doc = createDoc();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 18;
  const cw = pw - margin * 2;

  let y = coverHeader(doc, "Retail Analyst Report", "ANALYTICS", C.cyan);

  // ── Consumer Segments ──
  y = sectionHeader(doc, y, "Consumer Segments Distribution", "🧠", pw, margin);
  const segments = data.consumer_segments || [];
  if (segments.length > 0) {
    const total = segments.reduce((a, s) => a + (s.count || 0), 0) || 1;
    const segColors = [C.cyan, C.green, C.amber, C.purple, C.orange];
    segments.forEach((seg, i) => {
      y = checkBreak(doc, y, 16);
      const pct = Math.round((seg.count / total) * 100);
      const color = segColors[i % segColors.length];

      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...C.navy);
      doc.text(seg.segment || `Segment ${i + 1}`, margin, y + 6);

      doc.setFillColor(230, 235, 245);
      doc.roundedRect(margin + 55, y, cw - 80, 8, 2, 2, "F");
      const barW = (cw - 80) * (pct / 100);
      doc.setFillColor(...color);
      doc.roundedRect(margin + 55, y, Math.max(barW, 4), 8, 2, 2, "F");

      doc.setFontSize(8); doc.setTextColor(...color); doc.setFont("helvetica", "bold");
      doc.text(`${pct}% (${seg.count})`, margin + cw - 22, y + 6, { align: "right" });
      y += 13;
    });
    y += 4;
  }

  // ── Top Customer Routes ──
  y = checkBreak(doc, y, 30);
  y = sectionHeader(doc, y, "Top Customer Journey Routes", "🛤️", pw, margin);
  const routes = data.top_routes || [];
  if (routes.length > 0) {
    routes.slice(0, 10).forEach((route, i) => {
      y = checkBreak(doc, y, 12);
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...C.cyan);
      doc.text(`Route ${i + 1}:`, margin, y + 5);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...C.navy);
      const path = Array.isArray(route.path) ? route.path.join(" → ") : (route.path || "N/A");
      doc.text(path, margin + 22, y + 5);
      doc.setTextColor(...C.muted);
      doc.text(`${route.count || 0} shoppers`, margin + cw - 5, y + 5, { align: "right" });
      y += 10;
    });
    y += 4;
  }

  // ── Zone Heatmap Density ──
  y = checkBreak(doc, y, 30);
  y = sectionHeader(doc, y, "Zone Heatmap Density", "🗺️", pw, margin);
  const zones = data.zone_heatmaps || [];
  if (zones.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Zone", "Visit Count", "Avg Dwell Time", "Heat Level"]],
      body: zones.map(z => [
        z.zone || z.zone_id || "Unknown",
        String(z.visits ?? z.visit_count ?? 0),
        `${z.avg_dwell ?? z.average_duration ?? 0}s`,
        z.heat_level || (z.visits > 100 ? "🔥 Hot" : z.visits > 50 ? "🟡 Warm" : "🔵 Cool")
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 4, lineColor: C.light, lineWidth: 0.2 },
      headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.bg },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Product Attractiveness Scores ──
  y = checkBreak(doc, y, 30);
  y = sectionHeader(doc, y, "Product Attractiveness Scores", "⭐", pw, margin);
  const products = data.product_attractiveness || [];
  if (products.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Product", "Brand", "Attention", "Interaction", "Pickup", "Purchase", "Final Score"]],
      body: products.slice(0, 20).map(p => [
        p.name || "Unknown",
        p.brand || "-",
        String(p.attention_score ?? 0),
        String(p.interaction_score ?? 0),
        String(p.pickup_score ?? 0),
        String(p.purchase_score ?? 0),
        String(p.final_score ?? 0),
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 7, cellPadding: 3, lineColor: C.light, lineWidth: 0.2 },
      headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: C.bg },
      columnStyles: { 6: { textColor: C.green, fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  addFooters(doc);
  saveDoc(doc, "RetailAnalyst_Report");
}


// ═══════════════════════════════════════════════════════════════
//  3. MARKETING MANAGER REPORT
// ═══════════════════════════════════════════════════════════════

export function generateMarketingManagerReport(data) {
  const doc = createDoc();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 18;
  const cw = pw - margin * 2;

  let y = coverHeader(doc, "Marketing Manager Report", "MARKETING", C.purple);

  // ── KPI Cards ──
  y = sectionHeader(doc, y, "Marketing Performance", "📊", pw, margin);
  const kpis = data.kpis || {};
  y = kpiRow(doc, y, [
    { label: "Catalog Attention", value: `${kpis.catalog_attention_avg ?? 0}%`, color: C.cyan },
    { label: "High Vis SKUs", value: kpis.high_visibility_skus_count ?? 0, color: C.green },
    { label: "Anomalies", value: kpis.unmonetized_attention_count ?? 0, color: C.red },
    { label: "Repeat Rate", value: `${kpis.repeat_engagement_rate ?? 0}%`, color: C.purple },
  ], margin, cw);

  // ── High Visibility Products ──
  y = sectionHeader(doc, y, "High Visibility Products (> 60% Attention)", "🌟", pw, margin);
  const highVis = data.high_visibility_products || [];
  if (highVis.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Product", "Brand", "Attention Score", "Purchase Score", "Status"]],
      body: highVis.slice(0, 15).map(p => [
        p.name || "Unknown",
        p.brand || "-",
        `${p.attention_score ?? 0}`,
        `${p.purchase_score ?? 0}`,
        p.purchase_score > 50 ? "✅ Converting" : "⚠️ Needs Push"
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 4, lineColor: C.light, lineWidth: 0.2 },
      headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.bg },
      columnStyles: { 2: { textColor: C.green, fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Low Visibility Products ──
  y = checkBreak(doc, y, 30);
  y = sectionHeader(doc, y, "Low Visibility Products (< 30% Attention)", "📉", pw, margin);
  const lowVis = data.low_visibility_products || [];
  if (lowVis.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Product", "Brand", "Attention Score", "Recommendation"]],
      body: lowVis.slice(0, 15).map(p => [
        p.name || "Unknown",
        p.brand || "-",
        `${p.attention_score ?? 0}`,
        "Reposition or promote"
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 4, lineColor: C.light, lineWidth: 0.2 },
      headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.bg },
      columnStyles: { 2: { textColor: C.red, fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Category Engagement ──
  y = checkBreak(doc, y, 30);
  y = sectionHeader(doc, y, "Category Engagement Breakdown", "📊", pw, margin);
  const categories = data.category_engagement || [];
  if (categories.length > 0) {
    const maxCat = Math.max(...categories.map(c => c.engagement ?? 0), 1);
    categories.forEach(cat => {
      y = checkBreak(doc, y, 13);
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...C.navy);
      doc.text(cat.category || "Unknown", margin, y + 6);
      const barW = (cw - 60) * ((cat.engagement ?? 0) / maxCat);
      doc.setFillColor(230, 235, 245);
      doc.roundedRect(margin + 40, y, cw - 60, 8, 2, 2, "F");
      doc.setFillColor(...C.purple);
      doc.roundedRect(margin + 40, y, Math.max(barW, 4), 8, 2, 2, "F");
      doc.setFontSize(8); doc.setTextColor(...C.purple);
      doc.text(`${cat.engagement ?? 0}%`, margin + cw - 18, y + 6, { align: "right" });
      y += 12;
    });
    y += 4;
  }

  // ── AI Recommendations ──
  y = checkBreak(doc, y, 30);
  y = sectionHeader(doc, y, "AI-Powered Recommendations", "🤖", pw, margin);
  const recommendations = data.recommendations || [];
  if (recommendations.length > 0) {
    recommendations.slice(0, 8).forEach(rec => {
      y = checkBreak(doc, y, 18);
      doc.setFillColor(...C.purple);
      doc.rect(margin, y, 2, 12, "F");
      drawRoundedRect(doc, margin + 3, y, cw - 3, 12, 2, C.bg, null);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...C.navy);
      const lines = doc.splitTextToSize(`💡 ${rec.text || rec.recommendation || rec}`, cw - 14);
      doc.text(lines, margin + 7, y + 5);
      y += Math.max(lines.length * 4 + 4, 12) + 4;
    });
  }

  addFooters(doc);
  saveDoc(doc, "MarketingManager_Report");
}


// ═══════════════════════════════════════════════════════════════
//  4. ADMINISTRATOR REPORT
// ═══════════════════════════════════════════════════════════════

export function generateAdminReport(data) {
  const doc = createDoc();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 18;
  const cw = pw - margin * 2;

  let y = coverHeader(doc, "System Administrator Report", "ADMIN", C.orange);

  // ── Platform KPIs ──
  y = sectionHeader(doc, y, "Platform Overview", "📊", pw, margin);
  const metrics = data.platform_metrics || {};
  y = kpiRow(doc, y, [
    { label: "Total Stores", value: metrics.stores_count ?? 0, color: C.cyan },
    { label: "Shelves", value: metrics.shelves_count ?? 0, color: C.green },
    { label: "Products", value: metrics.products_count ?? 0, color: C.amber },
    { label: "Sessions", value: metrics.sessions_count ?? 0, color: C.indigo },
  ], margin, cw);

  // ── Camera Status ──
  y = sectionHeader(doc, y, "Camera Infrastructure Status", "📹", pw, margin);
  const cameras = data.cameras || [];
  if (cameras.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Camera Name", "Store", "Source", "Status"]],
      body: cameras.map(c => [
        c.name || "Unknown",
        c.store_name || "Unassigned",
        c.ip_address || "Local Feed",
        c.status || "Configured"
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 4, lineColor: C.light, lineWidth: 0.2 },
      headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.bg },
      didParseCell: (d) => {
        if (d.section === "body" && d.column.index === 3) {
          d.cell.styles.textColor = d.cell.raw.includes("Streaming") ? C.green : C.cyan;
          d.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── AI Services Health ──
  y = checkBreak(doc, y, 30);
  y = sectionHeader(doc, y, "AI Services Health Check", "🤖", pw, margin);
  const services = data.system_health || [];
  if (services.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Service", "Status", "Details"]],
      body: services.map(s => [
        s.service || "Unknown",
        s.status || "Unknown",
        s.latency || s.engine || "-"
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 4, lineColor: C.light, lineWidth: 0.2 },
      headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.bg },
      didParseCell: (d) => {
        if (d.section === "body" && d.column.index === 1) {
          d.cell.styles.textColor = d.cell.raw === "Operational" || d.cell.raw === "Connected" ? C.green : C.red;
          d.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  addFooters(doc);
  saveDoc(doc, "Administrator_Report");
}
