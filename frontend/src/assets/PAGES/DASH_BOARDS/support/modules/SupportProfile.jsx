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
  fullName: "Samantha Sterling",
  managerId: "SUP-5050-LEAD",
  roleTitle: "Lead Enterprise Support & Help Desk Operations",
  joiningDate: "March 15, 2018",
  dept: "Contact & Customer Support",
  jurisdiction: "All cost centers support desks",
  certifiedCount: 342,
  email: "samantha.sterling@enterprise.com",
  phone: "+1 (555) 011-4433",
  emergencyPhone: "+1 (555) 011-4430",
  location: "Global HQ - Support Command Suite",
  
  ticketAlerts: true,
  escalationAlerts: true,
  csatAlerts: true,
  dailyDigest: false,
};

const initialActivityLogs = [
  { action: "Agent Logged In", ip: "192.168.1.144", date: "2026-07-27 09:10 AM", details: "Logged into Enterprise Support Portal" },
  { action: "Resolve Ticket", ip: "192.168.1.144", date: "2026-07-26 04:00 PM", details: "Resolved ticket TICK-2026-098 (CFO wire remittance query)" },
  { action: "Escalate Ticket", ip: "192.168.1.144", date: "2026-07-26 11:20 AM", details: "Escalated ticket TICK-2026-104 to DevOps Tier 3" },
  { action: "Assign Ticket", ip: "192.168.1.144", date: "2026-07-25 02:15 PM", details: "Assigned ticket TICK-2026-112 to Tech Support Team" },
];

const SupportProfile = () => {
  const [profile, setProfile] = useState(initialProfileData);
  const [logs, setLogs] = useState(initialActivityLogs);
  const [activeTab, setActiveTab] = useState("info"); // info, role, security, logs
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Edit Temp Form State
  const [editName, setEditName] = useState(profile.fullName);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editLocation, setEditLocation] = useState(profile.location);

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
      details: "Modified support agent contact credentials"
    };
    setLogs([newLog, ...logs]);
    triggerToast("Personal profile details updated successfully!");
  };

  const handleTogglePreference = (key) => {
    setProfile({
      ...profile,
      [key]: !profile[key]
    });
  };

  return (
    <div className="sup-profile-container" style={{ padding: "20px" }}>
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
      <div className="sup-page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="sup-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <UserCheck color="#f8b400" size={28} /> Support Lead Profile
          </h1>
          <p className="sup-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Lead support credentials, alert subscriptions, and terminal log entries.
          </p>
        </div>

        {!isEditing && activeTab === "info" && (
          <button className="sup-btn-primary-sm" onClick={() => setIsEditing(true)}>
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
          onClick={() => { setActiveTab("role"); setIsEditing(false); }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "role" ? "700" : "500",
            color: activeTab === "role" ? "#d97706" : "#666",
            borderBottom: activeTab === "role" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Support Role & Alert Preferences
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
          Support Terminal Activity Logs
        </button>
      </div>

      {/* 1. Personal & Contact Details Tab */}
      {activeTab === "info" && (
        <div className="sup-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
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
                SS
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
                    <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Emergency Hotdesk Contact</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", margin: "2px 0 0" }}>{profile.emergencyPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveInfo} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="sup-form-group">
                <label className="sup-form-label">Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="sup-form-input" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sup-form-group">
                  <label className="sup-form-label">Corporate Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="sup-form-input" required />
                </div>
                <div className="sup-form-group">
                  <label className="sup-form-label">Corporate Phone</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="sup-form-input" required />
                </div>
              </div>
              <div className="sup-form-group">
                <label className="sup-form-label">Physical Office Desk Location</label>
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="sup-form-input" required />
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <button
                  type="button"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="sup-btn-primary-sm" style={{ padding: "10px 20px" }}>
                  Save Personal Details
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 2. Role & Alerts Pref Tab */}
      {activeTab === "role" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
          
          {/* Support Details */}
          <div className="sup-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Building size={16} color="#f8b400" /> Support Role details
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Job Title</span>
                <p style={{ fontWeight: "700", color: "#333", margin: "2px 0 0" }}>{profile.roleTitle}</p>
              </div>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Help Desk Department</span>
                <p style={{ fontWeight: "700", color: "#333", margin: "2px 0 0" }}>{profile.dept}</p>
              </div>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Oversight Jurisdiction</span>
                <p style={{ fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>{profile.jurisdiction}</p>
              </div>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Tickets Resolved YTD</span>
                <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{profile.certifiedCount} Resolved tickets</p>
              </div>
            </div>
          </div>

          {/* Alert checkboxes */}
          <div className="sup-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={16} color="#f8b400" /> Notifications & Alerts Subscriptions
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.ticketAlerts}
                  onChange={() => handleTogglePreference("ticketAlerts")}
                  style={{ width: "16px", height: "16px" }}
                />
                New Help Desk Support tickets
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.escalationAlerts}
                  onChange={() => handleTogglePreference("escalationAlerts")}
                  style={{ width: "16px", height: "16px" }}
                />
                Urgent Tier 3 Escalation Alerts (SMS/Email)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.csatAlerts}
                  onChange={() => handleTogglePreference("csatAlerts")}
                  style={{ width: "16px", height: "16px" }}
                />
                Negative CSAT customer feedback warnings
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.dailyDigest}
                  onChange={() => handleTogglePreference("dailyDigest")}
                  style={{ width: "16px", height: "16px" }}
                />
                Daily support SLA summary email digest
              </label>
            </div>
          </div>

        </div>
      )}


      {/* 4. Activity Logs Tab */}
      {activeTab === "logs" && (
        <div className="sup-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={16} color="#d97706" /> Support Terminal Activity Log
          </h3>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
            Trace past ticket assignments, resolution notes, and agent action logs on help desks.
          </p>

          <div className="sup-table-container">
            <table className="sup-table">
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

export default SupportProfile;
