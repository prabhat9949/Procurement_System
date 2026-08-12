import React, { useState } from "react";
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Search,
  Bell,
  Calendar,
  Layers,
  History,
  AlertOctagon,
} from "lucide-react";

const initialDeliveries = [
  {
    id: "DLV-2026-101",
    poId: "PO-2026-4401",
    vendor: "Apple Business Direct",
    carrier: "FedEx Freight Priority",
    tracking: "7790-8912-9901",
    dockDoor: "Door 4",
    expectedDate: "2026-07-27",
    status: "Arrived at Dock",
    delayReason: "",
    rating: "98% (Excellent)",
  },
  {
    id: "DLV-2026-102",
    poId: "PO-2026-4412",
    vendor: "Dell Technologies",
    carrier: "UPS Heavy Freight",
    tracking: "1Z9999999999999999",
    dockDoor: "Door 2",
    expectedDate: "2026-07-28",
    status: "In Transit",
    delayReason: "",
    rating: "94% (Good)",
  },
  {
    id: "DLV-2026-098",
    poId: "PO-2026-4350",
    vendor: "Apple Business Direct",
    carrier: "FedEx Standard Freight",
    tracking: "7790-8912-8822",
    dockDoor: "Door 4",
    expectedDate: "2026-07-24",
    status: "Completed",
    delayReason: "",
    rating: "98% (Excellent)",
  },
  {
    id: "DLV-2026-105",
    poId: "PO-2026-4389",
    vendor: "HP Inc. Enterprise",
    carrier: "DHL Express Logistics",
    tracking: "DHL-HP-30029",
    dockDoor: "Door 1",
    expectedDate: "2026-07-29",
    status: "Delayed",
    delayReason: "Customs clearance hold at airport hub.",
    rating: "85% (Average)",
  },
];

const initialVendorPerformance = [
  { vendor: "Apple Business Direct", onTimeRate: "98.2%", totalShipments: 45, rating: "A+ (Preferred)" },
  { vendor: "Dell Technologies", onTimeRate: "94.5%", totalShipments: 32, rating: "A (Verified)" },
  { vendor: "Logitech Logistics", onTimeRate: "100.0%", totalShipments: 12, rating: "A+ (Preferred)" },
  { vendor: "HP Inc. Enterprise", onTimeRate: "85.0%", totalShipments: 8, rating: "B (Average)" },
];

const initialAlerts = [
  { title: "HP Inc. Shipment Delayed", type: "warning", time: "2 hours ago", desc: "HP LaserJet shipment DLV-2026-105 delayed due to customs clearance hold." },
  { title: "Apple Shipment Arrived at Bay", type: "success", time: "5 hours ago", desc: "Apple MacBook delivery PO-2026-4401 arrived at Dock Door 4." },
  { title: "Dell Carrier Update", type: "info", time: "1 day ago", desc: "UPS logistics center dispatched PO-2026-4412 for direct transit." }
];

