import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Mail,
  Building,
  ShieldCheck,
  Calendar,
  Loader2,
  WifiOff,
  KeyRound,
  Hash,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatDateIN } from "../../../../../utils/format";

const ManagerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet("/api/auth/me");
        setProfile(data);
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "12px", color: "#666" }}>
        <Loader2 size={22} className="login-spin" /> Loading profile…
      </div>
    );
  }

  const displayName = profile?.displayName || localStorage.getItem("eps_display_name") || "Procurement Manager";
  const initials = (displayName || "PM")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const authorities = Array.isArray(profile?.authorities) ? profile.authorities : [];
  const permissions = authorities.filter((a) => a.startsWith("ROLE_") === false);

  return (
    <div className="pman-profile-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <UserCheck color="#f8b400" /> My Profile & Organization Credentials
          </h1>
          <p className="pman-page-subtitle">
            Your current account, role and effective permissions — loaded live from the database.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Profile Card */}
        <div className="pman-card pman-card-gold-glow" style={{ textAlign: "center" }}>
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)",
              color: "#000000",
              fontWeight: "800",
              fontSize: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 4px 15px rgba(248, 180, 0, 0.3)",
              border: "3px solid #f8b400",
            }}
          >
            {initials}
          </div>

          <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "700" }}>{displayName}</h2>
          <p style={{ color: "#d97706", fontSize: "14px", fontWeight: "700", marginTop: "2px" }}>
            {profile?.roleName || profile?.roleCode || "—"}
          </p>

          <span
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "4px 14px",
              background: "rgba(248, 180, 0, 0.15)",
              border: "1px solid #f8b400",
              borderRadius: "20px",
              fontSize: "12px",
              color: "#111111",
              fontWeight: "700",
            }}
          >
            Role: {profile?.roleCode || "—"}
          </span>

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #ececec", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Hash size={16} color="#f8b400" />
              <span>User ID: {profile?.userId ?? "—"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Building size={16} color="#f8b400" />
              <span>Employee ID: {profile?.employeeId ?? "—"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <ShieldCheck size={16} color="#f8b400" />
              <span>Department ID: {profile?.departmentId ?? "—"} · Cost Center ID: {profile?.costCenterId ?? "—"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Mail size={16} color="#f8b400" />
              <span>{profile?.username || "—"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Calendar size={16} color="#f8b400" />
              <span>Session: authenticated at login</span>
            </div>
          </div>
        </div>

        {/* Authority Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="pman-card">
            <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
              <ShieldCheck size={18} style={{ verticalAlign: "middle", marginRight: 8, color: "#f8b400" }} />
              Effective Permissions ({permissions.length})
            </h3>
            {permissions.length === 0 ? (
              <p style={{ color: "#888", fontSize: "13.5px" }}>No granular permissions assigned to this account.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {permissions.map((p) => (
                  <span
                    key={p}
                    style={{
                      padding: "5px 12px",
                      background: "rgba(248, 180, 0, 0.12)",
                      border: "1px solid #f8b40055",
                      borderRadius: "20px",
                      fontSize: "12px",
                      color: "#111111",
                      fontWeight: "700",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pman-card">
            <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>
              <KeyRound size={18} style={{ verticalAlign: "middle", marginRight: 8, color: "#f8b400" }} />
              Authority Note
            </h3>
            <p style={{ fontSize: "13.5px", color: "#555", lineHeight: 1.6 }}>
              Your actionable controls are determined by your role, permissions, department/team and the
              current workflow assignment for each record. The backend enforces these rules on every API call —
              this profile only reflects the current authorization state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;
