import React, { useState } from "react";
import {
  Settings,
  Sun,
  Bell,
  Lock,
  CheckCircle2,
  Save,
} from "lucide-react";

const SettingsModule = () => {
  const [notifications, setNotifications] = useState({
    emailApproval: true,
    emailPO: true,
    pushStatus: true,
    weeklyDigest: false,
  });

  const [toastMessage, setToastMessage] = useState("");

  const handleToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setToastMessage("Settings saved successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="emp-settings-container">
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <Settings color="#f8b400" /> Platform & User Preferences
          </h1>
          <p className="emp-page-subtitle">
            Customize your portal appearance, notification thresholds, and security settings.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            background: "rgba(5, 150, 105, 0.12)",
            border: "1px solid #059669",
            color: "#059669",
            padding: "12px 20px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Theme & Display */}
          <div className="emp-card emp-card-gold-glow">
            <h3
              style={{
                color: "#111111",
                fontSize: "17px",
                fontWeight: "700",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Sun size={18} color="#f8b400" /> Interface Theme & Display
            </h3>

            <div className="emp-form-group">
              <label className="emp-form-label">Theme Mode</label>
              <select className="emp-form-select" defaultValue="light-gold">
                <option value="light-gold">Light Gold Theme (Default)</option>
              </select>
            </div>

            <div className="emp-form-group">
              <label className="emp-form-label">Dashboard Compact Density</label>
              <select className="emp-form-select" defaultValue="comfortable">
                <option value="comfortable">Comfortable (Standard spacing)</option>
                <option value="compact">Compact (High data density)</option>
              </select>
            </div>

            <div className="emp-form-group">
              <label className="emp-form-label">Default Currency Format</label>
              <select className="emp-form-select" defaultValue="INR">
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
              </select>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="emp-card">
            <h3
              style={{
                color: "#111111",
                fontSize: "17px",
                fontWeight: "700",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Bell size={18} color="#f8b400" /> Notification Channels & Triggers
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#f8f9fb",
                  borderRadius: "10px",
                  border: "1px solid #ececec",
                }}
              >
                <div>
                  <p style={{ color: "#111111", fontSize: "14px", fontWeight: "600" }}>
                    Email Approval Notifications
                  </p>
                  <p style={{ color: "#666666", fontSize: "12px" }}>
                    Receive instant emails when a requisition is approved or rejected
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailApproval}
                  onChange={() => handleToggle("emailApproval")}
                  style={{ width: "20px", height: "20px", accentColor: "#f8b400", cursor: "pointer" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#f8f9fb",
                  borderRadius: "10px",
                  border: "1px solid #ececec",
                }}
              >
                <div>
                  <p style={{ color: "#111111", fontSize: "14px", fontWeight: "600" }}>
                    PO Generation Alerts
                  </p>
                  <p style={{ color: "#666666", fontSize: "12px" }}>
                    Get notified when formal purchase orders are issued to vendors
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailPO}
                  onChange={() => handleToggle("emailPO")}
                  style={{ width: "20px", height: "20px", accentColor: "#f8b400", cursor: "pointer" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#f8f9fb",
                  borderRadius: "10px",
                  border: "1px solid #ececec",
                }}
              >
                <div>
                  <p style={{ color: "#111111", fontSize: "14px", fontWeight: "600" }}>
                    Browser In-App Popups
                  </p>
                  <p style={{ color: "#666666", fontSize: "12px" }}>
                    Show live status changes in the top navbar bell icon
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.pushStatus}
                  onChange={() => handleToggle("pushStatus")}
                  style={{ width: "20px", height: "20px", accentColor: "#f8b400", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>

          {/* Password & Security — managed by Admin only */}
          <div className="emp-card" style={{ gridColumn: "span 2" }}>
            <h3
              style={{
                color: "#111111",
                fontSize: "17px",
                fontWeight: "700",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Lock size={18} color="#f8b400" /> Password & Security
            </h3>
            <p style={{ color: "#555555", fontSize: "13px", margin: 0 }}>
              Password changes are managed by your system administrator only. Contact the Admin / HR team to reset your password.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsModule;
