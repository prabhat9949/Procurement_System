import React, { useState } from "react";
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
  Star,
  MapPin,
  FileText,
  Package,
  DollarSign,
  Truck,
  Clock,
  CheckCircle2,
  Send,
  FileCheck2,
  Plus,
  Bell,
  Activity,
  Upload,
  Globe,
  Briefcase,
  Key,
} from "lucide-react";

const initialProfileData = {
  companyName: "ABC Technologies Pvt. Ltd.",
  vendorId: "VEN-2026-001",
  vendorType: "Electronics & IT Supplier",
  website: "https://www.abctech.com",
  email: "sales@abctech.com",
  phone: "+91 98765 43210",
  location: "DLF Cybercity, Phase III, Chennai, TN, India",
  repName: "Alex Morgan (Enterprise Director)",
  supportContact: "+91 44 4992 1000",
  
  gstin: "33AABCA1234F1Z5",
  gstStatus: "Active Verified",
  gstFilingStatus: "Up to date (Q2 Filings Reconciled)",

  bankName: "HDFC Corporate Bank",
  accountNo: "50200018392819",
  ifscCode: "HDFC0001203",
  swiftCode: "HDFCINBBXXX",
  bankBranch: "Cybercity Tech Park Branch, Chennai",

  productCategories: [
    "IT Hardware & Laptops",
    "Desktop Servers",
    "Enterprise Networking & Routers",
    "Office Display Monitors",
    "Custom IT Accessories & Support SLA Services",
  ],

  certifications: [
    { name: "ISO 9001:2015 Quality Management", code: "ISO-QMS-9921", date: "2024-03-12" },
    { name: "ISO 27001:2013 Information Security", code: "ISO-ISMS-3004", date: "2025-06-20" },
    { name: "GST Registration Certification", code: "GST-REG-33", date: "2020-04-01" },
    { name: "EcoVadis Sustainability Gold Medal", code: "EV-SUS-GOLD", date: "2026-01-15" }
  ],

  notificationPreferences: {
    newRfqAlerts: true,
    poReleasedAlerts: true,
    paymentRemittanceAlerts: true,
    systemUpdates: false,
    alertFrequency: "Real-time", // Real-time, Daily Digest, Weekly
  },

  securitySettings: {
    twoFactorAuth: true,
    sessionTimeoutMinutes: 30,
  }
};

const initialActivityLogs = [
  { action: "User Login", ip: "192.168.1.14", timestamp: "2026-07-27 08:32 AM", details: "Logged into Supplier Portal via Chrome Windows" },
  { action: "Submit Quotation", ip: "192.168.1.14", timestamp: "2026-07-25 04:45 PM", details: "Submitted QUOTE-2026-001 against RFQ-2026-901" },
  { action: "Update Bank Details", ip: "192.168.1.10", timestamp: "2026-07-22 11:20 AM", details: "Modified SWIFT code mapping" },
  { action: "Upload Certificate", ip: "192.168.1.14", timestamp: "2026-07-15 02:15 PM", details: "Uploaded EcoVadis Sustainability Gold Medal pdf" },
  { action: "Password Changed", ip: "192.168.1.10", timestamp: "2026-06-30 09:00 AM", details: "Changed user account security credentials" },
];

