"use client";
import React, { useState, useEffect } from "react";

const T = {
  bg: "#0B0F17", cardBg: "#131A27", border: "#232C40",
  text: "#EDEFF3", muted: "#8A93A6",
  accent: "#E8A33D", success: "#5FAE86",
  danger: "#E8654F", info: "#5B8DEF", purple: "#9B72E8",
};

const card = { backgroundColor: T.cardBg, borderRadius: "12px", border: `1px solid ${T.border}`, padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)" };

// ── MOCK DATA (matches backend engine logic) ──────────────────────────
const MOCK_PROFILES = [
  { id:"SHOPPER-01", persona:"High-Intent Deliberator", emoji:"🧐", description:"Evaluating products deeply. Very high purchase probability.", purchase_probability:91, color:"#E8A33D", mood_signal:"Focused & Evaluating", time_in_store_min:14.7, zones_visited:["Entrance","Electronics","Grocery & Snacks"], gaze_fixations:12, touch_events:4, items_returned:1, backtrack_count:0, velocity_mps:0.54, entry_time:"01:41 PM", current_zone:"Grocery & Snacks", next_zone_prediction:"Checkout", next_zone_probability:32, opportunity_alert:true },
  { id:"SHOPPER-02", persona:"Casual Browser", emoji:"🛍️", description:"Exploring multiple zones without strong product intent.", purchase_probability:40, color:"#5B8DEF", mood_signal:"Relaxed & Exploring", time_in_store_min:8.2, zones_visited:["Entrance","Apparel","Electronics"], gaze_fixations:6, touch_events:1, items_returned:0, backtrack_count:1, velocity_mps:0.82, entry_time:"01:46 PM", current_zone:"Electronics", next_zone_prediction:"Grocery & Snacks", next_zone_probability:42, opportunity_alert:false },
  { id:"SHOPPER-03", persona:"Mission Shopper", emoji:"🎯", description:"Direct, fast-moving shopper with a specific product in mind.", purchase_probability:88, color:"#5FAE86", mood_signal:"Impatient / Hurrying", time_in_store_min:3.1, zones_visited:["Entrance","Grocery & Snacks"], gaze_fixations:3, touch_events:2, items_returned:0, backtrack_count:0, velocity_mps:1.45, entry_time:"01:51 PM", current_zone:"Grocery & Snacks", next_zone_prediction:"Checkout", next_zone_probability:32, opportunity_alert:true },
  { id:"SHOPPER-04", persona:"Lost / Confused", emoji:"❓", description:"Erratic backtracking. Navigation unclear or product not found.", purchase_probability:14, color:"#E8654F", mood_signal:"Impatient / Hurrying", time_in_store_min:11.3, zones_visited:["Entrance","Apparel","Electronics","Entrance"], gaze_fixations:2, touch_events:0, items_returned:0, backtrack_count:4, velocity_mps:0.95, entry_time:"01:43 PM", current_zone:"Entrance", next_zone_prediction:"Grocery & Snacks", next_zone_probability:48, opportunity_alert:false },
  { id:"SHOPPER-05", persona:"High-Intent Deliberator", emoji:"🧐", description:"Deep product evaluation across multiple shelves.", purchase_probability:84, color:"#E8A33D", mood_signal:"Curious & Engaged", time_in_store_min:18.5, zones_visited:["Electronics","Apparel"], gaze_fixations:10, touch_events:3, items_returned:1, backtrack_count:0, velocity_mps:0.41, entry_time:"01:35 PM", current_zone:"Apparel", next_zone_prediction:"Checkout", next_zone_probability:52, opportunity_alert:true },
  { id:"SHOPPER-06", persona:"Casual Browser", emoji:"🛍️", description:"Low urgency browsing across the store.", purchase_probability:32, color:"#5B8DEF", mood_signal:"Relaxed & Exploring", time_in_store_min:5.8, zones_visited:["Entrance","Grocery & Snacks","Apparel"], gaze_fixations:4, touch_events:0, items_returned:0, backtrack_count:1, velocity_mps:0.73, entry_time:"01:49 PM", current_zone:"Apparel", next_zone_prediction:"Electronics", next_zone_probability:20, opportunity_alert:false },
];

