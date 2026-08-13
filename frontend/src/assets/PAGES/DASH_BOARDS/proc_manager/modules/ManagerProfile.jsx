import React from "react";
import {
  UserCheck,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Award,
  Calendar,
  Lock,
  Edit3,
} from "lucide-react";

const ManagerProfile = () => {
  return (
    <div className="pman-profile-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <UserCheck color="#f8b400" /> Executive Profile & Organization Credentials
          </h1>
          <p className="pman-page-subtitle">
            Chief Procurement Manager ID, organizational placement, and executive sign-off authority.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="pman-btn-primary-sm">
            <Edit3 size={15} /> Edit Profile
          </button>
          <button
            className="pman-btn-primary-sm"
            style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          >
            <Lock size={15} /> Change Password
          </button>
        </div>
      </div>

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
            RV
          </div>

          <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "700" }}>Robert Vance</h2>
          <p style={{ color: "#d97706", fontSize: "14px", fontWeight: "700", marginTop: "2px" }}>
            Chief Procurement Manager & Head of Supply Chain
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
            Manager ID: PM-1001-HEAD
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
              <span>Department: Global Supply Chain & Procurement</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Mail size={16} color="#f8b400" />
              <span>robert.vance@enterprise.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Phone size={16} color="#f8b400" />
              <span>+1 (555) 011-8890</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Calendar size={16} color="#f8b400" />
              <span>Joining Date: January 10, 2018</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <ShieldCheck size={16} color="#f8b400" />
              <span>HQ Location: Global HQ - Building 1</span>
            </div>
          </div>
        </div>

        {/* Executive Authority Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="pman-card">
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
              <Award size={18} color="#f8b400" /> Chief Sourcing Authority & Sign-off Limit
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
                  Purchase Order Approval Ceiling
                </span>
                <h4 style={{ fontSize: "22px", color: "#059669", fontWeight: "800", marginTop: "4px" }}>
                  Up to $500,000.00 USD
                </h4>
                <p style={{ fontSize: "12px", color: "#555555", marginTop: "2px" }}>
                  Executive countersign authority for organization-wide sourcing.
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
                  Organizational Scope
                </span>
                <h4 style={{ fontSize: "22px", color: "#d97706", fontWeight: "800", marginTop: "4px" }}>
                  All 12 Cost Centers
                </h4>
                <p style={{ fontSize: "12px", color: "#555555", marginTop: "2px" }}>
                  Oversees Engineering, DevOps, Marketing, Operations, and Sales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;
