import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Send,
  ShoppingBag,
  FileCheck2,
  Clock,
  Trash2,
} from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    title: "New Commercial Bid Submitted",
    message: "Apple Business Direct submitted a quote of $36,990.00 for RFQ-2026-901.",
    time: "10 mins ago",
    type: "quote",
    unread: true,
  },
  {
    id: 2,
    title: "Purchase Order Confirmed by Vendor",
    message: "PO-2026-4401 has been confirmed by Apple Business Direct. Shipment scheduled.",
    time: "1 hour ago",
    type: "po",
    unread: true,
  },
  {
    id: 3,
    title: "New Requisition Approved by Manager",
    message: "Sarah Jenkins approved REQ-2026-8972 (Cisco Switches $6,200.00). Ready for RFQ.",
    time: "3 hours ago",
    type: "req",
    unread: false,
  },
  {
    id: 4,
    title: "RFQ Bidding Deadline Warning",
    message: "RFQ-2026-898 (Datadog APM Renewal) bidding closes tomorrow at 05:00 PM.",
    time: "Yesterday",
    type: "rfq",
    unread: false,
  },
];

const ExecNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifications);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifs([]);
  };

  return (
    <div className="pe-notifications-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <Bell color="#f8b400" /> Sourcing Activity & Notification Stream
          </h1>
          <p className="pe-page-subtitle">
            Real-time alerts on vendor quotation submissions, PO confirmations, and RFQ deadlines.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="pe-btn-primary-sm"
            style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
            onClick={markAllRead}
          >
            <CheckCircle2 size={16} /> Mark All Read
          </button>
          <button
            className="pe-btn-primary-sm"
            style={{ background: "#f8f9fb", color: "#dc2626", border: "1px solid #dc2626" }}
            onClick={clearAll}
          >
            <Trash2 size={16} /> Clear Stream
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="pe-card">
        {notifs.length > 0 ? (
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
                  {n.type === "quote" && <FileCheck2 size={20} />}
                  {n.type === "po" && <ShoppingBag size={20} />}
                  {n.type === "req" && <CheckCircle2 size={20} />}
                  {n.type === "rfq" && <Send size={20} />}
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
        ) : (
          <div style={{ textAlign: "center", padding: "48px" }}>
            <Bell size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>Stream Clear!</h3>
            <p style={{ color: "#666666", fontSize: "14px", marginTop: "4px" }}>
              No unread procurement notifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecNotifications;
