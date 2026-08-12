import React, { useState } from "react";
import {
  Zap,
  Clock,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  UserCheck,
  Send,
  Package,
  Truck,
  ShieldCheck,
  Eye,
  Award,
  AlertCircle,
  Filter,
  BarChart2,
  Flag,
  Search,
  ChevronRight,
  X
} from "lucide-react";

const mockActiveOperations = [
  {
    id: "PROC-2026-901",
    title: "MacBook Pro M3 Max Workstation Deployment (x10)",
    reqId: "REQ-2026-8921",
    rfqId: "RFQ-2026-901",
    assignedExec: "David Chen (Senior Sourcing Exec)",
    execRole: "Hardware Procurement Lead",
    department: "Engineering & IT",
    progress: 75,
    workflowStatus: "In Fulfillment & Shipping",
    rfqMonitoring: {
      rfqStatus: "Completed",
      bidsReceived: 3,
      invitedVendorsCount: 3,
      awardedVendor: "Apple Business Direct",
      bidValue: "$36,990.00",
    },
    deliveryStatus: {
      status: "In Transit via FedEx Express",
      carrier: "FedEx Priority Freight",
      trackingNumber: "7790-8912-9901",
      expectedArrival: "2026-07-30",
    },
    riskIndicator: {
      level: "Low Risk", // 'Low Risk' | 'Medium Risk' | 'High Risk'
      reason: "On track for expected SLA delivery date.",
      badgeColor: "#059669",
    },
    milestones: [
      { name: "PR Approved", status: "done", date: "July 24" },
      { name: "RFQ Dispatched", status: "done", date: "July 24" },
      { name: "Bids Evaluated", status: "done", date: "July 25" },
      { name: "PO Transmitted", status: "done", date: "July 26" },
      { name: "Delivery Handover", status: "active", date: "Est July 30" },
    ],
    timeline: [
      { step: "1. PR Requisition Approved", actor: "Sarah Jenkins (VP Eng)", timestamp: "July 24, 2026 11:30 AM", notes: "Budget approved" },
      { step: "2. RFQ Broadcasted", actor: "David Chen", timestamp: "July 24, 2026 02:15 PM", notes: "Sent to 3 vendors" },
      { step: "3. Commercial Bid Evaluation", actor: "Sourcing System", timestamp: "July 25, 2026 09:00 AM", notes: "Apple bid awarded" },
      { step: "4. Purchase Order Transmitted", actor: "David Chen", timestamp: "July 26, 2026 10:00 AM", notes: "PO-2026-4401 confirmed" },
      { step: "5. Dispatched & In Transit", actor: "FedEx Logistics", timestamp: "July 27, 2026 08:30 AM", notes: "Waybill # 7790-8912-9901" },
    ],
  },
  {
    id: "PROC-2026-898",
    title: "Datadog APM Enterprise SaaS License Renewal",
    reqId: "REQ-2026-8945",
    rfqId: "RFQ-2026-898",
    assignedExec: "Emily Watson (Procurement Exec)",
    execRole: "SaaS & Cloud Lead",
    department: "Engineering & IT",
    progress: 90,
    workflowStatus: "Key Provisioning & License Handover",
    rfqMonitoring: {
      rfqStatus: "Completed",
      bidsReceived: 2,
      invitedVendorsCount: 2,
      awardedVendor: "Datadog Inc.",
      bidValue: "$8,500.00",
    },
    deliveryStatus: {
      status: "Digital License Keys Provisioned",
      carrier: "SaaS Cloud Portal",
      trackingNumber: "SAAS-DD-89401",
      expectedArrival: "2026-07-27",
    },
    riskIndicator: {
      level: "Low Risk",
      reason: "Instant digital provisioning verified.",
      badgeColor: "#059669",
    },
    milestones: [
      { name: "PR Approved", status: "done", date: "July 20" },
      { name: "RFQ Verified", status: "done", date: "July 21" },
      { name: "SaaS Quote Picked", status: "done", date: "July 22" },
      { name: "PO Transmitted", status: "done", date: "July 23" },
      { name: "Tenant Active", status: "done", date: "July 26" },
    ],
    timeline: [
      { step: "1. PR Requisition Approved", actor: "Sarah Jenkins", timestamp: "July 20, 2026", notes: "Renewal sign-off" },
      { step: "2. SaaS Terms Verified", actor: "Emily Watson", timestamp: "July 21, 2026", notes: "12-month rate lock" },
      { step: "3. PO Transmitted", actor: "Emily Watson", timestamp: "July 23, 2026", notes: "PO-2026-4389" },
      { step: "4. Digital Key Provisioning", actor: "Datadog Accounts", timestamp: "July 25, 2026", notes: "Keys sent to DevOps" },
    ],
  },
  {
    id: "PROC-2026-912",
    title: "Cisco Catalyst 9300 Core Rack Switches (x2)",
    reqId: "REQ-2026-8972",
    rfqId: "RFQ-2026-912",
    assignedExec: "David Chen (Senior Sourcing Exec)",
    execRole: "Hardware Procurement Lead",
    department: "IT Infrastructure",
    progress: 35,
    workflowStatus: "Active RFQ Vendor Bidding",
    rfqMonitoring: {
      rfqStatus: "Active Bidding",
      bidsReceived: 1,
      invitedVendorsCount: 3,
      awardedVendor: "Pending Evaluation",
      bidValue: "Est $6,200.00",
    },
    deliveryStatus: {
      status: "Sourcing Bidding Open",
      carrier: "Pending PO Award",
      trackingNumber: "N/A",
      expectedArrival: "2026-08-08",
    },
    riskIndicator: {
      level: "High Risk",
      reason: "Vendor bidding response slow. Only 1 bid received 24h prior to deadline.",
      badgeColor: "#dc2626",
    },
    milestones: [
      { name: "PR Approved", status: "done", date: "July 25" },
      { name: "RFQ Dispatched", status: "done", date: "July 26" },
      { name: "Bids Evaluation", status: "active", date: "Est July 28" },
      { name: "PO Transmitted", status: "pending", date: "Est Aug 01" },
      { name: "Delivery", status: "pending", date: "Est Aug 08" },
    ],
    timeline: [
      { step: "1. PR Requisition Approved", actor: "Elena Rostova", timestamp: "July 25, 2026", notes: "Switch upgrade" },
      { step: "2. RFQ Broadcasted", actor: "David Chen", timestamp: "July 26, 2026", notes: "Sent to Cisco, CDW, Insight" },
      { step: "3. Bidding Open", actor: "Vendor Portal", timestamp: "July 27, 2026", notes: "Awaiting additional quotes" },
    ],
  },
  {
    id: "PROC-2026-930",
    title: "Dell UltraSharp 4K USB-C Displays (x15)",
    reqId: "REQ-2026-9010",
    rfqId: "RFQ-2026-930",
    assignedExec: "Michael Vance (Sourcing Specialist)",
    execRole: "Peripheral Sourcing",
    department: "Design & UX",
    progress: 50,
    workflowStatus: "PO Approval Pending",
    rfqMonitoring: {
      rfqStatus: "Completed",
      bidsReceived: 2,
      invitedVendorsCount: 2,
      awardedVendor: "Dell Technologies",
      bidValue: "$9,750.00",
    },
    deliveryStatus: {
      status: "Awaiting Manager PO Sign-off",
      carrier: "Dell Logistics Direct",
      trackingNumber: "DELL-901-TRK",
      expectedArrival: "2026-08-04",
    },
    riskIndicator: {
      level: "Medium Risk",
      reason: "High value approval threshold check pending manager sign-off.",
      badgeColor: "#d97706",
    },
    milestones: [
      { name: "PR Approved", status: "done", date: "July 23" },
      { name: "RFQ Dispatched", status: "done", date: "July 24" },
      { name: "Bids Evaluated", status: "done", date: "July 25" },
      { name: "PO Manager Review", status: "active", date: "July 27" },
      { name: "Delivery", status: "pending", date: "Est Aug 04" },
    ],
    timeline: [
      { step: "1. PR Approved", actor: "Design Director", timestamp: "July 23, 2026", notes: "Monitor upgrade" },
      { step: "2. RFQ Dispatched", actor: "Michael Vance", timestamp: "July 24, 2026", notes: "Bidding completed" },
      { step: "3. PO Submitted for Manager Sign-off", actor: "Michael Vance", timestamp: "July 26, 2026", notes: "Awaiting Robert Vance" },
    ],
  },
];