const MOCK_FUNNEL = {
  stages: [
    { label:"Passersby (Impressions)", icon:"👁️", count:1480, pct:100,  color:"#5B8DEF" },
    { label:"Gaze Fixation (>1.5s)",  icon:"🔍", count:903,  pct:61.0, color:"#E8A33D" },
    { label:"Product Touch / Pickup", icon:"🖐️", count:343,  pct:23.2, color:"#5FAE86" },
    { label:"Cart / Basket Addition", icon:"🛒", count:178,  pct:12.0, color:"#9B72E8" },
    { label:"Completed Purchase",     icon:"✅", count:162,  pct:10.9, color:"#5FAE86" },
  ],
  dropoffs: { impression_to_gaze:39.0, gaze_to_touch:62.0, touch_to_cart:48.1, cart_to_purchase:9.0 },
  overall_visual_conversion: 38.0,
  abandonment_rate: 48.1,
};

const MOCK_FRICTION = {
  total_estimated_leakage_inr: 21500,
  critical_count: 1, high_count: 2, medium_count: 1,
  alerts: [
    { product:"Electronics Showcase — Display A", zone:"Electronics", gaze_pct:86, touch_pct:12, severity:"critical", severity_color:"#E8654F", type_label:"High Gaze / No Touch", revenue_lost_inr:8600, recommendation:"Price resistance or unclear specs. Recommend a 15% promotional tag or better product info card." },
    { product:"Premium Whiskey — Shelf C2", zone:"Grocery & Snacks", gaze_pct:74, touch_pct:19, severity:"high", severity_color:"#E8A33D", type_label:"Touch & Return", revenue_lost_inr:5200, recommendation:"Customers read label then return item. Add a taste-test offer card or bundle promotion." },
    { product:"Aisle 3 — Winter Apparel End Cap", zone:"Apparel", gaze_pct:8, touch_pct:2, severity:"medium", severity_color:"#5B8DEF", type_label:"Dead Zone", revenue_lost_inr:4200, recommendation:"Zero engagement despite high footfall. Rotate to seasonal hero items or add LED spotlight." },
    { product:"POS Counter 2 Queue", zone:"Checkout", gaze_pct:0, touch_pct:0, severity:"high", severity_color:"#E8A33D", type_label:"Queue Abandonment", revenue_lost_inr:3500, recommendation:"5 shoppers left before checkout. Open POS Counter 3 during peak hours." },
  ],
};

const MOCK_CXI = {
  cxi_score: 71.4, grade:"B", grade_color:"#E8A33D", grade_label:"Good",
  components: { navigation_smoothness:17.0, checkout_velocity:15.7, merchandising_quality:17.1, shopper_engagement:15.3 },
  benchmarks: { avg_dwell_min:14.8, dwell_vs_benchmark_min:2.8, camera_uptime_pct:99.4, golden_zone_pct:68.4 },
};

const MOCK_MOOD = { mood:"Peak Shopping Rush", emoji:"⚡", color:"#E8654F", risk_level:"High — Open extra POS", live_shopper_count:18, timestamp:"01:54 PM" };

const MOCK_ACTIONS = [
  { priority:"URGENT", color:"#E8654F", icon:"🔴", action:"Open POS Counter 3 immediately — 8 shoppers queuing, est. wait 6.2 mins." },
  { priority:"HIGH",   color:"#E8A33D", icon:"🟡", action:"Restock Electronics Showcase Shelf B — 3 units left, 86% gaze on this shelf." },
  { priority:"HIGH",   color:"#E8A33D", icon:"🟡", action:"SHOPPER-07 is High-Intent (82% prob) — send staff or activate promo display now." },
  { priority:"MEDIUM", color:"#5B8DEF", icon:"🔵", action:"Move beverage promo tag to Eye-Level Shelf 2 — 3rd-shelf position losing 74% of gaze." },
  { priority:"LOW",    color:"#5FAE86", icon:"🟢", action:"Rotate Apparel end-cap — no meaningful engagement in last 2 hours." },
];

