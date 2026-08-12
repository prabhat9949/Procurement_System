import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Search,
  Download,
  Eye,
  FileText,
  DollarSign,
  Award,
  X,
  CheckCircle2,
  Building,
  ShieldCheck,
  Clock
} from "lucide-react";
import { epsEventBus, fetchActiveRfqs, awardVendorContract, revokeVendorContract } from "../../../../../services/epsApiService";

const defaultApprovedQuotations = [
  {
    id: "QUOTE-2026-001",
    rfqId: "RFQ-2026-901",
    vendor: "Apple Business Direct",
    rating: "4.9 ⭐",
    item: "MacBook Pro M3 Max 64GB (x10)",
    unitPrice: "$3,699.00",
    totalPrice: "$36,990.00",
    leadTime: "3 Business Days",
    warranty: "3 Years AppleCare+ Enterprise",
    quoteFile: "Apple_Direct_Official_Quote_2026.pdf",
    discount: "5% Volume Tier",
    validUntil: "2026-08-15",
    paymentTerms: "Net 30 Days",
    technicalCompliance: "100% Meets Specifications",
    status: "Approved"
  }
];

const VendorQuotations = () => {
  const [quotationsList, setQuotationsList] = useState(defaultApprovedQuotations);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRfqFilter, setSelectedRfqFilter] = useState("all");
  const [statusTabFilter, setStatusTabFilter] = useState("all"); // 'all' | 'Approved' | 'Pending Review' | 'Rejected'
  const [previewQuote, setPreviewQuote] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const handleUpdateQuoteStatus = async (quoteObj, newStatus) => {
    const quoteId = typeof quoteObj === "string" ? quoteObj : quoteObj.id;
    const targetQuote = quotationsList.find(q => q.id === quoteId) || (typeof quoteObj === "object" ? quoteObj : null);

    setQuotationsList((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q))
    );

    if (newStatus === "Approved" && targetQuote) {
      await awardVendorContract(targetQuote.rfqId, targetQuote.vendor, targetQuote.totalPrice);
    } else if (newStatus === "Rejected" && targetQuote) {
      await revokeVendorContract(targetQuote.rfqId);
    }

    setToastMsg(`✓ Quotation ${quoteId} status updated to: [ ${newStatus} ] & PO synced`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const loadLiveQuotations = async () => {
    const rfqs = await fetchActiveRfqs();
    const vendorMap = new Map();

    // 1. Add default approved quotations
    defaultApprovedQuotations.forEach((q) => {
      const compositeKey = `${q.rfqId}_${q.vendor.toLowerCase().trim()}`;
      vendorMap.set(compositeKey, q);
    });

    // 2. Add/override with live extracted bids from RFQs
    (rfqs || []).forEach((rfq) => {
      if (rfq.bids && rfq.bids.length > 0) {
        rfq.bids.forEach((bid) => {
          const vName = bid.vendor || "Approved Supplier";
          const compositeKey = `${rfq.id}_${vName.toLowerCase().trim()}`;
          vendorMap.set(compositeKey, {
            id: `QUOTE-${rfq.id}-${vName.replace(/\s+/g, "")}`,
            rfqId: rfq.id,
            vendor: vName,
            rating: "4.8 ⭐",
            item: rfq.item || "Equipment Sourcing",
            unitPrice: bid.amount || "$3,699.00",
            totalPrice: bid.amount || "$36,990.00",
            leadTime: bid.leadTime || "3 Business Days",
            warranty: "Standard OEM Warranty",
            quoteFile: `${rfq.id}_Received_Proposal.pdf`,
            discount: "Commercial Bidding Rate",
            validUntil: rfq.deadline || "2026-08-15",
            paymentTerms: "Net 30 Days",
            technicalCompliance: "Verified Compliant",
            status: bid.status || (rfq.status === "Awarded" && rfq.winnerVendor === vName ? "Approved" : "Pending Review")
          });
        });
      }
    });

    setQuotationsList(Array.from(vendorMap.values()));
  };

  useEffect(() => {
    loadLiveQuotations();
    const unsub = epsEventBus.subscribe(() => {
      loadLiveQuotations();
    });
    return unsub;
  }, []);

  const filtered = quotationsList.filter((q) => {
    const matchesSearch =
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRfq =
      selectedRfqFilter === "all" || q.rfqId === selectedRfqFilter;
    const qStatus = q.status || "Approved";
    const matchesStatus =
      statusTabFilter === "all" || qStatus.toLowerCase().includes(statusTabFilter.toLowerCase());
    return matchesSearch && matchesRfq && matchesStatus;
  });

  const handleDownloadQuote = (quoteObj) => {
    setToastMsg(`Downloading official bid proposal PDF (${quoteObj.quoteFile})...`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="pe-quotations-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <FileCheck2 color="#f8b400" /> Vendor Quotations Repository
          </h1>
          <p className="pe-page-subtitle">
            View submitted commercial bids, inspect proposal documents, and download supplier quotes.
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

      {/* Status Filter Tabs Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          className={`pe-btn-primary-sm ${statusTabFilter === "all" ? "active" : ""}`}
          style={{
            background: statusTabFilter === "all" ? "#111111" : "#ffffff",
            color: statusTabFilter === "all" ? "#ffffff" : "#111111",
            border: "1px solid #d9d9d9",
            fontWeight: "700"
          }}
          onClick={() => setStatusTabFilter("all")}
        >
          All Quotations ({quotationsList.length})
        </button>

        <button
          className={`pe-btn-primary-sm ${statusTabFilter === "Approved" ? "active" : ""}`}
          style={{
            background: statusTabFilter === "Approved" ? "#059669" : "#ffffff",
            color: statusTabFilter === "Approved" ? "#ffffff" : "#059669",
            border: "1px solid #059669",
            fontWeight: "700"
          }}
          onClick={() => setStatusTabFilter("Approved")}
        >
          <CheckCircle2 size={14} /> Approved Quotations ({quotationsList.filter(q => (q.status || "Approved").includes("Approved")).length})
        </button>

        <button
          className={`pe-btn-primary-sm ${statusTabFilter === "Pending Review" ? "active" : ""}`}
          style={{
            background: statusTabFilter === "Pending Review" ? "#d97706" : "#ffffff",
            color: statusTabFilter === "Pending Review" ? "#ffffff" : "#d97706",
            border: "1px solid #d97706",
            fontWeight: "700"
          }}
          onClick={() => setStatusTabFilter("Pending Review")}
        >
          <Clock size={14} /> Pending Quotations ({quotationsList.filter(q => (q.status || "").includes("Pending")).length})
        </button>

        <button
          className={`pe-btn-primary-sm ${statusTabFilter === "Rejected" ? "active" : ""}`}
          style={{
            background: statusTabFilter === "Rejected" ? "#dc2626" : "#ffffff",
            color: statusTabFilter === "Rejected" ? "#ffffff" : "#dc2626",
            border: "1px solid #dc2626",
            fontWeight: "700"
          }}
          onClick={() => setStatusTabFilter("Rejected")}
        >
          <X size={14} /> Rejected Quotations ({quotationsList.filter(q => (q.status || "").includes("Rejected")).length})
        </button>
      </div>

      {/* Search & RFQ Filter Bar */}
      <div className="pe-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search
              size={16}
              color="#666666"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by Quote ID, Vendor, or Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>FILTER BY RFQ:</label>
            <select
              value={selectedRfqFilter}
              onChange={(e) => setSelectedRfqFilter(e.target.value)}
              className="pe-form-select"
              style={{ width: "180px", height: "42px" }}
            >
              <option value="all">All Open RFQs</option>
              <option value="RFQ-2026-901">RFQ-2026-901 (MacBook Pro)</option>
              <option value="RFQ-2026-898">RFQ-2026-898 (Datadog APM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Quotations */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "20px",
        }}
      >
        {filtered.map((q) => {
          const isApproved = (q.status || "Approved").includes("Approved");
          const isRejected = (q.status || "").includes("Rejected");
          const isPending = (q.status || "").includes("Pending");

          return (
            <div key={q.id} className="pe-card pe-card-gold-glow">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontWeight: "800", color: "#d97706", fontSize: "13px" }}>
                  {q.id} • {q.rfqId}
                </span>

                {isApproved && (
                  <span style={{ background: "rgba(5, 150, 105, 0.12)", color: "#059669", border: "1px solid rgba(5, 150, 105, 0.3)", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={12} /> Approved
                  </span>
                )}
                {isPending && (
                  <span style={{ background: "rgba(217, 119, 6, 0.12)", color: "#d97706", border: "1px solid rgba(217, 119, 6, 0.3)", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> Pending Review
                  </span>
                )}
                {isRejected && (
                  <span style={{ background: "rgba(220, 38, 38, 0.12)", color: "#dc2626", border: "1px solid rgba(220, 38, 38, 0.3)", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <X size={12} /> Rejected
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "17px", color: "#111111", fontWeight: "700" }}>{q.vendor}</h3>
              <p style={{ fontSize: "13px", color: "#555555", marginTop: "2px" }}>{q.item}</p>

            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "#f8f9fb",
                borderRadius: "10px",
                border: "1px solid #ececec",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Total Bid Price:</span>
                <strong style={{ color: "#059669", fontSize: "15px" }}>{q.totalPrice}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>SLA Lead Time:</span>
                <span style={{ fontWeight: "600" }}>{q.leadTime}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Commercial Incentive:</span>
                <span style={{ fontWeight: "700", color: "#d97706" }}>{q.discount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Proposal Validity:</span>
                <span style={{ fontWeight: "600", color: "#111" }}>Until {q.validUntil}</span>
              </div>
            </div>

            {/* Action buttons: View Submitted Quotation & Download Quotations */}
            <div
              style={{
                marginTop: "18px",
                display: "flex",
                justify: "flex-end",
                gap: "10px",
              }}
            >
              <button
                className="pe-btn-primary-sm"
                style={{ background: "#ffffff", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setPreviewQuote(q)}
              >
                <Eye size={15} /> View Quotation Details
              </button>

              <button
                className="pe-btn-primary-sm"
                onClick={() => handleDownloadQuote(q)}
              >
                <Download size={15} /> Download PDF
              </button>
            </div>
          </div>
        );
      })}
    </div>

      {/* VIEW SUBMITTED QUOTATION MODAL */}
      {previewQuote && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: "600px" }}>
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>SUBMITTED VENDOR COMMERCIAL BID</span>
                <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "800" }}>
                  {previewQuote.id} ({previewQuote.vendor})
                </h3>
              </div>
              <button
                onClick={() => setPreviewQuote(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  padding: "16px",
                  background: "#f8f9fb",
                  borderRadius: "12px",
                  border: "1px solid #ececec",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  fontSize: "13.5px",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Offered Total Price</span>
                  <p style={{ fontSize: "20px", color: "#059669", fontWeight: "800" }}>{previewQuote.totalPrice}</p>
                  <span style={{ fontSize: "11px", color: "#666" }}>Unit Rate: {previewQuote.unitPrice}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Vendor Rating & Tier</span>
                  <p style={{ fontWeight: "700", color: "#111" }}>{previewQuote.rating}</p>
                  <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "700" }}>{previewQuote.discount}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Guaranteed Delivery SLA</span>
                  <p style={{ fontWeight: "700", color: "#111" }}>{previewQuote.leadTime}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Payment Terms</span>
                  <p style={{ fontWeight: "700", color: "#111" }}>{previewQuote.paymentTerms}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Warranty & Support</span>
                  <p style={{ fontWeight: "700", color: "#111" }}>{previewQuote.warranty}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Specs Compliance</span>
                  <p style={{ fontWeight: "700", color: "#059669" }}>{previewQuote.technicalCompliance}</p>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #d9d9d9", padding: "14px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText color="#f8b400" size={20} />
                  <div>
                    <strong style={{ fontSize: "14px", color: "#111" }}>{previewQuote.quoteFile}</strong>
                    <p style={{ fontSize: "11px", color: "#666" }}>Official signed proposal PDF document</p>
                  </div>
                </div>

                <button
                  className="pe-btn-primary-sm"
                  onClick={() => handleDownloadQuote(previewQuote)}
                >
                  <Download size={15} /> Download PDF
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                className="pe-btn-primary-sm"
                onClick={() => setPreviewQuote(null)}
              >
                Close Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorQuotations;
