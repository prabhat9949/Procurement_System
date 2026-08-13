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
  Warehouse,
  Bell,
  Activity,
  Key,
} from "lucide-react";

const initialProfileData = {
  fullName: "Marcus Vance",
  managerId: "INV-8080-HEAD",
  roleTitle: "Chief Inventory & Warehouse Manager",
  joiningDate: "March 12, 2019",
  dept: "Warehouse & Inventory Control",
  managedZones: "Zone A, B & C",
  signOffPrivilege: "Full cargo putaway & receiving GRN sign-off authority",
  managedSkusCount: 482,
  email: "marcus.vance@enterprise.com",
  phone: "+1 (555) 019-7720",
  emergencyPhone: "+1 (555) 019-7725",
  location: "Central HQ - Main Warehouse, Sector 4",
  
  lowStockAlerts: true,
  deliveryArrivalAlerts: true,
  transferRequestAlerts: true,
  systemUpdates: false,
};

const initialActivityLogs = [
  { action: "User Logged In", ip: "192.168.2.22", date: "2026-07-27 08:35 AM", details: "Logged into Inventory Control Portal" },
  { action: "Verify Received Cargo", ip: "192.168.2.22", date: "2026-07-26 05:00 PM", desc: "Matched and generated GRN-2026-041 for Apple Business Direct shipment" },
  { action: "Adjust Stock Levels", ip: "192.168.2.19", date: "2026-07-24 09:30 AM", desc: "Logged 1 damaged Cisco Catalyst switch in SKU-NET-992" },
  { action: "Approve Stock Transfer", ip: "192.168.2.22", date: "2026-07-22 11:20 AM", desc: "Transferred 5 units of MacBook Pro to Warehouse B" },
];

const InventoryProfile = () => {
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
    <div className="inv-profile-container" style={{ padding: "20px" }}>
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
      <div className="inv-page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <UserCheck color="#f8b400" size={28} /> Inventory Manager Profile
          </h1>
          <p className="inv-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Review role credentials, facility allocations, security variables, audit logs, and configure alerts.
          </p>
        </div>

        {!isEditing && activeTab === "info" && (
          <button className="inv-btn-primary-sm" onClick={() => setIsEditing(true)}>
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
          Role details & Alert preferences
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
          Change Portal Password
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
        <div className="inv-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
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
                MV
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
              <div className="inv-form-group">
                <label className="inv-form-label">Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="inv-form-input" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="inv-form-group">
                  <label className="inv-form-label">Corporate Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="inv-form-input" required />
                </div>
                <div className="inv-form-group">
                  <label className="inv-form-label">Corporate Phone</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="inv-form-input" required />
                </div>
              </div>
              <div className="inv-form-group">
                <label className="inv-form-label">Physical Workstation Location</label>
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="inv-form-input" required />
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <button
                  type="button"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="inv-btn-primary-sm" style={{ padding: "10px 20px" }}>
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
          <div className="inv-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Warehouse size={16} color="#f8b400" /> Organizational Role Details
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
                <span style={{ color: "#777", fontSize: "12px" }}>Managed Facility Storage Zones</span>
                <p style={{ fontWeight: "700", color: "#333", margin: "2px 0 0" }}>{profile.managedZones}</p>
              </div>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Sign-Off Privileges Authority</span>
                <p style={{ fontWeight: "600", color: "#059669", margin: "2px 0 0" }}>{profile.signOffPrivilege}</p>
              </div>
              <div>
                <span style={{ color: "#777", fontSize: "12px" }}>Total Managed SKUs Capacity</span>
                <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{profile.managedSkusCount} Active catalog products</p>
              </div>
            </div>
          </div>

          {/* Alert checkboxes */}
          <div className="inv-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={16} color="#f8b400" /> Email Notifications Preferences
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.lowStockAlerts}
                  onChange={() => handleTogglePreference("lowStockAlerts")}
                  style={{ width: "16px", height: "16px" }}
                />
                Critical & Low Stock alerts email triggers
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.deliveryArrivalAlerts}
                  onChange={() => handleTogglePreference("deliveryArrivalAlerts")}
                  style={{ width: "16px", height: "16px" }}
                />
                Supplier cargo arrival at dock alerts
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.transferRequestAlerts}
                  onChange={() => handleTogglePreference("transferRequestAlerts")}
                  style={{ width: "16px", height: "16px" }}
                />
                Inter-warehouse stock transfer approvals alerts
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={profile.systemUpdates}
                  onChange={() => handleTogglePreference("systemUpdates")}
                  style={{ width: "16px", height: "16px" }}
                />
                General system maintenance & ERP log reports email
              </label>
            </div>
          </div>

        </div>
      )}

      {/* 3. Change Password Tab */}
      {activeTab === "security" && (
        <div className="inv-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "520px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Key size={16} color="#dc2626" /> Change Security Password
          </h3>

          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="inv-form-group">
              <label className="inv-form-label">Current Password</label>
              <input type="password" value={currPassword} onChange={(e) => setCurrPassword(e.target.value)} className="inv-form-input" required />
            </div>
            <div className="inv-form-group">
              <label className="inv-form-label">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="inv-form-input" required />
            </div>
            <div className="inv-form-group">
              <label className="inv-form-label">Confirm New Password</label>
              <input type="password" value={confPassword} onChange={(e) => setConfPassword(e.target.value)} className="inv-form-input" required />
            </div>

            <button
              type="submit"
              className="inv-btn-primary-sm"
              style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}
            >
              Update Security Password
            </button>
          </form>
        </div>
      )}

      {/* 4. Activity Logs Tab */}
      {activeTab === "logs" && (
        <div className="inv-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={16} color="#d97706" /> Operations Security & Audit Log
          </h3>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
            Re-trace recent administrative actions and terminal operations executed by your user profile.
          </p>

          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Audit Action</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                  <th>Activity Description</th>
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

export default InventoryProfile;
