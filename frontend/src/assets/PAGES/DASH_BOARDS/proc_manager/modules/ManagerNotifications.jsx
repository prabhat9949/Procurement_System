import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  Building,
  Trash2,
} from "lucide-react";

const initialNotifs = [
  {
    id: 1,
    title: "High-Value Purchase Order Awaiting Sign-off",
    message: "PO-2026-4412 ($54,200.00 Dell Servers) submitted by Emily Watson requires your approval.",
    time: "15 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "Vendor SLA Milestone Verified",
    message: "Apple Business Direct fulfilled PO-2026-4401 on-time with 100% compliance.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 3,
    title: "Contract Renewal Alert",
    message: "Datadog SaaS Enterprise Agreement renewal scheduled for Q4.",
    time: "1 day ago",
    unread: false,
  },
];

const ManagerNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="pman-notifications-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Bell color="#f8b400" /> Executive Procurement Notifications
          </h1>
          <p className="pman-page-subtitle">
            Real-time alerts on high-dollar PO approvals, vendor SLA milestones, and organizational updates.
          </p>
        </div>

        <button
          className="pman-btn-primary-sm"
          style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          onClick={markAllRead}
        >
          <CheckCircle2 size={16} /> Mark All Read
        </button>
      </div>

      {/* List */}
      <div className="pman-card">
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
                <ShieldCheck size={20} />
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

export default ManagerNotifications;
