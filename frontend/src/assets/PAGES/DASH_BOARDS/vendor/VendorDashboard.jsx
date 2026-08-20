import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLogoutHandler } from "../../../../services/logout";
import "./VendorDashboard.css";

import {
  LayoutDashboard,
  ShoppingBag,
  Send,
  FileCheck2,
  Truck,
  FileText,
  IndianRupee,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

import VendorOverview from "./modules/VendorOverview";
import VendorProcRequests from "./modules/VendorProcRequests";
import VendorRfqs from "./modules/VendorRfqs";
import VendorQuotations from "./modules/VendorQuotations";
import VendorPurchaseOrders from "./modules/VendorPurchaseOrders";
import NotificationsModule from "../employee/modules/NotificationsModule";
import SupportModule from "../employee/modules/SupportModule";
import VendorProfile from "./modules/VendorProfile";
import VendorSettings from "./modules/VendorSettings";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Supplier";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "rfqs", label: "My RFQs", icon: Send },
    { id: "quotations", label: "My Quotations", icon: FileCheck2 },
    { id: "purchase-orders", label: "My Purchase Orders", icon: ShoppingBag },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Support & Help", icon: HelpCircle },
  ];

  const handleLogout = createLogoutHandler(navigate);

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <VendorOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "procurement-requests":
        return <VendorProcRequests onNavigate={(tab) => setActiveTab(tab)} />;
      case "rfqs":
        return <VendorRfqs />;
      case "quotations":
        return <VendorQuotations />;
      case "purchase-orders":
        return <VendorPurchaseOrders onNavigate={(tab) => setActiveTab(tab)} />;
      case "notifications":
        return <NotificationsModule />;
      case "support":
        return <SupportModule />;
      case "profile":
        return <VendorProfile />;
      case "settings":
        return <VendorSettings />;
      default:
        return <VendorOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="vnd-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`vnd-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="vnd-sidebar-header">
          <div className="vnd-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="vnd-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="vnd-brand-text">
                <span className="vnd-brand-title">Enterprise</span>
                <span className="vnd-brand-subtitle">Supplier Portal</span>
              </div>
            )}
          </div>
          <button
            className="vnd-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="vnd-sidebar-nav">
          <div className="vnd-nav-section-title">Supplier Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`vnd-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="vnd-nav-icon" size={19} />
                <span className="vnd-nav-label">{item.label}</span>
                {item.badge && <span className="vnd-nav-badge">{item.badge}</span>}
              </button>
            );
          })}

        </div>

        {/* Supplier User Badge Footer & Logout below Profile */}
        <div className="vnd-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div className="vnd-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}>
                <div className="vnd-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="vnd-user-details">
                  <span className="vnd-user-name">{displayName}</span>
                  <span className="vnd-user-role">Supplier</span>
                </div>
              </div>

              <button
                className="vnd-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="vnd-sidebar-logout-btn collapsed"
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
        className={`vnd-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Bar */}
        <div className="vnd-mobile-bar">
          <button
            className="vnd-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>
            EPS Supplier Portal
          </span>
        </div>

        {/* Page Content Body */}
        <main className="vnd-page-content">{renderActiveModule()}</main>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>
              Confirm Supplier Logout
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Enterprise Supplier Portal?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="vnd-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="vnd-btn-primary-sm"
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

export default VendorDashboard;
