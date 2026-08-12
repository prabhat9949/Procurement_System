import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuditorDashboard.css";

import {
  LayoutDashboard,
  ShieldCheck,
  DollarSign,
  FileText,
  Star,
  Boxes,
  AlertTriangle,
  FolderKanban,
  Bell,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import AuditorOverview from "./modules/AuditorOverview";
import ProcurementAudits from "./modules/ProcurementAudits";
import FinancialAudits from "./modules/FinancialAudits";
import PoAudits from "./modules/PoAudits";
import VendorAudits from "./modules/VendorAudits";
import InventoryAudits from "./modules/InventoryAudits";
import ComplianceMonitoring from "./modules/ComplianceMonitoring";
import RiskAnalysis from "./modules/RiskAnalysis";
import AuditReports from "./modules/AuditReports";
import AuditorNotifications from "./modules/AuditorNotifications";
import AuditorProfile from "./modules/AuditorProfile";
import AuditorSettings from "./modules/AuditorSettings";
import AuditorBudgetAllocation from "./modules/AuditorBudgetAllocation";

const AuditorDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Auditor";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "procurement-audits", label: "Procurement Audits", icon: ShieldCheck },
    { id: "financial-audits", label: "Financial Audits", icon: DollarSign },
    { id: "po-audits", label: "PO Audits", icon: FileText },
    { id: "vendor-audits", label: "Vendor Audits", icon: Star },
    { id: "inventory-audits", label: "Inventory Audits", icon: Boxes },
    { id: "compliance-monitoring", label: "Compliance Monitoring", icon: ShieldCheck },
    { id: "risk-analysis", label: "Risk Analysis", icon: AlertTriangle },
    { id: "budget-allocations", label: "Budget Allocations", icon: DollarSign },
    { id: "reports", label: "Audit Reports", icon: FolderKanban },
    ];

  const handleLogout = () => {
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_access_token");
    navigate("/login");
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <AuditorOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "procurement-audits":
        return <ProcurementAudits />;
      case "financial-audits":
        return <FinancialAudits />;
      case "po-audits":
        return <PoAudits />;
      case "vendor-audits":
        return <VendorAudits />;
      case "inventory-audits":
        return <InventoryAudits />;
      case "compliance-monitoring":
        return <ComplianceMonitoring />;
      case "risk-analysis":
        return <RiskAnalysis />;
      case "budget-allocations":
        return <AuditorBudgetAllocation />;
      case "reports":
        return <AuditReports />;
      case "profile":
        return <AuditorProfile />;
      default:
        return <AuditorOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="aud-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`aud-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="aud-sidebar-header">
          <div className="aud-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="aud-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="aud-brand-text">
                <span className="aud-brand-title">Enterprise</span>
                <span className="aud-brand-subtitle">Auditor Portal</span>
              </div>
            )}
          </div>
          <button
            className="aud-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="aud-sidebar-nav">
          <div className="aud-nav-section-title">Auditor Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`aud-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="aud-nav-icon" size={19} />
                <span className="aud-nav-label">{item.label}</span>
                {item.badge && <span className="aud-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Auditor User Badge Footer & Logout below Profile */}
        <div className="aud-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div className="aud-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}>
                <div className="aud-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="aud-user-details">
                  <span className="aud-user-name">{displayName}</span>
                  <span className="aud-user-role">Auditor</span>
                </div>
              </div>

              <button
                className="aud-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="aud-sidebar-logout-btn collapsed"
              onClick={() => setShowLogoutModal(true)}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 95,
          }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <div
        className={`aud-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Bar */}
        <div className="aud-mobile-bar">
          <button
            className="aud-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>
            EPS Auditor Portal
          </span>
        </div>

        {/* Page Content Body */}
        <main className="aud-page-content">{renderActiveModule()}</main>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="aud-modal-overlay">
          <div className="aud-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>
              Confirm Auditor Logout
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Independent Governance Portal?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="aud-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="aud-btn-primary-sm"
                style={{
                  background: "#f8f9fb",
                  color: "#111",
                  border: "1px solid #d9d9d9",
                }}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditorDashboard;
