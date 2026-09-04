"use client";
import React, { useState, useRef } from "react";

const TOKENS = {
  bg: "#0B0F17",
  cardBg: "#131A27",
  cardBorder: "#232C40",
  text: "#EDEFF3",
  muted: "#8A93A6",
  accent: "#E8A33D",
  success: "#5FAE86",
  danger: "#E8654F",
  info: "#5B8DEF",
};

const cardStyle = {
  backgroundColor: TOKENS.cardBg,
  borderRadius: "12px",
  border: `1px solid ${TOKENS.cardBorder}`,
  padding: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
};

const API_BASE = "http://127.0.0.1:8000";

export default function ShelfPlanogramAuditor() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAuditResult(null);
      setErrorMsg(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API_BASE}/api/shelf/audit-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to run AI Shelf Audit. Ensure backend is running on port 8000.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* HEADER RIBBON */}
      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
            🛒 AI Shelf Planogram & Stock Analyzer (SKU-110K)
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
            Upload store shelf photos to automatically detect product facings, Out-of-Stock (OOS) void gaps, shelf tiers, and share-of-shelf.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "20px", background: "rgba(95,174,134,0.15)", color: TOKENS.success, fontWeight: 700 }}>
            ● YOLOv8 + Spatial SKU Grid Active
          </span>
        </div>
      </div>

      {/* UPLOAD & ACTION BAR */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: `1px solid ${TOKENS.cardBorder}`,
              backgroundColor: TOKENS.bg,
              color: TOKENS.text,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📁 Select Shelf Image
          </button>

          <span style={{ fontSize: "12px", color: TOKENS.muted }}>
            {selectedFile ? `Selected: ${selectedFile.name}` : "No file chosen (JPG, PNG, JPEG)"}
          </span>

          <button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || isProcessing}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: !selectedFile || isProcessing ? "#444" : TOKENS.accent,
              color: "#1A1200",
              fontSize: "13px",
              fontWeight: 700,
              cursor: !selectedFile || isProcessing ? "not-allowed" : "pointer",
              marginLeft: "auto",
              transition: "all 0.2s",
            }}
          >
            {isProcessing ? "⏳ Running AI Detection..." : "🚀 Run AI Shelf Audit"}
          </button>
        </div>

        {errorMsg && (
          <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "8px", background: "rgba(232,101,79,0.2)", border: `1px solid ${TOKENS.danger}`, color: TOKENS.danger, fontSize: "12px" }}>
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY */}
      {auditResult && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* KPI METRIC CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div style={cardStyle}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: 700 }}>Total Facings Detected</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "4px", color: TOKENS.text }}>{auditResult.total_facings_detected} Facings</div>
              <div style={{ fontSize: "11px", color: TOKENS.success, marginTop: "2px" }}>Across 3 Vertical Tiers</div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: 700 }}>Out-of-Stock Gaps</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "4px", color: auditResult.out_of_stock_gaps_count > 0 ? TOKENS.danger : TOKENS.success }}>
                {auditResult.out_of_stock_gaps_count} Gaps
              </div>
              <div style={{ fontSize: "11px", color: auditResult.out_of_stock_gaps_count > 0 ? TOKENS.danger : TOKENS.success, marginTop: "2px" }}>
                {auditResult.out_of_stock_gaps_count > 0 ? "⚠️ Immediate Restock Required" : "● Fully Stocked Shelf"}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: 700 }}>Golden Zone Share</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "4px", color: TOKENS.accent }}>
                {auditResult.golden_zone_share_pct}%
              </div>
              <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "2px" }}>{auditResult.golden_zone_facings} items at Eye-Level</div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: 700 }}>Planogram Score</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "4px", color: TOKENS.info }}>
                {auditResult.planogram_compliance_score} <span style={{ fontSize: "14px", color: TOKENS.muted }}>/ 100</span>
              </div>
              <div style={{ fontSize: "11px", color: TOKENS.info, marginTop: "2px" }}>Visual Compliance Rating</div>
            </div>
          </div>

          {/* ANNOTATED IMAGE PREVIEW & SHARE OF SHELF */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
            
            {/* ANNOTATED SHELF IMAGE */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>📸 AI Annotated Shelf Overlay</h3>
                <div style={{ display: "flex", gap: "6px", fontSize: "10px" }}>
                  <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(95,174,134,0.2)", color: TOKENS.success, border: `1px solid ${TOKENS.success}` }}>● Golden Zone</span>
                  <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(91,141,239,0.2)", color: TOKENS.info, border: `1px solid ${TOKENS.info}` }}>● Reach Tier</span>
                  <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(232,101,79,0.2)", color: TOKENS.danger, border: `1px solid ${TOKENS.danger}` }}>● Out-of-Stock</span>
                </div>
              </div>

              <div style={{ width: "100%", borderRadius: "8px", overflow: "hidden", background: "#000", border: `1px solid ${TOKENS.cardBorder}` }}>
                <img
                  src={auditResult.annotated_image_base64}
                  alt="Annotated Shelf Audit"
                  style={{ width: "100%", height: "auto", display: "block", maxHeight: "480px", objectFit: "contain" }}
                />
              </div>
            </div>

            {/* SHARE OF SHELF & RECOMMENDATIONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* SHARE OF SHELF CARD */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: 700 }}>📊 Share of Shelf Distribution</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {auditResult.share_of_shelf.map((item, idx) => (
                    <div key={idx}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                        <span style={{ color: TOKENS.text, fontWeight: 600 }}>{item.category}</span>
                        <span style={{ color: TOKENS.accent, fontWeight: 700 }}>{item.facings_count} items ({item.share_pct}%)</span>
                      </div>
                      <div style={{ height: "8px", background: TOKENS.bg, borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${item.share_pct}%`, height: "100%", background: idx === 0 ? TOKENS.accent : TOKENS.info, borderRadius: "4px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI MERCHANDISING RECOMMENDATIONS */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "15px", fontWeight: 700 }}>💡 AI Planogram Suggestions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {auditResult.ai_merchandising_recommendations.map((rec, idx) => (
                    <div key={idx} style={{ padding: "10px", background: TOKENS.bg, borderRadius: "8px", borderLeft: `3px solid ${idx === 0 && auditResult.out_of_stock_gaps_count > 0 ? TOKENS.danger : TOKENS.success}`, fontSize: "12px", color: TOKENS.muted }}>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* DETECTED ITEMS TABLE */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: 700 }}>📋 Detected SKU Inventory Manifest</h3>
            <div style={{ maxHeight: "240px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                    <th style={{ padding: "8px" }}>Item ID</th>
                    <th style={{ padding: "8px" }}>Category / Class</th>
                    <th style={{ padding: "8px" }}>Shelf Tier</th>
                    <th style={{ padding: "8px" }}>Detection Confidence</th>
                    <th style={{ padding: "8px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditResult.detected_items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                      <td style={{ padding: "8px", fontWeight: 700, color: TOKENS.accent }}>{item.item_id}</td>
                      <td style={{ padding: "8px", color: TOKENS.text }}>{item.name} ({item.detected_class})</td>
                      <td style={{ padding: "8px", color: item.shelf_tier.includes("Golden") ? TOKENS.success : TOKENS.info, fontWeight: 600 }}>
                        {item.shelf_tier}
                      </td>
                      <td style={{ padding: "8px" }}>{item.confidence}%</td>
                      <td style={{ padding: "8px", color: TOKENS.success }}>● Stocked</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
