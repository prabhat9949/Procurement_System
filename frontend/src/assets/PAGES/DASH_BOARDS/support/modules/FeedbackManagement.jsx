import React, { useState } from "react";
import { Star, MessageSquare, ShieldCheck, Heart, AlertCircle, Eye, CheckCircle, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const csatDistributionData = [
  { rating: "5 Stars", count: 280 },
  { rating: "4 Stars", count: 42 },
  { rating: "3 Stars", count: 12 },
  { rating: "2 Stars", count: 5 },
  { rating: "1 Star", count: 3 },
];

const initialFeedbackLogs = [
  { id: "FB-101", user: "David Chen (Sourcing)", type: "User Suggestion", rating: "4 Stars", comment: "Auto-routing RFQ bidding notifications is great, but could we add SMS notifications as well?", status: "Shared with DevOps" },
  { id: "FB-102", user: "Apple Business (Vendor)", type: "Vendor Complaint", rating: "2 Stars", comment: "Invoice validation is too strict. We had to compress a valid PDF twice to make it load.", status: "Under Review" },
  { id: "FB-103", user: "Victoria Vance (CFO)", type: "User Feedback", rating: "5 Stars", comment: "Help desk agent resolved treasury wire template alignment instantly. Fantastic service.", status: "Resolved" }
];

const FeedbackManagement = () => {
  const [logs, setLogs] = useState(initialFeedbackLogs);
  const [activeSubTab, setActiveSubTab] = useState("analytics"); // analytics, logs
  const [selectedLog, setSelectedLog] = useState(null);

  const handleUpdateStatus = (id, nextStatus) => {
    setLogs(logs.map(l => l.id === id ? { ...l, status: nextStatus } : l));
    setSelectedLog(null);
  };

  return (
    <div className="sup-feedback-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sup-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sup-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Star color="#f8b400" size={28} /> Feedback & Complaint Management
          </h1>
          <p className="sup-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Track user and vendor satisfaction, analyze feedback metrics, and log complaints or system improvement suggestions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("analytics")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "analytics" ? "700" : "500",
            color: activeSubTab === "analytics" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "analytics" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          CSAT Feedback Analytics & Ratings
        </button>
        <button
          onClick={() => setActiveSubTab("logs")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "logs" ? "700" : "500",
            color: activeSubTab === "logs" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "logs" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          User & Vendor Feedback Logs ({logs.length})
        </button>
      </div>

      {/* 1. Analytics Tab */}
      {activeSubTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div className="sup-card sup-card-gold-glow" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ color: "#111111", fontSize: "16px", fontWeight: "700", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
              CSAT 5-Star Rating Distribution
            </h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={csatDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                  <XAxis dataKey="rating" stroke="#666666" fontSize={12} />
                  <YAxis stroke="#666666" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f8b400" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="sup-card" style={{ textAlign: "center", padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <Star size={48} color="#f8b400" style={{ marginBottom: "12px" }} />
            <h2 style={{ fontSize: "36px", color: "#111111", fontWeight: "800", margin: 0 }}>98.6%</h2>
            <p style={{ color: "#059669", fontWeight: "700", fontSize: "16px", margin: "4px 0 0" }}>Average Customer Satisfaction Score</p>
            <p style={{ color: "#666666", fontSize: "13px", marginTop: "8px" }}>Based on 342 user responses in FY2026.</p>
          </div>
        </div>
      )}

      {/* 2. Logs Tab */}
      {activeSubTab === "logs" && (
        <div className="sup-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="sup-table-container">
            <table className="sup-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Submitter User</th>
                  <th>Feedback Type</th>
                  <th>User Rating</th>
                  <th>Message Comment Details</th>
                  <th>Response Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{l.id}</td>
                    <td style={{ fontWeight: "700" }}>{l.user}</td>
                    <td style={{ fontSize: "13px", color: "#555" }}>{l.type}</td>
                    <td style={{ fontWeight: "700", color: "#f8b400" }}>{l.rating}</td>
                    <td style={{ fontWeight: "600", color: "#333" }}>{l.comment}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: l.status.includes("Resolved") ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                          color: l.status.includes("Resolved") ? "#059669" : "#d97706",
                        }}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="sup-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                        onClick={() => setSelectedLog(l)}
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
      )}

      {/* Details modal */}
      {selectedLog && (
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
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>FEEDBACK RESPONSE ACTION</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  Feedback ID: {selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <p><strong>Submitter:</strong> {selectedLog.user}</p>
              <p><strong>Feedback Type:</strong> {selectedLog.type}</p>
              <p><strong>Rating:</strong> {selectedLog.rating}</p>
              <p><strong>Details comment:</strong></p>
              <p style={{ background: "#f8f9fb", padding: "12px", border: "1px solid #eee", borderRadius: "8px", color: "#333", fontSize: "13.5px" }}>
                {selectedLog.comment}
              </p>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              {selectedLog.status !== "Resolved" && (
                <button
                  className="fin-btn-approve"
                  style={{ background: "#059669", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  onClick={() => handleUpdateStatus(selectedLog.id, "Resolved")}
                >
                  Mark Resolved
                </button>
              )}
              <button
                className="sup-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedLog(null)}
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

export default FeedbackManagement;
