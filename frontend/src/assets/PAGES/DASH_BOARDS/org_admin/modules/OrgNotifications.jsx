import React, { useState } from "react";
import { Bell, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const initialNotifs = [
  {
    id: 1,
    title: "Executive Business Intelligence Refresh Complete",
    message: "FY2026 Q3 Power BI dataset refreshed with 100% data integrity.",
    time: "15 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "High-Value Procurement Wire Cleared",
    message: "PAY-2026-904 (₹54,200.00 Dell Technologies) cleared by FedWire.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 3,
    title: "Department Budget Milestone Alert",
    message: "HR & Corporate Ops consumed 57.6% of FY2026 allocated budget cap.",
    time: "1 day ago",
    unread: false,
  },
];

const OrgNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="org-notifications-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <Bell color="#f8b400" /> Executive Organization Notifications
          </h1>
          <p className="org-page-subtitle">
            Real-time notifications across enterprise cost centers, BI refreshes, and treasury alerts.
          </p>
        </div>

        <button
          className="org-btn-primary-sm"
          style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          onClick={markAllRead}
        >
          <CheckCircle2 size={16} /> Mark All Read
        </button>
      </div>

      {/* List */}
      <div className="org-card">
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

export default OrgNotifications;
