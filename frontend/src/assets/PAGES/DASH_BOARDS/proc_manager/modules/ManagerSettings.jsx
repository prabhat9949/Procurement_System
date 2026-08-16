import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Lock,
  CheckCircle2,
  Save,
  Loader2,
  WifiOff,
  KeyRound,
} from "lucide-react";
import { apiGet, apiPut, apiPost } from "../../../../../services/apiClient";
import { hasPermission } from "../../../../../utils/permissions";

const ManagerSettings = () => {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const canChangePassword = hasPermission("CHANGE_PASSWORD");

  const triggerToast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 4000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const page = await apiGet("/api/notification-preferences?page=0&size=10");
        const my = page?.content?.[0] || null;
        setPrefs(
          my || {
            emailEnabled: true,
            smsEnabled: false,
            inAppEnabled: true,
            approvalNotifications: true,
            paymentNotifications: true,
            rfqNotifications: true,
          }
        );
      } catch (err) {
        setError(err.message || "Unable to load preferences.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const savePrefs = async () => {
    if (!prefs?.userId) {
      triggerToast("No preference record found for your account yet.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiPut(`/api/notification-preferences/${prefs.userId}`, {
        emailEnabled: prefs.emailEnabled,
        smsEnabled: prefs.smsEnabled,
        inAppEnabled: prefs.inAppEnabled,
        approvalNotifications: prefs.approvalNotifications,
        paymentNotifications: prefs.paymentNotifications,
        rfqNotifications: prefs.rfqNotifications,
      });
      triggerToast("Notification preferences saved.");
    } catch (err) {
      setError(err.message || "Unable to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) {
      triggerToast("New password and confirmation do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiPost("/api/auth/change-password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      triggerToast("Password changed successfully.");
    } catch (err) {
      setError(err.message || "Unable to change password.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (key) => setPrefs((p) => (p ? { ...p, [key]: !p[key] } : p));

  const switchRow = (label, desc, key) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #ececec" }}>
      <div>
        <p style={{ fontWeight: 700, color: "#111", fontSize: "14px", margin: 0 }}>{label}</p>
        <p style={{ fontSize: "12.5px", color: "#888", margin: "2px 0 0" }}>{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => toggle(key)}
        style={{
          width: "44px",
          height: "24px",
          borderRadius: "12px",
          border: "none",
          background: prefs?.[key] ? "#059669" : "#d9d9d9",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: prefs?.[key] ? "24px" : "3px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d7dce3",
    borderRadius: "9px",
    fontSize: "13.5px",
    background: "#fff",
    outline: "none",
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "12px", color: "#666" }}>
        <Loader2 size={22} className="login-spin" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="pman-settings-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Settings color="#f8b400" /> Settings & Preferences
          </h1>
          <p className="pman-page-subtitle">
            Notification preferences and security settings — persisted to the database.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", fontWeight: 600, border: "1px solid #a7f3d0" }}>
          <CheckCircle2 size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> {toastMsg}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Notifications */}
        <div className="pman-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "17px", color: "#111", fontWeight: 700, marginBottom: "4px" }}>
            <Bell size={18} style={{ verticalAlign: "middle", marginRight: 8, color: "#f8b400" }} />
            Notification Preferences
          </h3>
          <p style={{ fontSize: "12.5px", color: "#888", marginBottom: "12px" }}>
            Control how workflow notifications reach you.
          </p>
          <div style={{ marginTop: "12px" }}>
            {switchRow("Email Notifications", "Receive workflow notifications by email", "emailEnabled")}
            {switchRow("SMS Notifications", "Receive urgent alerts by SMS", "smsEnabled")}
            {switchRow("In-App Notifications", "Show notifications inside the dashboard", "inAppEnabled")}
            {switchRow("Approval Notifications", "Approval task assignments and decisions", "approvalNotifications")}
            {switchRow("PO / RFQ Notifications", "RFQ, quotation and purchase order events", "rfqNotifications")}
            {switchRow("Payment Notifications", "Invoice, match and payment status changes", "paymentNotifications")}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
            <button className="pman-btn-primary-sm" onClick={savePrefs} disabled={saving}>
              {saving ? <Loader2 size={15} className="login-spin" /> : <Save size={15} />} Save Preferences
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="pman-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "17px", color: "#111", fontWeight: 700, marginBottom: "4px" }}>
            <KeyRound size={18} style={{ verticalAlign: "middle", marginRight: 8, color: "#f8b400" }} />
            Change Password
          </h3>
          <p style={{ fontSize: "12.5px", color: "#888", marginBottom: "16px" }}>
            {canChangePassword
              ? "Update your account password. You will need to sign in again after changing it."
              : "You do not have the CHANGE_PASSWORD permission. Contact an administrator."}
          </p>

          {canChangePassword ? (
            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="pman-form-group">
                <label className="pman-form-label">Current Password *</label>
                <input
                  type="password"
                  className="pman-form-input"
                  value={pw.currentPassword}
                  onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="pman-form-group">
                <label className="pman-form-label">New Password *</label>
                <input
                  type="password"
                  className="pman-form-input"
                  value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="pman-form-group">
                <label className="pman-form-label">Confirm New Password *</label>
                <input
                  type="password"
                  className="pman-form-input"
                  value={pw.confirmPassword}
                  onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="submit" className="pman-btn-primary-sm" disabled={busy}>
                  {busy ? <Loader2 size={15} className="login-spin" /> : <Lock size={15} />} Change Password
                </button>
              </div>
            </form>
          ) : (
            <div style={{ background: "#f8f9fb", border: "1px solid #ececec", borderRadius: "10px", padding: "16px", color: "#888", fontSize: "13.5px" }}>
              <Lock size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />
              Password change is restricted. Your administrator can update your credentials.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerSettings;
