import React, { useState } from "react";
import {
  Settings,
  Bell,
  Lock,
  Globe,
  CheckCircle2,
  Save,
  Sun,
} from "lucide-react";

const VendorSettings = () => {
  const [settings, setSettings] = useState({
    theme: "Light Gold Theme (Default)",
    language: "English (United States)",
    rfqAlerts: true,
    poAlerts: true,
    paymentAlerts: true,
  });

  const [toastMsg, setToastMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg("Supplier Portal settings saved successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="vnd-settings-container">
      {/* Header */}
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title">
            <Settings color="#f8b400" /> Supplier Portal Settings & Security
          </h1>
          <p className="vnd-page-subtitle">
            Configure theme preferences, RFQ notification triggers, language options, and password security.
          </p>
        </div>
      </div>

      {toastMsg && (
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
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Theme & Language */}
          <div className="vnd-card vnd-card-gold-glow">
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
              <Sun size={18} color="#f8b400" /> Interface & Theme Settings
            </h3>

            <div className="vnd-form-group">
              <label className="vnd-form-label">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="vnd-form-select"
              >
                <option value="Light Gold Theme (Default)">Light Gold Theme (Loginout.css Matched)</option>
              </select>
            </div>

            <div className="vnd-form-group">
              <label className="vnd-form-label">System Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="vnd-form-select"
              >
                <option value="English (United States)">English (United States)</option>
                <option value="English (United Kingdom)">English (United Kingdom)</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="vnd-card">
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
              <Bell size={18} color="#f8b400" /> Notification Alert Preferences
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px",
                background: "#f8f9fb",
                borderRadius: "10px",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#111", fontWeight: "600" }}>
                Email Alert on New RFQ Bidding Invitation
              </span>
              <input
                type="checkbox"
                checked={settings.rfqAlerts}
                onChange={(e) => setSettings({ ...settings, rfqAlerts: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#f8b400" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px",
                background: "#f8f9fb",
                borderRadius: "10px",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#111", fontWeight: "600" }}>
                Alert on Purchase Order Award
              </span>
              <input
                type="checkbox"
                checked={settings.poAlerts}
                onChange={(e) => setSettings({ ...settings, poAlerts: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#f8b400" }}
              />
            </div>
          </div>

          {/* Password Security */}
          <div className="vnd-card" style={{ gridColumn: "span 2" }}>
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
              <Lock size={18} color="#f8b400" /> Account Security & Password Update
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="vnd-form-group">
                <label className="vnd-form-label">Current Password</label>
                <input type="password" placeholder="••••••••" className="vnd-form-input" />
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">New Password</label>
                <input type="password" placeholder="••••••••" className="vnd-form-input" />
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="vnd-form-input" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="vnd-btn-primary-sm" style={{ padding: "12px 28px" }}>
              <Save size={16} /> Save Supplier Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VendorSettings;
