import React, { useState } from "react";
import {
  LifeBuoy,
  Search,
  BookOpen,
  FileText,
  HelpCircle,
  Wrench,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

const initialFaqs = [
  {
    category: "Common Procurement Issues",
    items: [
      { q: "Why did my Purchase Request trigger a 'Bypassed RFQ' alert?", a: "This happens when the purchase order amount exceeds $15,000.00 but only a single vendor quotation was submitted. To resolve, attach at least three competitive quotes or write a justification override." },
      { q: "How do I edit a Purchase Order post-release?", a: "Once a PO has been approved by the department manager, it cannot be directly modified. The sourcing executive must raise a 'Modified PO Request' detailing changes which requires re-authorization." }
    ]
  },
  {
    category: "Vendor Registration & Invoicing",
    items: [
      { q: "Why is a vendor getting verification errors during file upload?", a: "Ensure the attached tax certificate or invoice document is strictly in PDF format and does not exceed 10MB in file size." },
      { q: "How are payment tracking timelines updated?", a: "The system traces payments through 8 distinct milestones (Invoice submission, bank route match, CFO release, wire dispatch). These update automatically when remittance matches bank logs." }
    ]
  },
  {
    category: "System Access & Roles",
    items: [
      { q: "How can a new auditor request cost center jurisdiction access?", a: "The chief administrator must configure the auditor profile scope within administrative workspace settings." }
    ]
  }
];

const HelpDesk = () => {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [activeSubTab, setActiveSubTab] = useState("kb"); // kb, request
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null); // 'cat-index' format

  // Request Form State
  const [callerName, setCallerName] = useState("");
  const [callerEmail, setCallerEmail] = useState("");
  const [helpTopic, setHelpTopic] = useState("Procurement Support");
  const [helpMsg, setHelpMsg] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const handleCreateRequest = (e) => {
    e.preventDefault();
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setCallerName("");
      setCallerEmail("");
      setHelpMsg("");
    }, 4000);
  };

  return (
    <div className="sup-helpdesk-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sup-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sup-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <LifeBuoy color="#f8b400" size={28} /> Knowledge Base & User Assistance
          </h1>
          <p className="sup-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Browse troubleshooting guides, system documentation, common procurement issues, or raise assistance request logs.
          </p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("kb")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "kb" ? "700" : "500",
            color: activeSubTab === "kb" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "kb" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Frequently Asked Questions & System Documentation
        </button>
        <button
          onClick={() => setActiveSubTab("request")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "request" ? "700" : "500",
            color: activeSubTab === "request" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "request" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Raise User Assistance Request
        </button>
      </div>

      {/* 1. Knowledge Base Tab */}
      {activeSubTab === "kb" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Search KB */}
          <div className="sup-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <div style={{ position: "relative", width: "360px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search troubleshooting guides, FAQs..."
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

          {/* FAQ Accordion list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {faqs.map((cat, catIdx) => {
              const matchedItems = cat.items.filter(
                (item) =>
                  item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.a.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (matchedItems.length === 0) return null;

              return (
                <div key={catIdx} className="sup-card" style={{ padding: "20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#d97706", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px" }}>
                    <BookOpen size={16} /> {cat.category}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {matchedItems.map((item, itemIdx) => {
                      const idKey = `${catIdx}-${itemIdx}`;
                      const isExpanded = expandedFaq === idKey;

                      return (
                        <div
                          key={itemIdx}
                          style={{
                            border: "1px solid #eee",
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: isExpanded ? "#fafafa" : "#fff",
                          }}
                        >
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : idKey)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "14px 16px",
                              background: "none",
                              border: "none",
                              fontWeight: "700",
                              fontSize: "14.5px",
                              color: "#333",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>{item.q}</span>
                            <span>{isExpanded ? "−" : "+"}</span>
                          </button>

                          {isExpanded && (
                            <div style={{ padding: "0 16px 14px", fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Raise User Request Tab */}
      {activeSubTab === "request" && (
        <div className="sup-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "560px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={16} color="#d97706" /> Submit User Assistance Request
          </h3>

          {formSuccess && (
            <div style={{ background: "rgba(5, 150, 105, 0.12)", color: "#059669", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} /> User assistance ticket logged onto queue!
            </div>
          )}

          <form onSubmit={handleCreateRequest} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sup-form-group">
                <label className="sup-form-label">Caller / Username *</label>
                <input type="text" value={callerName} onChange={(e) => setCallerName(e.target.value)} placeholder="e.g. David Chen" className="sup-form-input" required />
              </div>
              <div className="sup-form-group">
                <label className="sup-form-label">Contact Email *</label>
                <input type="email" value={callerEmail} onChange={(e) => setCallerEmail(e.target.value)} placeholder="email@enterprise.com" className="sup-form-input" required />
              </div>
            </div>

            <div className="sup-form-group">
              <label className="sup-form-label">Help Desk Support Topic *</label>
              <select
                value={helpTopic}
                onChange={(e) => setHelpTopic(e.target.value)}
                className="sup-form-select"
              >
                <option value="Procurement Support">Procurement & Sourcing Issues</option>
                <option value="Vendor Support">Supplier Account Queries</option>
                <option value="Financial Support">Disbursement & Invoices Problems</option>
                <option value="Inventory Support">Warehouse Stock Discrepancies</option>
              </select>
            </div>

            <div className="sup-form-group">
              <label className="sup-form-label">Detailed Message Notes *</label>
              <textarea
                rows="4"
                value={helpMsg}
                onChange={(e) => setHelpMsg(e.target.value)}
                placeholder="Log details of call or assistance query..."
                className="sup-form-textarea"
                required
              />
            </div>

            <button
              type="submit"
              className="sup-btn-primary-sm"
              style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}
            >
              Submit Support Request Log
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default HelpDesk;