const VendorProfile = () => {
  const [profile, setProfile] = useState(initialProfileData);
  const [activityLogs, setActivityLogs] = useState(initialActivityLogs);
  const [activeSubTab, setActiveSubTab] = useState("company"); // company, compliance, settings, logs
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Edit Temp Form State
  const [editCompanyName, setEditCompanyName] = useState(profile.companyName);
  const [editWebsite, setEditWebsite] = useState(profile.website);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editLocation, setEditLocation] = useState(profile.location);
  const [editRepName, setEditRepName] = useState(profile.repName);
  const [editGstin, setEditGstin] = useState(profile.gstin);
  const [editBankName, setEditBankName] = useState(profile.bankName);
  const [editAccountNo, setEditAccountNo] = useState(profile.accountNo);
  const [editIfsc, setEditIfsc] = useState(profile.ifscCode);
  const [editSwift, setEditSwift] = useState(profile.swiftCode);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Custom Category Input
  const [newCategory, setNewCategory] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({
      ...profile,
      companyName: editCompanyName,
      website: editWebsite,
      email: editEmail,
      phone: editPhone,
      location: editLocation,
      repName: editRepName,
      gstin: editGstin,
      bankName: editBankName,
      accountNo: editAccountNo,
      ifscCode: editIfsc,
      swiftCode: editSwift,
    });
    
    // Add log
    const log = {
      action: "Profile Update",
      ip: "127.0.0.1",
      timestamp: new Date().toLocaleString(),
      details: "Modified company profile information & contact attributes."
    };
    setActivityLogs([log, ...activityLogs]);
    setIsEditing(false);
    triggerToast("Company profile updated successfully!");
  };

  const handleCancelEdit = () => {
    // Reset temp state
    setEditCompanyName(profile.companyName);
    setEditWebsite(profile.website);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setEditLocation(profile.location);
    setEditRepName(profile.repName);
    setEditGstin(profile.gstin);
    setEditBankName(profile.bankName);
    setEditAccountNo(profile.accountNo);
    setEditIfsc(profile.ifscCode);
    setEditSwift(profile.swiftCode);
    setIsEditing(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      triggerToast("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("New passwords do not match!");
      return;
    }
    
    // Add log
    const log = {
      action: "Password Change",
      ip: "127.0.0.1",
      timestamp: new Date().toLocaleString(),
      details: "Updated active sign-in security credentials."
    };
    setActivityLogs([log, ...activityLogs]);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerToast("Security password updated successfully!");
  };

  const handleTogglePref = (key) => {
    setProfile({
      ...profile,
      notificationPreferences: {
        ...profile.notificationPreferences,
        [key]: !profile.notificationPreferences[key]
      }
    });
  };

  const handleToggle2FA = () => {
    setProfile({
      ...profile,
      securitySettings: {
        ...profile.securitySettings,
        twoFactorAuth: !profile.securitySettings.twoFactorAuth
      }
    });
    triggerToast("Two-Factor Authentication toggled.");
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setProfile({
      ...profile,
      productCategories: [...profile.productCategories, newCategory.trim()]
    });
    setNewCategory("");
    triggerToast("Added new product category mapping!");
  };

  const handleRemoveCategory = (index) => {
    setProfile({
      ...profile,
      productCategories: profile.productCategories.filter((_, idx) => idx !== index)
    });
  };

  const handleUploadCertificate = () => {
    const name = prompt("Enter Certification Name:", "ISO 14001 Environmental Standard");
    const code = prompt("Enter Certification Code:", "ISO-14001-2026");
    if (name && code) {
      const newCert = {
        name,
        code,
        date: new Date().toISOString().split("T")[0]
      };
      setProfile({
        ...profile,
        certifications: [...profile.certifications, newCert]
      });
      
      const log = {
        action: "Certificate Upload",
        ip: "127.0.0.1",
        timestamp: new Date().toLocaleString(),
        details: `Uploaded compliance credential: ${name}`
      };
      setActivityLogs([log, ...activityLogs]);
      triggerToast("Compliance certification uploaded!");
    }
  };

  return (
    <div className="vnd-profile-container" style={{ padding: "20px" }}>
      
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
      <div className="vnd-page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <UserCheck color="#f8b400" size={28} /> Supplier Credentials & Profile
          </h1>
          <p className="vnd-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Manage official company attributes, bank routing numbers, compliance documentation, security parameters, and review activity history.
          </p>
        </div>

        {!isEditing && activeSubTab === "company" && (
          <button className="vnd-btn-primary-sm" onClick={() => setIsEditing(true)}>
            <Edit3 size={15} /> Edit Profile Credentials
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => { setActiveSubTab("company"); setIsEditing(false); }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "company" ? "700" : "500",
            color: activeSubTab === "company" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "company" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Company Information & Contacts
        </button>
        <button
          onClick={() => { setActiveSubTab("compliance"); setIsEditing(false); }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "compliance" ? "700" : "500",
            color: activeSubTab === "compliance" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "compliance" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Compliance, GST & Categories
        </button>
        <button
          onClick={() => { setActiveSubTab("settings"); setIsEditing(false); }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "settings" ? "700" : "500",
            color: activeSubTab === "settings" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "settings" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Notification & Security Settings
        </button>
        <button
          onClick={() => { setActiveSubTab("logs"); setIsEditing(false); }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "logs" ? "700" : "500",
            color: activeSubTab === "logs" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "logs" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Portal Activity Logs
        </button>
      </div>

      {/* Main Content Areas */}
      {activeSubTab === "company" && (
        <div className="vnd-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          {!isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Identity Banner */}
              <div style={{ display: "flex", gap: "20px", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
                <div style={{ width: "64px", height: "64px", background: "rgba(248, 180, 0, 0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justify: "center", color: "#d97706" }}>
                  <Building size={32} />
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Registered Supplier</span>
                  <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111", margin: 0 }}>{profile.companyName}</h2>
                  <p style={{ fontSize: "13px", color: "#555", marginTop: "2px" }}>ID Reference: <strong>{profile.vendorId}</strong> | Type: <strong>{profile.vendorType}</strong></p>
                </div>
              </div>

              {/* Core Information Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                
                {/* Left Side: Contact Details */}
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Mail size={16} color="#f8b400" /> Contact Details
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Primary Website</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#3b82f6", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Globe size={14} /> <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{profile.website}</a>
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Primary Sales Email</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{profile.email}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Corporate Phone</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{profile.phone}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Authorized Representative</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{profile.repName}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Enterprise Support Line</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{profile.supportContact}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Physical Office / Delivery Address</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{profile.location}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Bank Account & Payment Routing */}
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <DollarSign size={16} color="#059669" /> Bank Account Information
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Beneficiary Bank Name</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{profile.bankName}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Account Number</span>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#059669", marginTop: "2px" }}>{profile.accountNo}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>IFSC Code</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{profile.ifscCode}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>SWIFT / BIC Code</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{profile.swiftCode}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Bank Branch Address</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{profile.bankBranch}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Editing State Form */
            <form onSubmit={handleSaveProfile}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", marginBottom: "20px" }}>Edit Corporate Attributes</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                
                {/* Left Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">Company Name</label>
                    <input
                      type="text"
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      className="vnd-form-input"
                      required
                    />
                  </div>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">Sales Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="vnd-form-input"
                      required
                    />
                  </div>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">Corporate Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="vnd-form-input"
                      required
                    />
                  </div>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">Website</label>
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      className="vnd-form-input"
                    />
                  </div>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">Authorized Rep Name</label>
                    <input
                      type="text"
                      value={editRepName}
                      onChange={(e) => setEditRepName(e.target.value)}
                      className="vnd-form-input"
                    />
                  </div>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">Office Address</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="vnd-form-input"
                    />
                  </div>
                </div>

                {/* Right Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">GSTIN Code</label>
                    <input
                      type="text"
                      value={editGstin}
                      onChange={(e) => setEditGstin(e.target.value)}
                      className="vnd-form-input"
                    />
                  </div>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">Beneficiary Bank Name</label>
                    <input
                      type="text"
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="vnd-form-input"
                    />
                  </div>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">Account Number</label>
                    <input
                      type="text"
                      value={editAccountNo}
                      onChange={(e) => setEditAccountNo(e.target.value)}
                      className="vnd-form-input"
                    />
                  </div>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">IFSC Code</label>
                    <input
                      type="text"
                      value={editIfsc}
                      onChange={(e) => setEditIfsc(e.target.value)}
                      className="vnd-form-input"
                    />
                  </div>
                  <div className="vnd-form-group">
                    <label className="vnd-form-label">SWIFT Code</label>
                    <input
                      type="text"
                      value={editSwift}
                      onChange={(e) => setEditSwift(e.target.value)}
                      className="vnd-form-input"
                    />
                  </div>
                </div>

              </div>

              {/* Edit Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", borderTop: "1px solid #f2f2f2", paddingTop: "20px" }}>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: "#f8f9fb",
                    color: "#111",
                    border: "1px solid #d9d9d9",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="vnd-btn-primary-sm" style={{ padding: "10px 24px" }}>
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeSubTab === "compliance" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
          
          {/* Left Column: Certifications & GST */}
          <div className="vnd-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* GST Info */}
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#059669" /> GST Information (Goods & Services Tax)
              </h3>
              <div style={{ background: "#f0fdf4", border: "1px solid rgba(5,150,105,0.2)", borderRadius: "8px", padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#666" }}>Registered GSTIN</span>
                  <p style={{ fontSize: "15px", fontWeight: "800", color: "#111", marginTop: "2px" }}>{profile.gstin}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#666" }}>GST Status</span>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#059669", marginTop: "2px" }}>✓ {profile.gstStatus}</p>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ fontSize: "11px", color: "#666" }}>GST Filing & Reconciliations</span>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#555", marginTop: "2px" }}>{profile.gstFilingStatus}</p>
                </div>
              </div>
            </div>

            {/* Certifications List */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={18} color="#f8b400" /> Compliance Documents & Certifications
                </h3>
                <button
                  className="vnd-btn-primary-sm"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={handleUploadCertificate}
                >
                  <Upload size={13} /> Upload Compliance Document
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {profile.certifications.map((cert, index) => (
                  <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fb", border: "1px solid #eee", padding: "12px 16px", borderRadius: "8px" }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: 0 }}>{cert.name}</p>
                      <span style={{ fontSize: "11px", color: "#666" }}>Reference No: <strong>{cert.code}</strong> • Issued/Uploaded: {cert.date}</span>
                    </div>
                    <button
                      style={{ background: "none", border: "none", color: "#d97706", cursor: "pointer" }}
                      onClick={() => triggerToast(`Downloading certification document: ${cert.code}.pdf`)}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Product Categories */}
          <div className="vnd-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={18} color="#f8b400" /> Product Categories Catalog
            </h3>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
              Manage industry segment categories your company is qualified to submit bids for.
            </p>

            <form onSubmit={handleAddCategory} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="e.g. Server Cabinets"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d9d9d9",
                  fontSize: "13.5px",
                }}
              />
              <button
                type="submit"
                className="vnd-btn-primary-sm"
                style={{ padding: "8px 12px" }}
              >
                <Plus size={15} /> Add
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {profile.productCategories.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fafafa",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #eee",
                    fontSize: "13.5px",
                    fontWeight: "600",
                  }}
                >
                  <span>• {cat}</span>
                  <button
                    onClick={() => handleRemoveCategory(idx)}
                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "12px" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeSubTab === "settings" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Left: Preferences */}
          <div className="vnd-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={18} color="#f8b400" /> Notification Preferences
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.newRfqAlerts}
                    onChange={() => handleTogglePref("newRfqAlerts")}
                    style={{ width: "16px", height: "16px" }}
                  />
                  New RFQ Opportunities alerts
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.poReleasedAlerts}
                    onChange={() => handleTogglePref("poReleasedAlerts")}
                    style={{ width: "16px", height: "16px" }}
                  />
                  Purchase Order Release alerts
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.paymentRemittanceAlerts}
                    onChange={() => handleTogglePref("paymentRemittanceAlerts")}
                    style={{ width: "16px", height: "16px" }}
                  />
                  Payment Reconciliations & Remittance advice alerts
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.systemUpdates}
                    onChange={() => handleTogglePref("systemUpdates")}
                    style={{ width: "16px", height: "16px" }}
                  />
                  General Supplier newsletter & system maintenance notices
                </label>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Lock size={18} color="#d97706" /> Security Settings
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={profile.securitySettings.twoFactorAuth}
                    onChange={handleToggle2FA}
                    style={{ width: "16px", height: "16px" }}
                  />
                  Enable Two-Factor Authentication (2FA via SMS/Auth App)
                </label>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Inactivity Auto-Logout Timeout</span>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginTop: "2px" }}>
                    {profile.securitySettings.sessionTimeoutMinutes} Minutes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Change Password */}
          <div className="vnd-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Key size={18} color="#dc2626" /> Change Portal Password
            </h3>

            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="vnd-form-group">
                <label className="vnd-form-label">Current Account Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="vnd-form-input"
                  required
                />
              </div>
              <div className="vnd-form-group">
                <label className="vnd-form-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="vnd-form-input"
                  required
                />
              </div>
              <div className="vnd-form-group">
                <label className="vnd-form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="vnd-form-input"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="vnd-btn-primary-sm"
                style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
              >
                Change Security Password
              </button>
            </form>
          </div>

        </div>
      )}

      {activeSubTab === "logs" && (
        <div className="vnd-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} color="#d97706" /> Account Security & Action Logs
          </h3>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
            Below is a real-time audit log of access and profile changes executed on this supplier account.
          </p>

          <div className="vnd-table-container">
            <table className="vnd-table">
              <thead>
                <tr>
                  <th>Event Action</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                  <th>Operation Description</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: "700", color: "#111" }}>{log.action}</td>
                    <td style={{ color: "#555" }}>{log.ip}</td>
                    <td style={{ color: "#d97706", fontWeight: "600", fontSize: "13px" }}>{log.timestamp}</td>
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

export default VendorProfile;
