import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Key,
  ShieldAlert,
  Search,
} from "lucide-react";

const initialSecurityLogs = [
  { event: "Azure Sentinel Identity Verification", ip: "192.168.1.100 (HQ Subnet)", status: "Zero Trust Verified", time: "2026-07-27 09:20 AM" },
  { event: "AWS CloudTrail Root Session Authenticated", ip: "10.0.4.12 (Admin Subnet)", status: "Zero Trust Verified", time: "2026-07-27 08:30 AM" },
  { event: "Automated IP Firewall Scan", ip: "Global Gateway Nodes", status: "0 Vulnerabilities", time: "2026-07-27 08:00 AM" }
];

const initialLoginActivities = [
  { user: "Gideon Cross", role: "Super Admin", ip: "10.0.4.12", date: "2026-07-27 09:05 AM", location: "Global HQ", mfa: "FIDO2 Key Verified", status: "Safe" },
  { user: "David Chen", role: "Sourcing Executive", ip: "192.168.3.11", date: "2026-07-27 09:12 AM", location: "Global HQ", mfa: "Authenticator Verified", status: "Safe" },
  { user: "Suspicious Tech Vendor Rep", role: "External Vendor", ip: "185.220.101.44", date: "2026-07-26 11:22 PM", location: "Unknown (Tor Exit)", mfa: "Bypass Attempt / SMS Fail", status: "Alert Pushed" }
];

const SuperSecurityCenter = () => {
  const [logs, setLogs] = useState(initialSecurityLogs);
  const [logins, setLogins] = useState(initialLoginActivities);
  const [activeSubTab, setActiveSubTab] = useState("events"); // events, logins

  return (
    <div className="sadmin-security-center-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <ShieldCheck color="#059669" size={28} /> Operations Security Center
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Evaluate Multi-Factor Authentication (MFA) status, trace suspicious remote login activities, and view threat intelligence logs.
          </p>
        </div>
      </div>

      {/* Grid summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        <div className="sadmin-card sadmin-card-gold-glow" style={{ padding: "20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ShieldCheck size={32} color="#059669" />
            <div>
              <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", margin: 0 }}>Zero-Trust Security Status</h3>
              <p style={{ color: "#059669", fontWeight: "800", fontSize: "15px", marginTop: "2px", margin: 0 }}>
                100% Threat-Free • Active Cloud Shield
              </p>
            </div>
          </div>
        </div>

        <div className="sadmin-card" style={{ padding: "20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Key size={32} color="#f8b400" />
            <div>
              <h3 style={{ fontSize: "16px", color: "#11", fontWeight: "800", margin: 0 }}>Multi-Factor Authentication (MFA)</h3>
              <p style={{ color: "#111111", fontWeight: "700", fontSize: "15px", marginTop: "2px", margin: 0 }}>
                1,480 / 1,480 Accounts Hardware Token Enforced
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("events")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "events" ? "700" : "500",
            color: activeSubTab === "events" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "events" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Threat Detection & Security Events
        </button>
        <button
          onClick={() => setActiveSubTab("logins")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "logins" ? "700" : "500",
            color: activeSubTab === "logins" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "logins" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Login Activities & MFA Status
        </button>
      </div>

      {/* 1. Events Tab */}
      {activeSubTab === "events" && (
        <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Security Event Description</th>
                  <th>IP Subnet / Route</th>
                  <th>Verification Status</th>
                  <th>Event Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((s, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "800", color: "#111111" }}>{s.event}</td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{s.ip}</td>
                    <td style={{ fontWeight: "700", color: "#059669" }}>{s.status}</td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Logins Tab */}
      {activeSubTab === "logins" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Warning check */}
          {logins.some(l => l.status.includes("Alert")) && (
            <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "8px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldAlert color="#dc2626" size={20} />
              <div>
                <strong style={{ color: "#dc2626", fontSize: "13.5px" }}>Suspicious Remote Login Activities Flagged</strong>
                <p style={{ color: "#555", fontSize: "12.5px", margin: "2px 0 0" }}>
                  Tor exit node connections and MFA authentication bypass alerts are being tracked by Azure sentinel dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="sadmin-table-container">
              <table className="sadmin-table">
                <thead>
                  <tr>
                    <th>Username Name</th>
                    <th>Enterprise Role</th>
                    <th>IP Address</th>
                    <th>Login Date & Time</th>
                    <th>Location Node</th>
                    <th>MFA Status</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.map((l, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: "700" }}>{l.user}</td>
                      <td>{l.role}</td>
                      <td style={{ color: "#666", fontSize: "13px" }}>{l.ip}</td>
                      <td>{l.date}</td>
                      <td>{l.location}</td>
                      <td style={{ color: "#d97706", fontWeight: "700" }}>{l.mfa}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: l.status === "Safe" ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                            color: l.status === "Safe" ? "#059669" : "#dc2626",
                          }}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperSecurityCenter;
