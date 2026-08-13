import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  FolderKanban,
  HelpCircle,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import DashboardOverview from "./modules/DashboardOverview";
import CreateRequest from "./modules/CreateRequest";
import MyRequests from "./modules/MyRequests";
import RequestTracking from "./modules/RequestTracking";
import DocumentsModule from "./modules/DocumentsModule";
import SupportModule from "./modules/SupportModule";
import ProfileDrawer from "../shared_ui/ProfileDrawer";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Employee";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }) +
          " • " +
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create-request", label: "Create Request", icon: PlusCircle },
    { id: "my-requests", label: "My Requests", icon: FileText },
    { id: "request-tracking", label: "Request Tracking", icon: Clock },
    { id: "documents", label: "Documents", icon: FolderKanban },
    { id: "support", label: "Support & Help", icon: HelpCircle },
  ];

  const handleLogout = () => {
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_access_token");
    navigate("/login");
  };

  const [selectedTrackingId, setSelectedTrackingId] = useState(null);

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "create-request":
        return <CreateRequest onNavigate={(tab) => setActiveTab(tab)} />;
      case "my-requests":
        return (
          <MyRequests
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectTracking={(id) => setSelectedTrackingId(id)}
          />
        );
      case "request-tracking":
        return <RequestTracking initialTrackingId={selectedTrackingId} />;
      case "documents":
        return <DocumentsModule />;
      case "support":
        return <SupportModule />;
      default:
        return <DashboardOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="emp-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`emp-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="emp-sidebar-header">
          <div className="emp-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="emp-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="emp-brand-text">
                <span className="emp-brand-title">Enterprise</span>
                <span className="emp-brand-subtitle">Procurement System</span>
              </div>
            )}
          </div>
          <button
            className="emp-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="emp-sidebar-nav">
          <div className="emp-nav-section-title">Main Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`emp-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="emp-nav-icon" size={20} />
                <span className="emp-nav-label">{item.label}</span>
                {item.badge && <span className="emp-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer User Info & Logout below Profile */}
        <div className="emp-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div
                className="emp-user-profile-row"
                onClick={() => setShowProfileDrawer(true)}
                style={{ cursor: "pointer" }}
                title="View Profile"
              >
                <div className="emp-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="emp-user-details">
                  <span className="emp-user-name">{displayName}</span>
                  <span className="emp-user-role">Employee (Requester)</span>
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
        className={`emp-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Toggle Button for Small Screens */}
        <div className="emp-mobile-bar">
          <button
            className="emp-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>EPS Portal</span>
        </div>

        {/* Page Content Body */}
        <main className="emp-page-content">{renderActiveModule()}</main>
      </div>

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        user={{
          name: displayName,
          role: "Employee (Requester)",
          email: localStorage.getItem("eps_username") || "",
          phone: "—",
          dept: "Employee Portal",
          empId: "",
          joinDate: "",
        }}
        accentColor="#3b82f6"
        onLogout={() => { setShowProfileDrawer(false); setShowLogoutModal(true); }}
      />

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>Confirm Logout</h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Enterprise Procurement System?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="emp-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="emp-btn-primary-sm"
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

export default EmployeeDashboard;
