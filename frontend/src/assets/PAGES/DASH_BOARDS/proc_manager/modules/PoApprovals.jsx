import React, { useState } from "react";
import {
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  Search,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Building,
  DollarSign,
  Award,
  RotateCcw,
  History,
  Clock,
  UserCheck,
  Package,
  Truck,
  Filter,
  AlertCircle
} from "lucide-react";

const initialPurchaseOrders = [
  {
    poId: "PO-2026-4401",
    reqId: "REQ-2026-8921",
    status: "Pending", // 'Pending' | 'Approved' | 'Rejected' | 'Modification Requested'
    exec: "David Chen (Senior Sourcing Exec)",
    dept: "Engineering & IT",
    date: "2026-07-26",
    
    // Vendor Information
    vendor: {
      name: "Apple Business Direct",
      id: "VEN-2026-001",
      rating: "4.9 ⭐",
      compliance: "100% Certified",
      email: "enterprise@apple.com",
      phone: "+1 (800) 692-7753",
      location: "Cupertino, CA, USA",
    },

    // Product Details
    product: {
      name: "MacBook Pro M3 Max 64GB Unified Memory Workstations",
      category: "Hardware & IT",
      quantity: 10,
      unitPrice: "$3,699.00",
      specs: "Apple M3 Max 16-Core CPU, 40-Core GPU, 64GB RAM, 1TB SSD Space Gray",
    },

    // Total Amount & Budget
    totalAmount: "$36,990.00",
    rawAmount: 36990,
    terms: "Net 30 Days",
    sourcingSavings: "$2,000.00 under budget cap",
    justification: "High-performance compilation workstations for senior engineering architects.",

    // Approval Timeline
    timeline: [
      { step: "1. Purchase Request Created", actor: "Alex Morgan (Requester)", date: "July 24, 2026 10:00 AM", status: "done" },
      { step: "2. Department Approval", actor: "Sarah Jenkins (VP Eng)", date: "July 24, 2026 11:30 AM", status: "done" },
      { step: "3. Sourcing & RFQ Award", actor: "David Chen (Sourcing Exec)", date: "July 25, 2026 02:15 PM", status: "done" },
      { step: "4. PO Generated & Transmitted for Manager Approval", actor: "David Chen", date: "July 26, 2026 09:00 AM", status: "active" },
      { step: "5. Executive Manager Sign-off", actor: "Robert Vance (Chief Mgr)", date: "Pending Action", status: "pending" },
    ],

    // PO History Log
    history: [
      { action: "PO Created", user: "David Chen", timestamp: "July 26, 2026 09:00 AM", notes: "Generated PO-2026-4401 after Apple bid selection." },
      { action: "Compliance Verification", user: "Auto Audit System", timestamp: "July 26, 2026 09:01 AM", notes: "100% Tax & GST Compliance Verified." },
    ],
  },
  {
    poId: "PO-2026-4412",
    reqId: "REQ-2026-8990",
    status: "Pending",
    exec: "Emily Watson (Procurement Exec)",
    dept: "Operations & Facilities",
    date: "2026-07-26",
    
    vendor: {
      name: "Dell Technologies",
      id: "VND-DELL-880",
      rating: "4.7 ⭐",
      compliance: "99% Certified",
      email: "bids@dell.com",
      phone: "+1 (800) 456-3355",
      location: "Round Rock, TX, USA",
    },

    product: {
      name: "PowerEdge R760 Enterprise Rack Servers",
      category: "Hardware & IT",
      quantity: 4,
      unitPrice: "$13,550.00",
      specs: "Dual Intel Xeon Platinum 8480+, 512GB DDR5 RAM, 8TB NVMe RAID Array",
    },

    totalAmount: "$54,200.00",
    rawAmount: 54200,
    terms: "Net 45 Days",
    sourcingSavings: "$3,800.00 enterprise discount",
    justification: "Primary data center compute expansion and hypervisor node cluster refresh.",

    timeline: [
      { step: "1. Purchase Request Created", actor: "David Miller (DevOps)", date: "July 22, 2026 09:15 AM", status: "done" },
      { step: "2. Department Approval", actor: "Sarah Jenkins (VP Eng)", date: "July 22, 2026 04:00 PM", status: "done" },
      { step: "3. Sourcing & RFQ Award", actor: "Emily Watson", date: "July 24, 2026 01:30 PM", status: "done" },
      { step: "4. PO Submitted for Manager Approval", actor: "Emily Watson", date: "July 26, 2026 10:30 AM", status: "active" },
      { step: "5. Executive Manager Sign-off", actor: "Robert Vance", date: "Pending Action", status: "pending" },
    ],

    history: [
      { action: "PO Created", user: "Emily Watson", timestamp: "July 26, 2026 10:30 AM", notes: "Submitted Dell Rack Server PO for manager approval." },
    ],
  },
  {
    poId: "PO-2026-4389",
    reqId: "REQ-2026-8945",
    status: "Approved",
    exec: "David Chen (Senior Sourcing Exec)",
    dept: "Engineering & IT",
    date: "2026-07-25",
    
    vendor: {
      name: "Datadog Inc.",
      id: "VND-DD-901",
      rating: "5.0 ⭐",
      compliance: "100% SaaS Certified",
      email: "sales@datadoghq.com",
      phone: "+1 (866) 329-4448",
      location: "New York, NY, USA",
    },

    product: {
      name: "Datadog APM Enterprise Monitoring Annual Subscription",
      category: "Software & SaaS",
      quantity: 1,
      unitPrice: "$8,500.00",
      specs: "Full Microservice APM, Continuous Profiler, 100 Host Licenses",
    },

    totalAmount: "$8,500.00",
    rawAmount: 8500,
    terms: "Net 15 Days",
    sourcingSavings: "12-Month Rate Freeze",
    justification: "Annual renewal for production microservice observability.",

    timeline: [
      { step: "1. Purchase Request Created", actor: "David Miller", date: "July 20, 2026", status: "done" },
      { step: "2. Department Approval", actor: "Sarah Jenkins", date: "July 21, 2026", status: "done" },
      { step: "3. Sourcing & RFQ Award", actor: "David Chen", date: "July 22, 2026", status: "done" },
      { step: "4. PO Submitted for Manager Approval", actor: "David Chen", date: "July 23, 2026", status: "done" },
      { step: "5. Approved by Chief Manager", actor: "Robert Vance", date: "July 25, 2026", status: "done" },
    ],

    history: [
      { action: "PO Created", user: "David Chen", timestamp: "July 23, 2026 02:00 PM", notes: "Created Datadog SaaS renewal PO." },
      { action: "PO Approved", user: "Robert Vance (Manager)", timestamp: "July 25, 2026 11:00 AM", notes: "Approved & signed off." },
    ],
  },
  {
    poId: "PO-2026-4312",
    reqId: "REQ-2026-8790",
    status: "Rejected",
    exec: "Emily Watson (Procurement Exec)",
    dept: "Marketing & Ops",
    date: "2026-07-21",
    
    vendor: {
      name: "Legacy Media Corp",
      id: "VND-LEG-402",
      rating: "3.8 ⭐",
      compliance: "Non-Compliant SLA",
      email: "quotes@legacymedia.com",
      phone: "+1 (800) 555-9011",
      location: "Chicago, IL, USA",
    },

    product: {
      name: "Printed Marketing Banners & Displays",
      category: "Office Supplies",
      quantity: 50,
      unitPrice: "$210.00",
      specs: "Vinyl Banners with Stand Framework",
    },

    totalAmount: "$10,500.00",
    rawAmount: 10500,
    terms: "Advance 100%",
    sourcingSavings: "No discount offered",
    justification: "Annual trade show promotional materials.",

    timeline: [
      { step: "1. Purchase Request Created", actor: "Rachel Green", date: "July 18, 2026", status: "done" },
      { step: "2. PO Submitted", actor: "Emily Watson", date: "July 20, 2026", status: "done" },
      { step: "3. Rejected by Chief Manager", actor: "Robert Vance", date: "July 21, 2026", status: "done" },
    ],

    history: [
      { action: "PO Created", user: "Emily Watson", timestamp: "July 20, 2026", notes: "Submitted for review." },
      { action: "PO Rejected", user: "Robert Vance", timestamp: "July 21, 2026", notes: "Rejected due to advance payment terms & poor supplier rating." },
    ],
  },
];

