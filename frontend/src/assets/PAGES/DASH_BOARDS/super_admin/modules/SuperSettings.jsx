import React, { useState } from "react";
import {
  Settings,
  Bell,
  Lock,
  Globe,
  CheckCircle2,
  Save,
  Sun,
  ShieldCheck,
} from "lucide-react";

const SuperSettings = () => {
  const [settings, setSettings] = useState({
    theme: "Light Gold Theme (Default)",
    language: "English (United States)",
    securityAlerts: true,
    cloudHealthAlerts: true,
  });

  const [toastMsg, setToastMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg("Super Admin Root preferences saved successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="sadmin-settings-container">
      {/* Header */}
      <div className="sadmin-page-header">
        <div>
          <h1 className="sadmin-page-title">
            <Settings color="#f8b400" /> Root System Preferences & Security Settings
          </h1>
          <p className="sadmin-page-subtitle">
            Configure theme settings, Azure Sentinel alert triggers, language, and master root security.
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
          <div className="sadmin-card sadmin-card-gold-glow">
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
              <Sun size={18} color="#f8b400" /> Interface & Theme Engine Settings
            </h3>

            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="sadmin-form-select"
              >
                <option value="Light Gold Theme (Default)">Light Gold Theme (Loginout.css Matched)</option>
              </select>
            </div>

            <div className="sadmin-form-group">
              <label className="sadmin-form-label">System Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="sadmin-form-select"
              >
                <option value="English (United States)">English (United States)</option>
                <option value="English (United Kingdom)">English (United Kingdom)</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="sadmin-card">
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
              <Bell size={18} color="#f8b400" /> Cloud Security & Telemetry Triggers
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
                Alert on Azure Sentinel Security Events & Anomalies
              </span>
              <input
                type="checkbox"
                checked={settings.securityAlerts}
                onChange={(e) => setSettings({ ...settings, securityAlerts: e.target.checked })}
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
                Alert on AWS Cloud Infrastructure SLA Latency (&gt; 50ms)
              </span>
              <input
                type="checkbox"
                checked={settings.cloudHealthAlerts}
                onChange={(e) => setSettings({ ...settings, cloudHealthAlerts: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#f8b400" }}
              />
            </div>
          </div>

          {/* Password Security */}
          <div className="sadmin-card" style={{ gridColumn: "span 2" }}>
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
              <Lock size={18} color="#f8b400" /> Master Root Security & Password Update
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="sadmin-form-group">
                <label className="sadmin-form-label">Current Master Password</label>
                <input type="password" placeholder="••••••••" className="sadmin-form-input" />
              </div>

              <div className="sadmin-form-group">
                <label className="sadmin-form-label">New Master Password</label>
                <input type="password" placeholder="••••••••" className="sadmin-form-input" />
              </div>

              <div className="sadmin-form-group">
                <label className="sadmin-form-label">Confirm New Master Password</label>
                <input type="password" placeholder="••••••••" className="sadmin-form-input" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="sadmin-btn-primary-sm" style={{ padding: "12px 28px" }}>
              <Save size={16} /> Save Root Master Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SuperSettings;
