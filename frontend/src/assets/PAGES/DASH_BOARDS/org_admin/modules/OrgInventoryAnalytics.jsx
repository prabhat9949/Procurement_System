import React from "react";
import { Boxes, Barcode, CheckCircle2 } from "lucide-react";

const invAnalyticsMock = [
  { warehouse: "Global Warehouse HQ (Bay A)", totalSku: 4250, value: "$840,000.00", utilization: "84.2%" },
  { warehouse: "Secondary Warehouse (Bay B)", totalSku: 4200, value: "$620,000.00", utilization: "72.0%" },
];

const OrgInventoryAnalytics = () => {
  return (
    <div className="org-inv-analytics-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <Boxes color="#f8b400" /> Warehouse Inventory & Stock Analytics
          </h1>
          <p className="org-page-subtitle">
            Enterprise SKU stock valuation, rack capacity utilization, and barcode serial tracking.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {invAnalyticsMock.map((w, idx) => (
          <div key={idx} className="org-card org-card-gold-glow">
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>FACILITY #{idx + 1}</span>
            <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "2px" }}>{w.warehouse}</h3>

            <div style={{ marginTop: "16px", padding: "12px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #ececec", fontSize: "13px" }}>
              <p>SKU Count: <strong>{w.totalSku} Units</strong></p>
              <p>Stock Valuation: <strong style={{ color: "#059669" }}>{w.value}</strong></p>
              <p>Rack Utilization: <strong style={{ color: "#d97706" }}>{w.utilization}</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgInventoryAnalytics;