const MOCK_ATTRACTIVENESS = {
  formula_weights: {
    attention_duration_pct: 35,
    interaction_frequency_pct: 25,
    pickup_rate_pct: 20,
    purchase_conversion_pct: 15,
    repeat_engagement_pct: 5
  },
  avg_catalog_score: 71.2,
  ranked_products: [
    { sku: "SKU-BEV-001", name: "Sparkling Citrus Energy Drink 330ml", category: "Beverages", zone: "Grocery & Snacks", shelf: "Eye-Level (Golden Zone)", attractiveness_score: 86.6, tier: "High Attractiveness (Star Product)", tier_color: "#5FAE86", attn: 92, interaction: 85, pickup: 88, conversion: 82, repeat: 75, price: "₹120" },
    { sku: "SKU-BEV-008", name: "Cold Brew Espresso Can 250ml", category: "Beverages", zone: "Grocery & Snacks", shelf: "Eye-Level (Golden Zone)", attractiveness_score: 83.2, tier: "High Attractiveness (Star Product)", tier_color: "#5FAE86", attn: 88, interaction: 82, pickup: 84, conversion: 79, repeat: 65, price: "₹160" },
    { sku: "SKU-SNK-109", name: "Artisan Roasted Almonds & Sea Salt", category: "Snacks", zone: "Grocery & Snacks", shelf: "Reach Level", attractiveness_score: 76.7, tier: "Moderate Attractiveness (Steady)", tier_color: "#E8A33D", attn: 78, interaction: 74, pickup: 80, conversion: 76, repeat: 70, price: "₹250" },
    { sku: "SKU-ELE-042", name: "Wireless Noise-Cancelling Headphones", category: "Electronics", zone: "Electronics", shelf: "Top Feature Display", attractiveness_score: 70.3, tier: "Moderate Attractiveness (Steady)", tier_color: "#E8A33D", attn: 96, interaction: 68, pickup: 45, conversion: 38, repeat: 60, price: "₹4,999" },
    { sku: "SKU-APP-201", name: "Classic Cotton Oxford Shirt (Navy)", category: "Apparel", zone: "Apparel", shelf: "Hanger Rack A2", attractiveness_score: 54.5, tier: "Low Attractiveness (Underperforming)", tier_color: "#E8654F", attn: 62, interaction: 58, pickup: 50, conversion: 42, repeat: 40, price: "₹1,499" },
    { sku: "SKU-SNK-055", name: "Organic Gluten-Free Granola Bar", category: "Snacks", zone: "Grocery & Snacks", shelf: "Bottom Shelf", attractiveness_score: 32.2, tier: "Low Attractiveness (Underperforming)", tier_color: "#E8654F", attn: 38, interaction: 32, pickup: 28, conversion: 25, repeat: 30, price: "₹80" },
  ]
};

// ── HELPER COMPONENTS ────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom:"16px" }}>
      <h3 style={{ margin:0, fontSize:"16px", fontWeight:700 }}>{icon} {title}</h3>
      {subtitle && <p style={{ margin:"4px 0 0", fontSize:"12px", color:T.muted }}>{subtitle}</p>}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{ padding:"3px 8px", borderRadius:"20px", fontSize:"10px", fontWeight:700,
      backgroundColor:`${color}22`, color, border:`1px solid ${color}44` }}>
      {label}
    </span>
  );
}

