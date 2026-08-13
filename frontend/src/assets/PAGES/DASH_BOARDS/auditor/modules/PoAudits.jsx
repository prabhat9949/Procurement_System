import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Search,
  Eye,
  Clock,
  Download,
  AlertTriangle,
  X,
  History,
  CheckCircle,
} from "lucide-react";

const initialPurchaseOrders = [
  {
    poId: "PO-2026-4401",
    vendor: "Apple Business Direct",
    vendorAddress: "One Apple Park Way, Cupertino, CA",
    amount: 36990.00,
    managerSign: "Robert Vance (Chief Mgr)",
    status: "Compliant",
    items: "MacBook Pro M3 Max 64GB Workstations (x10)",
    deliveryStatus: "Delivered & Verified",
    deliveryDate: "2026-07-26",
    timeline: [
      { event: "REQUISITION INITIATED", date: "2026-07-24", actor: "Engineering Manager" },
      { event: "MANAGER APPROVAL COMPLETE", date: "2026-07-25", actor: "Robert Vance (Chief Mgr)" },
      { event: "WIRE DISBURSEMENT APPROVED", date: "2026-07-26", actor: "Victoria Vance (CFO)" },
    ],
    checks: {
      underBudget: true,
      validVendor: true,
      priceMatchesSla: true,
    }
  },
  {
    poId: "PO-2026-4412",
    vendor: "Dell Technologies",
    vendorAddress: "One Dell Way, Round Rock, TX",
    amount: 54200.00,
    managerSign: "Robert Vance (Chief Mgr)",
    status: "Compliant",
    items: "PowerEdge R760 Rack Servers (x4)",
    deliveryStatus: "Arrived at Dock",
    deliveryDate: "2026-07-27",
    timeline: [
      { event: "REQUISITION INITIATED", date: "2026-07-24", actor: "IT Infrastructure Lead" },
      { event: "MANAGER APPROVAL COMPLETE", date: "2026-07-25", actor: "Robert Vance (Chief Mgr)" },
      { event: "WIRE DISBURSEMENT APPROVED", date: "2026-07-26", actor: "Victoria Vance (CFO)" },
    ],
    checks: {
      underBudget: true,
      validVendor: true,
      priceMatchesSla: true,
    }
  },
  {
    poId: "PO-2026-4409",
    vendor: "Custom Office Designs",
    vendorAddress: "Industrial Phase II, Chennai, TN",
    amount: 15200.00,
    managerSign: "Auto-Released (Bypass)",
    status: "Non-Compliant Alert",
    items: "Office Ergonomic Desks (x15)",
    deliveryStatus: "Pending Dispatch",
    deliveryDate: "Expected 2026-08-02",
    timeline: [
      { event: "REQUISITION INITIATED", date: "2026-07-22", actor: "HR Admin" },
      { event: "COMPETITIVE BIDDING BYPASSED", date: "2026-07-23", actor: "Sourcing Executive" },
    ],
    checks: {
      underBudget: true,
      validVendor: true,
      priceMatchesSla: false, // failed competitive bidding check
    }
  }
];

const initialModifiedRecords = [
  { poId: "PO-2026-4350", changeDate: "2026-07-21", fieldModified: "Quantity (Studio Displays)", originalValue: "4 Units", newValue: "5 Units", actor: "Sourcing Executive", reason: "Additional department hiring request." }
];

