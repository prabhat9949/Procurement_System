import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import VendorProfileModal from "../../shared_ui/VendorProfileModal";
import CreateRfqWizardModal from "./CreateRfqWizardModal";
import { epsEventBus, fetchActiveRfqs, awardVendorContract, revokeVendorContract } from "../../../../../services/epsApiService";
import {
  Send,
  PlusCircle,
  Clock,
  Users,
  CheckCircle2,
  FileText,
  X,
  Search,
  ArrowRight,
  Eye,
  Building,
  Filter,
  ShieldCheck,
  Award,
  DollarSign
} from "lucide-react";

const mockPurchaseRequests = {
  "REQ-2026-8921": {
    id: "REQ-2026-8921",
    requester: "Alex Morgan",
    role: "Senior Frontend Architect",
    dept: "Engineering & IT",
    item: "MacBook Pro M3 Max 64GB Workstations (x10)",
    qty: 10,
    estimatedCost: "$38,990.00",
    priority: "Urgent",
    date: "2026-07-24",
    justification: "High-performance Mobile compilation & Local LLM AI testing hardware setup required for Q3 project releases.",
    specificationsFile: "Hardware_Specs_MacBook_Pro.pdf",
    approvedBy: "Sarah Jenkins (VP Eng)",
  },
  "REQ-2026-8945": {
    id: "REQ-2026-8945",
    requester: "David Miller",
    role: "DevOps Lead",
    dept: "Engineering & IT",
    item: "Datadog APM Enterprise Monitoring License",
    qty: 1,
    estimatedCost: "$8,500.00",
    priority: "High",
    date: "2026-07-25",
    justification: "Annual renewal for production microservice observability and latency telemetry dashboards.",
    specificationsFile: "Datadog_License_Terms.pdf",
    approvedBy: "Sarah Jenkins (VP Eng)",
  },
  "REQ-2026-8972": {
    id: "REQ-2026-8972",
    requester: "Elena Rostova",
    role: "Network Architect",
    dept: "Engineering & IT",
    item: "Cisco Catalyst 9300 Core Rack Switches (x2)",
    qty: 2,
    estimatedCost: "$6,200.00",
    priority: "High",
    date: "2026-07-26",
    justification: "Secondary data center rack switch redundancy upgrade to eliminate single point of failure.",
    specificationsFile: "Cisco_Switch_Topology.pdf",
    approvedBy: "Sarah Jenkins (VP Eng)",
  },
};

const availableVendorsList = [
  {
    id: "VND-101",
    name: "Apple Business Direct",
    category: "Hardware & IT",
    rating: "4.9 ⭐",
    compliance: "100% Certified",
    email: "enterprise@apple.com",
    phone: "+1 (800) 692-7753",
    leadTime: "2-3 Days",
    preferredTier: "Gold Preferred",
  },
  {
    id: "VND-102",
    name: "CDW Direct",
    category: "Hardware & IT",
    rating: "4.7 ⭐",
    compliance: "100% Certified",
    email: "bids@cdw.com",
    phone: "+1 (800) 800-4239",
    leadTime: "1-2 Days",
    preferredTier: "Silver Partner",
  },
  {
    id: "VND-103",
    name: "Insight Tech Solutions",
    category: "Hardware & IT",
    rating: "4.6 ⭐",
    compliance: "98% Certified",
    email: "enterprise@insight.com",
    phone: "+1 (800) 467-4448",
    leadTime: "3-5 Days",
    preferredTier: "Verified Supplier",
  },
  {
    id: "VND-104",
    name: "Datadog Direct",
    category: "Software & SaaS",
    rating: "5.0 ⭐",
    compliance: "100% Certified",
    email: "sales@datadoghq.com",
    phone: "+1 (866) 329-4448",
    leadTime: "Instant Provisioning",
    preferredTier: "Strategic SaaS Partner",
  },
  {
    id: "VND-105",
    name: "SoftwareOne Reseller",
    category: "Software & SaaS",
    rating: "4.8 ⭐",
    compliance: "99% Certified",
    email: "quotes@softwareone.com",
    phone: "+1 (800) 444-9988",
    leadTime: "1 Day",
    preferredTier: "Gold Partner",
  },
  {
    id: "VND-106",
    name: "Cisco Systems Direct",
    category: "Hardware & IT",
    rating: "4.9 ⭐",
    compliance: "100% Certified",
    email: "commercial@cisco.com",
    phone: "+1 (800) 553-6387",
    leadTime: "3-4 Days",
    preferredTier: "Primary OEM",
  },
];

