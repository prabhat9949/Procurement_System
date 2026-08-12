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
  DollarSign,
  Award,
  Bell,
  Activity,
  Key,
} from "lucide-react";

const initialProfileData = {
  fullName: "Victoria Vance",
  managerId: "FIN-9090-CFO",
  roleTitle: "Chief Financial Officer & Head of Treasury",
  joiningDate: "February 1, 2017",
  dept: "Corporate Treasury & Finance",
  managedReserves: "$12,500,000.00 USD",
  disbursementLimit: "$2,500,000.00 USD",
  email: "victoria.vance@enterprise.com",
  phone: "+1 (555) 011-9900",
  emergencyPhone: "+1 (555) 011-9905",
  location: "Global HQ - Executive Suite, Level 12",
  
  approveAlerts: true,
  invoiceReceivedAlerts: true,
  budgetExceededAlerts: true,
  systemUpdates: false,
};

const initialActivityLogs = [
  { action: "User Logged In", ip: "192.168.1.100", date: "2026-07-27 09:12 AM", details: "Logged into Corporate Treasury Portal" },
  { action: "Authorize Wire Release", ip: "192.168.1.100", date: "2026-07-26 03:00 PM", details: "Approved wire transfer PAY-2026-901 to Apple Business Direct" },
  { action: "Update Budget Cap", ip: "192.168.1.98", date: "2026-07-24 11:15 AM", details: "Allocated additional $50,000 to Engineering cost center" },
  { action: "Invoice Process", ip: "192.168.1.100", date: "2026-07-22 02:30 PM", details: "Cleared tax invoice INV-2026-9850 for payment" },
];

const FinanceProfile = () => {
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
      details: "Modified personal metadata & contact parameters"
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
      details: "Security password changed successfully"
    };
    setLogs([newLog, ...logs]);
    setCurrPassword("");
    setNewPassword("");
    setConfPassword("");
    triggerToast("Security password updated successfully!");
  };

  return (
    <div className="fin-profile-container" style={{ padding: "20px" }}>
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
      <div className="fin-page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <UserCheck color="#f8b400" size={28} /> CFO Executive Profile
          </h1>
          <p className="fin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Review role credentials, treasury authorizations limits, security parameters, and audit history.
          </p>
        </div>

        {!isEditing && activeTab === "info" && (
          <button className="fin-btn-primary-sm" onClick={() => setIsEditing(true)}>
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
          Role & Notification Settings
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
          Portal Audit Activity Logs
        </button>
      </div>

      {/* 1. Personal & Contact Details Tab */}
      {activeTab === "info" && (
        <div className="fin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
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
                VV
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
                    <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Workstation Location</span>
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
              <div className="fin-form-group">
                <label className="fin-form-label">Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="fin-form-input" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="fin-form-group">
                  <label className="fin-form-label">Corporate Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="fin-form-input" required />
                </div>
                <div className="fin-form-group">
                  <label className="fin-form-label">Corporate Phone</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="fin-form-input" required />
                </div>
              </div>
              <div className="fin-form-group">
                <label className="fin-form-label">Physical Workstation Location</label>
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="fin-form-input" required />
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <button
                  type="button"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="fin-btn-approve" style={{ padding: "10px 20px" }}>
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
          
          {/* Role details */}
          <div className="fin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Building size={16} color="#f8b400" /> Organizational Role Details
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Job Title & Grade</span>
                <p style={{ fontWeight: "700", color: "#333", margin: "2px 0 0" }}>{profile.roleTitle}</p>
              </div>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Assigned Department</span>
                <p style={{ fontWeight: "700", color: "#333", margin: "2px 0 0" }}>{profile.dept}</p>
              </div>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Disbursement Sign-Off limit</span>
                <p style={{ fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>{profile.disbursementLimit}</p>
              </div>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Managed Treasury Reserves</span>
                <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{profile.managedReserves}</p>
              </div>
            </div>
          </div>

          {/* Alert checkboxes */}
          <div className="fin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={16} color="#f8b400" /> Treasury Notifications Preferences
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.approveAlerts}
                  onChange={() => handleTogglePreference("approveAlerts")}
                  style={{ width: "16px", height: "16px" }}
                />
                Commercial wire release authorization approvals alerts
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.invoiceReceivedAlerts}
                  onChange={() => handleTogglePreference("invoiceReceivedAlerts")}
                  style={{ width: "16px", height: "16px" }}
                />
                Incoming tax invoices verification logs
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.budgetExceededAlerts}
                  onChange={() => handleTogglePreference("budgetExceededAlerts")}
                  style={{ width: "16px", height: "16px" }}
                />
                Department budget limit ceiling warnings
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.systemUpdates}
                  onChange={() => handleTogglePreference("systemUpdates")}
                  style={{ width: "16px", height: "16px" }}
                />
                Annual audit file exports summary emails
              </label>
            </div>
          </div>

        </div>
      )}

      {/* 3. Password changes are managed by Admin only. */}
      {activeTab === "security" && (
        <div className="fin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "520px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Key size={16} color="#d97706" /> Account Security
          </h3>
          <p style={{ fontSize: "13.5px", color: "#555", lineHeight: 1.6, margin: 0 }}>
            Password changes are handled by the system administrator only. Please contact the Admin / HR team if you need your password reset.
          </p>
        </div>
      )}

      {/* 4. Activity Logs Tab */}
      {activeTab === "logs" && (
        <div className="fin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={16} color="#d97706" /> Corporate Audit Activity Logs
          </h3>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
            Review recent transaction approvals, budget distribution actions, and portal modifications.
          </p>

          <div className="fin-table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Activity Event</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                  <th>Audit Logs Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700" }}>{log.action}</td>
                    <td style={{ color: "#555" }}>{log.ip}</td>
                    <td style={{ color: "#d97706", fontWeight: "600", fontSize: "13px" }}>{log.date}</td>
                    <td style={{ color: "#666" }}>{log.details || log.desc}</td>
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

export default FinanceProfile;
