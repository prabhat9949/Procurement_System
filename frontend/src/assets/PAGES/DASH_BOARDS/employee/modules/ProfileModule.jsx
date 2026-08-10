import React from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Key,
  Award,
} from "lucide-react";

const ProfileModule = () => {
  return (
    <div className="emp-profile-container">
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <User color="#f8b400" /> Employee Profile & Enterprise Credentials
          </h1>
          <p className="emp-page-subtitle">
            View your organizational assignment, approval authority level, and personal information.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Profile Card */}
        <div className="emp-card emp-card-gold-glow" style={{ textAlign: "center" }}>
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
            AM
          </div>

          <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "700" }}>Alex Morgan</h2>
          <p style={{ color: "#d97706", fontSize: "14px", fontWeight: "700", marginTop: "2px" }}>
            Senior Frontend Architect
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
            Employee ID: EMP-90482
          </span>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #ececec",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Building size={16} color="#f8b400" />
              <span>Engineering & IT Infrastructure</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Mail size={16} color="#f8b400" />
              <span>alex.morgan@enterprise.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Phone size={16} color="#f8b400" />
              <span>+1 (555) 019-2834</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Shield size={16} color="#f8b400" />
              <span>Cost Center: CC-8902-ENG</span>
            </div>
          </div>
        </div>

        {/* Right Info Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Approval Authority & Manager */}
          <div className="emp-card">
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
              <Award size={18} color="#f8b400" /> Organizational Hierarchy & Purchasing Limits
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div
                style={{
                  padding: "16px",
                  background: "#f8f9fb",
                  borderRadius: "12px",
                  border: "1px solid #ececec",
                }}
              >
                <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                  Direct Reporting Manager
                </span>
                <h4 style={{ fontSize: "16px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>
                  Sarah Jenkins
                </h4>
                <p style={{ fontSize: "12px", color: "#555555" }}>VP of Engineering</p>
                <p style={{ fontSize: "11px", color: "#d97706", fontWeight: "700", marginTop: "6px" }}>
                  sarah.jenkins@enterprise.com
                </p>
              </div>

              <div
                style={{
                  padding: "16px",
                  background: "#f8f9fb",
                  borderRadius: "12px",
                  border: "1px solid #ececec",
                }}
              >
                <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                  Single Request Spend Limit
                </span>
                <h4 style={{ fontSize: "20px", color: "#059669", fontWeight: "800", marginTop: "4px" }}>
                  $5,000.00 USD
                </h4>
                <p style={{ fontSize: "12px", color: "#555555" }}>Auto-approved under limit</p>
              </div>
            </div>
          </div>

          {/* Security & Access Logs */}
          <div className="emp-card">
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
              <Key size={18} color="#f8b400" /> System Access & Authentication Security
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "#f8f9fb",
                  borderRadius: "8px",
                  border: "1px solid #ececec",
                }}
              >
                <span style={{ color: "#555555" }}>Two-Factor Authentication (2FA)</span>
                <span style={{ color: "#059669", fontWeight: "700" }}>Active (Hardware Key)</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "#f8f9fb",
                  borderRadius: "8px",
                  border: "1px solid #ececec",
                }}
              >
                <span style={{ color: "#555555" }}>SSO Provider</span>
                <span style={{ color: "#111111", fontWeight: "600" }}>Okta Enterprise ID</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "#f8f9fb",
                  borderRadius: "8px",
                  border: "1px solid #ececec",
                }}
              >
                <span style={{ color: "#555555" }}>Last Active Session</span>
                <span style={{ color: "#111111" }}>July 26, 2026 at 12:45 PM (IP 192.168.1.42)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModule;
