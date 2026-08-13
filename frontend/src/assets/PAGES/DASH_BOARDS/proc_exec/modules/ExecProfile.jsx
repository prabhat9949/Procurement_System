import React from "react";
import {
  UserCheck,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Award,
  Calendar,
  Briefcase,
} from "lucide-react";

const ExecProfile = () => {
  return (
    <div className="pe-profile-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <UserCheck color="#f8b400" /> Executive Profile & Credentials
          </h1>
          <p className="pe-page-subtitle">
            Procurement Executive ID, organizational placement, and commercial signing credentials.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Profile Card */}
        <div className="pe-card pe-card-gold-glow" style={{ textAlign: "center" }}>
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
            DC
          </div>

          <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "700" }}>David Chen</h2>
          <p style={{ color: "#d97706", fontSize: "14px", fontWeight: "700", marginTop: "2px" }}>
            Senior Procurement Executive
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
            Executive ID: PE-4091-GLOBAL
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
              <span>Department: Strategic Procurement & Sourcing</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Mail size={16} color="#f8b400" />
              <span>david.chen@enterprise.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Phone size={16} color="#f8b400" />
              <span>+1 (555) 018-4492</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Calendar size={16} color="#f8b400" />
              <span>Joining Date: March 15, 2021</span>
            </div>
          </div>
        </div>

        {/* Right Sourcing Credentials Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="pe-card">
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
              <Award size={18} color="#f8b400" /> Sourcing Authority & Executive Clearance
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
                  PO Issuance Authority Limit
                </span>
                <h4 style={{ fontSize: "22px", color: "#059669", fontWeight: "800", marginTop: "4px" }}>
                  Up to $100,000.00 USD
                </h4>
                <p style={{ fontSize: "12px", color: "#555555", marginTop: "2px" }}>
                  Authorized to create, negotiate, and issue Purchase Orders.
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
                  Preferred Vendor Network Access
                </span>
                <h4 style={{ fontSize: "22px", color: "#d97706", fontWeight: "800", marginTop: "4px" }}>
                  Tier 1 Certified
                </h4>
                <p style={{ fontSize: "12px", color: "#555555", marginTop: "2px" }}>
                  Direct portal access to Apple, CDW, Dell, Cisco, and Datadog.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecProfile;
