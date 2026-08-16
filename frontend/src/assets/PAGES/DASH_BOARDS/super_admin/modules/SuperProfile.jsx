import React, { useState } from "react";
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
  Bell,
  Activity,
  Key,
} from "lucide-react";

const initialProfileData = {
  fullName: "Gideon Cross",
  managerId: "ROOT-SUPER-ADMIN",
  roleTitle: "Root Super Administrator & Chief Cloud Director",
  joiningDate: "November 1, 2012",
  dept: "EPS Master Global Enterprise",
  certifiedCount: 1480,
  email: "gideon.cross@enterprise.com",
  phone: "+1 (555) 011-0000",
  location: "Global HQ - Root Cloud Command",
  
  securityAlerts: true,
  infrastructureAlerts: true,
  concurrentUserAlerts: true,
  dailyDigest: false,
};

const initialActivityLogs = [
  { action: "Root Login Verified", ip: "10.0.4.12", date: "2026-07-27 09:05 AM", details: "Logged into Root Cloud Command Console" },
  { action: "Enforced MFA policy", ip: "10.0.4.12", date: "2026-07-27 08:30 AM", details: "Enforced FIDO2 token requirement system-wide" },
  { action: "Deactivated Tenant", ip: "10.0.4.12", date: "2026-07-25 04:15 PM", details: "Deactivated LATAM-OFFICE due to credentials leak audit findings" }
];

