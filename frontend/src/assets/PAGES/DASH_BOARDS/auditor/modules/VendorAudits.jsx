import React, { useState } from "react";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  Download,
  X,
  FileText,
  Activity,
} from "lucide-react";

const initialVendorAudits = [
  {
    vendor: "Apple Business Direct",
    rating: "4.9 / 5.0 ⭐",
    slaScore: "99.2% Fulfillment",
    compliance: "Tier 1 Preferred",
    auditDate: "2026-07-20",
    riskScore: "Low (8%)",
    certifications: "ISO 27001 Certified, Apple Authorized Enterprise",
    taxRegistration: "GST-AAPL-90081",
    paymentHistory: "$36,990.00 YTD",
    deliveryPerformance: "10/10 On-Time",
    suspiciousFlags: "None",
    checks: {
      legitimacy: true,
      bankVerified: true,
      isoAudit: true,
    }
  },
  {
    vendor: "Dell Technologies",
    rating: "4.8 / 5.0 ⭐",
    slaScore: "97.0% Fulfillment",
    compliance: "Active Verified",
    auditDate: "2026-07-15",
    riskScore: "Low (12%)",
    certifications: "ISO 9001 Certified, Dell OEM Partner",
    taxRegistration: "GST-DELL-44021",
    paymentHistory: "$54,200.00 YTD",
    deliveryPerformance: "4/4 On-Time",
    suspiciousFlags: "None",
    checks: {
      legitimacy: true,
      bankVerified: true,
      isoAudit: true,
    }
  },
  {
    vendor: "Custom Office Designs",
    rating: "3.2 / 5.0 ⭐",
    slaScore: "78.5% Fulfillment",
    compliance: "Under Review",
    auditDate: "2026-07-10",
    riskScore: "Medium (45%)",
    certifications: "Local Woodworking Association Cert",
    taxRegistration: "GST-OFFC-22910",
    paymentHistory: "$15,200.00 YTD",
    deliveryPerformance: "12/15 On-Time (3 Delayed)",
    suspiciousFlags: "Bypassed standard competitive bidding parameters.",
    checks: {
      legitimacy: true,
      bankVerified: true,
      isoAudit: false,
    }
  },
  {
    vendor: "Suspicious Tech Sourcing Inc",
    rating: "N/A",
    slaScore: "N/A",
    compliance: "Suspended",
    auditDate: "2026-07-24",
    riskScore: "High (88%)",
    certifications: "None provided",
    taxRegistration: "Unverified",
    paymentHistory: "$0.00 YTD",
    deliveryPerformance: "N/A",
    suspiciousFlags: "Duplicate bank account routing number matched with Custom Office Designs.",
    checks: {
      legitimacy: false,
      bankVerified: false,
      isoAudit: false,
    }
  }
];

