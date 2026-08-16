import React from "react";
import {
  UserCheck,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
} from "lucide-react";

const teamLeads = [
  { name: "Alex Morgan", title: "Senior Frontend Architect", subTeam: "Frontend Architecture" },
  { name: "David Miller", title: "DevOps & Infrastructure Lead", subTeam: "Cloud Infrastructure" },
  { name: "Priya Sharma", title: "Lead QA Engineer", subTeam: "Quality Assurance" },
  { name: "Marcus Vance", title: "Senior Systems Administrator", subTeam: "IT Service Desk" },
];

const ManagerProfile = () => {
  return (
    <div className="dm-profile-container">
      {/* Header */}
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">
            <UserCheck color="#f8b400" /> Department Manager Profile & Approval Credentials
          </h1>
          <p className="dm-page-subtitle">
            View your organizational hierarchy, approval authority threshold, and department cost center assignments.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Manager Card */}
        <div className="dm-card dm-card-gold-glow" style={{ textAlign: "center" }}>
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
            SJ
          </div>

          <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "700" }}>Sarah Jenkins</h2>
          <p style={{ color: "#d97706", fontSize: "14px", fontWeight: "700", marginTop: "2px" }}>
            VP of Engineering & IT Infrastructure
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
            Manager ID: MGR-8902-ENG
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
              <span>Department: Engineering & IT</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Mail size={16} color="#f8b400" />
              <span>sarah.jenkins@enterprise.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <Phone size={16} color="#f8b400" />
              <span>+1 (555) 019-9942</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#555555" }}>
              <ShieldCheck size={16} color="#f8b400" />
              <span>Cost Center: CC-8902-ENG</span>
            </div>
          </div>
        </div>

        {/* Right Authority & Reporting Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Approval Authority Card */}
          <div className="dm-card">
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
              <Award size={18} color="#f8b400" /> Purchasing Authority & Spending Limits
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
                  Single Request Sign-off Limit
                </span>
                <h4 style={{ fontSize: "22px", color: "#059669", fontWeight: "800", marginTop: "4px" }}>
                  ₹25,000.00
                </h4>
                <p style={{ fontSize: "12px", color: "#555555", marginTop: "2px" }}>
                  Requisitions over ₹25,000 escalate to CTO for co-approval.
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
                  Monthly Cost Center Budget Cap
                </span>
                <h4 style={{ fontSize: "22px", color: "#d97706", fontWeight: "800", marginTop: "4px" }}>
                  ₹1,20,000.00
                </h4>
                <p style={{ fontSize: "12px", color: "#555555", marginTop: "2px" }}>
                  Managed under Cost Center CC-8902-ENG.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Team Leads Card */}
          <div className="dm-card">
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
              <Users size={18} color="#f8b400" /> Direct Sub-Team Leads & Requesters
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {teamLeads.map((lead, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 14px",
                    background: "#f8f9fb",
                    borderRadius: "10px",
                    border: "1px solid #ececec",
                  }}
                >
                  <h4 style={{ fontSize: "14px", color: "#111111", fontWeight: "700" }}>{lead.name}</h4>
                  <p style={{ fontSize: "12px", color: "#d97706", fontWeight: "600" }}>{lead.title}</p>
                  <p style={{ fontSize: "11px", color: "#666666", marginTop: "2px" }}>{lead.subTeam}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;
