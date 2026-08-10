import React, { useState } from "react";
import { Bell, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const initialNotifs = [
  {
    id: 1,
    title: "Azure Sentinel Threat Intelligence Scan Complete",
    message: "Global firewall baseline verified with zero security anomalies.",
    time: "5 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "AWS Cloud Infrastructure Auto-Scale Triggered",
    message: "US-East region expanded capacity to support Peak FY2026 Q3 transaction volume.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    title: "Master Financial Ledger Backup Certified",
    message: "$12.4M treasury disbursement ledger backed up to encrypted AWS S3 vault.",
    time: "Yesterday",
    unread: false,
  },
];

const SuperNotificationsCenter = () => {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="sadmin-notifications-container">
      {/* Header */}
      <div className="sadmin-page-header">
        <div>
          <h1 className="sadmin-page-title">
            <Bell color="#f8b400" /> Master Cloud Notifications & Alert Center
          </h1>
          <p className="sadmin-page-subtitle">
            Real-time alerts across Azure/AWS cloud infrastructure, zero-trust security events, and treasury ledgers.
          </p>
        </div>

        <button
          className="sadmin-btn-primary-sm"
          style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          onClick={markAllRead}
        >
          <CheckCircle2 size={16} /> Mark All Read
        </button>
      </div>

      {/* List */}
      <div className="sadmin-card">
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

export default SuperNotificationsCenter;
