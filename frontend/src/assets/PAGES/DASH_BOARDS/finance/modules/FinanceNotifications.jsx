import React, { useState } from "react";
import { Bell, CheckCircle2, CreditCard, DollarSign } from "lucide-react";

const initialNotifs = [
  {
    id: 1,
    title: "High-Value Payment Authorization Request",
    message: "PAY-2026-901 ($36,990.00 to Apple Business Direct) submitted for CFO wire clearance.",
    time: "15 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "Invoice Accounts Payable Verification Passed",
    message: "INV-2026-9912 ($54,200.00 Dell Technologies) verified against PO-2026-4412.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 3,
    title: "Department Budget Milestone Alert",
    message: "HR & Operations Department consumed 57.6% of FY2026 allocated budget.",
    time: "1 day ago",
    unread: false,
  },
];

const FinanceNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="fin-notifications-container">
      {/* Header */}
      <div className="fin-page-header">
        <div>
          <h1 className="fin-page-title">
            <Bell color="#f8b400" /> Enterprise Treasury Notifications
          </h1>
          <p className="fin-page-subtitle">
            Real-time alerts on wire transfer requests, Accounts Payable clearances, and budget threshold alerts.
          </p>
        </div>

        <button
          className="fin-btn-primary-sm"
          style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          onClick={markAllRead}
        >
          <CheckCircle2 size={16} /> Mark All Read
        </button>
      </div>

      {/* List */}
      <div className="fin-card">
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

export default FinanceNotifications;
