import React, { useState } from "react";
import {
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiPost } from "../../../../../services/apiClient";

const AdminChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/api/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      triggerToast("Password changed successfully. Use your new password on the next login.");
    } catch (err) {
      setError(err.message || "Could not change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sadmin-settings-container" style={{ padding: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.tone === "err" ? "#dc2626" : "#111", color: "#fff", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 1200, fontWeight: "700", fontSize: "14px", borderLeft: `4px solid ${toast.tone === "err" ? "#fff" : "#f8b400"}` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111", margin: 0 }}>
            <Lock color="#f8b400" size={28} /> Change Password
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Securely update your admin password. Changes take effect immediately.
          </p>
        </div>
      </div>

      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "24px", maxWidth: "520px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
          <Lock size={18} color="#f8b400" /> Update Your Password
        </h3>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13.5px", fontWeight: "600" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            { key: "current", label: "Current Password", placeholder: "Enter your current password" },
            { key: "next", label: "New Password", placeholder: "Minimum 8 characters" },
            { key: "confirm", label: "Confirm New Password", placeholder: "Repeat the new password" },
          ].map((f) => (
            <div className="sadmin-form-group" key={f.key}>
              <label className="sadmin-form-label">{f.label} *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw[f.key] ? "text" : "password"}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="sadmin-form-input"
                  style={{ paddingRight: "44px" }}
                  autoComplete={f.key === "current" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => ({ ...s, [f.key]: !s[f.key] }))}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#888", cursor: "pointer" }}
                >
                  {showPw[f.key] ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          ))}

          <button type="submit" className="sadmin-btn-primary-sm" style={{ justifyContent: "center", padding: "12px" }} disabled={saving}>
            {saving ? <><Loader2 size={16} className="login-spin" /> Updating password...</> : <><Lock size={16} /> Update Password</>}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px", color: "#888", fontSize: "12.5px" }}>
          <CheckCircle2 size={14} color="#059669" /> Passwords are hashed with BCrypt on the backend. Never stored in plaintext.
        </div>
      </div>
    </div>
  );
};

export default AdminChangePassword;