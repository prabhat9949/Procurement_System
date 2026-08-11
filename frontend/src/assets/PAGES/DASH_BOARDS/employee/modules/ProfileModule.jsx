import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Key,
  Briefcase,
  BadgeCheck,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
const ProfileModule = ({ me, authMe }) => {
  const employee = me;
  const account = authMe;

  const infoRow = (Icon, label, value) => (
    <div style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: "1px solid #f2f4f6" }}>
      <Icon size={17} style={{ color: "#2563eb", flexShrink: 0, marginTop: 2 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#7a8999", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 2, wordBreak: "break-word" }}>{value || "—"}</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "20px", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <User color="#2563eb" />
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111" }}>My Profile</h1>
          <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
            Your identity and organizational information as stored in the database. Organizational fields are managed by Admin/HR.
          </p>
        </div>
      </div>

      {/* Identity card */}
      <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, padding: "24px", marginBottom: 18, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800 }}>
          {((employee?.firstName?.[0] || "") + (employee?.lastName?.[0] || "")).toUpperCase() || "E"}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>
            {employee ? `${employee.firstName} ${employee.lastName}` : account?.displayName || "Employee"}
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            <span style={{ background: "rgba(37,99,235,.1)", color: "#2563eb", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>{employee?.roleName || account?.roleName || "EMPLOYEE"}</span>
            {employee?.employeeCode && <span style={{ background: "#f1f5f9", color: "#475569", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>{employee.employeeCode}</span>}
            {employee?.active != null && (
              <span style={{ background: employee.active ? "rgba(5,150,105,.1)" : "rgba(220,38,38,.1)", color: employee.active ? "#059669" : "#dc2626", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>
                {employee.active ? "ACTIVE" : "INACTIVE"}
              </span>
            )}
          </div>
        </div>
        {account?.username && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#7a8999", fontWeight: 700 }}>Username</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{account.username}</div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Personal */}
        <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, padding: "20px 22px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
            <BadgeCheck size={16} color="#2563eb" /> Personal Information
          </h3>
          {infoRow(Mail, "Email", employee?.email)}
          {infoRow(Phone, "Phone", employee?.phone)}
          {infoRow(Key, "Username", account?.username)}
          {infoRow(Shield, "Role", employee?.roleName || account?.roleName)}
        </div>

        {/* Organization */}
        <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, padding: "20px 22px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
            <Building size={16} color="#2563eb" /> Organizational Information
          </h3>
          {infoRow(Briefcase, "Department", employee?.departmentName)}
          {infoRow(Building, "Cost Center", employee?.costCenterCode ? `${employee.costCenterCode} — ${employee.costCenterName}` : employee?.costCenterName)}
          {infoRow(User, "Reporting Manager", employee?.managerName)}
          {infoRow(Shield, "Designation", employee?.roleName)}
        </div>
      </div>

      {/* Password changes are managed by Admin only. */}
      <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, padding: "20px 22px", marginTop: 18, maxWidth: 620 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
          <Key size={16} color="#64748b" /> Account Security
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
          Password changes are handled by your system administrator only. If you need to reset your
          password, please contact the Admin / HR team.
        </p>
      </div>
    </div>
  );
};

export default ProfileModule;
