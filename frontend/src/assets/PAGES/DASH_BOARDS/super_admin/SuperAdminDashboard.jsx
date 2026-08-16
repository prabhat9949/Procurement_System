import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SuperAdminDashboard.css";

import {
  Globe,
  Building2,
  Users,
  ShieldCheck,
  Lock,
  Activity,
  ShoppingBag,
  IndianRupee,
  Boxes,
  Truck,
  FileText,
  Bell,
  FolderKanban,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Server,
  FlaskConical,
} from "lucide-react";

import SuperSystemOverview from "./modules/SuperSystemOverview";
import SuperOrgManagement from "./modules/SuperOrgManagement";
import SuperUserManagement from "./modules/SuperUserManagement";
import SuperRoleManagement from "./modules/SuperRoleManagement";
import SuperPermissionManagement from "./modules/SuperPermissionManagement";
import SuperSystemAnalytics from "./modules/SuperSystemAnalytics";
import SuperProcurementMonitoring from "./modules/SuperProcurementMonitoring";
import SuperFinancialMonitoring from "./modules/SuperFinancialMonitoring";
import SuperInventoryMonitoring from "./modules/SuperInventoryMonitoring";
import SuperVendorMonitoring from "./modules/SuperVendorMonitoring";
import SuperSecurityCenter from "./modules/SuperSecurityCenter";
import SuperAuditLogs from "./modules/SuperAuditLogs";
import SuperNotificationsCenter from "./modules/SuperNotificationsCenter";
import SuperGlobalReports from "./modules/SuperGlobalReports";
import OrgMasterDataPanel from "../org_admin/modules/OrgMasterDataPanel";
import OrgSystemHealth from "../org_admin/modules/OrgSystemHealth";

import SuperSettings from "./modules/SuperSettings";
import SuperDemoBriefing from "./modules/SuperDemoBriefing";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Super Administrator";
  const [activeTab, setActiveTab] = useState("system-overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navMenuItems = [
    { id: "system-overview", label: "System Overview", icon: Globe },
    { id: "system-health", label: "System Health", icon: Server },
    { id: "organization-management", label: "Organization Management", icon: Building2 },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "role-management", label: "Role Management", icon: ShieldCheck },
    { id: "permission-management", label: "Permission Management", icon: Lock },
    { id: "system-analytics", label: "System Analytics", icon: Activity },
    { id: "procurement-monitoring", label: "Procurement Monitoring", icon: ShoppingBag },
    { id: "financial-monitoring", label: "Financial Monitoring", icon: IndianRupee },
    { id: "inventory-monitoring", label: "Inventory Monitoring", icon: Boxes },
    { id: "vendor-monitoring", label: "Vendor Monitoring", icon: Truck },
    { id: "security-center", label: "Security Center", icon: ShieldCheck },
    { id: "audit-logs", label: "Audit Logs", icon: FileText },
    { id: "master-data", label: "Master Data Management", icon: Globe },
    { id: "global-reports", label: "Global Reports", icon: FolderKanban },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "demo-briefing", label: "Demo / Briefing", icon: FlaskConical },
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
      case "system-overview":
        return <SuperSystemOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "system-health":
        return <OrgSystemHealth />;
      case "organization-management":
        return <SuperOrgManagement />;
      case "user-management":
        return <SuperUserManagement />;
      case "role-management":
        return <SuperRoleManagement />;
      case "permission-management":
        return <SuperPermissionManagement />;
      case "system-analytics":
        return <SuperSystemAnalytics />;
      case "procurement-monitoring":
        return <SuperProcurementMonitoring />;
      case "financial-monitoring":
        return <SuperFinancialMonitoring />;
      case "inventory-monitoring":
        return <SuperInventoryMonitoring />;
      case "vendor-monitoring":
        return <SuperVendorMonitoring />;
      case "security-center":
        return <SuperSecurityCenter />;
      case "audit-logs":
        return <SuperAuditLogs />;
      case "global-reports":
        return <SuperGlobalReports />;
      case "notifications":
        return <SuperNotificationsCenter />;
      case "demo-briefing":
        return <SuperDemoBriefing />;
      case "master-data":
        return <OrgMasterDataPanel />;
      case "profile":
      case "settings":
        return <SuperSettings />;
      default:
        return <SuperSystemOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="sadmin-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`sadmin-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="sadmin-sidebar-header">
          <div className="sadmin-brand" onClick={() => setActiveTab("system-overview")}>
            <div className="sadmin-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="sadmin-brand-text">
                <span className="sadmin-brand-title">Enterprise</span>
                <span className="sadmin-brand-subtitle">Admin Control Center</span>
              </div>
            )}
          </div>
          <button
            className="sadmin-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="sadmin-sidebar-nav">
          <div className="sadmin-nav-section-title">Root Super Admin Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sadmin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="sadmin-nav-icon" size={19} />
                <span className="sadmin-nav-label">{item.label}</span>
                {item.badge && <span className="sadmin-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Super Admin User Badge Footer & Logout below Profile */}
        <div className="sadmin-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div className="sadmin-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}>
                <div className="sadmin-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="sadmin-user-details">
                  <span className="sadmin-user-name">{displayName}</span>
                  <span className="sadmin-user-role">System Administrator</span>
                </div>
              </div>

              <button
                className="sadmin-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="sadmin-sidebar-logout-btn collapsed"
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
        className={`sadmin-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Bar */}
        <div className="sadmin-mobile-bar">
          <button
            className="sadmin-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "800", fontSize: "16px", color: "#111" }}>
            EPS Admin Control Center
          </span>
        </div>

        {/* Page Content Body */}
        <main className="sadmin-page-content">{renderActiveModule()}</main>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="sadmin-modal-overlay">
          <div className="sadmin-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>
              Confirm Super Admin Logout
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Root Enterprise Cloud Console?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="sadmin-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="sadmin-btn-primary-sm"
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

export default SuperAdminDashboard;
