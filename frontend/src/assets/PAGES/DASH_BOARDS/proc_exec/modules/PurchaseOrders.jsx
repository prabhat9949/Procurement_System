import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Send,
  Building,
  DollarSign,
  Truck,
  UserCheck,
  PackageCheck,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

const mockPos = [
  {
    id: "PO-2026-4401",
    reqId: "REQ-2026-8921",
    vendor: "Apple Business Direct",
    item: "MacBook Pro M3 Max Workstations (x10)",
    totalAmount: "$36,990.00",
    terms: "Net 30 Days",
    status: "Vendor Confirmed",
    date: "2026-07-26",
    poFile: "PO_2026_4401_Apple_Direct.pdf",
    shipAddress: "HQ Building 3, Tech Receiving Bay 4, San Jose CA",
    expectedDelivery: "2026-07-30",
    carrier: "FedEx Priority Freight",
    trackingNumber: "7790-8912-9901",
    currentStep: 6,
    steps: [
      { title: "1. Approved Requisition Received", desc: "Signed off by Sarah Jenkins (VP Eng)", actor: "Sarah Jenkins", timestamp: "July 24, 2026", status: "done" },
      { title: "2. RFQ Broadcasted", desc: "RFQ-2026-901 sent to suppliers", actor: "David Chen", timestamp: "July 24, 2026", status: "done" },
      { title: "3. Vendor Quotations Evaluated", desc: "3 commercial bids received", actor: "Bidding System", timestamp: "July 25, 2026", status: "done" },
      { title: "4. Vendor Selected", desc: "Apple Business Direct awarded", actor: "David Chen", timestamp: "July 25, 2026", status: "done" },
      { title: "5. PO Generated & Transmitted", desc: "PO-2026-4401 issued", actor: "Procurement Exec", timestamp: "July 26, 2026", status: "done" },
      { title: "6. Vendor Confirmation", desc: "Apple confirmed PO & scheduled build", actor: "Apple Order Desk", timestamp: "July 26, 2026", status: "active" },
      { title: "7. Delivery Tracking (In Transit)", desc: "FedEx Priority Freight Tracking # 7790-8912-9901", actor: "FedEx Logistics", timestamp: "Est July 29", status: "pending" },
      { title: "8. Receiving Inspection & Handover", desc: "Bay inspection & asset tagging", actor: "Inventory Bay", timestamp: "Est July 30", status: "pending" },
    ],
  },
  {
    id: "PO-2026-4389",
    reqId: "REQ-2026-8945",
    vendor: "Datadog Inc.",
    item: "Datadog APM Enterprise Monitoring License",
    totalAmount: "$8,500.00",
    terms: "Net 15 Days",
    status: "Vendor Confirmed",
    date: "2026-07-25",
    poFile: "PO_2026_4389_Datadog.pdf",
    shipAddress: "Digital SaaS Provisioning Tenant ID #89401",
    expectedDelivery: "2026-07-27",
    carrier: "Digital SaaS Provisioning",
    trackingNumber: "SAAS-DD-89401",
    currentStep: 7,
    steps: [
      { title: "1. Approved Requisition Received", desc: "Signed off by Manager", actor: "Sarah Jenkins", timestamp: "July 20, 2026", status: "done" },
      { title: "2. RFQ Broadcasted", desc: "SaaS agreement verified", actor: "David Chen", timestamp: "July 21, 2026", status: "done" },
      { title: "3. Vendor Quotations Evaluated", desc: "Direct quote verified", actor: "Datadog Sales", timestamp: "July 21, 2026", status: "done" },
      { title: "4. Vendor Selected", desc: "Datadog Inc awarded", actor: "David Chen", timestamp: "July 22, 2026", status: "done" },
      { title: "5. PO Generated & Transmitted", desc: "PO-2026-4389 issued", actor: "Procurement Exec", timestamp: "July 23, 2026", status: "done" },
      { title: "6. Vendor Confirmation", desc: "PO countersigned", actor: "Datadog Accounts", timestamp: "July 24, 2026", status: "done" },
      { title: "7. Delivery & Key Provisioning", desc: "License keys dispatched to IT Ops", actor: "IT Administrator", timestamp: "July 25, 2026", status: "active" },
      { title: "8. SaaS Tenant Active", desc: "Verified in production environment", actor: "David Chen", timestamp: "Est July 27", status: "pending" },
    ],
  },
  {
    id: "PO-2026-4350",
    reqId: "REQ-2026-8850",
    vendor: "Herman Miller Co.",
    item: "Ergonomic Office Chairs (x5)",
    totalAmount: "$1,250.00",
    terms: "Net 30 Days",
    status: "Fulfilled & Delivered",
    date: "2026-07-16",
    poFile: "PO_2026_4350_Herman_Miller.pdf",
    shipAddress: "QA Pod Center, 2nd Floor, HQ Annex",
    expectedDelivery: "2026-07-19",
    carrier: "DHL Express Logistics",
    trackingNumber: "DHL-8890-4100",
    currentStep: 8,
    steps: [
      { title: "1. Approved Requisition Received", desc: "Signed off by Manager", actor: "Sarah Jenkins", timestamp: "July 10, 2026", status: "done" },
      { title: "2. RFQ Broadcasted", desc: "Quotes collected", actor: "David Chen", timestamp: "July 11, 2026", status: "done" },
      { title: "3. Vendor Quotations Evaluated", desc: "Herman Miller bid picked", actor: "David Chen", timestamp: "July 12, 2026", status: "done" },
      { title: "4. Vendor Selected", desc: "PO Issued", actor: "David Chen", timestamp: "July 13, 2026", status: "done" },
      { title: "5. PO Transmitted", desc: "PO Sent to Vendor", actor: "Procurement Exec", timestamp: "July 14, 2026", status: "done" },
      { title: "6. Vendor Confirmation", desc: "Order confirmed", actor: "Herman Miller Desk", timestamp: "July 15, 2026", status: "done" },
      { title: "7. Delivery Tracking", desc: "In transit via DHL Express", actor: "DHL Express", timestamp: "July 18, 2026", status: "done" },
      { title: "8. Delivered & Tagged", desc: "Chairs physically delivered to QA Pod", actor: "Inventory Bay", timestamp: "July 19, 2026", status: "done" },
    ],
  },
  {
    id: "PO-2026-4310",
    reqId: "REQ-2026-8812",
    vendor: "Amazon Web Services",
    item: "AWS Enterprise Infrastructure Renewal",
    totalAmount: "$12,000.00",
    terms: "Monthly Billing",
    status: "Fulfilled & Delivered",
    date: "2026-07-11",
    poFile: "PO_2026_4310_AWS.pdf",
    shipAddress: "AWS Account ID: 9048-2210-9901",
    expectedDelivery: "2026-07-12",
    carrier: "AWS Billing Portal",
    trackingNumber: "AWS-RENEWAL-2026",
    currentStep: 8,
    steps: [
      { title: "1. Approved Requisition Received", desc: "Signed off", actor: "Sarah Jenkins", timestamp: "July 08, 2026", status: "done" },
      { title: "2. RFQ Broadcasted", desc: "Direct renewal verified", actor: "David Chen", timestamp: "July 09, 2026", status: "done" },
      { title: "3. Vendor Quotations Evaluated", desc: "AWS Enterprise discount", actor: "David Chen", timestamp: "July 10, 2026", status: "done" },
      { title: "4. Vendor Selected", desc: "PO Generated", actor: "David Chen", timestamp: "July 11, 2026", status: "done" },
      { title: "5. PO Transmitted", desc: "Dispatched to AWS", actor: "Procurement Exec", timestamp: "July 11, 2026", status: "done" },
      { title: "6. Vendor Confirmation", desc: "AWS Enterprise team confirmed", actor: "AWS Accounts", timestamp: "July 11, 2026", status: "done" },
      { title: "7. Delivery Tracking", desc: "Account credits applied", actor: "AWS Portal", timestamp: "July 12, 2026", status: "done" },
      { title: "8. Completed Procurement", desc: "Renewal verified active", actor: "David Chen", timestamp: "July 12, 2026", status: "done" },
    ],
  },
];