const initialRfqs = [
  {
    id: "RFQ-2026-901",
    reqId: "REQ-2026-8921",
    item: "MacBook Pro M3 Max 64GB Workstations (x10)",
    category: "Hardware & IT",
    targetQty: 10,
    deadline: "2026-07-28",
    invitedVendors: ["Apple Business Direct", "CDW Direct", "Insight Tech Solutions"],
    bidsReceived: 3,
    status: "Active Bidding",
  },
  {
    id: "RFQ-2026-898",
    reqId: "REQ-2026-8945",
    item: "Datadog APM Enterprise Monitoring License",
    category: "Software & SaaS",
    targetQty: 1,
    deadline: "2026-07-29",
    invitedVendors: ["Datadog Direct", "SoftwareOne Reseller"],
    bidsReceived: 2,
    status: "Reviewing Bids",
  },
  {
    id: "RFQ-2026-912",
    reqId: "REQ-2026-8972",
    item: "Cisco Catalyst 9300 Core Rack Switches (x2)",
    category: "Hardware & IT",
    targetQty: 2,
    deadline: "2026-07-30",
    invitedVendors: ["Cisco Systems Direct", "CDW Direct", "Insight Tech Solutions"],
    bidsReceived: 1,
    status: "Active Bidding",
  },
];

