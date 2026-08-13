import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  FileText,
  ShieldAlert,
  CheckCheck,
} from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    title: "Requisition Approved by Department Head",
    message: "REQ-2026-8894 (Figma Enterprise License) was approved by Sarah Jenkins.",
    time: "10 minutes ago",
    type: "approval",
    read: false,
  },
  {
    id: 2,
    title: "Sourcing Action Required for REQ-2026-8921",
    message: "David Chen added vendor quotation options for MacBook Pro M3 Max.",
    time: "2 hours ago",
    type: "procurement",
    read: false,
  },
  {
    id: 3,
    title: "Purchase Order Issued (PO-2026-8850)",
    message: "Formal PO generated and sent to Herman Miller Direct.",
    time: "1 day ago",
    type: "procurement",
    read: true,
  },
  {
    id: 4,
    title: "Quarterly Budget Policy Update",
    message: "IT Hardware spending limit policy updated for H2 2026.",
    time: "3 days ago",
    type: "system",
    read: true,
  },
];

const NotificationsModule = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterType, setFilterType] = useState("all");

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter(
    (n) => filterType === "all" || n.type === filterType
  );

  return (
    <div className="emp-notifications-container">
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <Bell color="#f8b400" /> Notifications & Activity Stream
          </h1>
          <p className="emp-page-subtitle">
            Stay updated with real-time requisition approvals, PO updates, and system alerts.
          </p>
        </div>
        <button
          className="emp-btn-primary-sm"
          style={{
            background: "#f8f9fb",
            color: "#111111",
            border: "1px solid #d9d9d9",
          }}
          onClick={markAllAsRead}
        >
          <CheckCheck size={16} /> Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="emp-card" style={{ marginBottom: "24px", padding: "16px 24px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          {["all", "approval", "procurement", "system"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: "8px 18px",
                borderRadius: "10px",
                border: "none",
                background: filterType === type ? "#f8b400" : "#f8f9fb",
                color: filterType === type ? "#000000" : "#555555",
                fontWeight: filterType === type ? "700" : "600",
                fontSize: "13px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filtered.map((n) => (
          <div
            key={n.id}
            className="emp-card"
            style={{
              padding: "20px",
              borderLeft: !n.read ? "4px solid #f8b400" : "1px solid #ececec",
              background: !n.read ? "rgba(248, 180, 0, 0.05)" : "#ffffff",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "rgba(248, 180, 0, 0.12)",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {n.type === "approval" && <CheckCircle2 size={22} />}
                {n.type === "procurement" && <FileText size={22} />}
                {n.type === "system" && <ShieldAlert size={22} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h4 style={{ color: "#111111", fontSize: "15px", fontWeight: "700" }}>{n.title}</h4>
                  <span style={{ fontSize: "12px", color: "#666666" }}>{n.time}</span>
                </div>
                <p style={{ color: "#555555", fontSize: "13px", marginTop: "4px" }}>{n.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsModule;
