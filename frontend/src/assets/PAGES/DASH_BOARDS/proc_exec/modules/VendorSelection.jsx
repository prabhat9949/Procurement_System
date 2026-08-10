import React, { useState } from "react";
import {
  FileCheck2,
  CheckCircle2,
  Award,
  DollarSign,
  Truck,
  ShieldCheck,
  Check,
  Zap,
  Send,
  AlertCircle,
  X
} from "lucide-react";

const matrixData = {
  rfqId: "RFQ-2026-901",
  item: "MacBook Pro M3 Max 64GB Workstations (x10)",
  targetBudget: "$38,990.00",
  rawBudget: 38990,
  approvalThreshold: "$25,000.00",
  vendors: [
    {
      name: "Apple Business Direct",
      recommended: true,
      rating: "4.9 / 5.0 ⭐",
      unitPrice: "$3,699.00",
      totalPrice: "$36,990.00",
      rawTotal: 36990,
      leadTime: "3 Business Days",
      warranty: "3 Years AppleCare+ Enterprise",
      compliance: "100% Verified",
      incentive: "5% Direct Volume Tier",
      savings: "$2,000.00 under budget",
      requiresApproval: true,
    },
    {
      name: "CDW Direct",
      recommended: false,
      rating: "4.7 / 5.0 ⭐",
      unitPrice: "$3,849.00",
      totalPrice: "$38,490.00",
      rawTotal: 38490,
      leadTime: "2 Business Days",
      warranty: "3 Years CDW Express Replace",
      compliance: "100% Verified",
      incentive: "Free Expedited Air Freight",
      savings: "$500.00 under budget",
      requiresApproval: true,
    },
    {
      name: "Insight Tech Solutions",
      recommended: false,
      rating: "4.6 / 5.0 ⭐",
      unitPrice: "$3,899.00",
      totalPrice: "$38,990.00",
      rawTotal: 38990,
      leadTime: "5 Business Days",
      warranty: "3 Years Standard Warranty",
      compliance: "100% Verified",
      incentive: "Standard Price Match",
      savings: "Matches Budget Target",
      requiresApproval: true,
    },
  ],
};