const RfqManagement = () => {
  const [rfqs, setRfqs] = useState(initialRfqs);
  const [activeTabSection, setActiveTabSection] = useState("rfqs"); // 'rfqs' | 'vendors'
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [selectedVendorCategory, setSelectedVendorCategory] = useState("all");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewReqDetails, setViewReqDetails] = useState(null);
  const [viewVendorDetails, setViewVendorDetails] = useState(null);
  const [editRfqModal, setEditRfqModal] = useState(null); // Post-creation RFQ Editing
  const [editRfqDeadline, setEditRfqDeadline] = useState("");
  const [editRfqStatus, setEditRfqStatus] = useState("Active Bidding");
  const [bidsMatrixRfq, setBidsMatrixRfq] = useState(null); // Side-by-side Bids Matrix Modal
  const [confirmQuoteApproval, setConfirmQuoteApproval] = useState(null); // Quotation Approval Confirmation Modal

  useEffect(() => {
    const load = async () => {
      const data = await fetchActiveRfqs();
      if (data && data.length) {
        setRfqs(data);
      }
    };
    load();
    const unsub = epsEventBus.subscribe(async () => {
      const data = await fetchActiveRfqs();
      if (data && data.length) {
        setRfqs(data);
      }
    });
    return unsub;
  }, []);

  // New RFQ Form state with selectable vendors
  const [newRfq, setNewRfq] = useState({
    reqId: "REQ-2026-8921",
    item: "MacBook Pro M3 Max 64GB Workstations (x10)",
    targetQty: 10,
    category: "Hardware & IT",
    deadline: "2026-08-05",
    selectedVendors: ["Apple Business Direct", "CDW Direct"],
  });

  const [toastMsg, setToastMsg] = useState("");

  const filteredVendors = availableVendorsList.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(vendorSearchTerm.toLowerCase());
    const matchesCategory =
      selectedVendorCategory === "all" || v.category === selectedVendorCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleVendorSelection = (vendorName) => {
    if (newRfq.selectedVendors.includes(vendorName)) {
      setNewRfq({
        ...newRfq,
        selectedVendors: newRfq.selectedVendors.filter((v) => v !== vendorName),
      });
    } else {
      setNewRfq({
        ...newRfq,
        selectedVendors: [...newRfq.selectedVendors, vendorName],
      });
    }
  };

  const handleCreateAndSendRfq = (e) => {
    e.preventDefault();
    if (newRfq.selectedVendors.length === 0) {
      alert("Please select at least 1 available vendor to invite.");
      return;
    }

    const createdId = `RFQ-2026-${Math.floor(920 + Math.random() * 75)}`;
    const created = {
      id: createdId,
      reqId: newRfq.reqId,
      item: newRfq.item,
      category: newRfq.category,
      targetQty: newRfq.targetQty,
      deadline: newRfq.deadline || "2026-08-05",
      invitedVendors: newRfq.selectedVendors,
      bidsReceived: 0,
      status: "Active Bidding",
    };

    setRfqs([created, ...rfqs]);
    setShowCreateModal(false);
    setToastMsg(
      `RFQ ${createdId} created and successfully sent/broadcasted to ${newRfq.selectedVendors.length} invited suppliers!`
    );
    setTimeout(() => setToastMsg(""), 5000);
  };

  return (
    <div className="pe-rfq-management-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <Send color="#f8b400" /> Request for Quotations (RFQ) Management Hub
          </h1>
          <p className="pe-page-subtitle">
            Create, issue, and broadcast competitive bidding requests to verified enterprise suppliers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="pe-btn-primary-sm"
            style={{
              background: activeTabSection === "vendors" ? "#f8b400" : "#ffffff",
              color: "#111111",
              border: "1px solid #d9d9d9",
            }}
            onClick={() =>
              setActiveTabSection(activeTabSection === "rfqs" ? "vendors" : "rfqs")
            }
          >
            <Users size={16} />{" "}
            {activeTabSection === "rfqs" ? "Search Available Vendors" : "View Active RFQs"}
          </button>

          <button
            className="pe-btn-primary-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusCircle size={16} /> Create & Send New RFQ
          </button>
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

      {/* SECTION 1: SEARCH AVAILABLE VENDORS DIRECTORY TAB */}
      {activeTabSection === "vendors" ? (
        <div>
          <div className="pe-card" style={{ marginBottom: "24px", padding: "20px" }}>
            <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "700", marginBottom: "14px" }}>
              Search Available Vendors & Supplier Profiles
            </h3>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                <Search
                  size={16}
                  color="#666666"
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Search available vendors by name or category..."
                  value={vendorSearchTerm}
                  onChange={(e) => setVendorSearchTerm(e.target.value)}
                  className="pe-form-input"
                  style={{ paddingLeft: "42px", height: "42px" }}
                />
              </div>

              <select
                value={selectedVendorCategory}
                onChange={(e) => setSelectedVendorCategory(e.target.value)}
                className="pe-form-select"
                style={{ width: "200px", height: "42px" }}
              >
                <option value="all">All Vendor Categories</option>
                <option value="Hardware & IT">Hardware & IT</option>
                <option value="Software & SaaS">Software & SaaS</option>
              </select>
            </div>
          </div>

          {/* Vendors Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {filteredVendors.map((v) => (
              <div key={v.id} className="pe-card pe-card-gold-glow">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800" }}>{v.id}</span>
                  <span style={{ background: "rgba(5,150,105,0.12)", color: "#059669", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                    {v.compliance}
                  </span>
                </div>

                <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>{v.name}</h3>
                <p style={{ fontSize: "13px", color: "#555555" }}>Category: <strong>{v.category}</strong></p>

                <div style={{ background: "#f8f9fb", padding: "12px", borderRadius: "10px", margin: "14px 0", fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div>Rating: <strong>{v.rating}</strong> ({v.preferredTier})</div>
                  <div>SLA Lead Time: <strong>{v.leadTime}</strong></div>
                  <div>Contact: <span style={{ color: "#3b82f6" }}>{v.email}</span></div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="pe-btn-primary-sm"
                    onClick={() => setViewVendorDetails(v)}
                  >
                    <Eye size={15} /> View Vendor Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SECTION 2: ACTIVE RFQS LIST */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="pe-card pe-card-gold-glow">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: "800", color: "#d97706", fontSize: "16px" }}>
                      {rfq.id}
                    </span>
                    <span style={{ fontSize: "12px", color: "#666666" }}>
                      Purchase Req Ref: <strong>{rfq.reqId}</strong>
                    </span>
                    {rfq.status === "Awarded" || rfq.status === "Approved" || rfq.winnerVendor ? (
                      <span
                        style={{
                          background: "rgba(5, 150, 105, 0.12)",
                          color: "#059669",
                          border: "1px solid rgba(5, 150, 105, 0.3)",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px"
                        }}
                      >
                        <CheckCircle2 size={14} /> Quotation Approved & Awarded ({rfq.winnerVendor || "Apple Business Direct"})
                      </span>
                    ) : (
                      <span className="pe-badge rfq">{rfq.status}</span>
                    )}
                  </div>

                  <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>
                    {rfq.item}
                  </h3>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                    Bidding Deadline
                  </span>
                  <p style={{ fontSize: "16px", color: "#dc2626", fontWeight: "800" }}>
                    {rfq.deadline}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "16px",
                  padding: "14px",
                  background: "#f8f9fb",
                  borderRadius: "10px",
                  border: "1px solid #ececec",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                    Vendor Bids Received
                  </span>
                  <p style={{ fontSize: "18px", color: "#059669", fontWeight: "800", marginTop: "2px" }}>
                    {rfq.bids ? new Set(rfq.bids.map((b) => b.vendor)).size : (rfq.bidsReceived || 1)} Unique Supplier Quotations
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                    Selected / Invited Vendors ({(rfq.invitedVendors || ["Apple Business Direct", "CDW Direct"]).length})
                  </span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                    {(rfq.invitedVendors || ["Apple Business Direct", "CDW Direct"]).map((vName, idx) => {
                      const vendorObj = availableVendorsList.find((x) => x.name === vName);
                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            setViewVendorDetails(
                              vendorObj || {
                                name: vName,
                                category: rfq.category,
                                rating: "4.8 ⭐",
                                compliance: "Verified",
                                email: "sales@vendor.com",
                                phone: "+1 (800) 555-0199",
                                leadTime: "3 Days",
                                preferredTier: "Preferred Vendor",
                              }
                            )
                          }
                          style={{
                            fontSize: "12px",
                            background: "#ffffff",
                            border: "1px solid #d9d9d9",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            color: "#111111",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title="Click to View Vendor Details"
                        >
                          <Building size={13} color="#f8b400" /> {vName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Sub-features */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
                <button
                  className="pe-btn-primary-sm"
                  style={{ background: "#ffffff", color: "#d97706", border: "1px solid #f8b400" }}
                  onClick={() => {
                    setEditRfqModal(rfq);
                    setEditRfqDeadline(rfq.deadline || "2026-08-05");
                    setEditRfqStatus(rfq.status || "Active Bidding");
                  }}
                >
                  <FileText size={15} /> Edit RFQ Details
                </button>

                <button
                  className="pe-btn-primary-sm"
                  style={{ background: "#ffffff", color: "#111111", border: "1px solid #d9d9d9" }}
                  onClick={() =>
                    setViewReqDetails(
                      mockPurchaseRequests[rfq.reqId] || mockPurchaseRequests["REQ-2026-8921"]
                    )
                  }
                >
                  <FileText size={15} /> View Purchase Request Details
                </button>

                <button
                  className="pe-btn-primary-sm"
                  onClick={() => setBidsMatrixRfq(rfq)}
                >
                  View Bids Matrix <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT RFQ MODAL */}
      {editRfqModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "520px", width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800" }}>Edit Sourcing RFQ: {editRfqModal.id}</h3>
              <button onClick={() => setEditRfqModal(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "22px" }}>
              <div>
                <label className="pe-form-label">RFQ Title <span style={{ fontSize: "10px", color: "#666" }}>(Read-Only)</span></label>
                <input type="text" className="pe-form-input" value={editRfqModal.item} readOnly style={{ background: "#f8f9fb" }} />
              </div>
              <div>
                <label className="pe-form-label">Sourcing Submission Deadline *</label>
                <input type="date" className="pe-form-input" value={editRfqDeadline} onChange={(e) => setEditRfqDeadline(e.target.value)} />
              </div>
              <div>
                <label className="pe-form-label">RFQ Status *</label>
                <select className="pe-form-select" value={editRfqStatus} onChange={(e) => setEditRfqStatus(e.target.value)}>
                  <option value="Active Bidding">Active Bidding</option>
                  <option value="Reviewing Bids">Reviewing Bids</option>
                  <option value="Awarded">Awarded</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="pe-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111" }} onClick={() => setEditRfqModal(null)}>Cancel</button>
              <button className="pe-btn-primary-sm" onClick={() => {
                setRfqs(rfqs.map(r => r.id === editRfqModal.id ? { ...r, deadline: editRfqDeadline, status: editRfqStatus } : r));
                setEditRfqModal(null);
                setToastMsg(`RFQ ${editRfqModal.id} sourcing specifications updated successfully!`);
                setTimeout(() => setToastMsg(""), 4000);
              }}>Save RFQ Updates</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW PURCHASE REQUEST DETAILS */}
      {viewReqDetails && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>EMPLOYEE PURCHASE REQUISITION DETAILS</span>
                <h3 style={{ fontSize: "20px", color: "#111111", fontWeight: "800" }}>{viewReqDetails.id}</h3>
              </div>
              <button onClick={() => setViewReqDetails(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec" }}>
                <div>
                  <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase" }}>Employee Requester</span>
                  <p style={{ fontWeight: "700", color: "#111" }}>{viewReqDetails.requester}</p>
                  <span style={{ fontSize: "11px", color: "#666" }}>{viewReqDetails.role} ({viewReqDetails.dept})</span>
                </div>
                <div>
                  <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase" }}>Allocated Budget</span>
                  <p style={{ fontWeight: "800", color: "#059669", fontSize: "16px" }}>{viewReqDetails.estimatedCost}</p>
                  <span style={{ fontSize: "11px", color: "#666" }}>Signed off by: {viewReqDetails.approvedBy}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Requested Item Specification:</span>
                <p style={{ fontWeight: "700", color: "#111", fontSize: "16px", marginTop: "2px" }}>{viewReqDetails.item}</p>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Business Justification:</span>
                <p style={{ background: "#f8f9fb", padding: "12px", borderRadius: "8px", border: "1px solid #ececec", color: "#333", marginTop: "4px", fontStyle: "italic" }}>
                  "{viewReqDetails.justification}"
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="pe-btn-primary-sm" onClick={() => setViewReqDetails(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW VENDOR DETAILS - EXACT VENDOR PROFILE SCHEMA */}
      {viewVendorDetails && (
        <VendorProfileModal
          vendor={{
            companyName: viewVendorDetails.name || "ABC Technologies Pvt. Ltd.",
            vendorId: viewVendorDetails.id || "VEN-2026-001",
            vendorType: viewVendorDetails.category || "Electronics Supplier",
            email: viewVendorDetails.email || "sales@abctech.com",
            phone: viewVendorDetails.phone || "+91 98765 43210",
            location: viewVendorDetails.location || "Chennai, Tamil Nadu, India",
            productsServices: [
              "Laptops",
              "Desktop Computers",
              "Printers",
              "Computer Accessories",
              "Office Equipment",
            ],
            performance: {
              rating: viewVendorDetails.rating || "4.8 / 5",
              totalOrdersCompleted: 185,
              onTimeDeliveries: "97%",
              successfulTransactions: "98%",
              responseTime: "Within 4 Hours",
            },
            pricingInfo: [
              "Competitive Pricing",
              "Bulk Order Discounts Available",
              "GST Included",
              "Negotiable Prices",
            ],
            deliveryInfo: {
              deliveryTime: viewVendorDetails.leadTime || "3 - 5 Business Days",
              shippingAvailability: "PAN India",
            },
            certifications: [
              "GST Verified",
              "ISO Certified",
              "Company Verified",
              "Approved Vendor",
            ],
            recentProcurement: {
              lastOrderValue: "₹2,50,000",
              lastOrderDate: "12 July 2026",
              totalTransactions: 356,
            },
          }}
          onClose={() => setViewVendorDetails(null)}
          onAction={(actionName, vendorData) => {
            setToastMsg(`Action Executed: [ ${actionName} ] for ${vendorData.companyName}`);
            setTimeout(() => setToastMsg(""), 4000);
          }}
        />
      )}

      {/* MODAL 3: 8-SECTION CREATE & BROADCAST NEW RFQ WIZARD */}
      {showCreateModal && (
        <CreateRfqWizardModal
          onClose={() => setShowCreateModal(false)}
          onRfqCreated={(createdRfqObj) => {
            setRfqs([createdRfqObj, ...rfqs]);
            setToastMsg(`RFQ ${createdRfqObj.id} created & broadcasted successfully!`);
            setTimeout(() => setToastMsg(""), 4000);
          }}
        />
      )}

      {/* MODAL 4: INTERACTIVE SIDE-BY-SIDE VENDOR BIDS COMPARISON MATRIX */}
      {bidsMatrixRfq && ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "1000px",
              width: "100%",
              maxHeight: "88vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
              border: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid #ececec",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
                  COMMERCIAL EVALUATION MATRIX
                </span>
                <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "800", margin: "2px 0 0" }}>
                  Vendor Bids Comparison Matrix ({bidsMatrixRfq.id})
                </h2>
                <p style={{ fontSize: "13px", color: "#666666", margin: "2px 0 0" }}>
                  Item: <strong style={{ color: "#111" }}>{bidsMatrixRfq.item}</strong>
                </p>
              </div>
              <button
                onClick={() => setBidsMatrixRfq(null)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#555",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Bids Table Matrix */}
            {(() => {
              const rawBids = bidsMatrixRfq.bids || [];
              if (rawBids.length === 0) {
                return <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No vendor quotations have been created yet.</div>;
              }

              // Deduplicate confirmed vendor bids by vendor name
              const confirmedBids = Array.from(
                new Map(rawBids.map((b) => [ (b.vendor || "Vendor").toLowerCase().trim(), b ])).values()
              );

              return (
                <div style={{ overflowX: "auto", marginBottom: "24px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f8f9fb", borderBottom: "2px solid #ececec" }}>
                        <th style={{ padding: "14px 12px", textAlign: "left", color: "#111", fontWeight: "800" }}>Evaluation Criteria</th>
                        {confirmedBids.map((b, idx) => (
                          <th key={idx} style={{ padding: "14px 12px", textAlign: "left", color: "#d97706", fontWeight: "800" }}>
                            {b.vendor}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px", fontWeight: "700", color: "#333" }}>Vendor Rating</td>
                        {confirmedBids.map((b, idx) => (
                          <td key={idx} style={{ padding: "12px", color: "#111" }}>{b.rating || "4.8 ⭐ (Tier 1)"}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px", fontWeight: "700", color: "#333" }}>Unit Price</td>
                        {confirmedBids.map((b, idx) => (
                          <td key={idx} style={{ padding: "12px", fontWeight: "800", color: "#059669" }}>
                            {b.unitPrice || `$${(parseFloat(b.amount?.replace(/[^0-9.]/g, '') || 36990) / 10).toLocaleString()}`}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px", fontWeight: "700", color: "#333" }}>Total Offer Cost</td>
                        {confirmedBids.map((b, idx) => (
                          <td key={idx} style={{ padding: "12px", fontWeight: "800", color: "#059669" }}>{b.amount || "$36,990.00"}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px", fontWeight: "700", color: "#333" }}>Delivery Lead Time</td>
                        {confirmedBids.map((b, idx) => (
                          <td key={idx} style={{ padding: "12px", color: "#111" }}>{b.leadTime || "3 Business Days"}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px", fontWeight: "700", color: "#333" }}>Warranty Coverage</td>
                        {confirmedBids.map((b, idx) => (
                          <td key={idx} style={{ padding: "12px", color: "#111" }}>{b.warranty || "3 Years Standard Warranty"}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px", fontWeight: "700", color: "#333" }}>Technical Score</td>
                        {confirmedBids.map((b, idx) => (
                          <td key={idx} style={{ padding: "12px", fontWeight: "800", color: "#059669" }}>{b.score || "95.5% (Verified)"}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: "14px", fontWeight: "800", color: "#111" }}>Contract Selection</td>
                        {confirmedBids.map((b, idx) => {
                          const isThisVendorAwarded = bidsMatrixRfq.status === "Awarded" && bidsMatrixRfq.winnerVendor === b.vendor;
                          const isAnotherVendorAwarded = bidsMatrixRfq.status === "Awarded" && bidsMatrixRfq.winnerVendor && bidsMatrixRfq.winnerVendor !== b.vendor;

                          if (isThisVendorAwarded) {
                            return (
                              <td key={idx} style={{ padding: "14px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                                  <span
                                    style={{
                                      background: "rgba(5, 150, 105, 0.12)",
                                      color: "#059669",
                                      border: "1px solid rgba(5, 150, 105, 0.3)",
                                      padding: "6px 12px",
                                      borderRadius: "8px",
                                      fontSize: "12px",
                                      fontWeight: "800",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px"
                                    }}
                                  >
                                    <CheckCircle2 size={14} /> Approved Vendor
                                  </span>
                                  <button
                                    className="pe-btn-primary-sm"
                                    style={{ background: "#dc2626", color: "#fff", border: "none", width: "100%", justifyContent: "center", fontWeight: "700" }}
                                    onClick={async () => {
                                      await revokeVendorContract(bidsMatrixRfq.id);
                                      setRfqs((prev) =>
                                        prev.map((r) =>
                                          r.id === bidsMatrixRfq.id
                                            ? { ...r, status: "Active Bidding", winnerVendor: null, bidStatus: "Bids Received" }
                                            : r
                                        )
                                      );
                                      setBidsMatrixRfq((prev) => (prev ? { ...prev, status: "Active Bidding", winnerVendor: null } : null));
                                      setToastMsg(`Approval cancelled for ${bidsMatrixRfq.id}. Reset to Active Bidding.`);
                                      setTimeout(() => setToastMsg(""), 4000);
                                    }}
                                  >
                                    <X size={14} /> Cancel Approval
                                  </button>
                                </div>
                              </td>
                            );
                          }

                          if (isAnotherVendorAwarded) {
                            return (
                              <td key={idx} style={{ padding: "14px", textAlign: "center", color: "#888", fontStyle: "italic", fontSize: "12px" }}>
                                Not Selected
                              </td>
                            );
                          }

                          return (
                            <td key={idx} style={{ padding: "14px" }}>
                              <button
                                className="pe-btn-primary-sm"
                                style={{ background: "#059669", color: "#fff", border: "none", width: "100%", justifyContent: "center", fontWeight: "700" }}
                                onClick={() => {
                                  setConfirmQuoteApproval({
                                    rfqId: bidsMatrixRfq.id,
                                    reqId: bidsMatrixRfq.reqId,
                                    item: bidsMatrixRfq.item,
                                    vendorName: b.vendor,
                                    unitPrice: b.unitPrice || `$${(parseFloat(b.amount?.replace(/[^0-9.]/g, '') || 36990) / 10).toLocaleString()}`,
                                    totalPrice: b.amount || "$36,990.00",
                                    leadTime: b.leadTime || "3 Business Days",
                                    warranty: b.warranty || "3 Years Standard Warranty",
                                    score: b.score || "95.5% Verified"
                                  });
                                }}
                              >
                                <Award size={15} /> Select Vendor
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="pe-btn-primary-sm"
                style={{ background: "#ffffff", color: "#111", border: "1px solid #d9d9d9", padding: "8px 18px", fontSize: "13px" }}
                onClick={() => setBidsMatrixRfq(null)}
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 5: QUOTATION REVIEW & APPROVAL CONFIRMATION MODAL */}
      {confirmQuoteApproval && ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1000000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "30px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
              border: "1px solid #ececec",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid #ececec", paddingBottom: "14px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>QUOTATION APPROVAL FORM</span>
                <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "800", margin: "2px 0 0" }}>Confirm Vendor Award: {confirmQuoteApproval.vendorName}</h3>
              </div>
              <button onClick={() => setConfirmQuoteApproval(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={22} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
              <div style={{ background: "#f8f9fb", padding: "16px", borderRadius: "10px", border: "1px solid #ececec", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div><strong>RFQ Code:</strong> <span style={{ color: "#d97706", fontWeight: "700" }}>{confirmQuoteApproval.rfqId}</span></div>
                <div><strong>Purchase Request Ref:</strong> {confirmQuoteApproval.reqId || "REQ-2026-8921"}</div>
                <div><strong>Item Sourced:</strong> <strong style={{ color: "#111" }}>{confirmQuoteApproval.item}</strong></div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: "10px", fontSize: "13px" }}>
                <div><span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Selected Vendor</span><p style={{ fontWeight: "800", color: "#059669", fontSize: "15px", margin: "2px 0 0" }}>{confirmQuoteApproval.vendorName}</p></div>
                <div><span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Contract Offer Cost</span><p style={{ fontWeight: "800", color: "#059669", fontSize: "15px", margin: "2px 0 0" }}>{confirmQuoteApproval.totalPrice}</p></div>
                <div><span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Unit Offered Price</span><p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{confirmQuoteApproval.unitPrice}</p></div>
                <div><span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>SLA Lead Time</span><p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{confirmQuoteApproval.leadTime}</p></div>
                <div><span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Warranty Coverage</span><p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{confirmQuoteApproval.warranty}</p></div>
                <div><span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Technical Compliance</span><p style={{ fontWeight: "700", color: "#059669", margin: "2px 0 0" }}>{confirmQuoteApproval.score}</p></div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                className="pe-btn-primary-sm"
                style={{ background: "#ffffff", color: "#111", border: "1px solid #d9d9d9", padding: "10px 18px", fontSize: "13px" }}
                onClick={() => setConfirmQuoteApproval(null)}
              >
                Cancel
              </button>
              <button
                className="pe-btn-primary-sm"
                style={{ background: "#059669", color: "#ffffff", padding: "10px 20px", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}
                onClick={async () => {
                  const targetRfqId = confirmQuoteApproval.rfqId;
                  const winnerName = confirmQuoteApproval.vendorName;
                  const finalCost = confirmQuoteApproval.totalPrice;

                  // 1. Persist to API / Local Storage & Database
                  await awardVendorContract(targetRfqId, winnerName, finalCost);

                  // 2. Instantly update local RFQ state
                  setRfqs((prevRfqs) =>
                    prevRfqs.map((r) =>
                      r.id === targetRfqId
                        ? { ...r, status: "Awarded", bidStatus: "Awarded", winnerVendor: winnerName, awardedVendor: winnerName, awardedAmount: finalCost }
                        : r
                    )
                  );

                  // 3. Emit real-time bus event for all subscriber modules
                  epsEventBus.publish({ type: "QUOTATION_APPROVED", rfqId: targetRfqId, vendorName: winnerName, amount: finalCost });

                  // 4. Close modals & show success toast
                  setConfirmQuoteApproval(null);
                  setBidsMatrixRfq(null);
                  setToastMsg(`✓ Quotation Approved! Contract awarded to ${winnerName} (${finalCost}). Workflow advanced to Stage 4.`);
                  setTimeout(() => setToastMsg(""), 5000);
                }}
              >
                <CheckCircle2 size={16} /> Confirm & Approve Quotation
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RfqManagement;
