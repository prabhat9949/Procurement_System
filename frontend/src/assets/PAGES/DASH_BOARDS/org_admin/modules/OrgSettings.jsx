import React, { useState } from "react";
import {
  Settings,
  Bell,
  Lock,
  Globe,
  CheckCircle2,
  Save,
  Sun,
  BarChart2,
} from "lucide-react";

const OrgSettings = () => {
  const [settings, setSettings] = useState({
    theme: "Light Gold Theme (Default)",
    language: "English (United States)",
    biRefresh: "Real-time Power BI Sync",
    orgAlerts: true,
  });

  const [toastMsg, setToastMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg("Organization Admin preferences saved successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="org-settings-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <Settings color="#f8b400" /> Organization Admin Preferences & BI Settings
          </h1>
          <p className="org-page-subtitle">
            Configure theme settings, Power BI / SAP Analytics Cloud refresh frequencies, language, and security.
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
          {/* Theme & BI Engine */}
          <div className="org-card org-card-gold-glow">
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
              <Sun size={18} color="#f8b400" /> Interface & BI Engine Settings
            </h3>

            <div className="org-form-group">
              <label className="org-form-label">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="org-form-select"
              >
                <option value="Light Gold Theme (Default)">Light Gold Theme (Loginout.css Matched)</option>
              </select>
            </div>

            <div className="org-form-group">
              <label className="org-form-label">BI Engine Refresh Rate</label>
              <select
                value={settings.biRefresh}
                onChange={(e) => setSettings({ ...settings, biRefresh: e.target.value })}
                className="org-form-select"
              >
                <option value="Real-time Power BI Sync">Real-time Power BI Sync</option>
                <option value="SAP Analytics Cloud 15-Min Pipeline">SAP Analytics Cloud 15-Min Pipeline</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="org-card">
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
              <Bell size={18} color="#f8b400" /> Executive Alert Triggers
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
                Alert on Department Budget Cap Threshold (&gt; 50%)
              </span>
              <input
                type="checkbox"
                checked={settings.orgAlerts}
                onChange={(e) => setSettings({ ...settings, orgAlerts: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#f8b400" }}
              />
            </div>
          </div>

          {/* Password Security */}
          <div className="org-card" style={{ gridColumn: "span 2" }}>
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
              <Lock size={18} color="#f8b400" /> Executive Credential Security
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="org-form-group">
                <label className="org-form-label">Current Password</label>
                <input type="password" placeholder="••••••••" className="org-form-input" />
              </div>

              <div className="org-form-group">
                <label className="org-form-label">New Password</label>
                <input type="password" placeholder="••••••••" className="org-form-input" />
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="org-form-input" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="org-btn-primary-sm" style={{ padding: "12px 28px" }}>
              <Save size={16} /> Save Admin Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrgSettings;
