import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProcManagerDashboard.css";

import {
  LayoutDashboard,
  Layers,
  FileText,
  ShieldCheck,
  Users,
  Zap,
  BarChart3,
  Clock,
  FolderKanban,
  UserCheck,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Bell,
  HelpCircle,
  Inbox,
} from "lucide-react";

import ManagerOverview from "./modules/ManagerOverview";
import ProcurementOverview from "./modules/ProcurementOverview";
import ProcurementRequests from "./modules/ProcurementRequests";
import PoApprovals from "./modules/PoApprovals";
import VendorManagement from "./modules/VendorManagement";
import ProcurementOperations from "./modules/ProcurementOperations";
import ProcurementAnalytics from "./modules/ProcurementAnalytics";
import ProcurementTracking from "./modules/ProcurementTracking";
import ManagerReports from "./modules/ManagerReports";
import ManagerProfile from "./modules/ManagerProfile";
import ManagerInvoices from "./modules/ManagerInvoices";
import NotificationsModule from "../employee/modules/NotificationsModule";
import SupportModule from "../employee/modules/SupportModule";
import RfqManagement from "../proc_exec/modules/RfqManagement";
import VendorQuotations from "../proc_exec/modules/VendorQuotations";
import PurchaseOrders from "../proc_exec/modules/PurchaseOrders";
import MyApprovals from "../shared_ui/MyApprovals";

const ProcManagerDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Procurement Manager";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "procurement-overview", label: "Procurement Overview", icon: Layers },
    { id: "procurement-requests", label: "Procurement Requests", icon: FileText },
    { id: "my-approvals", label: "My Approvals & Tasks", icon: Inbox },
    { id: "rfq-management", label: "RFQ Management", icon: FileText },
    { id: "vendor-quotations", label: "Vendor Quotations", icon: FileText },
    { id: "purchase-orders", label: "Purchase Orders", icon: FileText },
    { id: "po-approvals", label: "PO Approvals", icon: ShieldCheck },
    { id: "vendor-invoices", label: "Vendor Invoices", icon: AlertTriangle },
    { id: "vendor-management", label: "Vendor Management", icon: Users },
    { id: "procurement-operations", label: "Procurement Operations", icon: Zap },
    { id: "procurement-analytics", label: "Procurement Analytics", icon: BarChart3 },
    { id: "procurement-tracking", label: "Procurement Tracking", icon: Clock },
    { id: "reports", label: "Procurement Reports", icon: FolderKanban },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Support & Help", icon: HelpCircle },
    ];

  const handleLogout = () => {
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_access_token");
    navigate("/login");
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <ManagerOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "procurement-overview":
        return <ProcurementOverview />;
      case "procurement-requests":
        return <ProcurementRequests />;
      case "my-approvals":
        return <MyApprovals />;
      case "rfq-management":
        return <RfqManagement />;
      case "vendor-quotations":
        return <VendorQuotations />;
      case "purchase-orders":
        return <PurchaseOrders />;
      case "po-approvals":
        return <PoApprovals />;
      case "vendor-invoices":
        return <ManagerInvoices />;
      case "vendor-management":
        return <VendorManagement />;
      case "procurement-operations":
        return <ProcurementOperations />;
      case "procurement-analytics":
        return <ProcurementAnalytics />;
      case "procurement-tracking":
        return <ProcurementTracking />;
      case "reports":
        return <ManagerReports />;
      case "notifications":
        return <NotificationsModule />;
      case "support":
        return <SupportModule />;
      case "profile":
        return <ManagerProfile />;
      default:
        return <ManagerOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="pman-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`pman-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="pman-sidebar-header">
          <div className="pman-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="pman-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="pman-brand-text">
                <span className="pman-brand-title">Enterprise</span>
                <span className="pman-brand-subtitle">Procurement Manager</span>
              </div>
            )}
          </div>
          <button
            className="pman-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="pman-sidebar-nav">
          <div className="pman-nav-section-title">Manager Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`pman-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="pman-nav-icon" size={19} />
                <span className="pman-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Manager User Badge & Logout Below Profile Name */}
        <div className="pman-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div className="pman-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}>
                <div className="pman-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="pman-user-details">
                  <span className="pman-user-name">{displayName}</span>
                  <span className="pman-user-role">Procurement Manager</span>
                </div>
              </div>

              <button
                className="pman-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="pman-sidebar-logout-btn collapsed"
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
        className={`pman-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Bar */}
        <div className="pman-mobile-bar">
          <button
            className="pman-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <div className="pman-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="pman-brand-logo">EPS</div>
            <span className="pman-brand-title">Procurement Manager</span>
          </div>
        </div>

        {/* Dynamic Module Content */}
        <main className="pman-content">{renderActiveModule()}</main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "440px" }}>
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(220, 38, 38, 0.12)",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111111" }}>
                Confirm Sign Out
              </h3>
              <p style={{ color: "#555555", fontSize: "14px", marginTop: "8px" }}>
                Are you sure you want to log out of the Procurement Manager portal?
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                className="pman-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111111", border: "1px solid #d9d9d9" }}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="pman-btn-primary-sm"
                style={{ background: "#dc2626", color: "#ffffff" }}
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcManagerDashboard;
