import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FinanceDashboard.css";

import {
  LayoutDashboard,
  CreditCard,
  FileCheck2,
  PieChart,
  TrendingUp,
  BarChart3,
  IndianRupee,
  FolderKanban,
  Bell,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import FinanceOverview from "./modules/FinanceOverview";
import PaymentApprovals from "./modules/PaymentApprovals";
import FinanceInvoiceMgmt from "./modules/FinanceInvoiceMgmt";
import FinanceBudgetMgmt from "./modules/FinanceBudgetMgmt";
import FinanceExpenseMgmt from "./modules/FinanceExpenseMgmt";
import FinancialAnalytics from "./modules/FinancialAnalytics";
import ProcurementPaymentTracking from "./modules/ProcurementPaymentTracking";
import FinancialReports from "./modules/FinancialReports";
import FinanceNotifications from "./modules/FinanceNotifications";
import FinanceSettings from "./modules/FinanceSettings";
import ProfileDrawer from "../shared_ui/ProfileDrawer";

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Finance Officer";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "payment-approvals", label: "Payment Approvals", icon: CreditCard },
    { id: "invoice-management", label: "Invoice Management", icon: FileCheck2 },

    { id: "procurement-payments", label: "Procurement Payments", icon: IndianRupee },
    { id: "reports", label: "Financial Reports", icon: FolderKanban },
  ];

  const handleLogout = () => {
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_access_token");
    navigate("/login");
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <FinanceOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "payment-approvals":
        return <PaymentApprovals onNavigate={(tab) => setActiveTab(tab)} />;
      case "invoice-management":
        return <FinanceInvoiceMgmt />;

      case "procurement-payments":
        return <ProcurementPaymentTracking />;
      case "reports":
        return <FinancialReports />;
      default:
        return <FinanceOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="fin-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fin-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="fin-sidebar-header">
          <div className="fin-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="fin-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="fin-brand-text">
                <span className="fin-brand-title">Enterprise</span>
                <span className="fin-brand-subtitle">Finance Portal</span>
              </div>
            )}
          </div>
          <button
            className="fin-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="fin-sidebar-nav">
          <div className="fin-nav-section-title">Finance Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`fin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="fin-nav-icon" size={19} />
                <span className="fin-nav-label">{item.label}</span>
                {item.badge && <span className="fin-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Finance User Badge Footer */}
        <div className="fin-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div
                className="fin-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}
                onClick={() => setShowProfileDrawer(true)}
                style={{ cursor: "pointer" }}
                title="View Profile"
              >
                <div className="fin-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="fin-user-details">
                  <span className="fin-user-name">{displayName}</span>
                  <span className="fin-user-role">Finance Officer</span>
                </div>
              </div>

              <button
                className="fin-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="fin-sidebar-logout-btn collapsed"
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
        className={`fin-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Bar */}
        <div className="fin-mobile-bar">
          <button
            className="fin-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>
            EPS Finance Portal
          </span>
        </div>

        {/* Page Content Body */}
        <main className="fin-page-content">{renderActiveModule()}</main>
      </div>

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        user={{
          name: displayName,
          role: "Finance Officer",
          email: localStorage.getItem("eps_username") || "",
          phone: "—",
          dept: "Finance Portal",
          empId: "",
          joinDate: "",
        }}
        accentColor="#f8b400"
        onLogout={() => { setShowProfileDrawer(false); setShowLogoutModal(true); }}
      />

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="fin-modal-overlay">
          <div className="fin-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>
              Confirm Finance Manager Logout
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Corporate Treasury Portal?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="fin-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="fin-btn-primary-sm"
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

export default FinanceDashboard;