const PoAudits = () => {
  const [orders, setOrders] = useState(initialPurchaseOrders);
  const [mods, setMods] = useState(initialModifiedRecords);
  const [activeSubTab, setActiveSubTab] = useState("all-pos"); // all-pos, mods
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPo, setSelectedPo] = useState(null);

  const filteredOrders = orders.filter(
    (o) =>
      o.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="aud-po-audits-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="aud-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <FileText color="#f8b400" size={28} /> Purchase Order Compliance Audits
          </h1>
          <p className="aud-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Verify that high-dollar Purchase Orders are validly approved, follow contract parameters, and trace history modifications.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("all-pos")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "all-pos" ? "700" : "500",
            color: activeSubTab === "all-pos" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "all-pos" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Purchase Orders Verification & Compliance
        </button>
        <button
          onClick={() => setActiveSubTab("mods")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "mods" ? "700" : "500",
            color: activeSubTab === "mods" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "mods" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Modified PO Records Log ({mods.length})
        </button>
      </div>

      {/* Search Bar */}
      {activeSubTab === "all-pos" && (
        <div className="aud-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px" }}>
          <div style={{ position: "relative", width: "360px" }}>
            <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search PO ID, Vendor, or items..."
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
      )}

      {/* 1. All POs Workspace */}
      {activeSubTab === "all-pos" && (
        <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="aud-table-container">
            <table className="aud-table">
              <thead>
                <tr>
                  <th>PO Code</th>
                  <th>Awarded Vendor</th>
                  <th>Product Specification</th>
                  <th>Order Value</th>
                  <th>Chief Manager Sign-off</th>
                  <th>Delivery Status</th>
                  <th>Compliance standing</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.poId}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{o.poId}</td>
                    <td style={{ fontWeight: "700" }}>{o.vendor}</td>
                    <td>{o.items}</td>
                    <td style={{ fontWeight: "800", color: "#059669" }}>${o.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: "600" }}>{o.managerSign}</td>
                    <td style={{ color: "#666", fontSize: "13.5px" }}>{o.deliveryStatus}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: o.status.includes("Compliant") ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                          color: o.status.includes("Compliant") ? "#059669" : "#dc2626",
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="aud-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                        onClick={() => setSelectedPo(o)}
                        title="View PO Audit Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Modifications Log Workspace */}
      {activeSubTab === "mods" && (
        <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="aud-table-container">
            <table className="aud-table">
              <thead>
                <tr>
                  <th>PO Reference</th>
                  <th>Change Date</th>
                  <th>Modified Parameter</th>
                  <th>Original Value</th>
                  <th>New Override Value</th>
                  <th>Modified By</th>
                  <th>Reasoning justification</th>
                </tr>
              </thead>
              <tbody>
                {mods.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "800", color: "#dc2626" }}>{m.poId}</td>
                    <td>{m.changeDate}</td>
                    <td style={{ fontWeight: "700" }}>{m.fieldModified}</td>
                    <td style={{ color: "#dc2626", textDecoration: "line-through" }}>{m.originalValue}</td>
                    <td style={{ color: "#059669", fontWeight: "700" }}>{m.newValue}</td>
                    <td style={{ fontWeight: "600" }}>{m.actor}</td>
                    <td style={{ color: "#555" }}>{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail PO Modal */}
      {selectedPo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>PURCHASE ORDER AUDIT PROFILE</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  PO Code: {selectedPo.poId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPo(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              
              {/* Product and supplier details */}
              <div style={{ background: "#f8f9fb", padding: "12px", border: "1px solid #eee", borderRadius: "8px", fontSize: "13.5px", marginBottom: "16px" }}>
                <strong>Product details:</strong> {selectedPo.items} <br />
                <strong>Awarded Vendor:</strong> {selectedPo.vendor} <br />
                <strong>Address:</strong> {selectedPo.vendorAddress} <br />
                <strong>Order Value:</strong> <strong style={{ color: "#059669" }}>${selectedPo.amount.toLocaleString()}</strong> <br />
                <strong>Delivery Date:</strong> {selectedPo.deliveryDate} ({selectedPo.deliveryStatus})
              </div>

              {/* Compliance checks */}
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "8px" }}>Compliance Checks</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Cost Center Budget Availability:</span>
                  <strong style={{ color: selectedPo.checks.underBudget ? "#059669" : "#dc2626" }}>
                    {selectedPo.checks.underBudget ? "Pass" : "Fail"}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Approved Vendor List registration:</span>
                  <strong style={{ color: selectedPo.checks.validVendor ? "#059669" : "#dc2626" }}>
                    {selectedPo.checks.validVendor ? "Pass" : "Fail"}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Competitive RFQ Pricing compliance:</span>
                  <strong style={{ color: selectedPo.checks.priceMatchesSla ? "#059669" : "#dc2626" }}>
                    {selectedPo.checks.priceMatchesSla ? "Pass" : "Fail"}
                  </strong>
                </div>
              </div>

              {/* Timeline list */}
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "8px" }}>PO Signature Timeline</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>
                {selectedPo.timeline.map((step, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px" }}>
                      ✓
                    </div>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#111" }}>{step.event}</span>
                      <p style={{ fontSize: "11px", color: "#777", margin: 0 }}>Date: {step.date} • Actor: {step.actor}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="aud-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedPo(null)}
              >
                Close Audit details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PoAudits;
