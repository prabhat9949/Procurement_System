import React, { useState } from "react";
import { Bell, CheckCircle2, Ticket, Zap } from "lucide-react";

const initialNotifs = [
  {
    id: 1,
    title: "New High Priority Support Ticket Logged",
    message: "TICK-2026-104 submitted by David Chen regarding PO notification delay.",
    time: "10 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "Incoming Live Support Chat Request",
    message: "Apple Business Direct initialized a live support chat session.",
    time: "45 mins ago",
    unread: true,
  },
  {
    id: 3,
    title: "Support Ticket Resolved & Closed",
    message: "TICK-2026-098 marked as resolved with 5-star customer feedback.",
    time: "Yesterday",
    unread: false,
  },
];

const SupportNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="sup-notifications-container">
      {/* Header */}
      <div className="sup-page-header">
        <div>
          <h1 className="sup-page-title">
            <Bell color="#f8b400" /> Help Desk Notifications & Activity
          </h1>
          <p className="sup-page-subtitle">
            Real-time alerts on new support tickets, incoming live chat sessions, and SLA thresholds.
          </p>
        </div>

        <button
          className="sup-btn-primary-sm"
          style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          onClick={markAllRead}
        >
          <CheckCircle2 size={16} /> Mark All Read
        </button>
      </div>

      {/* List */}
      <div className="sup-card">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {notifs.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "16px",
                borderRadius: "12px",
                background: n.unread ? "rgba(248, 180, 0, 0.08)" : "#f8f9fb",
                border: n.unread ? "1px solid #f8b400" : "1px solid #ececec",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  border: "1px solid #d9d9d9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f8b400",
                  flexShrink: 0,
                }}
              >
                <Bell size={20} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                  <h4 style={{ fontSize: "15px", color: "#111111", fontWeight: "700" }}>{n.title}</h4>
                  <span style={{ fontSize: "12px", color: "#666666" }}>{n.time}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#555555", lineHeight: "1.4" }}>{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportNotifications;
