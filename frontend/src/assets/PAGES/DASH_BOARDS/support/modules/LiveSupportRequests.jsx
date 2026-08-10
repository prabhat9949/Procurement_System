import React, { useState } from "react";
import {
  Zap,
  MessageSquare,
  CheckCircle2,
  PhoneCall,
  User,
  Clock,
  AlertTriangle,
  X,
  History,
} from "lucide-react";

const initialLiveSessions = [
  { id: "CHAT-901", user: "Apple Business Direct (Vendor Rep)", type: "Live Chat", topic: "Live RFQ Bidding Submission Issue", priority: "Urgent", queueTime: "1 min ago" },
  { id: "CALL-882", user: "David Chen (Sourcing Executive)", type: "Call Back Request", topic: "PO countersign validation timeout query", priority: "High", queueTime: "3 mins ago" },
  { id: "CHAT-904", user: "Victoria Vance (CFO)", type: "Live Chat", topic: "Wire automated notification customization", priority: "Medium", queueTime: "5 mins ago" }
];

const initialSessionHistory = [
  { sessId: "HIST-701", date: "2026-07-26", user: "Marcus Vance (Inventory)", type: "Live Chat", duration: "12 mins", status: "Completed", agent: "Samantha Sterling" },
  { sessId: "HIST-702", date: "2026-07-25", user: "Robert Vance (Manager)", type: "Call Back", duration: "8 mins", status: "Completed", agent: "Tech Support Team" }
];

const LiveSupportRequests = () => {
  const [sessions, setSessions] = useState(initialLiveSessions);
  const [history, setHistory] = useState(initialSessionHistory);
  const [activeSubTab, setActiveSubTab] = useState("live"); // live, history
  const [activeSession, setActiveSession] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const handleJoinSession = (sess) => {
    setActiveSession(sess);
    setChatMessages([
      { sender: "System", text: `Emergency support session ${sess.id} joined by Samantha Sterling.` },
      { sender: sess.user, text: `Hello, I'm encountering a critical roadblock regarding: ${sess.topic}.` }
    ]);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: "Samantha Sterling (Agent)", text: chatInput }]);
    setChatInput("");
  };

  const handleEndSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    setActiveSession(null);
    // Add to history
    const histItem = {
      sessId: `HIST-${800 + history.length}`,
      date: new Date().toISOString().split("T")[0],
      user: activeSession.user,
      type: activeSession.type,
      duration: "5 mins",
      status: "Completed",
      agent: "Samantha Sterling",
    };
    setHistory([histItem, ...history]);
  };

  return (
    <div className="sup-live-requests-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sup-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sup-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Zap color="#f8b400" size={28} /> Emergency Live Support Queue
          </h1>
          <p className="sup-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Respond to emergency live chat sessions, manage phone callbacks requests, and verify system response time statistics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("live")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "live" ? "700" : "500",
            color: activeSubTab === "live" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "live" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Active Support Queue & Metrics
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "history" ? "700" : "500",
            color: activeSubTab === "history" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "history" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Support Session History
        </button>
      </div>

      {/* 1. Active Queue Tab */}
      {activeSubTab === "live" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Response Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", background: "#f6faf8", border: "1px solid rgba(5,150,105,0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Average Response Speed</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>42 Seconds</h3>
            </div>
            <div style={{ padding: "16px", background: "#fafafa", border: "1px solid #eee", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Support Agents Online</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#111", margin: "2px 0 0" }}>4 Agents</h3>
            </div>
            <div style={{ padding: "16px", background: "#fcf8f2", border: "1px solid rgba(248,180,0,0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Emergency Queue Load</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#d97706", margin: "2px 0 0" }}>3 Active</h3>
            </div>
          </div>

          {/* Sessions Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {sessions.map((chat) => (
              <div key={chat.id} className="sup-card sup-card-gold-glow" style={{ padding: "20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>{chat.id} • {chat.queueTime}</span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "800",
                          background: chat.priority === "Urgent" ? "rgba(220,38,38,0.12)" : "rgba(217,119,6,0.12)",
                          color: chat.priority === "Urgent" ? "#dc2626" : "#d97706",
                          padding: "2px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        {chat.priority}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "17px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>
                      {chat.user}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#555", marginTop: "2px" }}>
                      {chat.type === "Live Chat" ? <MessageSquare size={13} /> : <PhoneCall size={13} />}
                      <span><strong>{chat.type}:</strong> {chat.topic}</span>
                    </div>
                  </div>

                  <button
                    className="sup-btn-primary-sm"
                    onClick={() => handleJoinSession(chat)}
                  >
                    {chat.type === "Live Chat" ? "Join Chat Session" : "Process Callback"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. History Tab */}
      {activeSubTab === "history" && (
        <div className="sup-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="sup-table-container">
            <table className="sup-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Date Logged</th>
                  <th>Requestor User</th>
                  <th>Channel Type</th>
                  <th>Call Duration</th>
                  <th>Closed Agent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.sessId}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{h.sessId}</td>
                    <td>{h.date}</td>
                    <td style={{ fontWeight: "700" }}>{h.user}</td>
                    <td>{h.type}</td>
                    <td>{h.duration}</td>
                    <td>{h.agent}</td>
                    <td>
                      <span className="sup-badge resolved">{h.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chat workspace Modal */}
      {activeSession && (
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
              maxWidth: "500px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "800" }}>LIVE SUPPORT DISPATCH</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  Connected with: {activeSession.user}
                </h3>
              </div>
              <button
                onClick={() => setActiveSession(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat screen */}
            <div style={{ padding: "20px" }}>
              <div style={{ height: "200px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #ececec", padding: "12px", fontSize: "13px", color: "#555", overflowY: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.sender === "System" ? (
                      <p style={{ color: "#d97706", fontWeight: "700", margin: 0 }}>{msg.text}</p>
                    ) : (
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: msg.sender.includes("Agent") ? "#059669" : "#111" }}>{msg.sender}:</strong> {msg.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {activeSession.type === "Live Chat" ? (
                <form onSubmit={handleSendChat} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <input
                    type="text"
                    placeholder="Type reply message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px" }}
                  />
                  <button type="submit" className="sup-btn-primary-sm" style={{ padding: "10px 16px" }}>
                    Send
                  </button>
                </form>
              ) : (
                <div style={{ background: "#fef9c3", border: "1px solid #fef08a", padding: "10px", borderRadius: "8px", fontSize: "13px", color: "#854d0e", marginBottom: "16px" }}>
                  <strong>Callback Instructions:</strong> Please call the user back at their emergency phone number configured in corporate profile records.
                </div>
              )}

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <button
                  className="fin-btn-approve"
                  style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  onClick={() => handleEndSession(activeSession.id)}
                >
                  End & Close Session
                </button>
                <button
                  className="sup-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => setActiveSession(null)}
                >
                  Minimize Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveSupportRequests;
