import React, { useState } from "react";
import {
  Truck,
  Star,
  CheckCircle2,
  AlertTriangle,
  Search,
  DollarSign,
  Download,
} from "lucide-react";

const initialVendors = [
  { name: "Apple Business Direct", rating: "4.9 / 5.0", sla: "99.2%", spent: "$36,990.00", status: "Tier 1 Preferred", certs: "ISO 27001, Apple Auth" },
  { name: "Dell Technologies", rating: "4.8 / 5.0", sla: "97.0%", spent: "$54,200.00", status: "Active Verified", certs: "ISO 9001" },
  { name: "Custom Office Designs", rating: "3.2 / 5.0", sla: "78.5%", spent: "$15,200.00", status: "Under Review", certs: "Local wood cert" },
  { name: "Suspicious Tech Sourcing Inc", rating: "N/A", sla: "N/A", spent: "$0.00", status: "Suspended", certs: "None" }
];

const initialVendorActivities = [
  { vendor: "Suspicious Tech Sourcing Inc", event: "Duplicate bank routing number flagged", date: "2026-07-24", severity: "Critical Risk" },
  { vendor: "Custom Office Designs", event: "Bypassed standard competitive bidding", date: "2026-07-22", severity: "Medium Warning" }
];

const SuperVendorMonitoring = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [activities, setActivities] = useState(initialVendorActivities);
  const [activeSubTab, setActiveSubTab] = useState("performance"); // performance, activities

  return (
    <div className="sadmin-vnd-mon-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Truck color="#f8b400" size={28} /> Global Vendor Monitoring
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Audit supplier SLA fulfillment rates, total disbursed treasury payments, compliance certifications, and risk warning flags.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("performance")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "performance" ? "700" : "500",
            color: activeSubTab === "performance" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "performance" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Vendor Profiles & SLA Performance
        </button>
        <button
          onClick={() => setActiveSubTab("activities")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "activities" ? "700" : "500",
            color: activeSubTab === "activities" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "activities" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Suspicious Supplier Activities ({activities.length})
        </button>
      </div>

      {/* 1. Performance Tab */}
      {activeSubTab === "performance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div style={{ padding: "16px", background: "#f6faf8", border: "1px solid rgba(5,150,105,0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Registered Suppliers</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>480 Vendors</h3>
            </div>
            <div style={{ padding: "16px", background: "#fafafa", border: "1px solid #eee", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Average SLA Rating</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#111", margin: "2px 0 0" }}>99.2% Passed</h3>
            </div>
            <div style={{ padding: "16px", background: "#fcf8f2", border: "1px solid rgba(248,180,0,0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Under Active Review</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#d97706", margin: "2px 0 0" }}>2 Suppliers</h3>
            </div>
          </div>

          {/* Table */}
          <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="sadmin-table-container">
              <table className="sadmin-table">
                <thead>
                  <tr>
                    <th>Supplier / Vendor Name</th>
                    <th>Fulfillment SLA</th>
                    <th>CSAT Rating</th>
                    <th>YTD Treasury Spent</th>
                    <th>Corporate Certifications</th>
                    <th>Compliance Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: "700" }}>{v.name}</td>
                      <td style={{ fontWeight: "800", color: "#059669" }}>{v.sla}</td>
                      <td style={{ color: "#d97706", fontWeight: "700" }}>{v.rating}</td>
                      <td style={{ fontWeight: "700" }}>{v.spent}</td>
                      <td style={{ fontSize: "13px", color: "#555" }}>{v.certs}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: v.status.includes("Preferred") || v.status.includes("Verified") ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                            color: v.status.includes("Preferred") || v.status.includes("Verified") ? "#059669" : "#dc2626",
                          }}
                        >
                          {v.status}
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

      {/* 2. Activities Tab */}
      {activeSubTab === "activities" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {activities.map((a, idx) => (
            <div key={idx} style={{ padding: "16px", background: "rgba(220,38,38,0.06)", border: "1px dashed rgba(220,38,38,0.25)", borderRadius: "8px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <AlertTriangle color="#dc2626" size={22} />
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#dc2626", margin: 0 }}>Supplier Warning: {a.vendor}</h4>
                <p style={{ margin: "4px 0 0", color: "#333", fontSize: "13.5px" }}>{a.event}</p>
                <span style={{ fontSize: "11px", color: "#777", display: "inline-block", marginTop: "4px" }}>Flagged on {a.date} | Severity: <strong>{a.severity}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default SuperVendorMonitoring;
