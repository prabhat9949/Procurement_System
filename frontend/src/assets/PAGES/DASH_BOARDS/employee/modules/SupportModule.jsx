import React, { useState } from "react";
import {
  HelpCircle,
  Mail,
  Phone,
  BookOpen,
  FileCheck2,
  Send,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from "lucide-react";

const guidelinesList = [
  {
    title: "1. Purchasing Threshold & Approval Delegation",
    desc: "Requisitions under $5,000 require Department Manager approval only. Requisitions between $5,000 and $25,000 require Procurement Manager sign-off. Items above $25,000 require CFO authorization.",
  },
  {
    title: "2. Vendor Sourcing & Mandatory Quotes",
    desc: "For IT hardware purchases over $3,000, employees must attach at least one official vendor quotation PDF during requisition creation.",
  },
  {
    title: "3. Delivery & Inventory Tagging",
    desc: "All physical goods must be delivered to HQ Receiving Bay B. Goods will undergo barcode asset tagging by Inventory Management before dispatch.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Requisition Submission",
    desc: "Employee submits purchase request with item specs, vendor preferences, and business justification.",
  },
  {
    step: "02",
    title: "Manager Approval",
    desc: "Department Manager reviews cost center budget availability and signs off on the request.",
  },
  {
    step: "03",
    title: "Procurement Sourcing",
    desc: "Procurement Executive evaluates quotes, negotiates pricing, and issues formal Purchase Order.",
  },
  {
    step: "04",
    title: "Fulfillment & Receiving",
    desc: "Vendor delivers goods to central warehouse; Inventory Manager logs intake and verifies item condition.",
  },
  {
    step: "05",
    title: "Finance Disbursement",
    desc: "Finance Manager completes 3-way invoice matching and executes secure wire payment.",
  },
];

const SupportModule = () => {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Requisition Assistance");
  const [ticketMessage, setTicketMessage] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setToastMsg("Support ticket successfully created! Ticket ID: TCK-2026-9041");
    setTicketSubject("");
    setTicketMessage("");
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="emp-support-container">
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <HelpCircle color="#f8b400" /> Support, Guidelines & Process Help Center
          </h1>
          <p className="emp-page-subtitle">
            Enterprise procurement policies, workflow step-by-step instructions, and 24/7 support channels.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            background: "rgba(5, 150, 105, 0.12)",
            border: "1px solid #059669",
            color: "#059669",
            padding: "12px 20px",
            borderRadius: "10px",
            marginBottom: "24px",
            fontSize: "14px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* Support Direct Contact Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* Email Support Card */}
        <div className="emp-card emp-card-gold-glow">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(248, 180, 0, 0.15)",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mail size={22} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>
                EMAIL SUPPORT
              </span>
              <h3 style={{ fontSize: "16px", color: "#111111", fontWeight: "700" }}>Email Helpdesk</h3>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "#555555", marginBottom: "14px" }}>
            Direct inbox for procurement questions, quote verification, and system assistance.
          </p>
          <a
            href="mailto:support@enterprise-procurement.com"
            className="emp-btn-primary-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            <Mail size={15} /> support@enterprise-procurement.com
          </a>
        </div>

        {/* Telephone Support Card */}
        <div className="emp-card emp-card-gold-glow">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(5, 150, 105, 0.12)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Phone size={22} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800", textTransform: "uppercase" }}>
                PHONE HOTLINE
              </span>
              <h3 style={{ fontSize: "16px", color: "#111111", fontWeight: "700" }}>24/7 Telephone Hotline</h3>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "#555555", marginBottom: "14px" }}>
            Immediate phone support for urgent purchase orders and order delivery issues.
          </p>
          <a
            href="tel:+18005553774"
            className="emp-btn-primary-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              fontSize: "13px",
              background: "#059669",
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            <Phone size={15} /> +1 (800) 555-EPS-HELP
          </a>
        </div>

        {/* Live Support Desk Card */}
        <div className="emp-card emp-card-gold-glow">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.12)",
                color: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={22} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#3b82f6", fontWeight: "800", textTransform: "uppercase" }}>
                LIVE SUPPORT DESK
              </span>
              <h3 style={{ fontSize: "16px", color: "#111111", fontWeight: "700" }}>Support Team Chat</h3>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "#555555", marginBottom: "14px" }}>
            Live chat with dedicated Help Desk Officer (Rachel Adams - Lead Support).
          </p>
          <button
            className="emp-btn-primary-sm"
            style={{
              width: "100%",
              fontSize: "13px",
              background: "#3b82f6",
              color: "#ffffff",
            }}
            onClick={() => alert("Connecting to Live Support Chat with Rachel Adams...")}
          >
            <MessageSquare size={15} /> Start Live Chat
          </button>
        </div>
      </div>

      {/* Process Details & Instructions */}
      <div className="emp-card" style={{ marginBottom: "28px" }}>
        <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <FileCheck2 size={20} color="#f8b400" /> End-to-End Requisition Process Details
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }}>
          {processSteps.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: "#f8f9fb",
                border: "1px solid #ececec",
                borderRadius: "12px",
                padding: "16px",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "#d97706",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                {p.step}
              </span>
              <h4 style={{ fontSize: "14px", color: "#111111", fontWeight: "700", marginBottom: "6px" }}>
                {p.title}
              </h4>
              <p style={{ fontSize: "12px", color: "#666666", lineHeight: "1.4" }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines & Create Ticket Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Guidelines & Policy Rules */}
        <div className="emp-card">
          <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <BookOpen size={20} color="#f8b400" /> Enterprise Procurement Guidelines
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {guidelinesList.map((g, idx) => (
              <div key={idx} style={{ padding: "14px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #ececec" }}>
                <h4 style={{ fontSize: "14px", color: "#111111", fontWeight: "700", marginBottom: "4px" }}>
                  {g.title}
                </h4>
                <p style={{ fontSize: "12px", color: "#555555", lineHeight: "1.4" }}>
                  {g.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Raise Support Ticket Form */}
        <div className="emp-card">
          <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Send size={20} color="#f8b400" /> Submit Support Ticket
          </h3>

          <form onSubmit={handleTicketSubmit}>
            <div className="emp-form-group">
              <label className="emp-form-label">Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="emp-form-select"
              >
                <option value="Requisition Assistance">Requisition Assistance</option>
                <option value="Vendor Quotation Query">Vendor Quotation Query</option>
                <option value="Delivery Delay Inquiry">Delivery Delay Inquiry</option>
                <option value="Invoice & Billing Clarification">Invoice & Billing Clarification</option>
              </select>
            </div>

            <div className="emp-form-group">
              <label className="emp-form-label">Subject</label>
              <input
                type="text"
                placeholder="Brief summary of your query..."
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                className="emp-form-input"
              />
            </div>

            <div className="emp-form-group">
              <label className="emp-form-label">Detailed Description</label>
              <textarea
                rows="4"
                placeholder="Provide details or reference requisition number..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                required
                className="emp-form-textarea"
              />
            </div>

            <button type="submit" className="emp-btn-primary-sm" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
              <Send size={16} /> Submit Ticket to Support Team
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportModule;
