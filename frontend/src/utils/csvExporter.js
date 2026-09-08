// ═══════════════════════════════════════════════════════════════
//  RetailEye AI — CSV / Excel Export Utility
//  Exports dashboard data as downloadable CSV files
// ═══════════════════════════════════════════════════════════════

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(csvContent, filename) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function arrayToCsv(headers, rows) {
  const headerLine = headers.map(escapeCsv).join(",");
  const dataLines = rows.map(row => row.map(escapeCsv).join(","));
  return [headerLine, ...dataLines].join("\n");
}

function timestampSuffix() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}


// ═══════════════════════════════════════════════════════════════
//  STORE MANAGER CSV EXPORT
// ═══════════════════════════════════════════════════════════════

export function exportStoreManagerCsv(data) {
  let csv = "";
  const ts = timestampSuffix();

  // ── KPIs Section ──
  csv += "=== STORE MANAGER KPIs ===\n";
  const kpis = data.kpis || {};
  csv += arrayToCsv(
    ["Metric", "Value"],
    [
      ["Total Shoppers", kpis.total_shoppers ?? 0],
      ["Avg Journey Time (s)", kpis.avg_journey_time ?? 0],
      ["Avg Dwell Time (s)", kpis.avg_dwell_time ?? 0],
      ["Top Shelf", kpis.top_shelf ?? "N/A"],
      ["Conversion Rate (%)", kpis.conversion_rate ?? 0],
    ]
  );
  csv += "\n\n";

  // ── Hourly Traffic ──
  csv += "=== HOURLY TRAFFIC ===\n";
  const traffic = data.hourly_traffic || [];
  csv += arrayToCsv(
    ["Hour", "Visitor Count"],
    traffic.map(t => [`${t.hour}:00`, t.count])
  );
  csv += "\n\n";

  // ── Shelf Performance ──
  csv += "=== SHELF PERFORMANCE ===\n";
  const shelves = data.shelf_performance || [];
  csv += arrayToCsv(
    ["Shelf", "Visit Count", "Avg Dwell (s)", "Attention Share (%)"],
    shelves.map(s => [s.name || `Shelf #${s.id}`, s.visit_count ?? 0, s.avg_dwell ?? 0, s.attention_share ?? 0])
  );
  csv += "\n\n";

  // ── Product Engagement ──
  csv += "=== PRODUCT ENGAGEMENT ===\n";
  const products = data.product_engagement || [];
  csv += arrayToCsv(
    ["Product", "Views", "Pickups", "Purchases", "Conversion Rate (%)"],
    products.map(p => [p.name || "Unknown", p.views ?? 0, p.pickups ?? 0, p.purchases ?? 0, p.conversion_rate ?? 0])
  );
  csv += "\n\n";

  // ── Conversion Funnel ──
  csv += "=== CONVERSION FUNNEL ===\n";
  const funnel = data.conversion_funnel || {};
  csv += arrayToCsv(
    ["Stage", "Count"],
    [
      ["Footfall", funnel.footfall ?? 0],
      ["Engagement", funnel.engagement ?? 0],
      ["Pickup", funnel.pickup ?? 0],
      ["Purchase", funnel.purchase ?? 0],
    ]
  );

  downloadCsv(csv, `StoreManager_Export_${ts}.csv`);
}


// ═══════════════════════════════════════════════════════════════
//  RETAIL ANALYST CSV EXPORT
// ═══════════════════════════════════════════════════════════════

export function exportRetailAnalystCsv(data) {
  let csv = "";
  const ts = timestampSuffix();

  // ── Consumer Segments ──
  csv += "=== CONSUMER SEGMENTS ===\n";
  const segments = data.consumer_segments || [];
  const total = segments.reduce((a, s) => a + (s.count || 0), 0) || 1;
  csv += arrayToCsv(
    ["Segment", "Count", "Percentage (%)"],
    segments.map(s => [s.segment, s.count ?? 0, Math.round((s.count / total) * 100)])
  );
  csv += "\n\n";

  // ── Top Routes ──
  csv += "=== TOP CUSTOMER ROUTES ===\n";
  const routes = data.top_routes || [];
  csv += arrayToCsv(
    ["Route #", "Path", "Shopper Count"],
    routes.map((r, i) => [i + 1, Array.isArray(r.path) ? r.path.join(" → ") : r.path, r.count ?? 0])
  );
  csv += "\n\n";

  // ── Zone Heatmap ──
  csv += "=== ZONE HEATMAP DENSITY ===\n";
  const zones = data.zone_heatmaps || [];
  csv += arrayToCsv(
    ["Zone", "Visits", "Avg Dwell (s)", "Heat Level"],
    zones.map(z => [
      z.zone || z.zone_id,
      z.visits ?? z.visit_count ?? 0,
      z.avg_dwell ?? z.average_duration ?? 0,
      z.heat_level || (z.visits > 100 ? "Hot" : z.visits > 50 ? "Warm" : "Cool")
    ])
  );
  csv += "\n\n";

  // ── Product Attractiveness ──
  csv += "=== PRODUCT ATTRACTIVENESS SCORES ===\n";
  const products = data.product_attractiveness || [];
  csv += arrayToCsv(
    ["Product", "Brand", "Attention", "Interaction", "Pickup", "Purchase", "Repeat", "Final Score"],
    products.map(p => [
      p.name, p.brand, p.attention_score ?? 0, p.interaction_score ?? 0,
      p.pickup_score ?? 0, p.purchase_score ?? 0, p.repeat_score ?? 0, p.final_score ?? 0
    ])
  );

  downloadCsv(csv, `RetailAnalyst_Export_${ts}.csv`);
}


