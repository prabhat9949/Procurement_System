import React, { useState } from "react";
import {
  Boxes,
  Barcode,
  CheckCircle2,
  Search,
  AlertTriangle,
  History,
  Download,
  MapPin,
  RefreshCw,
} from "lucide-react";

const initialStockAudits = [
  { sku: "SKU-MAC-101", name: "MacBook Pro M3 Max", location: "Warehouse A (Rack A-01)", sysCount: 24, physCount: 24, status: "Reconciled - Pass" },
  { sku: "SKU-SER-202", name: "Dell PowerEdge Server", location: "Warehouse A (Rack A-05)", sysCount: 6, physCount: 6, status: "Reconciled - Pass" },
  { sku: "SKU-NET-992", name: "Cisco Catalyst 9300 Switch", location: "Warehouse B (Rack B-04)", sysCount: 3, physCount: 2, status: "Deficit Flagged (-1)" },
  { sku: "SKU-DISP-401", name: "Dell UltraSharp 32'' Monitor", location: "Warehouse A (Rack B-01)", sysCount: 1, physCount: 2, status: "Surplus Flagged (+1)" },
];

const initialMovements = [
  { mvtId: "MVT-801", sku: "SKU-MAC-101", type: "Stock In", qty: 10, source: "Goods Received (GRN-2026-041)", date: "2026-07-26", flag: "None" },
  { mvtId: "MVT-802", sku: "SKU-NET-992", type: "Adjustment", qty: -1, source: "Physical Count Deficit", date: "2026-07-25", flag: "Investigating" },
  { mvtId: "MVT-803", sku: "SKU-DISP-401", type: "Adjustment", qty: 1, source: "Found in unassigned bin", date: "2026-07-24", flag: "Reconciled" },
  { mvtId: "MVT-804", sku: "SKU-MAC-101", type: "Damaged Write-off", qty: -1, source: "Handling damage by staff", date: "2026-07-23", flag: "Audited & Written off" }
];

const InventoryAudits = () => {
  const [stock, setStock] = useState(initialStockAudits);
  const [movements, setMovements] = useState(initialMovements);
  const [activeSubTab, setActiveSubTab] = useState("records"); // records, movements
  const [searchTerm, setSearchTerm] = useState("");

  const triggerDownload = (reportName) => {
    alert(`Downloading inventory audit report: ${reportName}`);
  };

  const filteredStock = stock.filter(
    (s) =>
      s.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="aud-inv-audits-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="aud-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Boxes color="#f8b400" size={28} /> Warehouse & Inventory Audits
          </h1>
          <p className="aud-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Audit physical stock levels, verify goods receiving logs against PO transactions, and trace adjustments or inventory deficits.
          </p>
        </div>

        <button
          className="aud-btn-primary-sm"
          onClick={() => triggerDownload("Warehouse_Stock_Verification_Report.pdf")}
        >
          <Download size={16} /> Download Stock Verification Report
        </button>
      </div>

      {/* Navigation Subtabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("records")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "records" ? "700" : "500",
            color: activeSubTab === "records" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "records" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Inventory Records & Discrepancies
        </button>
        <button
          onClick={() => setActiveSubTab("movements")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "movements" ? "700" : "500",
            color: activeSubTab === "movements" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "movements" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Stock Movements & Adjustments Ledger
        </button>
      </div>

      {/* Search Bar */}
      <div className="aud-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder={activeSubTab === "records" ? "Search stock SKU or name..." : "Search movement logs..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 38px",
              borderRadius: "8px",
              border: "1px solid #d9d9d9",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* 1. Records & Discrepancies Tab */}
      {activeSubTab === "records" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Deficits banners */}
          {stock.some(s => s.status.includes("Deficit")) && (
            <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "8px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertTriangle color="#dc2626" size={20} />
              <div>
                <strong style={{ color: "#dc2626", fontSize: "13.5px" }}>Stock Discrepancy Warnings Flagged</strong>
                <p style={{ color: "#555", fontSize: "12.5px", margin: "2px 0 0" }}>
                  Deficits have been highlighted between ERP records and physical stock checks. Active audit investigation is required.
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="aud-table-container">
              <table className="aud-table">
                <thead>
                  <tr>
                    <th>SKU Code</th>
                    <th>Product Description</th>
                    <th>Warehouse Location</th>
                    <th>System Count (ERP)</th>
                    <th>Physical Count Verified</th>
                    <th>Difference Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((s) => {
                    const diff = s.physCount - s.sysCount;
                    const isPassed = s.status.includes("Pass");

                    return (
                      <tr key={s.sku}>
                        <td style={{ fontWeight: "800", color: "#d97706" }}>{s.sku}</td>
                        <td style={{ fontWeight: "700" }}>{s.name}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13.5px", color: "#555" }}>
                            <MapPin size={13} color="#888" />
                            <span>{s.location}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: "600" }}>{s.sysCount} Units</td>
                        <td style={{ fontWeight: "800", color: isPassed ? "#059669" : "#dc2626" }}>{s.physCount} Units</td>
                        <td>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "800",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              background: isPassed ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                              color: isPassed ? "#059669" : "#dc2626",
                            }}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Movements & Adjustments Ledger */}
      {activeSubTab === "movements" && (
        <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="aud-table-container">
            <table className="aud-table">
              <thead>
                <tr>
                  <th>Movement ID</th>
                  <th>SKU Code</th>
                  <th>Type</th>
                  <th>Quantity (Delta)</th>
                  <th>Source Reference</th>
                  <th>Date Logged</th>
                  <th>Audit notes / status</th>
                </tr>
              </thead>
              <tbody>
                {movements
                  .filter(m => m.sku.toLowerCase().includes(searchTerm.toLowerCase()) || m.mvtId.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((m) => (
                    <tr key={m.mvtId}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{m.mvtId}</td>
                      <td style={{ fontWeight: "700" }}>{m.sku}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11.5px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: m.type.includes("In") ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                            color: m.type.includes("In") ? "#059669" : "#dc2626",
                          }}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: "800", color: m.qty > 0 ? "#059669" : "#dc2626" }}>
                        {m.qty > 0 ? `+${m.qty}` : m.qty} Units
                      </td>
                      <td style={{ color: "#333", fontWeight: "600" }}>{m.source}</td>
                      <td>{m.date}</td>
                      <td style={{ fontStyle: "italic", fontSize: "13px", color: "#666" }}>{m.flag}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryAudits;