const PoApprovals = () => {
  const [poList, setPoList] = useState(initialPurchaseOrders);
  const [activeTabFilter, setActiveTabFilter] = useState("Pending"); // 'Pending' | 'Approved' | 'Rejected' | 'Modification Requested' | 'all'
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [targetPo, setTargetPo] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'sendback' | 'details'
  
  // Modal Inputs
  const [approvalNotes, setApprovalNotes] = useState("Approved after technical specifications & budget savings review.");
  const [rejectionReason, setRejectionReason] = useState("Contract Payment Terms Non-Compliant");
  const [rejectionComment, setRejectionComment] = useState("");
  const [sendBackComment, setSendBackComment] = useState("Please renegotiate delivery lead time to 3 days and revise payment terms to Net 30.");

  const [toastMsg, setToastMsg] = useState("");

  // Filtered PO list
  const filtered = poList.filter((p) => {
    const matchesSearch =
      p.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.exec.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTabFilter === "all" || p.status === activeTabFilter;
    return matchesSearch && matchesTab;
  });

  // Action Handlers
  const handleApprovePO = () => {
    const timestamp = new Date().toLocaleString();
    const updated = poList.map((p) => {
      if (p.poId === targetPo.poId) {
        return {
          ...p,
          status: "Approved",
          history: [
            ...p.history,
            { action: "PO Approved", user: "Robert Vance (Chief Manager)", timestamp, notes: approvalNotes },
          ],
          timeline: p.timeline.map((st) =>
            st.step.includes("Manager") ? { ...st, status: "done", date: timestamp, actor: "Robert Vance" } : st
          ),
        };
      }
      return p;
    });
    setPoList(updated);
    setModalType(null);
    setToastMsg(`Purchase Order ${targetPo.poId} approved & countersigned by Chief Manager!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleRejectPO = () => {
    const timestamp = new Date().toLocaleString();
    const updated = poList.map((p) => {
      if (p.poId === targetPo.poId) {
        return {
          ...p,
          status: "Rejected",
          history: [
            ...p.history,
            { action: "PO Rejected", user: "Robert Vance (Chief Manager)", timestamp, notes: `${rejectionReason}: ${rejectionComment}` },
          ],
        };
      }
      return p;
    });
    setPoList(updated);
    setModalType(null);
    setToastMsg(`Purchase Order ${targetPo.poId} rejected.`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleSendBackPO = () => {
    const timestamp = new Date().toLocaleString();
    const updated = poList.map((p) => {
      if (p.poId === targetPo.poId) {
        return {
          ...p,
          status: "Modification Requested",
          history: [
            ...p.history,
            { action: "Sent Back for Modification", user: "Robert Vance (Chief Manager)", timestamp, notes: sendBackComment },
          ],
        };
      }
      return p;
    });
    setPoList(updated);
    setModalType(null);
    setToastMsg(`PO ${targetPo.poId} sent back to Sourcing Executive for modification.`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Status badge count helpers
  const countPending = poList.filter((p) => p.status === "Pending").length;
  const countApproved = poList.filter((p) => p.status === "Approved").length;
  const countRejected = poList.filter((p) => p.status === "Rejected").length;
  const countModification = poList.filter((p) => p.status === "Modification Requested").length;

  return (
    <div className="pman-po-approvals-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <ShieldCheck color="#f8b400" /> High-Value Purchase Order Approval Center
          </h1>
          <p className="pman-page-subtitle">
            Executive approval workflow for reviewing, approving, rejecting, or returning POs for modification.
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

      {/* FILTER TABS & SEARCH BAR */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* TAB BUTTONS: Pending, Approved, Rejected, Modification Requested */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTabFilter("Pending")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "Pending" ? "#f8b400" : "#f8f9fb",
                color: activeTabFilter === "Pending" ? "#000000" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Clock size={15} /> Pending ({countPending})
            </button>

            <button
              onClick={() => setActiveTabFilter("Approved")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "Approved" ? "#059669" : "#f8f9fb",
                color: activeTabFilter === "Approved" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <CheckCircle2 size={15} /> Approved ({countApproved})
            </button>

            <button
              onClick={() => setActiveTabFilter("Rejected")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "Rejected" ? "#dc2626" : "#f8f9fb",
                color: activeTabFilter === "Rejected" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <XCircle size={15} /> Rejected ({countRejected})
            </button>

            <button
              onClick={() => setActiveTabFilter("Modification Requested")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "Modification Requested" ? "#d97706" : "#f8f9fb",
                color: activeTabFilter === "Modification Requested" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RotateCcw size={15} /> Sent Back ({countModification})
            </button>

            <button
              onClick={() => setActiveTabFilter("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "all" ? "#111111" : "#f8f9fb",
                color: activeTabFilter === "all" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
              }}
            >
              All POs ({poList.length})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", width: "320px" }}>
            <Search
              size={15}
              color="#666666"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search PO Code, Vendor, or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pman-form-input"
              style={{ paddingLeft: "36px", height: "38px" }}
            />
          </div>

        </div>
      </div>

      {/* PO LIST CARDS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {filtered.length > 0 ? (
          filtered.map((po) => (
            <div key={po.poId} className="pman-card pman-card-gold-glow">
              
              {/* TOP PO HEADER ROW */}
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
                    <span style={{ fontWeight: "800", color: "#d97706", fontSize: "17px" }}>
                      {po.poId}
                    </span>
                    <span style={{ fontSize: "12px", color: "#666666" }}>Ref: {po.reqId}</span>
                    
                    {/* Status Badge */}
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "800",
                        background:
                          po.status === "Approved"
                            ? "rgba(5, 150, 105, 0.12)"
                            : po.status === "Rejected"
                            ? "rgba(220, 38, 38, 0.12)"
                            : po.status === "Modification Requested"
                            ? "rgba(217, 119, 6, 0.15)"
                            : "rgba(248, 180, 0, 0.2)",
                        color:
                          po.status === "Approved"
                            ? "#059669"
                            : po.status === "Rejected"
                            ? "#dc2626"
                            : po.status === "Modification Requested"
                            ? "#d97706"
                            : "#111111",
                      }}
                    >
                      {po.status === "Pending" ? "Awaiting Executive Sign-off" : po.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "800", marginTop: "4px" }}>
                    {po.product.name}
                  </h3>
                </div>

                {/* Total Amount Display */}
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                    Total Amount
                  </span>
                  <p style={{ fontSize: "26px", color: "#059669", fontWeight: "800", margin: "2px 0 0" }}>
                    {po.totalAmount}
                  </p>
                  <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "700" }}>
                    {po.sourcingSavings}
                  </span>
                </div>
              </div>

              {/* THREE COLUMN DETAILS (Vendor Info, Product Details, Executive Sourcing) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr 1fr",
                  gap: "16px",
                  padding: "16px",
                  background: "#f8f9fb",
                  borderRadius: "12px",
                  border: "1px solid #ececec",
                  marginBottom: "18px",
                  fontSize: "13px",
                }}
              >
                {/* 1. Vendor Information */}
                <div>
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Building size={12} color="#f8b400" /> Vendor Information
                  </span>
                  <p style={{ fontSize: "14px", color: "#111111", fontWeight: "800", marginTop: "4px" }}>
                    {po.vendor.name} ({po.vendor.id})
                  </p>
                  <div style={{ color: "#555", marginTop: "2px", display: "flex", flexDirection: "column", gap: "2px", fontSize: "12px" }}>
                    <span>Rating: <strong>{po.vendor.rating}</strong> ({po.vendor.compliance})</span>
                    <span>Contact: {po.vendor.email}</span>
                  </div>
                </div>

                {/* 2. Product Details */}
                <div>
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Package size={12} color="#f8b400" /> Product Details
                  </span>
                  <p style={{ fontSize: "13.5px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>
                    Qty: <strong>{po.product.quantity} Units</strong> @ {po.product.unitPrice}
                  </p>
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                    Category: {po.product.category} • Terms: {po.terms}
                  </p>
                </div>

                {/* 3. Submitting Executive & Justification */}
                <div>
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <UserCheck size={12} color="#f8b400" /> Sourcing Executive
                  </span>
                  <p style={{ fontSize: "13.5px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>
                    {po.exec}
                  </p>
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                    Dept: {po.dept}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS (Approve, Reject, Send Back for Modification, View Details & History) */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                
                <button
                  className="pman-btn-primary-sm"
                  style={{ background: "#ffffff", color: "#111111", border: "1px solid #d9d9d9" }}
                  onClick={() => {
                    setTargetPo(po);
                    setModalType("details");
                  }}
                >
                  <Eye size={15} /> PO Details, Timeline & History
                </button>

                {po.status === "Pending" && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      className="pman-btn-primary-sm"
                      style={{ background: "#ffffff", color: "#d97706", border: "1px solid #d97706" }}
                      onClick={() => {
                        setTargetPo(po);
                        setModalType("sendback");
                      }}
                    >
                      <RotateCcw size={15} /> Send Back for Modification
                    </button>

                    <button
                      className="pman-btn-primary-sm"
                      style={{ background: "#ffffff", color: "#dc2626", border: "1px solid #dc2626" }}
                      onClick={() => {
                        setTargetPo(po);
                        setModalType("reject");
                      }}
                    >
                      <XCircle size={15} /> Reject PO
                    </button>

                    <button
                      className="pman-btn-primary-sm"
                      style={{ background: "#059669", color: "#ffffff", border: "none", fontWeight: "800" }}
                      onClick={() => {
                        setTargetPo(po);
                        setModalType("approve");
                      }}
                    >
                      <CheckCircle2 size={15} /> Approve PO
                    </button>
                  </div>
                )}

              </div>

            </div>
          ))
        ) : (
          <div className="pman-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "#666", fontSize: "15px" }}>No Purchase Orders found matching the selected status or filter.</p>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: APPROVE PO CONFIRMATION */}
      {/* ========================================================= */}
      {modalType === "approve" && targetPo && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(5, 150, 105, 0.12)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800", textTransform: "uppercase" }}>EXECUTIVE APPROVAL</span>
                  <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800", margin: 0 }}>Approve PO {targetPo.poId}</h3>
                </div>
              </div>
              <button onClick={() => setModalType(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", marginBottom: "16px", fontSize: "13.5px" }}>
              <div>Total PO Amount: <strong style={{ color: "#059669", fontSize: "16px" }}>{targetPo.totalAmount}</strong></div>
              <div>Vendor: <strong>{targetPo.vendor.name}</strong></div>
              <div>Product: <strong>{targetPo.product.name}</strong></div>
            </div>

            <div className="pman-form-group" style={{ marginBottom: "20px" }}>
              <label className="pman-form-label">Manager Sign-off Remarks / Notes</label>
              <textarea
                className="pman-form-input"
                rows={3}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="pman-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setModalType(null)}>Cancel</button>
              <button className="pman-btn-primary-sm" style={{ background: "#059669", color: "#fff", border: "none" }} onClick={handleApprovePO}>
                <CheckCircle2 size={16} /> Confirm Executive Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: REJECT PO CONFIRMATION */}
      {/* ========================================================= */}
      {modalType === "reject" && targetPo && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(220, 38, 38, 0.12)", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <XCircle size={20} />
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "800", textTransform: "uppercase" }}>REJECT PURCHASE ORDER</span>
                  <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800", margin: 0 }}>Reject PO {targetPo.poId}</h3>
                </div>
              </div>
              <button onClick={() => setModalType(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div className="pman-form-group" style={{ marginBottom: "14px" }}>
              <label className="pman-form-label">Rejection Reason Category *</label>
              <select
                className="pman-form-select"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <option value="Contract Payment Terms Non-Compliant">Contract Payment Terms Non-Compliant</option>
                <option value="Over Budget Threshold Limit">Over Budget Threshold Limit</option>
                <option value="Supplier Rating Below Minimum Standard">Supplier Rating Below Minimum Standard</option>
                <option value="Duplicate or Unnecessary Order">Duplicate or Unnecessary Order</option>
              </select>
            </div>

            <div className="pman-form-group" style={{ marginBottom: "20px" }}>
              <label className="pman-form-label">Detailed Rejection Feedback for Sourcing Exec</label>
              <textarea
                className="pman-form-input"
                rows={3}
                placeholder="Explain why this PO is being rejected..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="pman-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setModalType(null)}>Cancel</button>
              <button className="pman-btn-primary-sm" style={{ background: "#dc2626", color: "#fff", border: "none" }} onClick={handleRejectPO}>
                <XCircle size={16} /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: SEND BACK FOR MODIFICATION */}
      {/* ========================================================= */}
      {modalType === "sendback" && targetPo && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(217, 119, 6, 0.15)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <RotateCcw size={20} />
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>RETURN TO SOURCING EXEC</span>
                  <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800", margin: 0 }}>Send Back PO {targetPo.poId}</h3>
                </div>
              </div>
              <button onClick={() => setModalType(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: "13.5px", color: "#555", marginBottom: "16px" }}>
              Send PO <strong>{targetPo.poId}</strong> back to Sourcing Executive <strong>{targetPo.exec}</strong> with requested modifications before re-submitting for manager approval.
            </p>

            <div className="pman-form-group" style={{ marginBottom: "20px" }}>
              <label className="pman-form-label">Required Modifications & Revision Notes *</label>
              <textarea
                className="pman-form-input"
                rows={4}
                value={sendBackComment}
                onChange={(e) => setSendBackComment(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="pman-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setModalType(null)}>Cancel</button>
              <button className="pman-btn-primary-sm" style={{ background: "#d97706", color: "#fff", border: "none" }} onClick={handleSendBackPO}>
                <RotateCcw size={16} /> Send Back for Modification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: PO DETAILS, APPROVAL TIMELINE & PO HISTORY */}
      {/* ========================================================= */}
      {modalType === "details" && targetPo && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>PURCHASE ORDER AUDIT DOSSIER</span>
                <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "800", margin: "2px 0 0" }}>
                  {targetPo.poId} (Ref: {targetPo.reqId})
                </h3>
              </div>
              <button onClick={() => setModalType(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {/* PO DETAILS GRID */}
            <div style={{ background: "#f8f9fb", padding: "18px", borderRadius: "12px", border: "1px solid #ececec", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13.5px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Total Order Amount</span>
                <p style={{ fontSize: "20px", color: "#059669", fontWeight: "800", margin: "2px 0 0" }}>{targetPo.totalAmount}</p>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "700" }}>{targetPo.sourcingSavings}</span>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>PO Status</span>
                <p style={{ fontSize: "16px", color: "#111", fontWeight: "800", margin: "2px 0 0" }}>{targetPo.status}</p>
                <span style={{ fontSize: "11px", color: "#666" }}>Payment Terms: {targetPo.terms}</span>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Vendor Details</span>
                <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{targetPo.vendor.name} ({targetPo.vendor.id})</p>
                <span style={{ fontSize: "11px", color: "#666" }}>{targetPo.vendor.location} • {targetPo.vendor.email}</span>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Product Specification</span>
                <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{targetPo.product.name}</p>
                <span style={{ fontSize: "11px", color: "#666" }}>{targetPo.product.quantity} Units @ {targetPo.product.unitPrice}</span>
              </div>
            </div>

            {/* APPROVAL TIMELINE */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "15px", color: "#111", fontWeight: "800", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={16} color="#f8b400" /> Multi-Stage Approval Timeline
              </h4>

              <div className="emp-timeline-container">
                {targetPo.timeline.map((st, idx) => (
                  <div key={idx} className={`emp-timeline-item ${st.status}`}>
                    <div className="emp-timeline-node">
                      {st.status === "done" && <CheckCircle2 size={13} color="#ffffff" />}
                      {st.status === "active" && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#000" }} />}
                    </div>
                    <div className="emp-timeline-content">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: "13.5px", color: "#111" }}>{st.step}</strong>
                        <span style={{ fontSize: "11px", color: "#666" }}>{st.date}</span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "700" }}>Actor: {st.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PO HISTORY AUDIT TRAIL */}
            <div>
              <h4 style={{ fontSize: "15px", color: "#111", fontWeight: "800", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <History size={16} color="#059669" /> PO History Audit Trail
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {targetPo.history.map((h, idx) => (
                  <div key={idx} style={{ padding: "12px 16px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #ececec", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <strong style={{ color: "#d97706" }}>{h.action}</strong>
                      <span style={{ fontSize: "11px", color: "#666" }}>{h.timestamp}</span>
                    </div>
                    <p style={{ color: "#333", margin: "2px 0 4px" }}>"{h.notes}"</p>
                    <span style={{ fontSize: "11px", color: "#555" }}>Actioned By: <strong>{h.user}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button className="pman-btn-primary-sm" onClick={() => setModalType(null)}>
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PoApprovals;
