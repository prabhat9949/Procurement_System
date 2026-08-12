import React from "react";
import {
  X,
  Mail,
  Phone,
  Building2,
  BadgeCheck,
  Shield,
  LogOut,
  Settings,
  User,
} from "lucide-react";

/**
 * ProfileDrawer — slides in from the right when the user avatar/name is clicked.
 * Props:
 *   isOpen: bool
 *   onClose: fn
 *   user: { name, role, email, phone, dept, empId, joinDate }
 *   accentColor: hex string (e.g. "#f8b400")
 *   onLogout: fn
 */
const ProfileDrawer = ({ isOpen, onClose, user = {}, accentColor = "#3b82f6", onLogout }) => {
  if (!isOpen) return null;

  const {
    name = "User",
    role = "Team Member",
    email = "user@enterprise.com",
    phone = "+1 (415) 000-0000",
    dept = "Enterprise Operations",
    empId = "EMP-00000",
    joinDate = "January 2024",
  } = user;

  const avatarInitials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "clamp(320px, 30vw, 420px)",
          background: "#fff",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          animation: "epsProfileSlideIn 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <style>{`
          @keyframes epsProfileSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        <div
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            padding: "32px 24px 24px",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <X size={16} />
          </button>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              border: "3px solid rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: "800",
              color: "#fff",
              marginBottom: "12px",
              letterSpacing: "1px",
            }}
          >
            {avatarInitials}
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", margin: "0 0 4px" }}>{name}</h2>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#fff",
              background: "rgba(255,255,255,0.22)",
              padding: "3px 10px",
              borderRadius: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <BadgeCheck size={12} /> {role}
          </span>
        </div>

        <div style={{ padding: "24px", flex: 1 }}>
          <div
            style={{
              background: `${accentColor}12`,
              border: `1px solid ${accentColor}40`,
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ fontSize: "11px", color: "#777", margin: 0 }}>Employee ID</p>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{empId}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11px", color: "#777", margin: 0 }}>Member Since</p>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{joinDate}</p>
            </div>
          </div>

          <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Contact & Department
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {[
              { icon: Mail, label: "Email", value: email },
              { icon: Phone, label: "Phone", value: phone },
              { icon: Building2, label: "Department", value: dept },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: `${accentColor}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={accentColor} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>{label}</p>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#111", margin: "1px 0 0" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <Shield size={16} color="#059669" />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#059669" }}>
              Access verified — Active session
            </span>
          </div>

          <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Quick Links
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", background: "#f8f9fb", border: "1px solid #ebebeb",
                borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                color: "#333", textAlign: "left",
              }}
            >
              <User size={15} color={accentColor} /> View My Activity
            </button>
            <button
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", background: "#f8f9fb", border: "1px solid #ebebeb",
                borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                color: "#333", textAlign: "left",
              }}
            >
              <Settings size={15} color={accentColor} /> Account Settings
            </button>
            <button
              onClick={onLogout}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", background: "#fff5f5", border: "1px solid #fecaca",
                borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
                color: "#dc2626", textAlign: "left",
              }}
            >
              <LogOut size={15} color="#dc2626" /> Logout
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #ebebeb",
            fontSize: "11px",
            color: "#aaa",
            textAlign: "center",
          }}
        >
          Enterprise Procurement System © 2026
        </div>
      </div>
    </>
  );
};

export default ProfileDrawer;