const VendorSelection = ({ onNavigate }) => {
  const [selectedVendor, setSelectedVendor] = useState("Apple Business Direct");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalTargetVendor, setApprovalTargetVendor] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const handleSelectVendor = (vendorObj) => {
    setSelectedVendor(vendorObj.name);
    setToastMsg(`Best Supplier "${vendorObj.name}" selected for ${matrixData.rfqId}!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleOpenApprovalModal = (vendorObj) => {
    setApprovalTargetVendor(vendorObj);
    setShowApprovalModal(true);
  };

  const handleSubmitForApproval = (e) => {
    e.preventDefault();
    setShowApprovalModal(false);
    setToastMsg(
      `Vendor Selection for ${approvalTargetVendor.name} (${approvalTargetVendor.totalPrice}) submitted to VP Sarah Jenkins for High-Value Sign-off!`
    );
    setTimeout(() => setToastMsg(""), 5000);
  };

  return (
    <div className="pe-vendor-selection-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <Award color="#f8b400" /> Commercial Bid Comparison & Vendor Selection Matrix
          </h1>
          <p className="pe-page-subtitle">
            Compare submitted supplier quotations side-by-side, select the winning vendor, and submit high-value awards for approval.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            background: "rgba(5, 150, 105, 0.12)",
            border: "1px solid #059669",
            color: "#059669",
            padding: "14px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontWeight: "700",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* RFQ Context Card */}
      <div
        className="pe-card pe-card-gold-glow"
        style={{ marginBottom: "28px", padding: "20px 24px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800" }}>
              COMPARING QUOTATIONS FOR: {matrixData.rfqId}
            </span>
            <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700", marginTop: "2px" }}>
              {matrixData.item}
            </h2>
            <p style={{ color: "#666666", fontSize: "13px", marginTop: "2px" }}>
              Allocated Target Budget: <strong style={{ color: "#111111" }}>{matrixData.targetBudget}</strong> • High-Value Threshold: <strong>{matrixData.approvalThreshold}</strong>
            </p>
          </div>

          <div
            style={{
              padding: "8px 16px",
              background: "rgba(5, 150, 105, 0.12)",
              borderRadius: "12px",
              border: "1px solid #059669",
              color: "#059669",
              fontWeight: "700",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Zap size={16} /> Automated Commercial Savings Matrix
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        {matrixData.vendors.map((v, idx) => {
          const isSelected = selectedVendor === v.name;
          return (
            <div
              key={idx}
              className="pe-card"
              style={{
                border: isSelected ? "2px solid #059669" : "1px solid #ececec",
                background: isSelected ? "linear-gradient(180deg, rgba(5,150,105,0.06) 0%, #ffffff 100%)" : "#ffffff",
                position: "relative",
              }}
            >
              {v.recommended && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "var(--accent-gold-gradient)",
                    color: "#000000",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Best Value Bid
                </div>
              )}

              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>{v.name}</h3>
              <span style={{ fontSize: "13px", color: "#666666" }}>Supplier Rating: {v.rating}</span>

              <div style={{ margin: "20px 0", borderTop: "1px solid #ececec", paddingTop: "16px" }}>
                <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                  Total Commercial Offer
                </span>
                <p style={{ fontSize: "26px", color: "#059669", fontWeight: "800", marginTop: "2px" }}>
                  {v.totalPrice}
                </p>
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "700" }}>
                  Unit Rate: {v.unitPrice}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "#333" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Truck size={16} color="#f8b400" />
                  <span>SLA Lead Time: <strong>{v.leadTime}</strong></span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={16} color="#f8b400" />
                  <span>Warranty: <strong>{v.warranty}</strong></span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span>Compliance: <strong>{v.compliance}</strong></span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <DollarSign size={16} color="#d97706" />
                  <span>Budget Savings: <strong style={{ color: "#059669" }}>{v.savings}</strong></span>
                </div>
              </div>

              {/* Action Buttons for Select Best Vendor & Submit for Approval */}
              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  className="pe-btn-primary-sm"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    background: isSelected ? "#059669" : "var(--accent-gold-gradient)",
                    color: isSelected ? "#ffffff" : "#000000",
                  }}
                  onClick={() => handleSelectVendor(v)}
                >
                  {isSelected ? (
                    <>
                      <Check size={16} /> Selected Best Vendor
                    </>
                  ) : (
                    "Select Best Vendor"
                  )}
                </button>

                {v.rawTotal > 25000 && (
                  <button
                    className="pe-btn-primary-sm"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      background: "#ffffff",
                      color: "#d97706",
                      border: "1px solid #d97706",
                    }}
                    onClick={() => handleOpenApprovalModal(v)}
                  >
                    <Send size={15} /> Submit for Approval (&gt; $25k)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBMIT FOR APPROVAL MODAL */}
      {showApprovalModal && approvalTargetVendor && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>HIGH-VALUE AWARD APPROVAL SUBMISSION</span>
                <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800" }}>{approvalTargetVendor.name}</h3>
              </div>
              <button onClick={() => setShowApprovalModal(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForApproval}>
              <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "14px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", color: "#92400e", display: "flex", gap: "10px", alignItems: "center" }}>
                <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                <span>
                  This award value (<strong>{approvalTargetVendor.totalPrice}</strong>) exceeds the $25,000 threshold and requires executive manager sign-off.
                </span>
              </div>

              <div className="pe-form-group" style={{ marginBottom: "16px" }}>
                <label className="pe-form-label">Approving Officer *</label>
                <input
                  type="text"
                  className="pe-form-input"
                  value="Sarah Jenkins (VP of Engineering & IT)"
                  readOnly
                />
              </div>

              <div className="pe-form-group" style={{ marginBottom: "20px" }}>
                <label className="pe-form-label">Executive Award Justification / Notes</label>
                <textarea
                  className="pe-form-input"
                  rows={3}
                  defaultValue={`Requesting sign-off for awarding ${matrixData.rfqId} to ${approvalTargetVendor.name} at ${approvalTargetVendor.totalPrice}. Yields ${approvalTargetVendor.savings} with 100% compliance rating.`}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pe-btn-primary-sm">
                  <Send size={16} /> Submit to Manager for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorSelection;
