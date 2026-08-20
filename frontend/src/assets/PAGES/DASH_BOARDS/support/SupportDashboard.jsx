import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLogoutHandler } from "../../../../services/logout";
import "./SupportDashboard.css";

import {
  LayoutDashboard,
  Ticket,
  Zap,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import SupportOverview from "./modules/SupportOverview";
import SupportTickets from "./modules/SupportTickets";
import LiveSupportRequests from "./modules/LiveSupportRequests";
import NotificationsModule from "../employee/modules/NotificationsModule";
import SupportProfile from "./modules/SupportProfile";
import SupportSettings from "./modules/SupportSettings";

const SupportDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Support Team";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "support-tickets", label: "Support Tickets", icon: Ticket },
    { id: "live-support-requests", label: "Live Chat", icon: Zap },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleLogout = createLogoutHandler(navigate);

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <SupportOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "support-tickets":
        return <SupportTickets />;
      case "live-support-requests":
        return <LiveSupportRequests />;
      case "notifications":
        return <NotificationsModule />;
      case "profile":
        return <SupportProfile />;
      default:
        return <SupportOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="sup-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`sup-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="sup-sidebar-header">
          <div className="sup-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="sup-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="sup-brand-text">
                <span className="sup-brand-title">Enterprise</span>
                <span className="sup-brand-subtitle">Support Portal</span>
              </div>
            )}
          </div>
          <button
            className="sup-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="sup-sidebar-nav">
          <div className="sup-nav-section-title">Support Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sup-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="sup-nav-icon" size={19} />
                <span className="sup-nav-label">{item.label}</span>
                {item.badge && <span className="sup-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Support User Badge Footer & Logout below Profile */}
        <div className="sup-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div className="sup-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}>
                <div className="sup-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="sup-user-details">
                  <span className="sup-user-name">{displayName}</span>
                  <span className="sup-user-role">Support Team</span>
                </div>
              </div>

              <button
                className="sup-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="sup-sidebar-logout-btn collapsed"
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
        className={`sup-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Bar */}
        <div className="sup-mobile-bar">
          <button
            className="sup-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>
            EPS Support Portal
          </span>
        </div>

        {/* Page Content Body */}
        <main className="sup-page-content">{renderActiveModule()}</main>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="sup-modal-overlay">
          <div className="sup-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>
              Confirm Support Operations Logout
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Enterprise Help Desk Portal?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="sup-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="sup-btn-primary-sm"
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

export default SupportDashboard;
