import React, { useState } from "react";
import { Bell, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";

const initialNotifs = [
  {
    id: 1,
    title: "Audit Verification Passed",
    message: "PO-2026-4401 ($36,990.00 Apple Workstations) verified 100% compliant with 3-way match.",
    time: "20 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "Scheduled Quarterly Risk Audit",
    message: "Q3 2026 Sourcing Risk Assessment audit scheduled for August 1, 2026.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    title: "Vendor Compliance Rating Updated",
    message: "Apple Business Direct compliance scorecard verified at 99.2% Tier 1 Preferred.",
    time: "Yesterday",
    unread: false,
  },
];

const AuditorNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="aud-notifications-container">
      {/* Header */}
      <div className="aud-page-header">
        <div>
          <h1 className="aud-page-title">
            <Bell color="#f8b400" /> Compliance & Audit Notifications
          </h1>
          <p className="aud-page-subtitle">
            Real-time alerts on audit verification results, scheduled risk reviews, and policy compliance.
          </p>
        </div>

        <button
          className="aud-btn-primary-sm"
          style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          onClick={markAllRead}
        >
          <CheckCircle2 size={16} /> Mark All Read
        </button>
      </div>

      {/* List */}
      <div className="aud-card">
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

export default AuditorNotifications;
