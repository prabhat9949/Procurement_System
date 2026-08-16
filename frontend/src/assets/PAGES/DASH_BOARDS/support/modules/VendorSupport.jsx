import React, { useState } from "react";
import {
  Users,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Clock,
  X,
} from "lucide-react";

const initialVendorTickets = [
  { id: "SUP-VND-801", vendor: "Apple Business Direct", category: "Invoicing", topic: "Invoice PDF Upload Verification Error", priority: "High", status: "Pending", date: "2026-07-26", desc: "Vendor encountered system error code 500 when uploading tax invoice PDF." },
  { id: "SUP-VND-805", vendor: "Dell Technologies", category: "RFQ & Quotation", topic: "RFQ Submission Portal Clarification", priority: "Medium", status: "Resolved", date: "2026-07-25", desc: "Clarified how to enter delivery commitments timeframe slider." },
  { id: "SUP-VND-809", vendor: "Custom Office Designs", category: "Vendor Account", topic: "Cannot edit bank account details", priority: "High", status: "In Progress", date: "2026-07-27", desc: "Vendor registration form locks bank fields post approval. Needs manual override." }
];

const VendorSupport = () => {
  const [tickets, setTickets] = useState(initialVendorTickets);
  const [activeSubTab, setActiveSubTab] = useState("queue"); // queue, create
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form state
  const [formVendor, setFormVendor] = useState("Apple Business Direct");
  const [formCategory, setFormCategory] = useState("RFQ & Quotation");
  const [formTopic, setFormTopic] = useState("");
  const [formPriority, setFormPriority] = useState("Medium");
  const [formDesc, setFormDesc] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    const newTicket = {
      id: `SUP-VND-${100 + tickets.length + 700}`,
      vendor: formVendor,
      category: formCategory,
      topic: formTopic,
      priority: formPriority,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      desc: formDesc,
    };
    setTickets([newTicket, ...tickets]);
    setSuccess(true);
    setFormTopic("");
    setFormDesc("");
    setTimeout(() => {
      setSuccess(false);
      setActiveSubTab("queue");
    }, 2000);
  };

  const handleResolve = (id) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "Resolved" } : t));
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sup-vnd-support-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sup-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sup-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Users color="#f8b400" size={28} /> Supplier & Vendor Support
          </h1>
          <p className="sup-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Assist suppliers with portal registration issues, RFQ/Quotation submission problems, PO queries, and invoice remittance questions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("queue")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "queue" ? "700" : "500",
            color: activeSubTab === "queue" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "queue" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Vendor Support Tickets
        </button>
        <button
          onClick={() => setActiveSubTab("create")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "create" ? "700" : "500",
            color: activeSubTab === "create" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "create" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Log Vendor Query
        </button>
      </div>

      {/* 1. Queue Tab */}
      {activeSubTab === "queue" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Search bar */}
          <div className="sup-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <div style={{ position: "relative", width: "360px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search Ticket ID, Vendor, Subject..."
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

          {/* Table */}
          <div className="sup-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="sup-table-container">
              <table className="sup-table">
                <thead>
                  <tr>
                    <th>Support ID</th>
                    <th>Supplier / Vendor Name</th>
                    <th>Issue Area</th>
                    <th>Topic Description</th>
                    <th>Priority</th>
                    <th>Date Logged</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{t.id}</td>
                      <td style={{ fontWeight: "700" }}>{t.vendor}</td>
                      <td style={{ fontSize: "13px", color: "#555" }}>{t.category}</td>
                      <td style={{ fontWeight: "600" }}>{t.topic}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            color: t.priority === "High" ? "#dc2626" : "#555",
                            background: t.priority === "High" ? "rgba(220,38,38,0.08)" : "rgba(0,0,0,0.05)",
                            padding: "2px 8px",
                            borderRadius: "12px",
                          }}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ color: "#777", fontSize: "13.5px" }}>{t.date}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11.5px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: t.status === "Resolved" ? "rgba(5, 150, 105, 0.12)" : t.status === "In Progress" ? "rgba(59, 130, 246, 0.12)" : "rgba(217, 119, 6, 0.12)",
                            color: t.status === "Resolved" ? "#059669" : t.status === "In Progress" ? "#3b82f6" : "#d97706",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="sup-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                          onClick={() => setSelectedTicket(t)}
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
        </div>
      )}

      {/* 2. Create Tab */}
      {activeSubTab === "create" && (
        <div className="sup-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "560px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px" }}>
            Log Vendor Assistance Request
          </h3>

          {success && (
            <div style={{ background: "rgba(5, 150, 105, 0.12)", color: "#059669", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600" }}>
              Ticket logged successfully! Redirecting to queue...
            </div>
          )}

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sup-form-group">
                <label className="sup-form-label">Vendor Supplier *</label>
                <select value={formVendor} onChange={(e) => setFormVendor(e.target.value)} className="sup-form-select">
                  <option value="Apple Business Direct">Apple Business Direct</option>
                  <option value="Dell Technologies">Dell Technologies</option>
                  <option value="Custom Office Designs">Custom Office Designs</option>
                  <option value="HP Inc. Enterprise">HP Inc. Enterprise</option>
                </select>
              </div>
              
              <div className="sup-form-group">
                <label className="sup-form-label">Support Category *</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="sup-form-select">
                  <option value="Registration">Vendor Registration / Profile</option>
                  <option value="RFQ & Quotation">RFQ submissions & Quotation</option>
                  <option value="PO Queries">Purchase Order Queries</option>
                  <option value="Invoicing">Invoicing & Payments</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px" }}>
              <div className="sup-form-group">
                <label className="sup-form-label">Topic Subject Title *</label>
                <input type="text" value={formTopic} onChange={(e) => setFormTopic(e.target.value)} placeholder="e.g. Bank details update override" className="sup-form-input" required />
              </div>
              <div className="sup-form-group">
                <label className="sup-form-label">Priority *</label>
                <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} className="sup-form-select">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="sup-form-group">
              <label className="sup-form-label">Detailed Notes *</label>
              <textarea rows="4" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Enter details of supplier query..." className="sup-form-textarea" required />
            </div>

            <button type="submit" className="sup-btn-primary-sm" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
              Log Supplier Ticket & Dispatch Notification
            </button>
          </form>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTicket && (
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
              maxWidth: "520px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>VENDOR HELPDESK DETAILS</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  Ticket: {selectedTicket.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <p><strong>Supplier Name:</strong> {selectedTicket.vendor}</p>
              <p><strong>Category Area:</strong> {selectedTicket.category}</p>
              <p><strong>Issue Title:</strong> {selectedTicket.topic}</p>
              <p><strong>Date Logged:</strong> {selectedTicket.date}</p>
              <p><strong>Priority Level:</strong> {selectedTicket.priority}</p>
              <p><strong>Details:</strong></p>
              <p style={{ background: "#f8f9fb", padding: "12px", border: "1px solid #eee", borderRadius: "8px", color: "#333", fontSize: "13.5px" }}>
                {selectedTicket.desc}
              </p>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              {selectedTicket.status !== "Resolved" && (
                <button
                  className="fin-btn-approve"
                  style={{ background: "#059669", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  onClick={() => handleResolve(selectedTicket.id)}
                >
                  Mark Resolved
                </button>
              )}
              <button
                className="sup-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedTicket(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorSupport;