const DeliveryMonitoring = () => {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [performance, setPerformance] = useState(initialVendorPerformance);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [activeTab, setActiveTab] = useState("active"); // active, performance, notifications
  const [filterStatus, setFilterStatus] = useState("All"); // All, In Transit, Arrived, Delayed, Completed
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.carrier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "All" || d.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="inv-delivery-mon-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="inv-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Truck color="#f8b400" size={28} /> Logistics & Delivery Monitoring Control
          </h1>
          <p className="inv-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Track incoming supplier shipments, verify ETAs, analyze vendor delivery performance metrics, and review delay exception logs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "active" ? "700" : "500",
            color: activeTab === "active" ? "#d97706" : "#666",
            borderBottom: activeTab === "active" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Active Deliveries & Schedule
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "performance" ? "700" : "500",
            color: activeTab === "performance" ? "#d97706" : "#666",
            borderBottom: activeTab === "performance" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Vendor Delivery Performance Scorecard
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "notifications" ? "700" : "500",
            color: activeTab === "notifications" ? "#d97706" : "#666",
            borderBottom: activeTab === "notifications" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Logistics Notifications ({alerts.length})
        </button>
      </div>

      {/* 1. Active Deliveries View */}
      {activeTab === "active" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Controls Bar */}
          <div className="inv-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", width: "300px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search PO, Supplier, Carrier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  borderRadius: "6px",
                  border: "1px solid #d9d9d9",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Filter Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d9d9d9",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <option value="All">All Shipments</option>
                <option value="In Transit">In Transit</option>
                <option value="Arrived at Dock">Arrived at Dock</option>
                <option value="Delayed">Delayed Only</option>
                <option value="Completed">Completed Only</option>
              </select>
            </div>
          </div>

          {/* Deliveries List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredDeliveries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", color: "#666" }}>
                No active delivery records match your current parameters.
              </div>
            ) : (
              filteredDeliveries.map((dlv) => (
                <div
                  key={dlv.id}
                  className="inv-card"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #ececec",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800", background: "rgba(248, 180, 0, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                        PO REF: {dlv.poId} • Tracking: {dlv.tracking}
                      </span>
                      <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "10px", marginBottom: "4px" }}>
                        {dlv.vendor}
                      </h3>
                      <p style={{ fontSize: "14px", color: "#666" }}>
                        Carrier: <strong>{dlv.carrier}</strong> | Dock Assignment: <strong>{dlv.dockDoor}</strong>
                      </p>
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        background:
                          dlv.status === "Completed"
                            ? "rgba(5, 150, 105, 0.12)"
                            : dlv.status === "Arrived at Dock"
                            ? "rgba(59, 130, 246, 0.12)"
                            : dlv.status === "Delayed"
                            ? "rgba(220, 38, 38, 0.12)"
                            : "rgba(217, 119, 6, 0.12)",
                        color:
                          dlv.status === "Completed"
                            ? "#059669"
                            : dlv.status === "Arrived at Dock"
                            ? "#3b82f6"
                            : dlv.status === "Delayed"
                            ? "#dc2626"
                            : "#d97706",
                        border: `1px solid ${
                          dlv.status === "Completed"
                            ? "rgba(5, 150, 105, 0.3)"
                            : dlv.status === "Arrived at Dock"
                            ? "rgba(59, 130, 246, 0.3)"
                            : dlv.status === "Delayed"
                            ? "rgba(220, 38, 38, 0.3)"
                            : "rgba(217, 119, 6, 0.3)"
                        }`,
                      }}
                    >
                      {dlv.status}
                    </span>
                  </div>

                  {/* Expected Dates & Delay Alert */}
                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "24px", background: "#f8f9fb", padding: "12px 16px", borderRadius: "8px", border: "1px solid #eee", fontSize: "13px" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Expected Delivery Date</span>
                        <p style={{ fontWeight: "700", color: "#333", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={14} color="#888" /> {dlv.expectedDate}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Vendor Rating Score</span>
                        <p style={{ fontWeight: "700", color: "#059669", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Award size={14} color="#059669" /> {dlv.rating}
                        </p>
                      </div>
                    </div>

                    {dlv.status === "Delayed" && dlv.delayReason && (
                      <div style={{ background: "rgba(220,38,38,0.05)", border: "1px dashed rgba(220,38,38,0.25)", padding: "10px 14px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#dc2626" }}>
                        <AlertOctagon size={16} />
                        <span><strong>Delay Incident Note:</strong> {dlv.delayReason}</span>
                      </div>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* 2. Performance Matrix */}
      {activeTab === "performance" && (
        <div className="inv-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Vendor / Supplier Name</th>
                  <th>On-Time Delivery Rate (%)</th>
                  <th>Total Shipments Tracked</th>
                  <th>Supplier Rating Grade</th>
                  <th>SLA Standing</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700" }}>{p.vendor}</td>
                    <td style={{ fontWeight: "800", color: parseFloat(p.onTimeRate) >= 90 ? "#059669" : "#d97706" }}>{p.onTimeRate}</td>
                    <td style={{ fontWeight: "600" }}>{p.totalShipments} Cargo Batches</td>
                    <td style={{ fontWeight: "700", color: "#d97706" }}>{p.rating}</td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: parseFloat(p.onTimeRate) >= 90 ? "#059669" : "#d97706" }}>
                        {parseFloat(p.onTimeRate) >= 90 ? "✓ Compliance Met" : "⚠ Under Review"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Alerts notifications */}
      {activeTab === "notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((alt, idx) => (
            <div key={idx} style={{ background: "#ffffff", border: "1px solid #ececec", borderRadius: "10px", padding: "16px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{
                background: alt.type === "warning" ? "rgba(220,38,38,0.12)" : alt.type === "success" ? "rgba(5,150,105,0.12)" : "rgba(59,130,246,0.12)",
                color: alt.type === "warning" ? "#dc2626" : alt.type === "success" ? "#059669" : "#3b82f6",
                padding: "8px",
                borderRadius: "50%",
                display: "flex"
              }}>
                <Bell size={18} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: 0 }}>{alt.title}</h4>
                  <span style={{ fontSize: "11px", color: "#777" }}>{alt.time}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#555", margin: "4px 0 0" }}>{alt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default DeliveryMonitoring;