const ProcurementOperations = () => {
  const [operationsList, setOperationsList] = useState(mockActiveOperations);
  const [activeTabFilter, setActiveTabFilter] = useState("all"); // 'all' | 'rfq' | 'delayed' | 'execs'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExecFilter, setSelectedExecFilter] = useState("all");

  // Selected Process Modal
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const filteredOperations = operationsList.filter((op) => {
    const matchesSearch =
      op.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.assignedExec.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.rfqMonitoring.awardedVendor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTabFilter === "all" ||
      (activeTabFilter === "rfq" && op.rfqMonitoring.rfqStatus === "Active Bidding") ||
      (activeTabFilter === "delayed" && (op.riskIndicator.level === "High Risk" || op.riskIndicator.level === "Medium Risk"));

    const matchesExec =
      selectedExecFilter === "all" || op.assignedExec.includes(selectedExecFilter);

    return matchesSearch && matchesTab && matchesExec;
  });

  const countDelayed = operationsList.filter(
    (op) => op.riskIndicator.level === "High Risk" || op.riskIndicator.level === "Medium Risk"
  ).length;

  const countActiveRfqs = operationsList.filter(
    (op) => op.rfqMonitoring.rfqStatus === "Active Bidding"
  ).length;

  const handleSendEscalation = (opId) => {
    setToastMsg(`Escalation alert sent to assigned Procurement Executive for ${opId}!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="pman-operations-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Zap color="#f8b400" /> Sourcing & Procurement Operations Command Center
          </h1>
          <p className="pman-page-subtitle">
            Real-time monitoring of active processes, RFQ progress, assigned executives, delivery milestones, and risk indicators.
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

      {/* KPI SUMMARY METRICS */}
      <div className="pman-kpi-grid" style={{ marginBottom: "24px" }}>
        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">Active Procurement Processes</span>
            <span className="pman-kpi-value">{operationsList.length}</span>
            <span className="pman-kpi-change positive">Cross-Department Operations</span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#f8b400" }}>
            <Zap size={24} />
          </div>
        </div>

        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">Active RFQs Monitored</span>
            <span className="pman-kpi-value" style={{ color: "#059669" }}>
              {countActiveRfqs} Active
            </span>
            <span className="pman-kpi-change positive">Vendor Bidding Open</span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#059669" }}>
            <Send size={24} />
          </div>
        </div>

        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">Delayed & At-Risk Procurements</span>
            <span className="pman-kpi-value" style={{ color: countDelayed > 0 ? "#dc2626" : "#059669" }}>
              {countDelayed} Delayed
            </span>
            <span className="pman-kpi-change negative" style={{ color: countDelayed > 0 ? "#dc2626" : "#059669" }}>
              <AlertTriangle size={14} /> Risk Indicator Warning
            </span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#dc2626" }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Tabs: All Active, RFQ Monitoring, Delayed Procurements */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => { setActiveTabFilter("all"); setSelectedExecFilter("all"); }}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "all" ? "#f8b400" : "#f8f9fb",
                color: activeTabFilter === "all" ? "#000000" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
              }}
            >
              All Active Processes ({operationsList.length})
            </button>

            <button
              onClick={() => { setActiveTabFilter("rfq"); setSelectedExecFilter("all"); }}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "rfq" ? "#059669" : "#f8f9fb",
                color: activeTabFilter === "rfq" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Send size={15} /> RFQ Monitoring ({countActiveRfqs})
            </button>

            <button
              onClick={() => { setActiveTabFilter("delayed"); setSelectedExecFilter("all"); }}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "delayed" ? "#dc2626" : "#f8f9fb",
                color: activeTabFilter === "delayed" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <AlertTriangle size={15} /> Delayed & Risk Alerts ({countDelayed})
            </button>
          </div>

          {/* Assigned Executive Filter & Search Box */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select
              className="pman-form-select"
              style={{ width: "220px", height: "38px" }}
              value={selectedExecFilter}
              onChange={(e) => setSelectedExecFilter(e.target.value)}
            >
              <option value="all">All Assigned Executives</option>
              <option value="David Chen">David Chen (Senior Exec)</option>
              <option value="Emily Watson">Emily Watson (SaaS Lead)</option>
              <option value="Michael Vance">Michael Vance (Specialist)</option>
            </select>

            <div style={{ position: "relative", width: "260px" }}>
              <Search
                size={15}
                color="#666666"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search process ID or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pman-form-input"
                style={{ paddingLeft: "36px", height: "38px" }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* OPERATIONS PROCESS CARDS GRID */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {filteredOperations.length > 0 ? (
          filteredOperations.map((op) => (
            <div key={op.id} className="pman-card pman-card-gold-glow" style={{ padding: "24px" }}>
              
              {/* TOP ROW: Process Header & Risk Indicator */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: "800", color: "#d97706", fontSize: "16px" }}>{op.id}</span>
                    <span style={{ fontSize: "12px", color: "#666" }}>PR Ref: {op.reqId} • RFQ Ref: {op.rfqId}</span>
                    
                    {/* Risk Indicator Badge */}
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "800",
                        background: op.riskIndicator.badgeColor === "#dc2626" ? "rgba(220, 38, 38, 0.12)" : op.riskIndicator.badgeColor === "#d97706" ? "rgba(217, 119, 6, 0.15)" : "rgba(5, 150, 105, 0.12)",
                        color: op.riskIndicator.badgeColor,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <AlertCircle size={13} /> {op.riskIndicator.level}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "19px", color: "#111111", fontWeight: "800", marginTop: "4px" }}>
                    {op.title}
                  </h3>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>
                    Workflow Status
                  </span>
                  <p style={{ fontSize: "15px", color: "#111", fontWeight: "800", margin: "2px 0 0" }}>
                    {op.workflowStatus}
                  </p>
                </div>
              </div>

              {/* PROGRESS BAR & % COMPLETION */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                  <span style={{ color: "#666", fontWeight: "700" }}>Procurement Progress</span>
                  <strong style={{ color: "#059669" }}>{op.progress}% Complete</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#ececec", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ width: `${op.progress}%`, height: "100%", background: "linear-gradient(90deg, #f8b400 0%, #059669 100%)", borderRadius: "10px" }} />
                </div>
              </div>

              {/* 4 COLUMN DETAILS: Assigned Exec, RFQ Monitoring, Delivery Status, Procurement Milestones */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1.2fr",
                  gap: "16px",
                  padding: "16px",
                  background: "#f8f9fb",
                  borderRadius: "12px",
                  border: "1px solid #ececec",
                  marginBottom: "20px",
                  fontSize: "13px",
                }}
              >
                {/* 1. Assigned Executive */}
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <UserCheck size={12} color="#f8b400" /> Assigned Executive
                  </span>
                  <p style={{ fontSize: "13.5px", color: "#111", fontWeight: "800", marginTop: "4px" }}>{op.assignedExec}</p>
                  <span style={{ fontSize: "11px", color: "#666" }}>{op.execRole} • {op.department}</span>
                </div>

                {/* 2. RFQ Monitoring */}
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Send size={12} color="#f8b400" /> RFQ Monitoring
                  </span>
                  <p style={{ fontSize: "13.5px", color: "#111", fontWeight: "700", marginTop: "4px" }}>
                    {op.rfqMonitoring.rfqStatus} ({op.rfqMonitoring.bidsReceived} Bids)
                  </p>
                  <span style={{ fontSize: "11px", color: "#059669", fontWeight: "700" }}>Awarded: {op.rfqMonitoring.awardedVendor}</span>
                </div>

                {/* 3. Delivery Status */}
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Truck size={12} color="#f8b400" /> Delivery Status
                  </span>
                  <p style={{ fontSize: "13.5px", color: "#111", fontWeight: "700", marginTop: "4px" }}>{op.deliveryStatus.status}</p>
                  <span style={{ fontSize: "11px", color: "#666" }}>Tracking #: {op.deliveryStatus.trackingNumber}</span>
                </div>

                {/* 4. Procurement Milestones Badges */}
                <div>
                  <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Flag size={12} color="#f8b400" /> Procurement Milestones
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                    {op.milestones.map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          background: m.status === "done" ? "rgba(5, 150, 105, 0.12)" : m.status === "active" ? "rgba(248, 180, 0, 0.2)" : "#ffffff",
                          color: m.status === "done" ? "#059669" : m.status === "active" ? "#d97706" : "#888",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        {m.status === "done" ? "✓" : m.status === "active" ? "⏳" : "•"} {m.name}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* ACTION FOOTER */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ fontSize: "12.5px", color: "#666" }}>
                  <strong>Risk Assessment:</strong> <span style={{ color: op.riskIndicator.badgeColor, fontWeight: "700" }}>{op.riskIndicator.reason}</span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {op.riskIndicator.level !== "Low Risk" && (
                    <button
                      className="pman-btn-primary-sm"
                      style={{ background: "#ffffff", color: "#dc2626", border: "1px solid #dc2626" }}
                      onClick={() => handleSendEscalation(op.id)}
                    >
                      <AlertTriangle size={14} /> Send Executive Escalation
                    </button>
                  )}

                  <button
                    className="pman-btn-primary-sm"
                    onClick={() => setSelectedOperation(op)}
                  >
                    <Eye size={15} /> Procurement Timeline & Milestones
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="pman-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "#666", fontSize: "15px" }}>No active procurement operations found matching the selected filter.</p>
          </div>
        )}
      </div>

      {/* MODAL: PROCUREMENT TIMELINE & MILESTONES DETAILS */}
      {selectedOperation && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "720px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>PROCUREMENT PROCESS TIMELINE</span>
                <h3 style={{ fontSize: "19px", color: "#111", fontWeight: "800", margin: "2px 0 0" }}>
                  {selectedOperation.id} - {selectedOperation.title}
                </h3>
              </div>
              <button onClick={() => setSelectedOperation(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {/* Status Summary Box */}
            <div style={{ background: "#f8f9fb", padding: "16px", borderRadius: "12px", border: "1px solid #ececec", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Assigned Executive</span>
                <p style={{ fontWeight: "800", color: "#111", margin: "2px 0 0" }}>{selectedOperation.assignedExec}</p>
                <span style={{ fontSize: "11px", color: "#666" }}>{selectedOperation.execRole}</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Logistics Delivery Status</span>
                <p style={{ fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>{selectedOperation.deliveryStatus.status}</p>
                <span style={{ fontSize: "11px", color: "#666" }}>Tracking #: {selectedOperation.deliveryStatus.trackingNumber}</span>
              </div>
            </div>

            {/* Multi-stage Timeline */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "15px", color: "#111", fontWeight: "800", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={16} color="#f8b400" /> Operational Step Timeline
              </h4>

              <div className="emp-timeline-container">
                {selectedOperation.timeline.map((t, idx) => (
                  <div key={idx} className="emp-timeline-item done">
                    <div className="emp-timeline-node">
                      <CheckCircle2 size={13} color="#ffffff" />
                    </div>
                    <div className="emp-timeline-content">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: "13.5px", color: "#111" }}>{t.step}</strong>
                        <span style={{ fontSize: "11px", color: "#666" }}>{t.timestamp}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#555", margin: "2px 0" }}>{t.notes}</p>
                      <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "700" }}>Actioned By: {t.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="pe-btn-primary-sm" onClick={() => setSelectedOperation(null)}>
                Close Timeline View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProcurementOperations;
