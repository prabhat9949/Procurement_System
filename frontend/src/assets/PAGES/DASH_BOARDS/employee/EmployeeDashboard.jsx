import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  Bell,
  UserCircle,
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
import NotificationsModule from "./modules/NotificationsModule";
import ProfileModule from "./modules/ProfileModule";
import SupportModule from "./modules/SupportModule";
import { apiGet, apiPost } from "../../../../services/apiClient";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [me, setMe] = useState(null);
  const [authMe, setAuthMe] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTrackingId, setSelectedTrackingId] = useState(null);

  const loadIdentity = useCallback(async () => {
    try {
      const [auth, employee] = await Promise.all([
        apiGet("/api/auth/me").catch(() => null),
        apiGet("/api/employees/me").catch(() => null),
      ]);
      setAuthMe(auth);
      setMe(employee);
    } catch {
      /* profile fallbacks below */
    }
  }, []);

  const loadUnread = useCallback(async () => {
    try {
      const count = await apiGet("/api/notifications/my/unread-count");
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadIdentity();
    loadUnread();
    const unreadTimer = setInterval(loadUnread, 30000);
    return () => clearInterval(unreadTimer);
  }, [loadIdentity, loadUnread]);

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

  const displayName =
    me?.firstName && me?.lastName
      ? `${me.firstName} ${me.lastName}`
      : authMe?.displayName || "Employee";
  const roleLabel = me?.roleName || authMe?.roleName || "Employee (Requester)";

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create-request", label: "Create Request", icon: PlusCircle },
    { id: "my-requests", label: "My Requests", icon: FileText },
    { id: "request-tracking", label: "Request Tracking", icon: Clock },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { id: "profile", label: "My Profile", icon: UserCircle },
    { id: "support", label: "Support & Help", icon: HelpCircle },
  ];

  const handleLogout = async () => {
    try {
      await apiPost("/api/auth/logout");
    } catch {
      /* backend logout is best-effort */
    }
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_access_token");
    localStorage.removeItem("eps_display_name");
    localStorage.removeItem("eps_username");
    navigate("/login");
  };

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
            onSelectTracking={(id) => {
              setSelectedTrackingId(id);
              setActiveTab("request-tracking");
            }}
          />
        );
      case "request-tracking":
        return (
          <RequestTracking
            initialTrackingId={selectedTrackingId}
            onNotifyRefresh={loadUnread}
          />
        );
      case "notifications":
        return <NotificationsModule onNotifyRefresh={loadUnread} />;
      case "profile":
        return <ProfileModule me={me} authMe={authMe} onReload={loadIdentity} />;
      case "support":
        return <SupportModule />;
      default:
        return <DashboardOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="emp-dashboard-container">
      <style>{`@keyframes lroSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} } .lro-spin { animation: lroSpin .9s linear infinite; }`}</style>
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`emp-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
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
                {item.badge != null && <span className="emp-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>

        <div className="emp-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div
                className="emp-user-profile-row"
                onClick={() => {
                  setActiveTab("profile");
                  setIsMobileOpen(false);
                }}
                style={{ cursor: "pointer" }}
                title="View Profile"
              >
                <div className="emp-user-avatar">
                  {displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="emp-user-details">
                  <span className="emp-user-name">{displayName}</span>
                  <span className="emp-user-role">{roleLabel}</span>
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
      <div className={`emp-main-wrapper ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className="emp-mobile-bar">
          <button className="emp-mobile-menu-btn" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>EPS Portal</span>
        </div>

        {/* Top navigation bar */}
        <div className="emp-navbar">
          <div className="emp-navbar-left">
            <button
              className="emp-mobile-menu-btn"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              style={{ display: "none" }}
            >
              <Menu size={22} />
            </button>
            <span className="emp-navbar-page-title">
              {navMenuItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
            </span>
          </div>
          <div className="emp-navbar-right">
            <span className="emp-nav-clock">{currentTime}</span>
            <button
              className="emp-nav-icon-btn"
              title="Notifications"
              onClick={() => setActiveTab("notifications")}
              style={{ position: "relative" }}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    background: "#dc2626",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 10,
                    padding: "1px 5px",
                    lineHeight: "14px",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <button
              className="emp-nav-icon-btn"
              title="My Profile"
              onClick={() => setActiveTab("profile")}
            >
              <UserCircle size={19} />
            </button>
            <button
              className="emp-nav-icon-btn"
              title="Logout"
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <main className="emp-page-content">{renderActiveModule()}</main>
      </div>

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
