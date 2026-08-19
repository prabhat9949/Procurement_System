import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  HelpCircle,
  Mail,
  Phone,
  Send,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Plus,
  X,
  Eye,
  RefreshCw,
  Clock,
  AlertCircle,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";

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

const processSteps = [
  { step: "01", title: "Requisition Submission", desc: "Employee submits purchase request with item specs, vendor preferences, and business justification." },
  { step: "02", title: "Manager Approval", desc: "Department Manager reviews cost center budget availability and signs off on the request." },
  { step: "03", title: "Procurement Sourcing", desc: "Procurement Executive evaluates quotes, negotiates pricing, and issues formal Purchase Order." },
  { step: "04", title: "Fulfillment & Receiving", desc: "Vendor delivers goods to central warehouse; Inventory Manager logs intake and verifies item condition." },
  { step: "05", title: "Finance Disbursement", desc: "Finance Manager completes 3-way invoice matching and executes secure wire payment." },
];

const guidelinesList = [
  { title: "1. Purchasing Threshold & Approval Delegation", desc: "Requisitions under ₹5,000 require Department Manager approval only. Requisitions between ₹5,000 and ₹25,000 require Procurement Manager sign-off. Items above ₹25,000 require CFO authorization." },
  { title: "2. Vendor Sourcing & Mandatory Quotes", desc: "For IT hardware purchases over ₹3,000, employees must attach at least one official vendor quotation PDF during requisition creation." },
  { title: "3. Delivery & Inventory Tagging", desc: "All physical goods must be delivered to HQ Receiving Bay B. Goods will undergo barcode asset tagging by Inventory Management before dispatch." },
];

const formatDateIN = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; }
};

/* ===== Toast ===== */
function Toast({ msg, tone }) {
  if (!msg) return null;
  const bg = tone === "err" ? "#dc2626" : "#111";
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: bg, color: "#fff", padding: "12px 24px", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.2)", zIndex: 1200, fontWeight: 700, fontSize: 14, borderLeft: `4px solid ${tone === "err" ? "#fff" : "#f8b400"}` }}>
      {msg}
    </div>
  );
}

