import React, { useState } from "react";
import {
  Boxes,
  AlertTriangle,
  Download,
  MapPin,
  Truck,
  HardDrive,
} from "lucide-react";

const initialLowStock = [
  { sku: "SKU-NET-992", name: "Cisco Catalyst 9300 Switch", warehouse: "Warehouse B (Rack B-04)", current: 2, limit: 5, status: "Critical Low" },
  { sku: "SKU-DISP-401", name: "Dell UltraSharp 32'' Monitor", warehouse: "Warehouse A (Rack B-01)", current: 4, limit: 10, status: "Low Stock Alert" }
];

const initialDeliveries = [
  { poId: "PO-2026-4401", carrier: "DHL Express", eta: "2026-07-28", route: "Cupertino -> Warehouse A", status: "In-Transit" },
  { poId: "PO-2026-4412", carrier: "FedEx Freight", eta: "2026-07-27", route: "Round Rock -> Warehouse A", status: "Arrived at Dock" },
  { poId: "PO-2026-4409", carrier: "Blue Dart Sourcing", eta: "2026-07-26", route: "Chennai -> Warehouse B", status: "Delayed (Customs)" }
];

const SuperInventoryMonitoring = () => {
  const [items, setItems] = useState(initialLowStock);
  const [transits, setTransits] = useState(initialDeliveries);
  const [activeSubTab, setActiveSubTab] = useState("stock"); // stock, transit

  return (
    <div className="sadmin-inv-mon-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Boxes color="#f8b400" size={28} /> Global Inventory & Warehouse Monitoring
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Monitor stock deficits, track inbound freight deliveries, check carrier ETA updates, and evaluate warehouse spacing limits.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("stock")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "stock" ? "700" : "500",
            color: activeSubTab === "stock" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "stock" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Low Stock Alerts & Inventory Records
        </button>
        <button
          onClick={() => setActiveSubTab("transit")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "transit" ? "700" : "500",
            color: activeSubTab === "transit" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "transit" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Delivery Tracking & Warehouse status
        </button>
      </div>

      {/* 1. Stock Alerts Tab */}
      {activeSubTab === "stock" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Warning banner */}
          <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "8px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle color="#dc2626" size={20} />
            <div>
              <strong style={{ color: "#dc2626", fontSize: "13.5px" }}>Low Stock Reorder Alerts Flagged</strong>
              <p style={{ color: "#555", fontSize: "12.5px", margin: "2px 0 0" }}>
                Critical deficits are present. Automated purchase requests will trigger if stock drop overrides are not checked.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="sadmin-table-container">
              <table className="sadmin-table">
                <thead>
                  <tr>
                    <th>SKU Code</th>
                    <th>Product description</th>
                    <th>Warehouse Location</th>
                    <th>Current Level</th>
                    <th>Reorder Threshold</th>
                    <th>Alert Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.sku}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{i.sku}</td>
                      <td style={{ fontWeight: "700" }}>{i.name}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13.5px", color: "#555" }}>
                          <MapPin size={13} color="#888" />
                          <span>{i.warehouse}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: "800", color: "#dc2626" }}>{i.current} Units</td>
                      <td style={{ fontWeight: "600" }}>{i.limit} Units</td>
                      <td>
                        <span style={{ fontSize: "11px", fontWeight: "800", background: "rgba(220, 38, 38, 0.12)", color: "#dc2626", padding: "2px 8px", borderRadius: "12px" }}>
                          {i.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Transit Tab */}
      {activeSubTab === "transit" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
          
          {/* Deliveries list */}
          <div className="sadmin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Truck size={16} color="#f8b400" /> Active Inbound Deliveries
            </h3>
            <div className="sadmin-table-container">
              <table className="sadmin-table">
                <thead>
                  <tr>
                    <th>PO Ref</th>
                    <th>Logistics Carrier</th>
                    <th>ETA Date</th>
                    <th>Transit Route</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transits.map((t, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{t.poId}</td>
                      <td style={{ fontWeight: "700" }}>{t.carrier}</td>
                      <td>{t.eta}</td>
                      <td style={{ fontSize: "13px", color: "#555" }}>{t.route}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: t.status.includes("Arrived") ? "rgba(5, 150, 105, 0.12)" : t.status.includes("Delayed") ? "rgba(220, 38, 38, 0.12)" : "rgba(217, 119, 6, 0.12)",
                            color: t.status.includes("Arrived") ? "#059669" : t.status.includes("Delayed") ? "#dc2626" : "#d97706",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warehouse Capacity */}
          <div className="sadmin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", height: "fit-content" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <HardDrive size={16} color="#f8b400" /> Warehouse space utilization
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13.5px" }}>
              <div>
                <div style={{ display: "flex", justify: "space-between", marginBottom: "4px" }}>
                  <span>Warehouse A (San Jose)</span>
                  <strong>85% capacity</strong>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#eee", borderRadius: "3px" }}>
                  <div style={{ width: "85%", height: "100%", background: "#dc2626", borderRadius: "3px" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justify: "space-between", marginBottom: "4px" }}>
                  <span>Warehouse B (Austin)</span>
                  <strong>48% capacity</strong>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#eee", borderRadius: "3px" }}>
                  <div style={{ width: "48%", height: "100%", background: "#059669", borderRadius: "3px" }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default SuperInventoryMonitoring;
