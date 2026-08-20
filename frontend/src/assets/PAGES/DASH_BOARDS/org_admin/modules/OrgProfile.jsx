import React from "react";
import {
  UserCheck,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Calendar,
  Lock,
  Edit3,
  Award,
} from "lucide-react";

const OrgProfile = () => {
  return (
    <div className="org-profile-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <UserCheck color="#f8b400" /> Organization Admin Profile & Executive Credentials
          </h1>
          <p className="org-page-subtitle">
            Chief Administrator ID, BI control room privileges, and enterprise command placement.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="org-btn-primary-sm">
            <Edit3 size={15} /> Edit Profile
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Profile Card */}
        <div className="org-card org-card-gold-glow" style={{ textAlign: "center" }}>
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
            AV
          </div>

          <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "800" }}>Alexander Vance</h2>
          <p style={{ color: "#d97706", fontSize: "14px", fontWeight: "700", marginTop: "2px" }}>
            Chief Organization Administrator & Head of BI
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
            Admin ID: ORG-1010-ADMIN
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
              <span>Organization: EPS Global Enterprise HQ</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Mail size={16} color="#f8b400" />
              <span>alexander.vance@enterprise.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Phone size={16} color="#f8b400" />
              <span>+1 (555) 011-1000</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Calendar size={16} color="#f8b400" />
              <span>Joining Date: January 10, 2015</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <ShieldCheck size={16} color="#f8b400" />
              <span>HQ Location: Global HQ - Executive Suite</span>
            </div>
          </div>
        </div>

        {/* Executive Admin Governance Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="org-card">
            <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "800", marginBottom: "20px" }}>
              Executive Organization Administration & BI Oversight
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ padding: "16px", background: "#f8f9fb", borderRadius: "12px", border: "1px solid #ececec" }}>
                <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                  Managed Organization Headcount
                </span>
                <h4 style={{ fontSize: "20px", color: "#111111", fontWeight: "800", marginTop: "4px" }}>
                  248 Active Users
                </h4>
                <p style={{ fontSize: "12px", color: "#555555", marginTop: "2px" }}>
                  Full administration across all 11 enterprise roles.
                </p>
              </div>

              <div style={{ padding: "16px", background: "#f8f9fb", borderRadius: "12px", border: "1px solid #ececec" }}>
                <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                  System Health & Uptime
                </span>
                <h4 style={{ fontSize: "20px", color: "#059669", fontWeight: "800", marginTop: "4px" }}>
                  99.4% Uptime
                </h4>
                <p style={{ fontSize: "12px", color: "#555555", marginTop: "2px" }}>
                  12 cost centers operating at peak SLA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgProfile;