function ProductAttractivenessModule({ data }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <SectionHeader
            icon="🏆"
            title="Product Attractiveness Scoring Engine (Weighted Model)"
            subtitle="Composite attractiveness metric calculated using Attention Duration (35%), Interaction (25%), Pickup (20%), Conversion (15%), and Repeat (5%)."
          />
        </div>
        <div style={{ background: T.bg, padding: "8px 16px", borderRadius: "8px", border: `1px solid ${T.border}`, textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: T.muted }}>Catalog Avg Score</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: T.accent }}>{data.avg_catalog_score} <span style={{ fontSize: "13px", color: T.muted }}>/ 100</span></div>
        </div>
      </div>

      {/* Formula Weights Ribbon */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px", padding: "10px 14px", background: T.bg, borderRadius: "8px", border: `1px solid ${T.border}` }}>
        <span style={{ fontSize: "11px", color: T.muted, fontWeight: 700, alignSelf: "center", marginRight: "6px" }}>📐 FORMULA WEIGHTS:</span>
        <Badge label="35% Attention Duration" color={T.accent} />
        <Badge label="25% Interaction Freq" color={T.info} />
        <Badge label="20% Pickup Rate" color={T.success} />
        <Badge label="15% Conversion Rate" color={T.purple} />
        <Badge label="5% Repeat Rate" color={T.muted} />
      </div>

      {/* Ranked Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, color: T.muted }}>
              <th style={{ padding: "10px 8px" }}>Rank & SKU</th>
              <th style={{ padding: "10px 8px" }}>Product Name</th>
              <th style={{ padding: "10px 8px" }}>Category & Shelf</th>
              <th style={{ padding: "10px 8px" }}>Price</th>
              <th style={{ padding: "10px 8px" }}>Attn (35%)</th>
              <th style={{ padding: "10px 8px" }}>Touch (20%)</th>
              <th style={{ padding: "10px 8px" }}>Attractiveness Score</th>
              <th style={{ padding: "10px 8px" }}>Status Tier</th>
            </tr>
          </thead>
          <tbody>
            {data.ranked_products.map((p, idx) => (
              <tr key={p.sku} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px 8px", fontWeight: 700, color: idx === 0 ? T.accent : T.text }}>
                  #{idx + 1} <span style={{ fontSize: "10px", color: T.muted }}>({p.sku})</span>
                </td>
                <td style={{ padding: "12px 8px", fontWeight: 600, color: T.text }}>{p.name}</td>
                <td style={{ padding: "12px 8px", color: T.muted }}>
                  <div>{p.category}</div>
                  <div style={{ fontSize: "10px", color: T.info }}>{p.shelf}</div>
                </td>
                <td style={{ padding: "12px 8px", fontWeight: 600 }}>{p.price}</td>
                <td style={{ padding: "12px 8px", color: T.accent, fontWeight: 700 }}>{p.attn}%</td>
                <td style={{ padding: "12px 8px", color: T.success, fontWeight: 700 }}>{p.pickup}%</td>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "60px", height: "6px", background: T.bg, borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${p.attractiveness_score}%`, height: "100%", background: p.tier_color, borderRadius: "3px" }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "14px", color: p.tier_color }}>{p.attractiveness_score}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <Badge label={p.tier} color={p.tier_color} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SECTION 1: STORE MOOD BANNER ─────────────────────────────────────
function StoreMoodBanner({ data }) {
  return (
    <div style={{ ...card, borderLeft:`4px solid ${data.color}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
        <span style={{ fontSize:"36px" }}>{data.emoji}</span>
        <div>
          <div style={{ fontSize:"11px", color:T.muted, fontWeight:700, textTransform:"uppercase" }}>Live Store Mood · {data.timestamp}</div>
          <div style={{ fontSize:"22px", fontWeight:800, color:data.color, marginTop:"2px" }}>{data.mood}</div>
          <div style={{ fontSize:"12px", color:T.muted, marginTop:"2px" }}>Risk Level: <strong style={{ color:data.color }}>{data.risk_level}</strong></div>
        </div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:"11px", color:T.muted }}>LIVE SHOPPERS IN STORE</div>
        <div style={{ fontSize:"38px", fontWeight:800, color:T.accent, display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ width:"12px", height:"12px", borderRadius:"50%", backgroundColor:T.success, display:"inline-block", boxShadow:"0 0 10px #5FAE86", animation:"pulse 2s infinite" }}></span>
          {data.live_shopper_count}
        </div>
      </div>
    </div>
  );
}

// ── SECTION 2: SHOPPER DNA CARDS ────────────────────────────────────
function ShopperDNAGrid({ profiles, onSelect, selected }) {
  return (
    <div style={card}>
      <SectionHeader icon="🧬" title="Live Shopper DNA Profiles" subtitle="Real-time behavioural classification, purchase probability, and next-move prediction for every detected shopper." />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"14px" }}>
        {profiles.map(p => (
          <div key={p.id} onClick={() => onSelect(p)}
            style={{ background:T.bg, padding:"14px", borderRadius:"10px", border:`2px solid ${selected?.id===p.id ? p.color : T.border}`, cursor:"pointer", transition:"all 0.2s" }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"22px" }}>{p.emoji}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:"13px", color:T.text }}>{p.id}</div>
                  <div style={{ fontSize:"11px", color:p.color, fontWeight:600 }}>{p.persona}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                {p.opportunity_alert && <div style={{ fontSize:"10px", color:T.danger, fontWeight:700 }}>🚨 OPPORTUNITY</div>}
                <div style={{ fontSize:"20px", fontWeight:800, color:p.color }}>{p.purchase_probability}%</div>
                <div style={{ fontSize:"9px", color:T.muted }}>PURCHASE PROB</div>
              </div>
            </div>
            {/* Purchase Probability Bar */}
            <div style={{ margin:"10px 0 8px", height:"6px", backgroundColor:T.cardBg, borderRadius:"3px", overflow:"hidden" }}>
              <div style={{ width:`${p.purchase_probability}%`, height:"100%", backgroundColor:p.color, borderRadius:"3px", transition:"width 0.6s ease" }} />
            </div>
            {/* Stats Row */}
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"8px" }}>
              <span style={{ fontSize:"10px", color:T.muted }}>⏱ {p.time_in_store_min}m</span>
              <span style={{ fontSize:"10px", color:T.muted }}>👁 {p.gaze_fixations} fixations</span>
              <span style={{ fontSize:"10px", color:T.muted }}>🖐 {p.touch_events} touches</span>
            </div>
            {/* Zones visited */}
            <div style={{ display:"flex", gap:"4px", marginTop:"8px", flexWrap:"wrap" }}>
              {p.zones_visited.map((z, i) => (
                <span key={i} style={{ fontSize:"9px", padding:"2px 6px", borderRadius:"10px", backgroundColor:`${T.info}22`, color:T.info, fontWeight:600 }}>{z}</span>
              ))}
            </div>
            {/* Next Zone Prediction */}
            <div style={{ marginTop:"10px", padding:"8px", borderRadius:"8px", background:`${p.color}11`, border:`1px solid ${p.color}33` }}>
              <div style={{ fontSize:"10px", color:T.muted }}>🔮 Next Zone Prediction</div>
              <div style={{ fontSize:"12px", fontWeight:700, color:p.color, marginTop:"2px" }}>
                {p.next_zone_prediction} <span style={{ color:T.muted, fontWeight:400 }}>({p.next_zone_probability}% probability)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SECTION 2B: SHOPPER DETAIL DRAWER ──────────────────────────────
