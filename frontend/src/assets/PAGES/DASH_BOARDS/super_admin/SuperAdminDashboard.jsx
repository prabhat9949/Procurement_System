import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLogoutHandler } from "../../../../services/logout";
import "./SuperAdminDashboard.css";

import {
  Globe,
  Building2,
  Users,

  Activity,
  ShoppingBag,

  FileText,
  Bell,
  FolderKanban,
  Settings,
  LifeBuoy,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Server,
} from "lucide-react";

import SuperSystemOverview from "./modules/SuperSystemOverview";
import SuperOrgManagement from "./modules/SuperOrgManagement";
import SuperUserManagement from "./modules/SuperUserManagement";

import SuperProcurementMonitoring from "./modules/SuperProcurementMonitoring";
import SuperInventoryMonitoring from "./modules/SuperInventoryMonitoring";
import SuperNotificationsCenter from "./modules/SuperNotificationsCenter";
import AdminSupport from "./modules/AdminSupport";

import OrgSystemHealth from "../org_admin/modules/OrgSystemHealth";

import SuperSettings from "./modules/SuperSettings";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Super Administrator";
  const [activeTab, setActiveTab] = useState("system-overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navMenuItems = [
    { id: "system-overview", label: "Dashboard", icon: Globe },
    { id: "system-health", label: "System Health", icon: Server },
    { id: "organization-management", label: "Organization Management", icon: Building2 },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "procurement-monitoring", label: "Procurement Monitoring", icon: ShoppingBag },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Support & Help", icon: LifeBuoy },
    { id: "settings", label: "Profile", icon: Settings },
    ];

  const handleLogout = createLogoutHandler(navigate);

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
      case "procurement-monitoring":
        return <SuperProcurementMonitoring />;
      case "support":
        return <AdminSupport />;
      case "notifications":
        return <SuperNotificationsCenter />;
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
