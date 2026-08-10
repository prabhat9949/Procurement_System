import React, { useState } from "react";
import {
  Globe,
  Building2,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Eye,
  Settings,
  DollarSign,
  Calendar,
  X,
} from "lucide-react";

const initialOrgs = [
  { code: "ORG-GLOBAL-HQ", name: "Enterprise Global HQ - North America", users: 480, status: "Active", subTier: "Enterprise Premium", subCost: "$25,000/mo", renewal: "2027-01-15", performance: "99.99% Uptime", csat: "4.9/5.0" },
  { code: "ORG-EU-SUBSIDIARY", name: "Enterprise Europe B.V. - Frankfurt Hub", users: 320, status: "Active", subTier: "Enterprise Premium", subCost: "$18,000/mo", renewal: "2026-12-10", performance: "99.98% Uptime", csat: "4.8/5.0" },
  { code: "ORG-APAC-HQ", name: "Enterprise Asia-Pacific Pte Ltd - Singapore", users: 280, status: "Active", subTier: "Standard Enterprise", subCost: "$12,000/mo", renewal: "2026-11-20", performance: "99.97% Uptime", csat: "4.7/5.0" },
  { code: "ORG-LATAM-OFFICE", name: "Enterprise LatAm - Brazil Desk", users: 50, status: "Inactive", subTier: "Trial Sandbox", subCost: "$0/mo", renewal: "Expired", performance: "N/A", csat: "N/A" }
];

const SuperOrgManagement = () => {
  const [orgs, setOrgs] = useState(initialOrgs);
  const [activeSubTab, setActiveSubTab] = useState("view"); // view, add
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  // Form State
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newTier, setNewTier] = useState("Standard Enterprise");
  const [newCost, setNewCost] = useState("$12,000/mo");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleToggleStatus = (code) => {
    setOrgs(
      orgs.map((o) => {
        if (o.code === code) {
          const nextStatus = o.status === "Active" ? "Inactive" : "Active";
          triggerToast(`Organization ${code} has been marked as ${nextStatus}.`);
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
    setSelectedOrg(null);
  };

  const handleAddOrg = (e) => {
    e.preventDefault();
    const newOrgItem = {
      code: newCode.toUpperCase(),
      name: newName,
      users: 1,
      status: "Active",
      subTier: newTier,
      subCost: newCost,
      renewal: "2027-07-27",
      performance: "100.00% Uptime",
      csat: "N/A",
    };
    setOrgs([...orgs, newOrgItem]);
    setNewCode("");
    setNewName("");
    setActiveSubTab("view");
    triggerToast(`Subsidiary ${newOrgItem.code} added successfully!`);
  };

  return (
    <div className="sadmin-org-mgmt-container" style={{ padding: "20px" }}>
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
      <div className="sadmin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Globe color="#f8b400" size={28} /> Organization Tenant Management
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Add subsidiaries, toggle active/inactive tenant standing, and evaluate subscription billing terms.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("view")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "view" ? "700" : "500",
            color: activeSubTab === "view" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "view" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Active Enterprise Subsidiaries
        </button>
        <button
          onClick={() => setActiveSubTab("add")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "add" ? "700" : "500",
            color: activeSubTab === "add" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "add" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Add Subsidiary Node
        </button>
      </div>

      {/* 1. View Tab */}
      {activeSubTab === "view" && (
        <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Org Code</th>
                  <th>Subsidiary Node Name</th>
                  <th>Active Users</th>
                  <th>Subscription Tier</th>
                  <th>Cost Outflow</th>
                  <th>Uptime Performance</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((o) => (
                  <tr key={o.code}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{o.code}</td>
                    <td style={{ fontWeight: "700" }}>{o.name}</td>
                    <td>{o.users} Users</td>
                    <td style={{ fontWeight: "600" }}>{o.subTier}</td>
                    <td style={{ color: "#059669", fontWeight: "700" }}>{o.subCost}</td>
                    <td style={{ fontWeight: "700" }}>{o.performance}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: o.status === "Active" ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                          color: o.status === "Active" ? "#059669" : "#dc2626",
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="sadmin-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                        onClick={() => setSelectedOrg(o)}
                        title="View Org Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Add Tab */}
      {activeSubTab === "add" && (
        <div className="sadmin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "560px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px" }}>
            Provision New Subsidiary Tenant
          </h3>
          
          <form onSubmit={handleAddOrg} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Org Code (Unique) *</label>
              <input type="text" placeholder="e.g. ORG-APAC-SUB" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="sadmin-form-input" required />
            </div>
            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Subsidiary Tenant Name *</label>
              <input type="text" placeholder="e.g. Enterprise Tokyo Sourcing Ltd" value={newName} onChange={(e) => setNewName(e.target.value)} className="sadmin-form-input" required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sadmin-form-group">
                <label className="sadmin-form-label">Subscription Tier *</label>
                <select value={newTier} onChange={(e) => setNewTier(e.target.value)} className="sadmin-form-select">
                  <option value="Enterprise Premium">Enterprise Premium</option>
                  <option value="Standard Enterprise">Standard Enterprise</option>
                  <option value="Trial Sandbox">Trial Sandbox</option>
                </select>
              </div>
              <div className="sadmin-form-group">
                <label className="sadmin-form-label">Cost Rate *</label>
                <input type="text" value={newCost} onChange={(e) => setNewCost(e.target.value)} className="sadmin-form-input" required />
              </div>
            </div>

            <button type="submit" className="sadmin-btn-primary-sm" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}>
              Provision Org Subsidiary Node
            </button>
          </form>
        </div>
      )}

      {/* Details modal */}
      {selectedOrg && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>ORGANIZATION TENANT INFO</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  Tenant Code: {selectedOrg.code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14.5px" }}>
                <p><strong>Org Name:</strong> {selectedOrg.name}</p>
                <p><strong>Uptime Performance Score:</strong> {selectedOrg.performance}</p>
                <p><strong>Average CSAT satisfaction:</strong> {selectedOrg.csat}</p>
                
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "6px", margin: "10px 0 0" }}>Subscription Details</h4>
                <p><strong>Tier level:</strong> {selectedOrg.subTier}</p>
                <p><strong>Billing Rate:</strong> {selectedOrg.subCost}</p>
                <p><strong>Next Renewal Date:</strong> {selectedOrg.renewal}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="sadmin-btn-primary-sm"
                style={{ background: selectedOrg.status === "Active" ? "#dc2626" : "#059669", color: "#fff", border: "none" }}
                onClick={() => handleToggleStatus(selectedOrg.code)}
              >
                {selectedOrg.status === "Active" ? "Deactivate Organization" : "Activate Organization"}
              </button>
              
              <button
                className="sadmin-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedOrg(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperOrgManagement;
