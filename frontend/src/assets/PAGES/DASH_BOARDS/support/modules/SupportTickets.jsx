import React, { useState } from "react";
import {
  Ticket,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  UserCheck,
  X,
  MessageSquare,
  Send,
  Upload,
  Clock,
  Filter,
} from "lucide-react";

const initialTickets = [
  {
    id: "TICK-2026-104",
    user: "David Chen (Senior Sourcing Exec)",
    type: "Procurement Support",
    priority: "High",
    issue: "PO-2026-4401 countersign notification email delivery delay.",
    assigned: "Samantha Sterling",
    status: "In Progress",
    date: "2026-07-26",
    document: "email_logs.txt",
    history: [
      { step: "Ticket created", date: "2026-07-26 11:00 AM", actor: "David Chen" },
      { step: "Assigned to Samantha Sterling", date: "2026-07-26 11:15 AM", actor: "System Auto-Router" }
    ]
  },
  {
    id: "TICK-2026-112",
    user: "Apple Business Direct (Vendor Desk)",
    type: "Vendor Support",
    priority: "High",
    issue: "Invoice INV-2026-9901 PDF upload validation error.",
    assigned: "Tech Support Team",
    status: "Pending",
    date: "2026-07-26",
    document: "",
    history: [
      { step: "Ticket created", date: "2026-07-26 11:30 AM", actor: "Apple Desk" }
    ]
  },
  {
    id: "TICK-2026-098",
    user: "Victoria Vance (CFO)",
    type: "Financial Support",
    priority: "Medium",
    issue: "Query regarding FedWire automated remittance confirmation template.",
    assigned: "Samantha Sterling",
    status: "Resolved",
    date: "2026-07-25",
    document: "wire_spec.pdf",
    history: [
      { step: "Ticket created", date: "2026-07-25 09:00 AM", actor: "Victoria Vance" },
      { step: "Resolved by updating templates", date: "2026-07-25 04:00 PM", actor: "Samantha Sterling" }
    ]
  },
];

