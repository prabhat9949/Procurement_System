import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DeptManagerDashboard.css";

import {
  LayoutDashboard,
  FileCheck,
  FileText,
  Clock,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Bell,
  HelpCircle,
} from "lucide-react";

import ManagerOverview from "./modules/ManagerOverview";
import ApprovalQueue from "./modules/ApprovalQueue";
import TeamRequisitions from "./modules/TeamRequisitions";
import TrackForms from "./modules/TrackForms";
import ManagerProfile from "./modules/ManagerProfile";
import ProfileDrawer from "../shared_ui/ProfileDrawer";
import NotificationsModule from "../employee/modules/NotificationsModule";
import SupportModule from "../employee/modules/SupportModule";

const DeptManagerDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Department Manager";
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [trackReqId, setTrackReqId] = useState(null);

  const navMenuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "approvals", label: "Approval Queue", icon: FileCheck },
    { id: "team-requests", label: "Team Requisitions", icon: FileText },
    { id: "track-forms", label: "PR Tracking", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Support & Help", icon: HelpCircle },
  ];

  const handleLogout = () => {
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_access_token");
    navigate("/login");
  };

  const handleNavigateToTrack = (reqId) => {
    if (reqId) {
      setTrackReqId(reqId);
    }
    setActiveTab("track-forms");
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ManagerOverview
            onNavigate={(tab) => setActiveTab(tab)}
            onApprove={() => setActiveTab("approvals")}
            onReject={() => setActiveTab("approvals")}
            onTrackForm={handleNavigateToTrack}
          />
        );
      case "approvals":
        return (
          <ApprovalQueue
            onNavigate={(tab) => setActiveTab(tab)}
            onTrackForm={handleNavigateToTrack}
          />
        );
      case "team-requests":
        return <TeamRequisitions onTrackForm={handleNavigateToTrack} />;
      case "track-forms":
        return <TrackForms initialReqId={trackReqId} />;
      case "notifications":
        return <NotificationsModule />;
      case "support":
        return <SupportModule />;
      case "profile":
        return <ManagerProfile />;
      default:
        return (
          <ManagerOverview
            onNavigate={(tab) => setActiveTab(tab)}
            onApprove={() => setActiveTab("approvals")}
            onReject={() => setActiveTab("approvals")}
            onTrackForm={handleNavigateToTrack}
          />
        );
    }
  };

  return (
    <div className="dm-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`dm-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="dm-sidebar-header">
          <div className="dm-brand" onClick={() => setActiveTab("overview")}>
            <div className="dm-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="dm-brand-text">
                <span className="dm-brand-title">Enterprise</span>
                <span className="dm-brand-subtitle">Dept Manager Portal</span>
              </div>
            )}
          </div>
          <button
            className="dm-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="dm-sidebar-nav">
          <div className="dm-nav-section-title">Manager Modules</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`dm-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="dm-nav-icon" size={20} />
                <span className="dm-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Manager Profile & Logout Footer - Exactly like Employee Dashboard */}
        <div className="emp-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div
                className="emp-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}
                onClick={() => setShowProfileDrawer(true)}
                style={{ cursor: "pointer" }}
                title="View Profile"
              >
                <div className="dm-user-avatar" style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)",
                  color: "#000000",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #f8b400",
                  flexShrink: 0
                }}>{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="emp-user-details">
                  <span className="emp-user-name">{displayName}</span>
                  <span className="emp-user-role">Department Manager</span>
                </div>
              </div>

              <button
                className="emp-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="emp-sidebar-logout-btn collapsed"
              onClick={() => setShowLogoutModal(true)}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
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

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div
        className={`dm-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Header Bar */}
        <div className="dm-mobile-bar">
          <button
            className="dm-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>Manager Portal</span>
        </div>

        {/* Dynamic Active Module Render */}
        <main className="dm-page-content">{renderActiveModule()}</main>
      </div>

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        user={{
          name: displayName,
          role: "Department Manager",
          email: localStorage.getItem("eps_username") || "",
          phone: "—",
          dept: "Manager Portal",
          empId: "",
          joinDate: "",
        }}
        accentColor="#7c3aed"
        onLogout={() => { setShowProfileDrawer(false); setShowLogoutModal(true); }}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="dm-modal-overlay">
          <div className="dm-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>Confirm Logout</h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Department Manager Portal?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="dm-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="dm-btn-primary-sm"
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

export default DeptManagerDashboard;