// ═══════════════════════════════════════════════════════════════
//  MARKETING MANAGER CSV EXPORT
// ═══════════════════════════════════════════════════════════════

export function exportMarketingManagerCsv(data) {
  let csv = "";
  const ts = timestampSuffix();

  // ── KPIs ──
  csv += "=== MARKETING KPIs ===\n";
  const kpis = data.kpis || {};
  csv += arrayToCsv(
    ["Metric", "Value"],
    [
      ["Catalog Attention Avg (%)", kpis.catalog_attention_avg ?? 0],
      ["High Visibility SKUs", kpis.high_visibility_skus_count ?? 0],
      ["Unmonetized Anomalies", kpis.unmonetized_attention_count ?? 0],
      ["Repeat Engagement Rate (%)", kpis.repeat_engagement_rate ?? 0],
    ]
  );
  csv += "\n\n";

  // ── High Visibility Products ──
  csv += "=== HIGH VISIBILITY PRODUCTS ===\n";
  const highVis = data.high_visibility_products || [];
  csv += arrayToCsv(
    ["Product", "Brand", "Attention Score", "Purchase Score"],
    highVis.map(p => [p.name, p.brand, p.attention_score ?? 0, p.purchase_score ?? 0])
  );
  csv += "\n\n";

  // ── Low Visibility Products ──
  csv += "=== LOW VISIBILITY PRODUCTS ===\n";
  const lowVis = data.low_visibility_products || [];
  csv += arrayToCsv(
    ["Product", "Brand", "Attention Score", "Purchase Score"],
    lowVis.map(p => [p.name, p.brand, p.attention_score ?? 0, p.purchase_score ?? 0])
  );
  csv += "\n\n";

  // ── Category Engagement ──
  csv += "=== CATEGORY ENGAGEMENT ===\n";
  const categories = data.category_engagement || [];
  csv += arrayToCsv(
    ["Category", "Engagement (%)"],
    categories.map(c => [c.category, c.engagement ?? 0])
  );

  downloadCsv(csv, `MarketingManager_Export_${ts}.csv`);
}


// ═══════════════════════════════════════════════════════════════
//  ADMINISTRATOR CSV EXPORT
// ═══════════════════════════════════════════════════════════════

export function exportAdminCsv(data) {
  let csv = "";
  const ts = timestampSuffix();

  // ── Platform Metrics ──
  csv += "=== PLATFORM METRICS ===\n";
  const m = data.platform_metrics || {};
  csv += arrayToCsv(
    ["Metric", "Value"],
    [
      ["Stores", m.stores_count ?? 0],
      ["Shelves", m.shelves_count ?? 0],
      ["Products", m.products_count ?? 0],
      ["Cameras", (data.cameras || []).length],
      ["Tracking Sessions", m.sessions_count ?? 0],
      ["Zone Events", m.zone_events_count ?? 0],
      ["Product Interactions", m.interactions_count ?? 0],
    ]
  );
  csv += "\n\n";

  // ── Camera Status ──
  csv += "=== CAMERA STATUS ===\n";
  const cameras = data.cameras || [];
  csv += arrayToCsv(
    ["Camera Name", "Store", "Source", "Status"],
    cameras.map(c => [c.name, c.store_name, c.ip_address || "Local", c.status])
  );
  csv += "\n\n";

  // ── AI Services ──
  csv += "=== AI SERVICES HEALTH ===\n";
  const services = data.system_health || [];
  csv += arrayToCsv(
    ["Service", "Status", "Details"],
    services.map(s => [s.service, s.status, s.latency || s.engine || "-"])
  );

  downloadCsv(csv, `Administrator_Export_${ts}.csv`);
}
