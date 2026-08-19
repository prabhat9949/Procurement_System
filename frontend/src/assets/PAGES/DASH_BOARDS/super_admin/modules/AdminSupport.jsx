import React, { useState, useEffect, useCallback } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Send,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Eye,
} from "lucide-react";
import { apiGet, apiPost, apiPut } from "../../../../../services/apiClient";
import { formatDateIN } from "../../../../../utils/format";

const STATUS_COLORS = {
  OPEN: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
  IN_PROGRESS: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  WAITING_FOR_USER: { bg: "rgba(124,58,237,.12)", color: "#7c3aed" },
  RESOLVED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  CLOSED: { bg: "rgba(107,114,128,.12)", color: "#6b7280" },
};

const PRIORITY_COLORS = {
  LOW: { bg: "rgba(107,114,128,.12)", color: "#6b7280" },
  MEDIUM: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
  HIGH: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  URGENT: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
};

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [counts, setCounts] = useState({ open: 0, inProgress: 0, resolved: 0 });
  const [toast, setToast] = useState(null);

  // Create form
  const [form, setForm] = useState({ subject: "", description: "", priority: "MEDIUM", category: "General" });
  const [creating, setCreating] = useState(false);

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/support-tickets?page=0&size=100");
      setTickets(data?.content || []);
    } catch (err) {
      setError(err.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      const data = await apiGet("/api/support-tickets/counts");
      setCounts(data || { open: 0, inProgress: 0, resolved: 0 });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadTickets();
    loadCounts();
  }, [loadTickets, loadCounts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setCreating(true);
    try {
      await apiPost("/api/support-tickets", form);
      triggerToast("Support ticket created successfully.");
      setShowCreate(false);
      setForm({ subject: "", description: "", priority: "MEDIUM", category: "General" });
      loadTickets();
      loadCounts();
    } catch (err) {
      triggerToast(err.message || "Could not create ticket.", "err");
    } finally {
      setCreating(false);
    }
  };

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setMsgLoading(true);
    try {
      const msgs = await apiGet(`/api/support-tickets/${ticket.id}/messages`);
      setMessages(msgs || []);
    } catch {
      setMessages([]);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const sent = await apiPost(`/api/support-tickets/${selectedTicket.id}/messages`, { messageText: newMsg });
      setMessages([...messages, sent]);
      setNewMsg("");
    } catch (err) {
      triggerToast(err.message || "Could not send message.", "err");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      await apiPut(`/api/support-tickets/${ticketId}/status?status=${status}`);
      triggerToast(`Ticket status updated to ${status}.`);
      loadTickets();
      loadCounts();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (err) {
      triggerToast(err.message || "Could not update status.", "err");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.tone === "err" ? "#dc2626" : "#111", color: "#fff", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 1200, fontWeight: "700", fontSize: "14px", borderLeft: `4px solid ${toast.tone === "err" ? "#fff" : "#f8b400"}` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111", margin: 0 }}>
            <LifeBuoy color="#f8b400" size={28} /> Support & Help
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Create support requests, view ticket status, and communicate with the Support Team.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={loadTickets} disabled={loading}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="sadmin-btn-primary-sm" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Support Request
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ padding: "16px", background: "#f0f6ff", border: "1px solid rgba(37,99,235,0.25)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Open Tickets</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#2563eb", margin: "2px 0 0" }}>{counts.open}</h3>
        </div>
        <div style={{ padding: "16px", background: "#fcf8f2", border: "1px solid rgba(248,180,0,0.3)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>In Progress</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "2px 0 0" }}>{counts.inProgress}</h3>
        </div>
        <div style={{ padding: "16px", background: "#f6faf8", border: "1px solid rgba(5,150,105,0.3)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Resolved</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>{counts.resolved}</h3>
        </div>
      </div>

      {/* Ticket List */}
      <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: "10px", color: "#666" }}>
            <Loader2 size={20} className="login-spin" /> Loading support tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>
            No support tickets yet. Click "New Support Request" to create one.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ececec" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Ticket</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Subject</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Created By</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Priority</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const sc = STATUS_COLORS[t.status] || STATUS_COLORS.OPEN;
                  const pc = PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.MEDIUM;
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onClick={() => openTicket(t)}>
                      <td style={{ padding: "12px 16px", fontWeight: "700", color: "#2563eb", fontSize: "13px" }}>{t.ticketNumber}</td>
                      <td style={{ padding: "12px 16px", fontWeight: "600", color: "#111", fontSize: "14px" }}>{t.subject}</td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555" }}>{t.createdByName || t.createdByUsername || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: pc.bg, color: pc.color }}>{t.priority}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: sc.bg, color: sc.color }}>{t.status.replace(/_/g, " ")}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12.5px", color: "#7a8999" }}>{formatDateIN(t.createdAt)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); openTicket(t); }}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "540px", boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec", borderRadius: "16px 16px 0 0" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>NEW SUPPORT REQUEST</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>Create a Support Ticket</h3>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", marginBottom: "4px", display: "block" }}>Subject *</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of the issue" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px" }} required />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", marginBottom: "4px", display: "block" }}>Description *</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed description of your issue or request..." style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px", resize: "vertical" }} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", marginBottom: "4px", display: "block" }}>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", marginBottom: "4px", display: "block" }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}>
                    <option value="General">General</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Finance">Finance</option>
                    <option value="Technical">Technical</option>
                    <option value="Account Access">Account Access</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button type="button" style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #d9d9d9", background: "#f8f9fb", color: "#111", fontWeight: "600", cursor: "pointer", fontSize: "14px" }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="sadmin-btn-primary-sm" disabled={creating || !form.subject.trim() || !form.description.trim()}>
                  {creating ? <><Loader2 size={15} className="login-spin" /> Creating...</> : <><LifeBuoy size={15} /> Submit Request</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail + Chat Modal */}
      {selectedTicket && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "640px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec", borderRadius: "16px 16px 0 0", flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "800" }}>{selectedTicket.ticketNumber}</span>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#111", margin: 0 }}>{selectedTicket.subject}</h3>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: (STATUS_COLORS[selectedTicket.status] || STATUS_COLORS.OPEN).bg, color: (STATUS_COLORS[selectedTicket.status] || STATUS_COLORS.OPEN).color }}>{selectedTicket.status.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: (PRIORITY_COLORS[selectedTicket.priority] || PRIORITY_COLORS.MEDIUM).bg, color: (PRIORITY_COLORS[selectedTicket.priority] || PRIORITY_COLORS.MEDIUM).color }}>{selectedTicket.priority}</span>
                  {selectedTicket.category && <span style={{ fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: "rgba(107,114,128,.12)", color: "#6b7280" }}>{selectedTicket.category}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {/* Status update buttons for admin */}
                {selectedTicket.status !== "RESOLVED" && selectedTicket.status !== "CLOSED" && (
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "12px", background: "#fff" }}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_FOR_USER">Waiting for User</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                )}
                <button onClick={() => { setSelectedTicket(null); setMessages([]); }} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "300px", maxHeight: "50vh" }}>
              {msgLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "32px", color: "#666" }}>
                  <Loader2 size={18} className="login-spin" /> Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888", padding: "32px" }}>No messages yet.</div>
              ) : (
                messages.map((m, idx) => {
                  const isAdmin = m.senderRole === "SUPER_ADMIN" || m.senderRole === "ADMIN" || m.senderRole === "SUPPORT_TEAM";
                  return (
                    <div key={m.id || idx} style={{ display: "flex", flexDirection: "column", maxWidth: "80%", alignSelf: isAdmin ? "flex-end" : "flex-start" }}>
                      <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px", fontWeight: "600" }}>
                        {m.senderName || m.senderUsername || "System"} {m.senderRole && <span style={{ color: "#aaa" }}>({m.senderRole})</span>}
                      </div>
                      <div style={{ padding: "10px 14px", borderRadius: "12px", fontSize: "13.5px", lineHeight: 1.5, background: isAdmin ? "#eff6ff" : "#f3f4f6", color: "#111", borderBottomLeftRadius: isAdmin ? "12px" : "4px", borderBottomRightRadius: isAdmin ? "4px" : "12px" }}>
                        {m.messageText}
                      </div>
                      <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>{formatDateIN(m.createdAt)}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            {selectedTicket.status !== "CLOSED" && (
              <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px", padding: "16px 20px", borderTop: "1px solid #ececec", flexShrink: 0 }}>
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px" }}
                  disabled={sending}
                />
                <button type="submit" className="sadmin-btn-primary-sm" disabled={sending || !newMsg.trim()}>
                  {sending ? <Loader2 size={15} className="login-spin" /> : <><Send size={15} /> Send</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
