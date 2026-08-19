import React, { useState } from "react";
import {
  Settings,
  UserCheck,
  Bell,
  Lock,
  CheckCircle2,
  Save,
  Sliders,
  Shield,
} from "lucide-react";

const ManagerSettings = () => {
  const [delegation, setDelegation] = useState({
    enabled: false,
    delegateTo: "David Ross (CTO)",
    startDate: "2026-08-10",
    endDate: "2026-08-20",
  });

  const [autoApprove, setAutoApprove] = useState({
    enabled: true,
    maxLimit: 500,
    categories: "Office Supplies & Minor Tools",
  });

  const [toastMsg, setToastMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg("Department Manager settings saved successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="dm-settings-container">
      {/* Header */}
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">
            <Settings color="#f8b400" /> Manager Workflow & Approval Preferences
          </h1>
          <p className="dm-page-subtitle">
            Configure delegation rules, auto-approval thresholds, and approval alert triggers.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            background: "rgba(5, 150, 105, 0.12)",
            border: "1px solid #059669",
            color: "#059669",
            padding: "12px 20px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Out-of-Office Delegation */}
          <div className="dm-card dm-card-gold-glow">
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
              <UserCheck size={18} color="#f8b400" /> Approval Authority Delegation (Out-of-Office)
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px",
                background: "#f8f9fb",
                borderRadius: "10px",
                marginBottom: "16px",
              }}
            >
              <div>
                <p style={{ color: "#111111", fontSize: "14px", fontWeight: "700" }}>
                  Enable Substitute Approver
                </p>
                <p style={{ color: "#666666", fontSize: "12px" }}>
                  Temporarily delegate sign-off authority during leave
                </p>
              </div>
              <input
                type="checkbox"
                checked={delegation.enabled}
                onChange={(e) => setDelegation({ ...delegation, enabled: e.target.checked })}
                style={{ width: "20px", height: "20px", accentColor: "#f8b400", cursor: "pointer" }}
              />
            </div>

            <div className="dm-form-group">
              <label className="dm-form-label">Delegate Sign-off Authority To</label>
              <select
                value={delegation.delegateTo}
                onChange={(e) => setDelegation({ ...delegation, delegateTo: e.target.value })}
                className="dm-form-select"
                disabled={!delegation.enabled}
              >
                <option value="David Ross (CTO)">David Ross (CTO)</option>
                <option value="Alex Morgan (Senior Architect)">Alex Morgan (Senior Architect)</option>
                <option value="Marcus Vance (Systems Admin)">Marcus Vance (Systems Admin)</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="dm-form-group">
                <label className="dm-form-label">Delegation Start Date</label>
                <input
                  type="date"
                  value={delegation.startDate}
                  onChange={(e) => setDelegation({ ...delegation, startDate: e.target.value })}
                  className="dm-form-input"
                  disabled={!delegation.enabled}
                />
              </div>

              <div className="dm-form-group">
                <label className="dm-form-label">Delegation End Date</label>
                <input
                  type="date"
                  value={delegation.endDate}
                  onChange={(e) => setDelegation({ ...delegation, endDate: e.target.value })}
                  className="dm-form-input"
                  disabled={!delegation.enabled}
                />
              </div>
            </div>
          </div>

          {/* Auto-Approval Rules */}
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
              <Sliders size={18} color="#f8b400" /> Low-Value Auto-Approval Thresholds
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px",
                background: "#f8f9fb",
                borderRadius: "10px",
                marginBottom: "16px",
              }}
            >
              <div>
                <p style={{ color: "#111111", fontSize: "14px", fontWeight: "700" }}>
                  Enable Low-Cost Auto-Approval
                </p>
                <p style={{ color: "#666666", fontSize: "12px" }}>
                  Bypass manual review for minor recurring department items
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoApprove.enabled}
                onChange={(e) => setAutoApprove({ ...autoApprove, enabled: e.target.checked })}
                style={{ width: "20px", height: "20px", accentColor: "#f8b400", cursor: "pointer" }}
              />
            </div>

            <div className="dm-form-group">
              <label className="dm-form-label">Maximum Auto-Approve Limit (INR)</label>
              <input
                type="number"
                value={autoApprove.maxLimit}
                onChange={(e) => setAutoApprove({ ...autoApprove, maxLimit: e.target.value })}
                className="dm-form-input"
                disabled={!autoApprove.enabled}
              />
            </div>

            <div className="dm-form-group">
              <label className="dm-form-label">Allowed Categories</label>
              <input
                type="text"
                value={autoApprove.categories}
                onChange={(e) => setAutoApprove({ ...autoApprove, categories: e.target.value })}
                className="dm-form-input"
                disabled={!autoApprove.enabled}
              />
            </div>
          </div>

          {/* Save Footer Button */}
          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="dm-btn-primary-sm" style={{ padding: "12px 28px" }}>
              <Save size={16} /> Save Manager Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManagerSettings;
