import React, { useState, useEffect } from "react";
import {
  Settings,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  KeyRound,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatDateIN } from "../../../../../utils/format";
import { hasPermission } from "../../../../../utils/permissions";

// Self-service password change is controlled by the CHANGE_PASSWORD permission
// (Admin-configurable). The backend enforces the same rule on the API.
const canChangePassword = hasPermission("CHANGE_PASSWORD");

const SuperSettings = () => {
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // /api/auth/me gives the id + role; the user account API has the full profile.
        const me = await apiGet("/api/auth/me");
        if (me?.userId) {
          const full = await apiGet(`/api/users/${me.userId}`);
          setProfile({ ...me, ...full });
        } else {
          setProfile(me);
        }
      } catch (err) {
        setProfileError(err.message || "Could not load profile.");
      }
    };
    load();
  }, []);

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

  const displayName = localStorage.getItem("eps_display_name") || profile?.displayName || "Administrator";

  const infoRow = (Icon, label, value) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
      <Icon size={16} color="#d97706" style={{ marginTop: "2px" }} />
      <div>
        <div style={{ fontSize: "11.5px", color: "#888", textTransform: "uppercase", fontWeight: "700" }}>{label}</div>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>{value || "—"}</div>
      </div>
    </div>
  );

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
            <Settings color="#f8b400" size={28} /> Account & Security
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Your profile comes from the database; password changes go through the secure backend flow.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Profile */}
        <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            <UserIcon size={18} color="#f8b400" /> Administrator Profile
          </h3>
          {profileError ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#dc2626", fontSize: "13.5px" }}>
              <AlertCircle size={16} /> {profileError}
            </div>
          ) : !profile ? (
            <LoadingRow />
          ) : (
            <>
              {infoRow(UserIcon, "Display Name", displayName)}
              {infoRow(KeyRound, "Username", profile.username)}
              {infoRow(ShieldCheck, "Role", `${profile.roleName} (${profile.roleCode})`)}
              {infoRow(Mail, "Email", profile.email)}
              {infoRow(Phone, "Phone", profile.phone)}
              {infoRow(Building2, "Department", profile.departmentName)}
              {infoRow(KeyRound, "Cost Center", profile.costCenterName)}
              {infoRow(UserIcon, "Last Login", formatDateIN(profile.lastLogin))}
              <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "800", padding: "4px 10px", borderRadius: "12px", background: profile.enabled ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: profile.enabled ? "#059669" : "#dc2626" }}>
                  {profile.enabled ? "ACCOUNT ENABLED" : "ACCOUNT DISABLED"}
                </span>
                {profile.accountLocked && (
                  <span style={{ fontSize: "11.5px", fontWeight: "800", padding: "4px 10px", borderRadius: "12px", background: "rgba(220,38,38,.12)", color: "#dc2626" }}>LOCKED</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Change Password — shown only when the account holds CHANGE_PASSWORD. */}
        <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            <Lock size={18} color={canChangePassword ? "#f8b400" : "#888"} /> Change Password
          </h3>

          {!canChangePassword ? (
            <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px", lineHeight: 1.6 }}>
              Self-service password change is disabled for this account. Contact a system administrator
              if you need to change your password.
            </p>
          ) : (
            <>
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
                <ShieldCheck size={14} color="#059669" /> Passwords are hashed with BCrypt on the backend. Never stored in plaintext.
              </div>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px", background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.3)", color: "#059669", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", fontWeight: "700" }}>
          <CheckCircle2 size={18} /> {toast.msg}
        </div>
      )}
    </div>
  );
};

const LoadingRow = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#666", padding: "16px 0" }}>
    <Loader2 size={18} className="login-spin" /> Loading profile...
  </div>
);

export default SuperSettings;