function ShopperDetailDrawer({ shopper, onClose }) {
  if (!shopper) return null;
  return (
    <div style={{ ...card, borderLeft:`4px solid ${shopper.color}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontSize:"28px" }}>{shopper.emoji}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:"16px" }}>{shopper.id} — {shopper.persona}</div>
            <div style={{ fontSize:"12px", color:T.muted }}>Mood Signal: {shopper.mood_signal} · Entry: {shopper.entry_time}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:"18px" }}>✕</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"16px" }}>
        {[
          ["Time In Store", `${shopper.time_in_store_min} min`, T.accent],
          ["Purchase Probability", `${shopper.purchase_probability}%`, shopper.color],
          ["Gaze Fixations", shopper.gaze_fixations, T.info],
          ["Product Touches", shopper.touch_events, T.success],
          ["Items Returned", shopper.items_returned, T.danger],
          ["Backtracks", shopper.backtrack_count, shopper.backtrack_count >= 3 ? T.danger : T.muted],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background:T.bg, padding:"10px 12px", borderRadius:"8px", textAlign:"center" }}>
            <div style={{ fontSize:"10px", color:T.muted }}>{label}</div>
            <div style={{ fontSize:"20px", fontWeight:800, color, marginTop:"4px" }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:"12px", color:T.muted, padding:"10px", background:T.bg, borderRadius:"8px" }}>
        💡 {shopper.description}
      </div>
      {shopper.opportunity_alert && (
        <div style={{ marginTop:"12px", padding:"12px", borderRadius:"8px", background:"#E8654F22", border:`1px solid #E8654F66` }}>
          <strong style={{ color:T.danger }}>🚨 OPPORTUNITY WINDOW ALERT</strong>
          <p style={{ margin:"6px 0 0", fontSize:"12px", color:T.muted }}>
            {shopper.id} has <strong style={{color:shopper.color}}>{shopper.purchase_probability}% purchase probability</strong> and is currently in <strong style={{color:T.text}}>{shopper.current_zone}</strong>.
            Staff intervention or a targeted promo display recommended immediately.
          </p>
        </div>
      )}
    </div>
  );
}

