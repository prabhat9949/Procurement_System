import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrgAdminDashboard.css";

import {
  Building2,
  ShoppingBag,
  DollarSign,
  Boxes,
  Database,
  Truck,
  Activity,
  Users,
  BarChart2,
  ShieldCheck,
  AlertTriangle,
  FolderKanban,
  Bell,
  Lock,
  FileText,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Server,
} from "lucide-react";

import OrgOverview from "./modules/OrgOverview";
import OrgProcurementAnalytics from "./modules/OrgProcurementAnalytics";
import OrgFinancialAnalytics from "./modules/OrgFinancialAnalytics";
import OrgInventoryAnalytics from "./modules/OrgInventoryAnalytics";
import OrgVendorAnalytics from "./modules/OrgVendorAnalytics";
import OrgDeptAnalytics from "./modules/OrgDeptAnalytics";
import OrgUserAnalytics from "./modules/OrgUserAnalytics";
import BusinessIntelligence from "./modules/BusinessIntelligence";
import OrgComplianceMonitoring from "./modules/OrgComplianceMonitoring";
import OrgRiskAnalysis from "./modules/OrgRiskAnalysis";
import OrgReports from "./modules/OrgReports";
import OrgMasterDataPanel from "./modules/OrgMasterDataPanel";
import OrgSystemHealth from "./modules/OrgSystemHealth";

// Real admin control modules (shared with the Super Admin portal)
import SuperUserManagement from "../super_admin/modules/SuperUserManagement";
import SuperRoleManagement from "../super_admin/modules/SuperRoleManagement";
import SuperPermissionManagement from "../super_admin/modules/SuperPermissionManagement";
import SuperVendorMonitoring from "../super_admin/modules/SuperVendorMonitoring";
import SuperAuditLogs from "../super_admin/modules/SuperAuditLogs";
import SuperNotificationsCenter from "../super_admin/modules/SuperNotificationsCenter";
import SuperSettings from "../super_admin/modules/SuperSettings";

const OrgAdminDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Organization Admin";
  const [activeTab, setActiveTab] = useState("org-overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navMenuItems = [
    { id: "org-overview", label: "Admin Dashboard", icon: Building2 },
    { id: "system-health", label: "System Health", icon: Server },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "role-management", label: "Role Management", icon: ShieldCheck },
    { id: "permission-management", label: "Permission Management", icon: Lock },
    { id: "master-data", label: "Master Data Management", icon: Database },
    { id: "vendor-monitoring", label: "Vendors & KYC", icon: Truck },
    { id: "audit-logs", label: "Audit Logs", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "procurement-analytics", label: "Procurement Analytics", icon: ShoppingBag },
    { id: "financial-analytics", label: "Financial Analytics", icon: DollarSign },
    { id: "inventory-analytics", label: "Inventory Analytics", icon: Boxes },
    { id: "vendor-analytics", label: "Vendor Analytics", icon: Activity },
    { id: "department-analytics", label: "Department Analytics", icon: BarChart2 },
    { id: "organization-reports", label: "Reports", icon: FolderKanban },
    { id: "compliance-monitoring", label: "Compliance Monitoring", icon: ShieldCheck },
    { id: "risk-analysis", label: "Risk Analysis", icon: AlertTriangle },
    { id: "settings", label: "Account & Security", icon: Settings },
    ];

  const handleLogout = () => {
    // Clear the complete EPS session so the Back button can never look like a logout.
    localStorage.removeItem("eps_access_token");
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_role_code");
    localStorage.removeItem("eps_username");
    localStorage.removeItem("eps_display_name");
    localStorage.removeItem("eps_user_id");
    navigate("/login", { replace: true });
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
      case "org-overview":
        return <OrgOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "system-health":
        return <OrgSystemHealth />;
      case "user-management":
        return <SuperUserManagement />;
      case "role-management":
        return <SuperRoleManagement />;
      case "permission-management":
        return <SuperPermissionManagement />;
      case "master-data":
        return <OrgMasterDataPanel />;
      case "vendor-monitoring":
        return <SuperVendorMonitoring />;
      case "audit-logs":
        return <SuperAuditLogs />;
      case "notifications":
        return <SuperNotificationsCenter />;
      case "procurement-analytics":
        return <OrgProcurementAnalytics />;
      case "financial-analytics":
        return <OrgFinancialAnalytics />;
      case "inventory-analytics":
        return <OrgInventoryAnalytics />;
      case "vendor-analytics":
        return <OrgVendorAnalytics />;
      case "department-analytics":
        return <OrgDeptAnalytics />;
      case "user-analytics":
        return <OrgUserAnalytics />;
      case "business-intelligence":
        return <BusinessIntelligence />;
      case "compliance-monitoring":
        return <OrgComplianceMonitoring />;
      case "risk-analysis":
        return <OrgRiskAnalysis />;
      case "organization-reports":
        return <OrgReports />;
      case "profile":
      case "settings":
        return <SuperSettings />;
      default:
        return <OrgOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="org-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`org-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="org-sidebar-header">
          <div className="org-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="org-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="org-brand-text">
                <span className="org-brand-title">Enterprise</span>
                <span className="org-brand-subtitle">Admin Control Center</span>
              </div>
            )}
          </div>
          <button
            className="org-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="org-sidebar-nav">
          <div className="org-nav-section-title">Organization BI Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`org-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="org-nav-icon" size={19} />
                <span className="org-nav-label">{item.label}</span>
                {item.badge && <span className="org-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Org Admin User Badge Footer & Logout below Profile */}
        <div className="org-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div className="org-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}>
                <div className="org-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="org-user-details">
                  <span className="org-user-name">{displayName}</span>
                  <span className="org-user-role">System Administrator</span>
                </div>
              </div>

              <button
                className="org-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="org-sidebar-logout-btn collapsed"
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
        className={`org-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Bar */}
        <div className="org-mobile-bar">
          <button
            className="org-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>                  <span style={{ fontWeight: "800", fontSize: "16px", color: "#111" }}>
            EPS Admin Control Center
          </span>
        </div>

        {/* Page Content Body */}
        <main className="org-page-content">{renderActiveModule()}</main>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="org-modal-overlay">
          <div className="org-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>
              Confirm Organization Admin Logout
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Executive BI Command Portal?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="org-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="org-btn-primary-sm"
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

export default OrgAdminDashboard;