/* ===== Main SupportModule ===== */
const SupportModule = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatTicket, setChatTicket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);

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
      const data = await apiGet("/api/support-tickets/my");
      setTickets(data?.content || []);
    } catch (err) {
      setError(err.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  /* ---- Create ticket ---- */
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
    } catch (err) {
      triggerToast(err.message || "Could not create ticket.", "err");
    } finally {
      setCreating(false);
    }
  };

  /* ---- Open ticket detail ---- */
  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setMsgLoading(true);
    try {
      const msgs = await apiGet(`/api/support-tickets/${ticket.id}/messages`);
      setMessages(msgs || []);
    } catch { setMessages([]); } finally { setMsgLoading(false); }
  };

  /* ---- Send message on ticket ---- */
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
    } finally { setSending(false); }
  };

  /* ---- Live Chat (creates a LIVE_CHAT support ticket) ---- */
  const startLiveChat = async () => {
    try {
      const ticket = await apiPost("/api/support-tickets", {
        subject: "Live Chat Session",
        description: "Live chat initiated from Employee dashboard",
        priority: "HIGH",
        category: "LIVE_CHAT",
      });
      setChatTicket(ticket);
      setShowChat(true);
      const msgs = await apiGet(`/api/support-tickets/${ticket.id}/messages`);
      setChatMessages(msgs || []);
    } catch (err) {
      triggerToast(err.message || "Could not start live chat.", "err");
    }
  };

  const sendChatMsg = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || !chatTicket) return;
    setChatSending(true);
    try {
      const sent = await apiPost(`/api/support-tickets/${chatTicket.id}/messages`, { messageText: chatMsg });
      setChatMessages([...chatMessages, sent]);
      setChatMsg("");
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      triggerToast(err.message || "Could not send message.", "err");
    } finally { setChatSending(false); }
  };

  /* Poll for new chat messages every 10s while chat is open */
  useEffect(() => {
    if (!showChat || !chatTicket) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await apiGet(`/api/support-tickets/${chatTicket.id}/messages`);
        setChatMessages(msgs || []);
      } catch { /* silent */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [showChat, chatTicket]);

  return (
    <div className="emp-support-container">
      <Toast msg={toast?.msg} tone={toast?.tone} />

      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <HelpCircle color="#f8b400" /> Support, Guidelines & Help Center
          </h1>
          <p className="emp-page-subtitle">
            Enterprise procurement policies, support tickets, live chat and 24/7 help — all backed by the Support Team.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadTickets} disabled={loading} style={{ border: "1px solid #d9d9d9", borderRadius: 9, background: "#f8f9fb", padding: "10px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)} style={{ border: 0, borderRadius: 9, background: "#f8b400", color: "#111", padding: "10px 18px", cursor: "pointer", fontWeight: 800, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(248,180,0,.35)" }}>
            <Plus size={15} /> New Support Ticket
          </button>
          <button onClick={startLiveChat} style={{ border: 0, borderRadius: 9, background: "#3b82f6", color: "#fff", padding: "10px 18px", cursor: "pointer", fontWeight: 800, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <MessageSquare size={15} /> Live Chat
          </button>
        </div>
      </div>

      {/* Quick contact cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="emp-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(248,180,0,.15)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}><Mail size={22} /></div>
          <div>
            <span style={{ fontSize: 11, color: "#d97706", fontWeight: 800, textTransform: "uppercase" }}>EMAIL SUPPORT</span>
            <div style={{ fontSize: 14, color: "#111", fontWeight: 700 }}>support@enterprise-procurement.com</div>
          </div>
        </div>
        <div className="emp-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(5,150,105,.12)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}><Phone size={22} /></div>
          <div>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 800, textTransform: "uppercase" }}>PHONE HOTLINE</span>
            <div style={{ fontSize: 14, color: "#111", fontWeight: 700 }}>+91 1800-555-EPS-HELP</div>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="emp-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 17, color: "#111", fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
          End-to-End Requisition Process
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          {processSteps.map((p, idx) => (
            <div key={idx} style={{ background: "#f8f9fb", border: "1px solid #ececec", borderRadius: 12, padding: 16 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#d97706", display: "block", marginBottom: 8 }}>{p.step}</span>
              <h4 style={{ fontSize: 13, color: "#111", fontWeight: 700, marginBottom: 4 }}>{p.title}</h4>
              <p style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="emp-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 17, color: "#111", fontWeight: 700, marginBottom: 16 }}>Enterprise Procurement Guidelines</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {guidelinesList.map((g, idx) => (
            <div key={idx} style={{ padding: 14, background: "#f8f9fb", borderRadius: 10, border: "1px solid #ececec" }}>
              <h4 style={{ fontSize: 14, color: "#111", fontWeight: 700, marginBottom: 4 }}>{g.title}</h4>
              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.4 }}>{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* My Support Tickets */}
      <div className="emp-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 17, color: "#111", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={18} color="#f8b400" /> My Support Tickets
        </h3>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32, gap: 8, color: "#666" }}><Loader2 size={18} className="login-spin" /> Loading...</div>
        ) : error ? (
          <div style={{ padding: 14, background: "#fff1f2", color: "#be123c", borderRadius: 9, fontWeight: 600 }}><AlertCircle size={16} /> {error}</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#888" }}>No support tickets yet. Click "New Support Ticket" to create one.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ececec" }}>
                  {["Ticket", "Subject", "Category", "Priority", "Status", "Date", "Action"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 800, color: "#888", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const sc = STATUS_COLORS[t.status] || STATUS_COLORS.OPEN;
                  const pc = PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.MEDIUM;
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onClick={() => openTicket(t)}>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "#2563eb", fontSize: 13 }}>{t.ticketNumber}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111", fontSize: 13 }}>{t.subject}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#666" }}>{t.category || "—"}</td>
                      <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: pc.bg, color: pc.color }}>{t.priority}</span></td>
                      <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: sc.bg, color: sc.color }}>{t.status?.replace(/_/g, " ")}</span></td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#7a8999" }}>{formatDateIN(t.createdAt)}</td>
                      <td style={{ padding: "10px 12px" }}><button style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: 6, background: "#fff", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); openTicket(t); }}><Eye size={13} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, boxShadow: "0 12px 36px rgba(0,0,0,.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: "#f8f9fb", borderBottom: "1px solid #ececec", borderRadius: "16px 16px 0 0" }}>
              <div>
                <span style={{ fontSize: 11, color: "#d97706", fontWeight: 800 }}>NEW SUPPORT REQUEST</span>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111", margin: 0 }}>Create a Support Ticket</h3>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 }}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid #d9d9d9", borderRadius: 8, fontSize: 14, background: "#fff" }}>
                  <option value="General">General</option>
                  <option value="Requisition Assistance">Requisition Assistance</option>
                  <option value="Vendor Quotation Query">Vendor Quotation Query</option>
                  <option value="Delivery Delay Inquiry">Delivery Delay Inquiry</option>
                  <option value="Invoice & Billing">Invoice & Billing</option>
                  <option value="System Access">System Access</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 }}>Subject *</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief summary of your issue" required style={{ width: "100%", padding: "10px 14px", border: "1px solid #d9d9d9", borderRadius: 8, fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 }}>Description *</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide details, reference PR/PO numbers, describe the issue..." required style={{ width: "100%", padding: "10px 14px", border: "1px solid #d9d9d9", borderRadius: 8, fontSize: 14, resize: "vertical" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 }}>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1px solid #d9d9d9", borderRadius: 8, fontSize: 14, background: "#fff" }}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", border: "1px solid #d9d9d9", borderRadius: 8, cursor: "pointer", background: "#f8f9fb", color: "#111", fontWeight: 700, fontSize: 13 }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: "10px 22px", border: 0, borderRadius: 8, cursor: "pointer", background: "#f8b400", color: "#111", fontWeight: 800, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, opacity: creating ? 0.6 : 1 }}>
                  {creating ? <Loader2 size={14} className="login-spin" /> : <Send size={14} />} {creating ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail / Messages Modal */}
      {selectedTicket && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 600, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 12px 36px rgba(0,0,0,.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f8f9fb", borderBottom: "1px solid #ececec", borderRadius: "16px 16px 0 0", flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 800 }}>{selectedTicket.ticketNumber}</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: 0 }}>{selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {msgLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 24, color: "#666" }}><Loader2 size={18} className="login-spin" /> Loading messages...</div>
              ) : messages.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#888" }}>No messages yet. Send a message to start the conversation.</div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} style={{ padding: "10px 14px", background: m.senderRole === "SUPPORT_TEAM" || m.senderRole === "ADMIN" ? "#f0f6ff" : "#f8f9fb", borderRadius: 10, marginBottom: 8, border: "1px solid #e7ebf0" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{m.senderName || "Unknown"} {m.senderRole ? <span style={{ fontSize: 10, color: "#888", fontWeight: 600 }}>({m.senderRole})</span> : null}</div>
                    <div style={{ fontSize: 13, color: "#111", marginTop: 4, lineHeight: 1.5 }}>{m.messageText}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{formatDateIN(m.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8, padding: "12px 16px", borderTop: "1px solid #ececec", flexShrink: 0 }}>
              <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type your message..." style={{ flex: 1, padding: "10px 14px", border: "1px solid #d9d9d9", borderRadius: 8, fontSize: 13 }} />
              <button type="submit" disabled={sending || !newMsg.trim()} style={{ padding: "10px 16px", border: 0, borderRadius: 8, background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, opacity: sending || !newMsg.trim() ? 0.5 : 1 }}>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Live Chat Floating Panel */}
      {showChat && chatTicket && (
        <div style={{ position: "fixed", bottom: 80, right: 24, width: 380, height: 480, background: "#fff", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,.2)", zIndex: 1100, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", background: "#2563eb", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Live Support Chat</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Ticket {chatTicket.ticketNumber}</div>
            </div>
            <button onClick={() => { setShowChat(false); setChatTicket(null); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {chatMessages.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "#888", fontSize: 13 }}>Send a message to start the conversation with the Support Team.</div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} style={{ marginBottom: 8, display: "flex", justifyContent: (m.senderRole === "SUPPORT_TEAM" || m.senderRole === "ADMIN") ? "flex-start" : "flex-end" }}>
                <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: 12, background: (m.senderRole === "SUPPORT_TEAM" || m.senderRole === "ADMIN") ? "#f0f6ff" : "#2563eb", color: (m.senderRole === "SUPPORT_TEAM" || m.senderRole === "ADMIN") ? "#111" : "#fff", fontSize: 13, lineHeight: 1.4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>{m.senderName || "You"}</div>
                  {m.messageText}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChatMsg} style={{ display: "flex", gap: 6, padding: "10px 12px", borderTop: "1px solid #ececec", flexShrink: 0 }}>
            <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: "8px 12px", border: "1px solid #d9d9d9", borderRadius: 8, fontSize: 13 }} />
            <button type="submit" disabled={chatSending || !chatMsg.trim()} style={{ padding: "8px 14px", border: 0, borderRadius: 8, background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: chatSending || !chatMsg.trim() ? 0.5 : 1 }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportModule;
