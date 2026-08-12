import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Send,
  ShoppingBag,
  CreditCard,
} from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    title: "New RFQ Bidding Invitation",
    message: "Enterprise Global Inc. invited you to bid on RFQ-2026-901 (MacBook Pro Workstations x10).",
    time: "30 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "Purchase Order Awarded",
    message: "Congratulations! Enterprise Global Inc. awarded PO-2026-4401 ($36,990.00) to Apple Business Direct.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 3,
    title: "Commercial Wire Transfer Remittance",
    message: "FedWire payment TX-2026-9901 ($7,995.00) cleared & credited to your corporate bank account.",
    time: "Yesterday",
    unread: false,
  },
];

const VendorNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifications);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="vnd-notifications-container">
      {/* Header */}
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title">
            <Bell color="#f8b400" /> Supplier Notifications Stream
          </h1>
          <p className="vnd-page-subtitle">
            Real-time alerts on RFQ bidding invitations, PO awards, and wire transfer remittances.
          </p>
        </div>

        <button
          className="vnd-btn-primary-sm"
          style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          onClick={markAllRead}
        >
          <CheckCircle2 size={16} /> Mark All Read
        </button>
      </div>

      {/* List */}
      <div className="vnd-card">
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

export default VendorNotifications;
