import React, { useState } from "react";
import {
  Settings,
  Bell,
  Lock,
  Globe,
  Shield,
  CheckCircle2,
  Save,
  Sun,
} from "lucide-react";

const ExecSettings = () => {
  const [settings, setSettings] = useState({
    theme: "Light Gold Theme (Default)",
    language: "English (United States)",
    emailQuoteAlerts: true,
    emailPoAlerts: true,
    smsUrgentAlerts: false,
    auditPrivacy: "Strict Enterprise Encryption",
  });

  const [toastMsg, setToastMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg("Procurement Executive preferences updated successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="pe-settings-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <Settings color="#f8b400" /> Executive Settings & Security Controls
          </h1>
          <p className="pe-page-subtitle">
            Configure theme preferences, vendor notification triggers, language options, and password security.
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
          <div className="pe-card pe-card-gold-glow">
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
              <Sun size={18} color="#f8b400" /> Theme & Interface Settings
            </h3>

            <div className="pe-form-group">
              <label className="pe-form-label">Active Dashboard Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="pe-form-select"
              >
                <option value="Light Gold Theme (Default)">Light Gold Theme (Loginout.css Matched)</option>
              </select>
            </div>

            <div className="pe-form-group">
              <label className="pe-form-label">System Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="pe-form-select"
              >
                <option value="English (United States)">English (United States)</option>
                <option value="English (United Kingdom)">English (United Kingdom)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
              </select>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="pe-card">
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
              <Bell size={18} color="#f8b400" /> Notification Alert Triggers
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
                Instant Email on Vendor Quotation Submission
              </span>
              <input
                type="checkbox"
                checked={settings.emailQuoteAlerts}
                onChange={(e) => setSettings({ ...settings, emailQuoteAlerts: e.target.checked })}
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
                Email Confirmation on PO Acceptance
              </span>
              <input
                type="checkbox"
                checked={settings.emailPoAlerts}
                onChange={(e) => setSettings({ ...settings, emailPoAlerts: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#f8b400" }}
              />
            </div>
          </div>

          {/* Security & Password */}
          <div className="pe-card" style={{ gridColumn: "span 2" }}>
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
              <Lock size={18} color="#f8b400" /> Executive Credentials & Password Update
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="pe-form-group">
                <label className="pe-form-label">Current Password</label>
                <input type="password" placeholder="••••••••" className="pe-form-input" />
              </div>

              <div className="pe-form-group">
                <label className="pe-form-label">New Password</label>
                <input type="password" placeholder="••••••••" className="pe-form-input" />
              </div>

              <div className="pe-form-group">
                <label className="pe-form-label">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="pe-form-input" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="pe-btn-primary-sm" style={{ padding: "12px 28px" }}>
              <Save size={16} /> Save Executive Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExecSettings;