const SupportTickets = () => {
  const [tickets, setTickets] = useState(initialTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Pending, In Progress, Resolved
  const [priorityFilter, setPriorityFilter] = useState("All"); // All, High, Medium, Low
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Edit Detail Modal State
  const [editPriority, setEditPriority] = useState("High");
  const [editAgent, setEditAgent] = useState("Samantha Sterling");
  const [resolutionComment, setResolutionComment] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleOpenDetail = (t) => {
    setSelectedTicket(t);
    setEditPriority(t.priority);
    setEditAgent(t.assigned);
    setResolutionComment("");
    setUploadedDoc(t.document);
  };

  const handleSaveDetail = (e) => {
    e.preventDefault();
    
    // Add timeline history
    const historyUpdate = [...selectedTicket.history];
    if (selectedTicket.priority !== editPriority) {
      historyUpdate.push({ step: `Priority updated to ${editPriority}`, date: new Date().toLocaleString(), actor: "Samantha Sterling" });
    }
    if (selectedTicket.assigned !== editAgent) {
      historyUpdate.push({ step: `Assigned agent updated to ${editAgent}`, date: new Date().toLocaleString(), actor: "Samantha Sterling" });
    }
    if (resolutionComment.trim()) {
      historyUpdate.push({ step: `Agent added comment: ${resolutionComment}`, date: new Date().toLocaleString(), actor: "Samantha Sterling" });
    }

    setTickets(
      tickets.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            priority: editPriority,
            assigned: editAgent,
            document: uploadedDoc,
            history: historyUpdate,
          };
        }
        return t;
      })
    );

    setSelectedTicket(null);
    triggerToast(`Ticket ${selectedTicket.id} updated successfully!`);
  };

  const handleMarkResolved = (id) => {
    setTickets(
      tickets.map((t) => {
        if (t.id === id) {
          const closedHistory = [...t.history, { step: "Ticket marked as Resolved & Closed", date: new Date().toLocaleString(), actor: "Samantha Sterling" }];
          return {
            ...t,
            status: "Resolved",
            history: closedHistory,
          };
        }
        return t;
      })
    );
    setSelectedTicket(null);
    triggerToast(`Ticket ${id} marked as Resolved.`);
  };

  const handleMarkInProgress = (id) => {
    setTickets(
      tickets.map((t) => {
        if (t.id === id) {
          const progressHistory = [...t.history, { step: "Ticket status changed to In Progress", date: new Date().toLocaleString(), actor: "Samantha Sterling" }];
          return {
            ...t,
            status: "In Progress",
            history: progressHistory,
          };
        }
        return t;
      })
    );
    setSelectedTicket(null);
    triggerToast(`Ticket ${id} is now In Progress.`);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.issue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="sup-tickets-container" style={{ padding: "20px" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#111111",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            fontWeight: "700",
            fontSize: "14px",
            borderLeft: "4px solid #f8b400",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="sup-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sup-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Ticket color="#f8b400" size={28} /> User Support Ticket Center
          </h1>
          <p className="sup-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Track, assign, prioritize, and resolve help tickets logged by internal users, executives, and vendor representatives.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="sup-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search Ticket ID, Requestor, Issue..."
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

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="sup-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        <div className="sup-table-container">
          <table className="sup-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Requestor User</th>
                <th>Domain Type</th>
                <th>Priority</th>
                <th>Issue Summary Description</th>
                <th>Assigned Agent</th>
                <th>Created Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: "800", color: "#d97706" }}>{t.id}</td>
                  <td style={{ fontWeight: "700" }}>{t.user}</td>
                  <td style={{ color: "#666" }}>{t.type}</td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        color: t.priority === "High" ? "#dc2626" : t.priority === "Medium" ? "#d97706" : "#059669",
                        background: t.priority === "High" ? "rgba(220,38,38,0.08)" : t.priority === "Medium" ? "rgba(217,119,6,0.08)" : "rgba(5,150,105,0.08)",
                        padding: "2px 8px",
                        borderRadius: "12px",
                      }}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ fontWeight: "600", color: "#111" }}>{t.issue}</td>
                  <td style={{ color: "#555" }}>{t.assigned}</td>
                  <td style={{ color: "#777", fontSize: "13.5px" }}>{t.date}</td>
                  <td>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background:
                          t.status === "Resolved"
                            ? "rgba(5, 150, 105, 0.12)"
                            : t.status === "In Progress"
                            ? "rgba(59, 130, 246, 0.12)"
                            : "rgba(217, 119, 6, 0.12)",
                        color:
                          t.status === "Resolved"
                            ? "#059669"
                            : t.status === "In Progress"
                            ? "#3b82f6"
                            : "#d97706",
                        border: `1px solid ${
                          t.status === "Resolved"
                            ? "rgba(5, 150, 105, 0.3)"
                            : t.status === "In Progress"
                            ? "rgba(59, 130, 246, 0.3)"
                            : "rgba(217, 119, 6, 0.3)"
                        }`,
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        className="sup-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                        onClick={() => handleOpenDetail(t)}
                        title="View details & history"
                      >
                        <Eye size={14} />
                      </button>

                      {t.status === "Pending" && (
                        <button
                          className="sup-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", color: "#3b82f6" }}
                          onClick={() => handleMarkInProgress(t.id)}
                          title="Change to In Progress"
                        >
                          <Clock size={14} />
                        </button>
                      )}

                      {t.status !== "Resolved" && (
                        <button
                          className="sup-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", color: "#059669" }}
                          onClick={() => handleMarkResolved(t.id)}
                          title="Mark Resolved"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & EDIT TICKET MODAL */}
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
              maxWidth: "560px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>SUPPORT TICKET WORKSPACE</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  Ticket ID: {selectedTicket.id}
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
            <form onSubmit={handleSaveDetail} style={{ padding: "24px" }}>
              <div style={{ background: "#f8f9fb", padding: "14px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "16px", fontSize: "13.5px" }}>
                <strong>Requestor User:</strong> {selectedTicket.user} <br />
                <strong>Domain Category:</strong> {selectedTicket.type} <br />
                <strong>Description summary:</strong>
                <p style={{ margin: "6px 0 0", color: "#111", fontWeight: "600" }}>{selectedTicket.issue}</p>
              </div>

              {/* Assign and priority */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="sup-form-group">
                  <label className="sup-form-label">Ticket Priority *</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="sup-form-select"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div className="sup-form-group">
                  <label className="sup-form-label">Assign Agent *</label>
                  <select
                    value={editAgent}
                    onChange={(e) => setEditAgent(e.target.value)}
                    className="sup-form-select"
                  >
                    <option value="Samantha Sterling">Samantha Sterling (Lead)</option>
                    <option value="Tech Support Team">Tech Support Team</option>
                    <option value="Engineering Tier 3">Engineering Tier 3</option>
                    <option value="Finance Support Specialist">Finance Support Specialist</option>
                  </select>
                </div>
              </div>

              {/* Upload input mock */}
              <div className="sup-form-group" style={{ marginBottom: "16px" }}>
                <label className="sup-form-label">Attach Supporting Documents</label>
                <div
                  style={{
                    border: "1.5px dashed #d9d9d9",
                    padding: "12px",
                    borderRadius: "8px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#fafafa"
                  }}
                  onClick={() => {
                    const file = prompt("Enter attached filename:", "screenshot_error_po.png");
                    if (file) setUploadedDoc(file);
                  }}
                >
                  <Upload size={16} color="#666" style={{ margin: "0 auto 4px" }} />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>
                    {uploadedDoc ? `Attached: ${uploadedDoc}` : "Upload debug log, screenshot or document"}
                  </span>
                </div>
              </div>

              {/* Comment field */}
              <div className="sup-form-group" style={{ marginBottom: "20px" }}>
                <label className="sup-form-label">Add Internal Resolution Memo / Comment</label>
                <input
                  type="text"
                  placeholder="e.g. Email dispatch settings adjusted / invoice cleared manually..."
                  value={resolutionComment}
                  onChange={(e) => setResolutionComment(e.target.value)}
                  className="sup-form-input"
                />
              </div>

              {/* History Timeline */}
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "8px" }}>Ticket History Audit Trail</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "120px", overflowY: "auto", border: "1px solid #eee", padding: "10px", borderRadius: "8px", background: "#fcfcfc", marginBottom: "20px" }}>
                {selectedTicket.history.map((h, idx) => (
                  <div key={idx} style={{ fontSize: "12px", color: "#555" }}>
                    <strong>{h.date}</strong> - {h.step} (by {h.actor})
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                {selectedTicket.status !== "Resolved" ? (
                  <button
                    type="button"
                    className="fin-btn-approve"
                    style={{ background: "#059669", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                    onClick={() => handleMarkResolved(selectedTicket.id)}
                  >
                    Resolve Ticket
                  </button>
                ) : (
                  <span style={{ color: "#059669", fontSize: "13.5px", fontWeight: "700", alignSelf: "center" }}>
                    Resolved & Closed
                  </span>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                    onClick={() => setSelectedTicket(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="sup-btn-primary-sm" style={{ padding: "10px 20px" }}>
                    Save updates
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportTickets;