// ── SECTION 3: PURCHASE FUNNEL ───────────────────────────────────────
function PurchaseFunnel({ data }) {
  return (
    <div style={card}>
      <SectionHeader icon="🔻" title="Visual Purchase Funnel — Today" subtitle="Drop-off analysis across the 4 physical shopping stages. Identify where and why customers disengage." />
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {data.stages.map((s, i) => (
          <div key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", marginBottom:"4px" }}>
              <span style={{ color:T.text, fontWeight:600 }}>{s.icon} {s.label}</span>
              <span style={{ color:s.color, fontWeight:700 }}>{s.count.toLocaleString()} <span style={{color:T.muted, fontWeight:400}}>({s.pct}%)</span></span>
            </div>
            <div style={{ height:"28px", backgroundColor:T.bg, borderRadius:"6px", overflow:"hidden" }}>
              <div style={{ width:`${s.pct}%`, height:"100%", backgroundColor:s.color, borderRadius:"6px", opacity:0.85, transition:"width 0.8s ease", display:"flex", alignItems:"center", paddingLeft:"8px" }}>
              </div>
            </div>
            {i < data.stages.length - 1 && (
              <div style={{ fontSize:"10px", color:T.danger, textAlign:"right", marginTop:"3px" }}>
                ↓ {Object.values(data.dropoffs)[i]}% drop-off at this stage
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"16px" }}>
        <div style={{ background:T.bg, padding:"12px", borderRadius:"8px", textAlign:"center" }}>
          <div style={{ fontSize:"11px", color:T.muted }}>Visual → Touch Conversion</div>
          <div style={{ fontSize:"24px", fontWeight:800, color:T.success }}>{data.overall_visual_conversion}%</div>
        </div>
        <div style={{ background:T.bg, padding:"12px", borderRadius:"8px", textAlign:"center" }}>
          <div style={{ fontSize:"11px", color:T.muted }}>Touch → Cart Abandonment</div>
          <div style={{ fontSize:"24px", fontWeight:800, color:T.danger }}>{data.abandonment_rate}%</div>
        </div>
      </div>
    </div>
  );
}

// ── SECTION 4: FRICTION ALERTS ───────────────────────────────────────
function FrictionAlerts({ data }) {
  return (
    <div style={card}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
        <SectionHeader icon="⚠️" title="Merchandising Friction & Lost Opportunity Alerts" subtitle="AI-detected revenue leakage zones with actionable fix recommendations." />
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"10px", color:T.muted }}>EST. REVENUE LEAKAGE TODAY</div>
          <div style={{ fontSize:"28px", fontWeight:800, color:T.danger }}>₹{data.total_estimated_leakage_inr.toLocaleString()}</div>
          <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end", marginTop:"4px" }}>
            <Badge label={`${data.critical_count} Critical`} color={T.danger} />
            <Badge label={`${data.high_count} High`} color={T.accent} />
            <Badge label={`${data.medium_count} Medium`} color={T.info} />
          </div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {data.alerts.map((a, i) => (
          <div key={i} style={{ background:T.bg, padding:"14px", borderRadius:"10px", borderLeft:`4px solid ${a.severity_color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"8px" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:"13px", color:T.text }}>{a.product}</div>
                <div style={{ fontSize:"11px", color:T.muted, marginTop:"2px" }}>Zone: {a.zone}</div>
              </div>
              <div style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
                <Badge label={a.type_label} color={a.severity_color} />
                <span style={{ fontSize:"13px", fontWeight:800, color:T.danger }}>₹{a.revenue_lost_inr.toLocaleString()} lost</span>
              </div>
            </div>
            {(a.gaze_pct > 0 || a.touch_pct > 0) && (
              <div style={{ display:"flex", gap:"16px", margin:"10px 0" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"10px", color:T.muted, marginBottom:"3px" }}>Gaze Attention</div>
                  <div style={{ height:"8px", background:T.cardBg, borderRadius:"4px", overflow:"hidden" }}>
                    <div style={{ width:`${a.gaze_pct}%`, height:"100%", background:T.accent, borderRadius:"4px" }} />
                  </div>
                  <div style={{ fontSize:"10px", color:T.accent, marginTop:"2px" }}>{a.gaze_pct}%</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"10px", color:T.muted, marginBottom:"3px" }}>Product Touch Rate</div>
                  <div style={{ height:"8px", background:T.cardBg, borderRadius:"4px", overflow:"hidden" }}>
                    <div style={{ width:`${a.touch_pct}%`, height:"100%", background:T.success, borderRadius:"4px" }} />
                  </div>
                  <div style={{ fontSize:"10px", color:T.success, marginTop:"2px" }}>{a.touch_pct}%</div>
                </div>
              </div>
            )}
            <div style={{ fontSize:"11px", color:T.muted, padding:"8px", background:`${a.severity_color}11`, borderRadius:"6px" }}>
              💡 {a.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SECTION 5: CXI SCORE ─────────────────────────────────────────────
function CXIScore({ data }) {
  const comps = [
    { key:"navigation_smoothness", label:"Navigation Smoothness", max:25, icon:"🧭" },
    { key:"checkout_velocity",     label:"Checkout Velocity",     max:25, icon:"🏃" },
    { key:"merchandising_quality", label:"Merchandising Quality", max:25, icon:"🏪" },
    { key:"shopper_engagement",    label:"Shopper Engagement",    max:25, icon:"👁️" },
  ];
  return (
    <div style={card}>
      <SectionHeader icon="🏅" title="Customer Experience Index (CXI)" subtitle="Composite 0–100 store health score measuring navigation, queue speed, merchandising quality, and engagement." />
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"24px", alignItems:"start" }}>
        {/* Big Score Circle */}
        <div style={{ textAlign:"center", minWidth:"130px" }}>
          <div style={{ width:"120px", height:"120px", borderRadius:"50%", border:`6px solid ${data.grade_color}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto" }}>
            <div style={{ fontSize:"36px", fontWeight:900, color:data.grade_color }}>{data.cxi_score}</div>
            <div style={{ fontSize:"11px", color:T.muted }}>out of 100</div>
          </div>
          <div style={{ marginTop:"10px" }}>
            <div style={{ fontSize:"22px", fontWeight:800, color:data.grade_color }}>Grade: {data.grade}</div>
            <div style={{ fontSize:"12px", color:T.muted }}>{data.grade_label}</div>
          </div>
        </div>
        {/* Sub-component Bars */}
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {comps.map(c => (
            <div key={c.key}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", marginBottom:"4px" }}>
                <span style={{ color:T.text }}>{c.icon} {c.label}</span>
                <span style={{ color:data.grade_color, fontWeight:700 }}>{data.components[c.key]} / {c.max}</span>
              </div>
              <div style={{ height:"10px", background:T.bg, borderRadius:"5px", overflow:"hidden" }}>
                <div style={{ width:`${(data.components[c.key] / c.max) * 100}%`, height:"100%", background:data.grade_color, borderRadius:"5px", opacity:0.85 }} />
              </div>
            </div>
          ))}
          {/* Benchmark row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"4px" }}>
            {[
              ["Avg Dwell Time", `${data.benchmarks.avg_dwell_min} min (▲ +${data.benchmarks.dwell_vs_benchmark_min} vs industry)`, T.success],
              ["Camera Uptime", `${data.benchmarks.camera_uptime_pct}%`, T.success],
              ["Golden Zone Focus", `${data.benchmarks.golden_zone_pct}%`, T.accent],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background:T.bg, padding:"8px 10px", borderRadius:"8px" }}>
                <div style={{ fontSize:"10px", color:T.muted }}>{l}</div>
                <div style={{ fontSize:"12px", fontWeight:700, color:c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SECTION 6: AI ACTION COMMANDER ──────────────────────────────────
function AIActionCommander({ actions }) {
  return (
    <div style={card}>
      <SectionHeader icon="🤖" title="AI Action Commander — Staff Instructions Right Now" subtitle="Ranked live actions generated by the AI engine. Act on URGENT items first." />
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {actions.map((a, i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"12px 14px", borderRadius:"10px", background:T.bg, borderLeft:`4px solid ${a.color}` }}>
            <span style={{ fontSize:"18px", flexShrink:0 }}>{a.icon}</span>
            <div style={{ flex:1 }}>
              <span style={{ fontSize:"10px", fontWeight:800, color:a.color, textTransform:"uppercase", letterSpacing:"0.5px" }}>{a.priority}</span>
              <div style={{ fontSize:"13px", color:T.text, marginTop:"3px" }}>{a.action}</div>
            </div>
            <button style={{ padding:"6px 12px", borderRadius:"6px", border:"none", backgroundColor:`${a.color}33`, color:a.color, fontSize:"11px", fontWeight:700, cursor:"pointer", flexShrink:0 }}>
              Mark Done
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────
export default function BehaviorIntelligence() {
  const [selectedShopper, setSelectedShopper] = useState(null);
  const [activeSection, setActiveSection] = useState("all");

  const sections = [
    { id:"all",            label:"All Modules",             icon:"🧠" },
    { id:"attractiveness", label:"Product Attractiveness",  icon:"🏆" },
    { id:"dna",            label:"Shopper DNA",              icon:"🧬" },
    { id:"funnel",         label:"Purchase Funnel",          icon:"🔻" },
    { id:"friction",       label:"Friction Alerts",          icon:"⚠️" },
    { id:"cxi",            label:"CXI Score",                icon:"🏅" },
    { id:"actions",        label:"AI Actions",               icon:"🤖" },
  ];

  const show = (id) => activeSection === "all" || activeSection === id;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      {/* Section Filter Tabs */}
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ padding:"8px 14px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700,
              backgroundColor: activeSection===s.id ? T.accent : T.cardBg,
              color: activeSection===s.id ? "#1A1200" : T.muted,
              border: `1px solid ${activeSection===s.id ? T.accent : T.border}` }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Store Mood Banner — always visible */}
      <StoreMoodBanner data={MOCK_MOOD} />

      {/* Product Attractiveness Weighted Scoring Module */}
      {show("attractiveness") && <ProductAttractivenessModule data={MOCK_ATTRACTIVENESS} />}

      {show("dna") && <ShopperDNAGrid profiles={MOCK_PROFILES} onSelect={setSelectedShopper} selected={selectedShopper} />}
      {selectedShopper && show("dna") && <ShopperDetailDrawer shopper={selectedShopper} onClose={() => setSelectedShopper(null)} />}
      {show("funnel") && <PurchaseFunnel data={MOCK_FUNNEL} />}
      {show("friction") && <FrictionAlerts data={MOCK_FRICTION} />}
      {show("cxi") && <CXIScore data={MOCK_CXI} />}
      {show("actions") && <AIActionCommander actions={MOCK_ACTIONS} />}
    </div>
  );
}
