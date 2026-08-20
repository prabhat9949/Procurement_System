import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Zap,
  MessageSquare,
  CheckCircle2,
  PhoneCall,
  User,
  Clock,
  AlertTriangle,
  X,
  Send,
  RefreshCw,
  Loader2,
  Filter,
} from "lucide-react";
import { apiGet, apiPost, apiPut } from "../../../../../services/apiClient";

const POLL_INTERVAL = 5000; // poll messages every 5s

const statusColor = (s) => {
  switch (s) {
    case "OPEN":
    case "LIVE_CHAT":
      return { bg: "rgba(220,38,38,0.12)", color: "#dc2626" };
    case "IN_PROGRESS":
      return { bg: "rgba(217,119,6,0.12)", color: "#d97706" };
    case "RESOLVED":
    case "CLOSED":
      return { bg: "rgba(5,150,105,0.12)", color: "#059669" };
    default:
      return { bg: "rgba(100,116,139,0.12)", color: "#64748b" };
  }
};

const LiveSupportRequests = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("live");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const chatEndRef = useRef(null);
  const pollRef = useRef(null);

  const displayName =
    localStorage.getItem("eps_display_name") || "Support Agent";

  /* ---- Load all tickets ---- */
  const loadTickets = useCallback(async () => {
    try {
      const page = await apiGet(
        "/api/support-tickets?page=0&size=200"
      );
      setTickets(page?.content || (Array.isArray(page) ? page : []));
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---- Load messages for a ticket ---- */
  const loadMessages = useCallback(async (ticketId) => {
    setLoadingMessages(true);
    try {
      const msgs = await apiGet(
        `/api/support-tickets/${ticketId}/messages`
      );
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  /* ---- Poll messages for active conversation ---- */
  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
      pollRef.current = setInterval(() => {
        loadMessages(selectedTicket.id);
      }, POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedTicket, loadMessages]);

  /* ---- Auto-scroll chat ---- */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---- Send message ---- */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await apiPost(
        `/api/support-tickets/${selectedTicket.id}/messages`,
        { messageText: chatInput }
      );
      setChatInput("");
      await loadMessages(selectedTicket.id);
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  /* ---- Update ticket status ---- */
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await apiPut(
        `/api/support-tickets/${ticketId}/status?status=${newStatus}`
      );
      await loadTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err.message || "Failed to update ticket status.");
    }
  };

  /* ---- Filtered tickets ---- */
  const liveTickets = tickets.filter(
    (t) =>
      t.status !== "RESOLVED" &&
      t.status !== "CLOSED" &&
      (statusFilter === "all" || t.status === statusFilter)
  );

  const resolvedTickets = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  );

  const openCount = tickets.filter((t) => t.status === "OPEN" || t.status === "LIVE_CHAT").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = resolvedTickets.length;

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "24px",
            fontWeight: "700",
            color: "#111",
            margin: 0,
          }}
        >
          <Zap color="#f8b400" size={28} /> Live Support Queue
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
          Manage live chat conversations, respond to tickets, and track support
          activity — all data from the database.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            padding: "16px",
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.2)",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>
            Open / Live
          </span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#dc2626", margin: "2px 0 0" }}>
            {openCount}
          </h3>
        </div>
        <div
          style={{
            padding: "16px",
            background: "rgba(217,119,6,0.06)",
            border: "1px solid rgba(217,119,6,0.2)",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>
            In Progress
          </span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "2px 0 0" }}>
            {inProgressCount}
          </h3>
        </div>
        <div
          style={{
            padding: "16px",
            background: "rgba(5,150,105,0.06)",
            border: "1px solid rgba(5,150,105,0.2)",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>
            Resolved
          </span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>
            {resolvedCount}
          </h3>
        </div>
        <div
          style={{
            padding: "16px",
            background: "#f8f9fb",
            border: "1px solid #eee",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>
            Total Tickets
          </span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#111", margin: "2px 0 0" }}>
            {tickets.length}
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        {[
          { key: "live", label: "Active Conversations" },
          { key: "history", label: "Resolved Tickets" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: "none",
              border: "none",
              padding: "10px 16px",
              fontSize: "15px",
              fontWeight: activeTab === tab.key ? "700" : "500",
              color: activeTab === tab.key ? "#d97706" : "#666",
              borderBottom: activeTab === tab.key ? "3px solid #f8b400" : "3px solid transparent",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            background: "#fff1f2",
            color: "#be123c",
            borderRadius: "8px",
            marginBottom: "16px",
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={14} style={{ marginRight: 6 }} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "#d97706" }} />
          <p style={{ color: "#666", marginTop: 8 }}>Loading support tickets...</p>
        </div>
      )}

      {/* Active Conversations */}
      {!loading && activeTab === "live" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filter */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Filter size={14} color="#666" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #d9d9d9",
                fontSize: "13px",
              }}
            >
              <option value="all">All Active</option>
              <option value="OPEN">Open</option>
              <option value="LIVE_CHAT">Live Chat</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
            <button
              onClick={loadTickets}
              style={{
                background: "none",
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {liveTickets.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              No active support tickets.
            </div>
          )}

          {liveTickets.map((ticket) => {
            const sc = statusColor(ticket.status);
            return (
              <div
                key={ticket.id}
                style={{
                  padding: "20px",
                  background: "#fff",
                  border: "1px solid #ececec",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>
                        {ticket.ticketNumber || `#${ticket.id}`}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "800",
                          background: sc.bg,
                          color: sc.color,
                          padding: "2px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        {ticket.status}
                      </span>
                      {ticket.category && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            background: "rgba(37,99,235,0.1)",
                            color: "#2563eb",
                            padding: "2px 8px",
                            borderRadius: "12px",
                          }}
                        >
                          {ticket.category}
                        </span>
                      )}
                      {ticket.priority && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            background:
                              ticket.priority === "URGENT"
                                ? "rgba(220,38,38,0.12)"
                                : "rgba(217,119,6,0.12)",
                            color:
                              ticket.priority === "URGENT" ? "#dc2626" : "#d97706",
                            padding: "2px 8px",
                            borderRadius: "12px",
                          }}
                        >
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                    <h3
                      style={{
                        fontSize: "16px",
                        color: "#111",
                        fontWeight: "700",
                        marginTop: "6px",
                      }}
                    >
                      {ticket.subject || "Support Request"}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#555",
                        margin: "2px 0 0",
                      }}
                    >
                      {ticket.description
                        ? ticket.description.substring(0, 120) +
                          (ticket.description.length > 120 ? "..." : "")
                        : "No description"}
                    </p>
                    {ticket.requesterName && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: "#888",
                          marginTop: "6px",
                        }}
                      >
                        <User size={12} />
                        <span>{ticket.requesterName}</span>
                        {ticket.createdAt && (
                          <>
                            <Clock size={12} />
                            <span>
                              {new Date(ticket.createdAt).toLocaleString("en-IN")}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      style={{
                        background: "#f8b400",
                        color: "#111",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MessageSquare size={14} /> Open Chat
                    </button>
                    {ticket.status !== "IN_PROGRESS" && (
                      <button
                        onClick={() =>
                          handleStatusChange(ticket.id, "IN_PROGRESS")
                        }
                        style={{
                          background: "#fff",
                          color: "#d97706",
                          border: "1px solid #d97706",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolved Tickets */}
      {!loading && activeTab === "history" && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #ececec",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8f9fb" }}>
                {["Ticket #", "Subject", "Requester", "Category", "Status", "Created", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#555",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {resolvedTickets.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                    No resolved tickets yet.
                  </td>
                </tr>
              )}
              {resolvedTickets.map((t) => {
                const sc = statusColor(t.status);
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#d97706" }}>
                      {t.ticketNumber || `#${t.id}`}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: "600" }}>
                      {t.subject || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>{t.requesterName || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>{t.category || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: sc.bg,
                          color: sc.color,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontWeight: "700",
                          fontSize: "11px",
                        }}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => setSelectedTicket(t)}
                        style={{
                          background: "none",
                          border: "1px solid #d9d9d9",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Chat Modal */}
      {selectedTicket && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
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
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "80vh",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                background: "#f8f9fb",
                borderBottom: "1px solid #ececec",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>
                  {selectedTicket.ticketNumber || `#${selectedTicket.id}`}
                </span>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#111",
                    margin: "2px 0 0",
                  }}
                >
                  {selectedTicket.subject || "Support Conversation"}
                </h3>
                {selectedTicket.requesterName && (
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    with {selectedTicket.requesterName}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setMessages([]);
                }}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} color="#666" />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                background: "#f8f9fb",
                minHeight: "200px",
                maxHeight: "400px",
              }}
            >
              {loadingMessages && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Loader2
                    size={20}
                    style={{ animation: "spin 1s linear infinite", color: "#d97706" }}
                  />
                </div>
              )}
              {messages.length === 0 && !loadingMessages && (
                <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
                  No messages yet. Start the conversation.
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe =
                  msg.senderName === displayName ||
                  msg.senderRole === "SUPPORT_TEAM";
                return (
                  <div
                    key={msg.id || idx}
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        background: isMe ? "#f8b400" : "#fff",
                        color: isMe ? "#111" : "#333",
                        border: isMe ? "none" : "1px solid #ececec",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      {!isMe && (
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#888",
                            marginBottom: "2px",
                          }}
                        >
                          {msg.senderName || "User"}
                        </div>
                      )}
                      <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                        {msg.messageText || msg.text || ""}
                      </div>
                      {msg.createdAt && (
                        <div
                          style={{
                            fontSize: "10px",
                            color: isMe ? "rgba(0,0,0,0.5)" : "#999",
                            marginTop: "4px",
                            textAlign: "right",
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            {selectedTicket.status !== "RESOLVED" &&
              selectedTicket.status !== "CLOSED" && (
                <form
                  onSubmit={handleSend}
                  style={{
                    display: "flex",
                    gap: "8px",
                    padding: "16px 20px",
                    borderTop: "1px solid #ececec",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #d9d9d9",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !chatInput.trim()}
                    style={{
                      background: "#f8b400",
                      color: "#111",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: sending ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      opacity: sending || !chatInput.trim() ? 0.5 : 1,
                    }}
                  >
                    <Send size={14} /> Send
                  </button>
                </form>
              )}

            {/* Footer Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                padding: "12px 20px",
                borderTop: "1px solid #eee",
              }}
            >
              {selectedTicket.status !== "RESOLVED" &&
                selectedTicket.status !== "CLOSED" && (
                  <button
                    onClick={() =>
                      handleStatusChange(selectedTicket.id, "RESOLVED")
                    }
                    style={{
                      background: "#059669",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <CheckCircle2 size={14} /> Mark Resolved
                  </button>
                )}
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setMessages([]);
                }}
                style={{
                  background: "#f8f9fb",
                  color: "#111",
                  border: "1px solid #d9d9d9",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LiveSupportRequests;
