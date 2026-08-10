import React, { useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Truck } from "lucide-react";

const initialNotifs = [
  {
    id: 1,
    title: "Critical Low Stock Warning",
    message: "SKU-NET-992 (Cisco Switch Module) dropped to 2 units (Reorder threshold: 5). Reorder recommended.",
    time: "10 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "Incoming Freight Arrived at Dock",
    message: "Apple Freight PO-2026-4401 (x10 MacBooks) arrived at Dock Door 4 for physical receiving.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    title: "Quality Inspection Passed",
    message: "QA Team completed inspection for 10x MacBook Pro units. All serial tags verified.",
    time: "3 hours ago",
    unread: false,
  },
];

const InventoryNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="inv-notifications-container">
      {/* Header */}
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title">
            <Bell color="#f8b400" /> Warehouse & Stock Notifications
          </h1>
          <p className="inv-page-subtitle">
            Real-time alerts on low stock thresholds, freight arrivals, and quality inspection updates.
          </p>
        </div>

        <button
          className="inv-btn-primary-sm"
          style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          onClick={markAllRead}
        >
          <CheckCircle2 size={16} /> Mark All Read
        </button>
      </div>

      {/* List */}
      <div className="inv-card">
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

export default InventoryNotifications;