const SuperProfile = () => {
  const [profile, setProfile] = useState(initialProfileData);
  const [logs, setLogs] = useState(initialActivityLogs);
  const [activeTab, setActiveTab] = useState("info"); // info, alerts, security, logs
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Edit Temp Form State
  const [editName, setEditName] = useState(profile.fullName);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editLocation, setEditLocation] = useState(profile.location);

  // Password State
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    setProfile({
      ...profile,
      fullName: editName,
      email: editEmail,
      phone: editPhone,
      location: editLocation,
    });
    setIsEditing(false);
    
    // Add log
    const newLog = {
      action: "Profile Update",
      ip: "127.0.0.1",
      date: new Date().toLocaleString(),
      details: "Modified Super Admin contact credentials"
    };
    setLogs([newLog, ...logs]);
    triggerToast("Super Admin details updated successfully!");
  };

  const handleTogglePreference = (key) => {
    setProfile({
      ...profile,
      [key]: !profile[key]
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confPassword) {
      triggerToast("New passwords do not match!");
      return;
    }
    
    // Add log
    const newLog = {
      action: "Password Changed",
      ip: "127.0.0.1",
      date: new Date().toLocaleString(),
      details: "Updated root governance security credentials"
    };
    setLogs([newLog, ...logs]);
    setCurrPassword("");
    setNewPassword("");
    setConfPassword("");
    triggerToast("Security password updated successfully!");
  };

  return (
    <div className="sadmin-profile-container" style={{ padding: "20px" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#111111",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            fontWeight: "700",
            fontSize: "14px",
            borderLeft: "4px solid #f8b400",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#11" }}>
            <UserCheck color="#f8b400" size={28} /> Super Admin Profile & Credentials
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Audit root authority contact details, modify notifications switches, and view terminal logs entries.
          </p>
        </div>

        {!isEditing && activeTab === "info" && (
          <button className="sadmin-btn-primary-sm" onClick={() => setIsEditing(true)}>
            <Edit3 size={15} /> Edit Personal Information
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => { setActiveTab("info"); setIsEditing(false); }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "info" ? "700" : "500",
            color: activeTab === "info" ? "#d97706" : "#666",
            borderBottom: activeTab === "info" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Personal & Contact Details
        </button>
        <button
          onClick={() => { setActiveTab("alerts"); setIsEditing(false); }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "alerts" ? "700" : "500",
            color: activeTab === "alerts" ? "#d97706" : "#666",
            borderBottom: activeTab === "alerts" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Notifications Settings
        </button>
        <button
          onClick={() => { setActiveTab("security"); setIsEditing(false); }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "security" ? "700" : "500",
            color: activeTab === "security" ? "#d97706" : "#666",
            borderBottom: activeTab === "security" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Change Security Password
        </button>
        <button
          onClick={() => { setActiveTab("logs"); setIsEditing(false); }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "logs" ? "700" : "500",
            color: activeTab === "logs" ? "#d97706" : "#666",
            borderBottom: activeTab === "logs" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Master Activity Logs
        </button>
      </div>

      {/* 1. Personal & Contact Details Tab */}
      {activeTab === "info" && (
        <div className="sadmin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          {!isEditing ? (
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <div style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)",
                color: "#111",
                fontWeight: "800",
                fontSize: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #f8b400",
              }}>
                GC
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Full Name</span>
                  <p style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{profile.fullName}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Corporate Email</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", margin: "2px 0 0" }}>{profile.email}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Corporate Phone</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", margin: "2px 0 0" }}>{profile.phone}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Office Desk Location</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", margin: "2px 0 0" }}>{profile.location}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Master Admin ID</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", margin: "2px 0 0" }}>{profile.managerId}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveInfo} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="sadmin-form-group">
                <label className="sadmin-form-label">Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="sadmin-form-input" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sadmin-form-group">
                  <label className="sadmin-form-label">Corporate Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="sadmin-form-input" required />
                </div>
                <div className="sadmin-form-group">
                  <label className="sadmin-form-label">Corporate Phone</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="sadmin-form-input" required />
                </div>
              </div>
              <div className="sadmin-form-group">
                <label className="sadmin-form-label">Physical Office Desk Location</label>
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="sadmin-form-input" required />
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <button
                  type="button"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="sadmin-btn-primary-sm" style={{ padding: "10px 20px" }}>
                  Save Personal Details
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 2. Alerts Pref Tab */}
      {activeTab === "alerts" && (
        <div className="sadmin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={16} color="#f8b400" /> Notifications & Alerts Subscriptions
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={profile.securityAlerts}
                onChange={() => handleTogglePreference("securityAlerts")}
                style={{ width: "16px", height: "16px" }}
              />
              Azure Sentinel & Threat Detection block alerts
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={profile.infrastructureAlerts}
                onChange={() => handleTogglePreference("infrastructureAlerts")}
                style={{ width: "16px", height: "16px" }}
              />
              AWS cloud service latency spikes warnings
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={profile.concurrentUserAlerts}
                onChange={() => handleTogglePreference("concurrentUserAlerts")}
                style={{ width: "16px", height: "16px" }}
              />
              Concurrent user limit spikes notifications
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={profile.dailyDigest}
                onChange={() => handleTogglePreference("dailyDigest")}
                style={{ width: "16px", height: "16px" }}
              />
              Daily system SLA summary email digest
            </label>
          </div>
        </div>
      )}

      {/* 3. Change Password Tab */}
      {activeTab === "security" && (
        <div className="sadmin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "520px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Key size={16} color="#dc2626" /> Change Master Password
          </h3>

          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Current Password</label>
              <input type="password" value={currPassword} onChange={(e) => setCurrPassword(e.target.value)} className="sadmin-form-input" required />
            </div>
            <div className="sadmin-form-group">
              <label className="sadmin-form-label">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="sadmin-form-input" required />
            </div>
            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Confirm New Password</label>
              <input type="password" value={confPassword} onChange={(e) => setConfPassword(e.target.value)} className="sadmin-form-input" required />
            </div>

            <button
              type="submit"
              className="sadmin-btn-primary-sm"
              style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}
            >
              Update Security Password
            </button>
          </form>
        </div>
      )}

      {/* 4. Activity Logs Tab */}
      {activeTab === "logs" && (
        <div className="sadmin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={16} color="#d97706" /> Master Admin Activity Log
          </h3>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
            Trace root level events actioned by Gideon Cross.
          </p>

          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Support Action Event</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                  <th>Log Details description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700" }}>{log.action}</td>
                    <td style={{ color: "#555" }}>{log.ip}</td>
                    <td style={{ color: "#d97706", fontWeight: "600", fontSize: "13px" }}>{log.date}</td>
                    <td style={{ color: "#666" }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperProfile;
