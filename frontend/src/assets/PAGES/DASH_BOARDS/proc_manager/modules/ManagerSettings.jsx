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

const ManagerSettings = () => {
  const [settings, setSettings] = useState({
    theme: "Light Gold Theme (Default)",
    language: "English (United States)",
    highPoAlerts: true,
    vendorAlerts: true,
  });

  const [toastMsg, setToastMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg("Procurement Manager preferences updated successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="pman-settings-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Settings color="#f8b400" /> Procurement Manager Settings
          </h1>
          <p className="pman-page-subtitle">
            Configure theme settings, high-dollar PO alerts, language preferences, and password security.
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
          {/* Theme & Display */}
          <div className="pman-card pman-card-gold-glow">
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
              <Sun size={18} color="#f8b400" /> Theme & Interface Preferences
            </h3>

            <div className="pman-form-group">
              <label className="pman-form-label">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="pman-form-select"
              >
                <option value="Light Gold Theme (Default)">Light Gold Theme (Loginout.css Matched)</option>
              </select>
            </div>

            <div className="pman-form-group">
              <label className="pman-form-label">Language Settings</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="pman-form-select"
              >
                <option value="English (United States)">English (United States)</option>
                <option value="English (United Kingdom)">English (United Kingdom)</option>
                <option value="Spanish">Spanish (Español)</option>
              </select>
            </div>
          </div>

          {/* Notification Alerts */}
          <div className="pman-card">
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
              <Bell size={18} color="#f8b400" /> Executive Notification Triggers
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
                Alert on High-Value POs (&gt; $25k)
              </span>
              <input
                type="checkbox"
                checked={settings.highPoAlerts}
                onChange={(e) => setSettings({ ...settings, highPoAlerts: e.target.checked })}
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
                Alert on Supplier SLA & Contract Renewals
              </span>
              <input
                type="checkbox"
                checked={settings.vendorAlerts}
                onChange={(e) => setSettings({ ...settings, vendorAlerts: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#f8b400" }}
              />
            </div>
          </div>

          {/* Password Security */}
          <div className="pman-card" style={{ gridColumn: "span 2" }}>
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
              <Lock size={18} color="#f8b400" /> Password & Credential Security
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="pman-form-group">
                <label className="pman-form-label">Current Password</label>
                <input type="password" placeholder="••••••••" className="pman-form-input" />
              </div>

              <div className="pman-form-group">
                <label className="pman-form-label">New Password</label>
                <input type="password" placeholder="••••••••" className="pman-form-input" />
              </div>

              <div className="pman-form-group">
                <label className="pman-form-label">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="pman-form-input" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="pman-btn-primary-sm" style={{ padding: "12px 28px" }}>
              <Save size={16} /> Save Manager Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManagerSettings;