import { epsEventBus, fetchPurchaseOrders, createPurchaseOrder } from "../../../../../services/epsApiService";

const PurchaseOrders = ({ onNavigate }) => {
  const [pos, setPos] = useState(mockPos);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  const loadLivePOs = async () => {
    const liveData = await fetchPurchaseOrders();
    if (liveData && liveData.length > 0) {
      const combined = [...liveData, ...mockPos];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setPos(unique);
    }
  };

  useEffect(() => {
    loadLivePOs();
    const unsub = epsEventBus.subscribe(() => {
      loadLivePOs();
    });
    return unsub;
  }, []);

  const [showBuildPoModal, setShowBuildPoModal] = useState(false);
  const [showSendPoModal, setShowSendPoModal] = useState(null);
  const [previewPo, setPreviewPo] = useState(null);
  const [trackPoModal, setTrackPoModal] = useState(null); // PO TRACKING MODAL

  const [newPo, setNewPo] = useState({
    reqId: "REQ-2026-8972",
    vendor: "Cisco Systems Direct",
    item: "Cisco Catalyst 9300 Core Switches (x2)",
    totalAmount: "$6,200.00",
    terms: "Net 30 Days",
    shipAddress: "HQ Server Room Rack Bay 2, San Jose CA",
    expectedDelivery: "2026-08-04",
  });

  const [toastMsg, setToastMsg] = useState("");

  const filtered = pos.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === "all" || p.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePoSubmit = (e) => {
    e.preventDefault();
    const createdId = `PO-2026-${Math.floor(4450 + Math.random() * 50)}`;
    const created = {
      id: createdId,
      reqId: newPo.reqId,
      vendor: newPo.vendor,
      item: newPo.item,
      totalAmount: newPo.totalAmount,
      terms: newPo.terms,
      status: "Issued to Vendor",
      date: "2026-07-27",
      poFile: `${createdId}_Official.pdf`,
      shipAddress: newPo.shipAddress,
      expectedDelivery: newPo.expectedDelivery || "2026-08-05",
      carrier: "Standard Logistics Courier",
      trackingNumber: `TRK-${createdId}`,
      currentStep: 5,
      steps: [
        { title: "1. Approved Requisition Received", desc: "Requisition sign-off completed", actor: "Sarah Jenkins", timestamp: "July 26, 2026", status: "done" },
        { title: "2. RFQ Broadcasted", desc: "Bidding completed", actor: "David Chen", timestamp: "July 26, 2026", status: "done" },
        { title: "3. Vendor Quotations Evaluated", desc: "Cisco bid selected", actor: "David Chen", timestamp: "July 27, 2026", status: "done" },
        { title: "4. Vendor Selected", desc: "PO Authorized", actor: "David Chen", timestamp: "July 27, 2026", status: "done" },
        { title: "5. PO Generated", desc: "PO Created and ready to transmit", actor: "Procurement Exec", timestamp: "July 27, 2026", status: "active" },
        { title: "6. Vendor Confirmation", desc: "Pending vendor acknowledgment", actor: "Cisco Desk", timestamp: "Pending", status: "pending" },
        { title: "7. Delivery Tracking", desc: "Shipment dispatch pending", actor: "Logistics Carrier", timestamp: "Pending", status: "pending" },
        { title: "8. Fulfillment", desc: "Receiving Bay inspection", actor: "Inventory Bay", timestamp: "Pending", status: "pending" },
      ],
    };
    createPurchaseOrder({ reqId: newPo.reqId, poNumber: createdId, vendor: newPo.vendor });
    setPos([created, ...pos]);
    setShowBuildPoModal(false);
    setToastMsg(`Formal Purchase Order ${createdId} created! Click 'Send PO' to transmit.`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleSendPoToVendor = (poObj) => {
    setPos(
      pos.map((p) => (p.id === poObj.id ? { ...p, status: "Vendor Confirmed" } : p))
    );
    setShowSendPoModal(null);
    setToastMsg(`Purchase Order ${poObj.id} sent & transmitted to ${poObj.vendor} order desk!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="pe-purchase-orders-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <ShoppingBag color="#f8b400" /> Purchase Orders (PO) Management Hub
          </h1>
          <p className="pe-page-subtitle">
            Create, issue, transmit, track, and manage official enterprise Purchase Orders.
          </p>
        </div>

        <button
          className="pe-btn-primary-sm"
          onClick={() => setShowBuildPoModal(true)}
        >
          <PlusCircle size={16} /> Create New Purchase Order
        </button>
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

      {/* Search & Status Filter Bar */}
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
              placeholder="Search PO Code, Vendor, or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["all", "Issued to Vendor", "Vendor Confirmed", "Fulfilled & Delivered"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: selectedStatusFilter === st ? "#f8b400" : "#f8f9fb",
                  color: selectedStatusFilter === st ? "#000000" : "#555555",
                  fontWeight: selectedStatusFilter === st ? "700" : "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  border: "1px solid #d9d9d9",
                }}
              >
                {st === "all" ? "All PO Statuses" : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PO Table */}
      <div className="pe-card">
        <div className="pe-table-container">
          <table className="pe-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Req Reference</th>
                <th>Supplier / Vendor</th>
                <th>Item Specification</th>
                <th>PO Amount</th>
                <th>Payment Terms</th>
                <th>Status View</th>
                <th>Issue Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((po) => (
                <tr key={po.id}>
                  <td style={{ fontWeight: "800", color: "#d97706" }}>{po.id}</td>
                  <td style={{ color: "#666666", fontSize: "13px" }}>{po.reqId}</td>
                  <td style={{ fontWeight: "700", color: "#111111" }}>{po.vendor}</td>
                  <td style={{ fontWeight: "600", color: "#111111" }}>{po.item}</td>
                  <td style={{ fontWeight: "800", color: "#059669" }}>{po.totalAmount}</td>
                  <td style={{ color: "#555555" }}>{po.terms}</td>
                  <td>
                    <span className={`pe-badge ${po.status === "Fulfilled & Delivered" ? "approved" : "rfq"}`}>
                      {po.status}
                    </span>
                  </td>
                  <td style={{ color: "#666666", fontSize: "13px" }}>{po.date}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                      {/* TRACK OPTION BUTTON ON EACH PURCHASE ORDER ROW */}
                      <button
                        className="pe-btn-primary-sm"
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)",
                          color: "#000000",
                          border: "none",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                        onClick={() => setTrackPoModal(po)}
                        title="Track Real-Time PO & Delivery Progress"
                      >
                        <Clock size={13} /> Track PO
                      </button>

                      {po.status === "Issued to Vendor" && (
                        <button
                          className="pe-btn-primary-sm"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => setShowSendPoModal(po)}
                        >
                          <Send size={13} /> Send PO
                        </button>
                      )}

                      <button
                        className="pe-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex" }}
                        title="View PO Status & Details"
                        onClick={() => setPreviewPo(po)}
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REAL-TIME PO TRACKING TIMELINE MODAL */}
      {trackPoModal && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={20} />
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>
                    REAL-TIME PO FULFILLMENT TRACKER
                  </span>
                  <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800", margin: "2px 0 0" }}>
                    {trackPoModal.id} ({trackPoModal.reqId})
                  </h3>
                </div>
              </div>

              <button onClick={() => setTrackPoModal(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* PO Summary Header Banner */}
            <div style={{ background: "#f8f9fb", padding: "16px", borderRadius: "12px", border: "1px solid #ececec", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Item Specification</span>
                <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{trackPoModal.item}</p>
                <span style={{ fontSize: "11px", color: "#666" }}>Supplier: <strong>{trackPoModal.vendor}</strong></span>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Logistics & Carrier Info</span>
                <p style={{ fontWeight: "700", color: "#059669", margin: "2px 0 0" }}>{trackPoModal.carrier || "Standard Freight"}</p>
                <span style={{ fontSize: "11px", color: "#666" }}>Waybill #: <strong>{trackPoModal.trackingNumber || "TRK-2026-901"}</strong></span>
              </div>
            </div>

            {/* 8-Stage Interactive Visual Timeline */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "14px", color: "#111", fontWeight: "800", marginBottom: "14px" }}>
                Fulfillment Timeline Nodes (Stage {trackPoModal.currentStep || 6} of 8)
              </h4>

              <div className="emp-timeline-container">
                {(trackPoModal.steps || []).map((st, idx) => (
                  <div key={idx} className={`emp-timeline-item ${st.status}`} style={{ opacity: st.status === "pending" ? 0.55 : 1 }}>
                    <div className="emp-timeline-node">
                      {st.status === "done" && <CheckCircle2 size={13} color="#ffffff" />}
                      {st.status === "active" && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#000000" }} />}
                    </div>
                    <div className="emp-timeline-content">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h5 style={{ fontSize: "14px", fontWeight: "700", color: st.status === "active" ? "#d97706" : "#111", margin: 0 }}>{st.title}</h5>
                        <span style={{ fontSize: "11px", color: "#666" }}>{st.timestamp}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#555", margin: "4px 0" }}>{st.desc}</p>
                      <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "700" }}>Actioned By: {st.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #ececec" }}>
              {onNavigate && (
                <button
                  className="pe-btn-primary-sm"
                  style={{ background: "#ffffff", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => {
                    setTrackPoModal(null);
                    onNavigate("procurement-tracking");
                  }}
                >
                  Open in Full Tracker <ArrowRight size={14} />
                </button>
              )}
              <button className="pe-btn-primary-sm" onClick={() => setTrackPoModal(null)}>
                Close Tracking View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE PURCHASE ORDER */}
      {showBuildPoModal && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "800" }}>
                Create New Purchase Order
              </h3>
              <button onClick={() => setShowBuildPoModal(false)} style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePoSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="pe-form-group">
                  <label className="pe-form-label">Vendor / Supplier *</label>
                  <input
                    type="text"
                    className="pe-form-input"
                    value={newPo.vendor}
                    onChange={(e) => setNewPo({ ...newPo, vendor: e.target.value })}
                    required
                  />
                </div>

                <div className="pe-form-group">
                  <label className="pe-form-label">Payment Terms *</label>
                  <select
                    className="pe-form-select"
                    value={newPo.terms}
                    onChange={(e) => setNewPo({ ...newPo, terms: e.target.value })}
                  >
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="Advance Payment">Advance Payment</option>
                  </select>
                </div>
              </div>

              <div className="pe-form-group" style={{ marginBottom: "16px" }}>
                <label className="pe-form-label">Item / Product Specification *</label>
                <input
                  type="text"
                  className="pe-form-input"
                  value={newPo.item}
                  onChange={(e) => setNewPo({ ...newPo, item: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="pe-form-group">
                  <label className="pe-form-label">Total Agreed Amount *</label>
                  <input
                    type="text"
                    className="pe-form-input"
                    value={newPo.totalAmount}
                    onChange={(e) => setNewPo({ ...newPo, totalAmount: e.target.value })}
                    required
                  />
                </div>

                <div className="pe-form-group">
                  <label className="pe-form-label">Expected Delivery Date *</label>
                  <input
                    type="date"
                    className="pe-form-input"
                    value={newPo.expectedDelivery}
                    onChange={(e) => setNewPo({ ...newPo, expectedDelivery: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="pe-form-group" style={{ marginBottom: "20px" }}>
                <label className="pe-form-label">Delivery Address / Destination *</label>
                <input
                  type="text"
                  className="pe-form-input"
                  value={newPo.shipAddress}
                  onChange={(e) => setNewPo({ ...newPo, shipAddress: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111111", border: "1px solid #d9d9d9" }}
                  onClick={() => setShowBuildPoModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pe-btn-primary-sm">
                  <PlusCircle size={16} /> Generate PO Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND PURCHASE ORDER CONFIRMATION */}
      {showSendPoModal && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: "500px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800" }}>
                Send PO: {showSendPoModal.id}
              </h3>
              <button onClick={() => setShowSendPoModal(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.5", marginBottom: "20px" }}>
              Are you sure you want to send and transmit Purchase Order <strong>{showSendPoModal.id}</strong> ({showSendPoModal.totalAmount}) to supplier <strong>{showSendPoModal.vendor}</strong>?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                className="pe-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setShowSendPoModal(null)}
              >
                Cancel
              </button>
              <button
                className="pe-btn-primary-sm"
                onClick={() => handleSendPoToVendor(showSendPoModal)}
              >
                <Send size={16} /> Confirm & Transmit PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW PO STATUS & DETAILS */}
      {previewPo && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>OFFICIAL PURCHASE ORDER DETAILS</span>
                <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800" }}>{previewPo.id}</h3>
              </div>
              <button onClick={() => setPreviewPo(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13.5px" }}>
              {/* PO Status Banner */}
              <div style={{ background: "rgba(5, 150, 105, 0.12)", border: "1px solid #059669", padding: "14px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800", textTransform: "uppercase" }}>PO STATUS</span>
                  <p style={{ fontSize: "16px", color: "#111", fontWeight: "800", margin: "2px 0 0" }}>{previewPo.status}</p>
                </div>
                <span style={{ fontSize: "13px", color: "#059669", fontWeight: "700" }}>Expected: {previewPo.expectedDelivery}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#666" }}>Supplier Vendor:</span>
                  <p style={{ fontWeight: "700", color: "#111" }}>{previewPo.vendor}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666" }}>Total PO Amount:</span>
                  <p style={{ fontWeight: "800", color: "#059669", fontSize: "16px" }}>{previewPo.totalAmount}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666" }}>Payment Terms:</span>
                  <p style={{ fontWeight: "700", color: "#111" }}>{previewPo.terms}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666" }}>Issue Date:</span>
                  <p style={{ fontWeight: "700", color: "#111" }}>{previewPo.date}</p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>Delivery Address:</span>
                <p style={{ fontWeight: "600", color: "#111", marginTop: "2px" }}>{previewPo.shipAddress}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="pe-btn-primary-sm" onClick={() => setPreviewPo(null)}>
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
