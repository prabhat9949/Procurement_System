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

const InventorySettings = () => {
  const [settings, setSettings] = useState({
    theme: "Light Gold Theme (Default)",
    language: "English (United States)",
    lowStockAlerts: true,
    dockArrivalAlerts: true,
  });

  const [toastMsg, setToastMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg("Inventory Manager preferences saved successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="inv-settings-container">
      {/* Header */}
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title">
            <Settings color="#f8b400" /> Inventory Manager System Settings
          </h1>
          <p className="inv-page-subtitle">
            Configure theme preferences, low stock alert triggers, language options, and password security.
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
          <div className="inv-card inv-card-gold-glow">
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

            <div className="inv-form-group">
              <label className="inv-form-label">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="inv-form-select"
              >
                <option value="Light Gold Theme (Default)">Light Gold Theme (Loginout.css Matched)</option>
              </select>
            </div>

            <div className="inv-form-group">
              <label className="inv-form-label">System Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="inv-form-select"
              >
                <option value="English (United States)">English (United States)</option>
                <option value="English (United Kingdom)">English (United Kingdom)</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="inv-card">
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
              <Bell size={18} color="#f8b400" /> Low Stock & Freight Triggers
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
                Alert on Critical Low Stock Thresholds
              </span>
              <input
                type="checkbox"
                checked={settings.lowStockAlerts}
                onChange={(e) => setSettings({ ...settings, lowStockAlerts: e.target.checked })}
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
                Alert on Incoming Dock Freight Arrival
              </span>
              <input
                type="checkbox"
                checked={settings.dockArrivalAlerts}
                onChange={(e) => setSettings({ ...settings, dockArrivalAlerts: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#f8b400" }}
              />
            </div>
          </div>

          {/* Password Security */}
          <div className="inv-card" style={{ gridColumn: "span 2" }}>
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
              <div className="inv-form-group">
                <label className="inv-form-label">Current Password</label>
                <input type="password" placeholder="••••••••" className="inv-form-input" />
              </div>

              <div className="inv-form-group">
                <label className="inv-form-label">New Password</label>
                <input type="password" placeholder="••••••••" className="inv-form-input" />
              </div>

              <div className="inv-form-group">
                <label className="inv-form-label">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="inv-form-input" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="inv-btn-primary-sm" style={{ padding: "12px 28px" }}>
              <Save size={16} /> Save Manager Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InventorySettings;