const VendorAudits = () => {
  const [vendors, setVendors] = useState(initialVendorAudits);
  const [activeSubTab, setActiveSubTab] = useState("approved"); // approved, suspicious
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);

  const filteredVendors = vendors.filter(
    (v) =>
      v.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.compliance.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="aud-vendor-audits-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="aud-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Star color="#f8b400" size={28} /> Supplier Compliance & Performance Scorecards
          </h1>
          <p className="aud-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Audit supplier registrations, SLA delivery fulfillment percentages, certifications checklist, and risk warning flags.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("approved")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "approved" ? "700" : "500",
            color: activeSubTab === "approved" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "approved" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Vendor Profiles & Compliance Scorecards
        </button>
        <button
          onClick={() => setActiveSubTab("suspicious")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "suspicious" ? "700" : "500",
            color: activeSubTab === "suspicious" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "suspicious" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Suspicious Vendor Activities ({vendors.filter(v => v.suspiciousFlags !== "None").length})
        </button>
      </div>

      {/* Search Bar */}
      {activeSubTab === "approved" && (
        <div className="aud-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px" }}>
          <div style={{ position: "relative", width: "360px" }}>
            <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search vendor name, compliance..."
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

      {/* 1. Approved Profiles Tab */}
      {activeSubTab === "approved" && (
        <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="aud-table-container">
            <table className="aud-table">
              <thead>
                <tr>
                  <th>Vendor / Supplier Name</th>
                  <th>Rating</th>
                  <th>SLA Fulfillment</th>
                  <th>Delivery Accuracy</th>
                  <th>Audited Risk Score</th>
                  <th>Treasury Disbursements YTD</th>
                  <th>Compliance Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((v, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700" }}>{v.vendor}</td>
                    <td style={{ color: "#d97706", fontWeight: "700" }}>{v.rating}</td>
                    <td style={{ fontWeight: "700", color: "#059669" }}>{v.slaScore}</td>
                    <td style={{ color: "#555" }}>{v.deliveryPerformance}</td>
                    <td style={{ fontWeight: "800", color: v.riskScore.includes("High") ? "#dc2626" : v.riskScore.includes("Medium") ? "#d97706" : "#059669" }}>
                      {v.riskScore}
                    </td>
                    <td style={{ color: "#059669", fontWeight: "700" }}>{v.paymentHistory}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background:
                            v.compliance === "Tier 1 Preferred" || v.compliance === "Active Verified"
                              ? "rgba(5, 150, 105, 0.12)"
                              : "rgba(220, 38, 38, 0.12)",
                          color:
                            v.compliance === "Tier 1 Preferred" || v.compliance === "Active Verified"
                              ? "#059669"
                              : "#dc2626",
                        }}
                      >
                        {v.compliance}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="aud-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                        onClick={() => setSelectedVendor(v)}
                        title="View Vendor Profile Audit"
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

      {/* 2. Suspicious Activities Tab */}
      {activeSubTab === "suspicious" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {vendors.filter(v => v.suspiciousFlags !== "None").map((v, idx) => (
            <div key={idx} className="aud-card" style={{ padding: "20px", border: "1px solid rgba(220,38,38,0.25)", background: "rgba(220,38,38,0.05)", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <AlertTriangle color="#dc2626" size={24} />
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#dc2626", margin: 0 }}>
                  Security Flag: {v.vendor}
                </h4>
                <p style={{ fontSize: "13.5px", color: "#333", marginTop: "8px", fontWeight: "600" }}>
                  Incident Type: {v.suspiciousFlags}
                </p>
                <div style={{ marginTop: "12px", fontSize: "12.5px", color: "#555" }}>
                  Audited risk standing: <strong>{v.riskScore} Risk</strong> | Tax registration: <strong>{v.taxRegistration}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor Profile Modal */}
      {selectedVendor && (
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
              maxWidth: "540px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>VENDOR COMPLIANCE PROFILE</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  {selectedVendor.vendor}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", maxHeight: "60vh", overflowY: "auto" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
                <div>
                  <span style={{ fontSize: "11.5px", color: "#777" }}>Supplier Certifications</span>
                  <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{selectedVendor.certifications}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11.5px", color: "#777" }}>Tax Registration Identification (GST/VAT)</span>
                  <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{selectedVendor.taxRegistration}</p>
                </div>

                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "6px", margin: "10px 0 0" }}>Compliance Verifications Checklist</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Corporate Legitimacy Checked:</span>
                    <strong style={{ color: selectedVendor.checks.legitimacy ? "#059669" : "#dc2626" }}>
                      {selectedVendor.checks.legitimacy ? "Verified Legit" : "Unverified"}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Bank Routing Details Verified:</span>
                    <strong style={{ color: selectedVendor.checks.bankVerified ? "#059669" : "#dc2626" }}>
                      {selectedVendor.checks.bankVerified ? "Bank Verified" : "Unverified / Flagged"}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>ISO Quality Standards Certified:</span>
                    <strong style={{ color: selectedVendor.checks.isoAudit ? "#059669" : "#dc2626" }}>
                      {selectedVendor.checks.isoAudit ? "Yes (Certified)" : "No (Not Certified)"}
                    </strong>
                  </div>
                </div>

                {selectedVendor.suspiciousFlags !== "None" && (
                  <div style={{ marginTop: "12px", background: "rgba(220,38,38,0.06)", border: "1px dashed rgba(220,38,38,0.3)", padding: "10px", borderRadius: "6px", color: "#dc2626", fontSize: "13px" }}>
                    <strong>Warning Flags:</strong> {selectedVendor.suspiciousFlags}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="aud-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedVendor(null)}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorAudits;
