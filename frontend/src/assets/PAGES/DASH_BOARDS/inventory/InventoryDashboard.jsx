import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InventoryDashboard.css";

import {
  LayoutDashboard,
  Warehouse,
  Boxes,
  PackageCheck,
  Truck,
  Barcode,
  Clock,
  BarChart3,
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

import InventoryOverview from "./modules/InventoryOverview";
import InventoryOverviewDept from "./modules/InventoryOverviewDept";
import ProductManagement from "./modules/ProductManagement";
import StockManagement from "./modules/StockManagement";
import GoodsReceiving from "./modules/GoodsReceiving";
import InventoryTracking from "./modules/InventoryTracking";
import DeliveryMonitoring from "./modules/DeliveryMonitoring";
import WarehouseManagement from "./modules/WarehouseManagement";
import InventoryAnalytics from "./modules/InventoryAnalytics";
import InventoryReports from "./modules/InventoryReports";
import InventoryNotifications from "./modules/InventoryNotifications";
import InventoryProfile from "./modules/InventoryProfile";
import InventorySettings from "./modules/InventorySettings";

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Warehouse Manager";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory-overview", label: "Inventory Overview", icon: Warehouse },
    { id: "product-management", label: "Product Management", icon: Boxes },
    { id: "stock-management", label: "Stock Management", icon: PackageCheck },
    { id: "goods-receiving", label: "Goods Receiving", icon: Truck },
    { id: "inventory-tracking", label: "Inventory Tracking", icon: Barcode },
    { id: "delivery-monitoring", label: "Delivery Monitoring", icon: Clock },
    { id: "warehouse-management", label: "Warehouse Management", icon: Warehouse },
    { id: "inventory-analytics", label: "Inventory Analytics", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FolderKanban },
    ];

  const handleLogout = () => {
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_access_token");
    navigate("/login");
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <InventoryOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "inventory-overview":
        return <InventoryOverviewDept />;
      case "product-management":
        return <ProductManagement />;
      case "stock-management":
        return <StockManagement />;
      case "goods-receiving":
        return <GoodsReceiving />;
      case "inventory-tracking":
        return <InventoryTracking />;
      case "delivery-monitoring":
        return <DeliveryMonitoring />;
      case "warehouse-management":
        return <WarehouseManagement />;
      case "inventory-analytics":
        return <InventoryAnalytics />;
      case "reports":
        return <InventoryReports />;
      case "profile":
        return <InventoryProfile />;
      default:
        return <InventoryOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="inv-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`inv-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="inv-sidebar-header">
          <div className="inv-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="inv-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="inv-brand-text">
                <span className="inv-brand-title">Enterprise</span>
                <span className="inv-brand-subtitle">Inventory Manager</span>
              </div>
            )}
          </div>
          <button
            className="inv-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="inv-sidebar-nav">
          <div className="inv-nav-section-title">Inventory Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`inv-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="inv-nav-icon" size={19} />
                <span className="inv-nav-label">{item.label}</span>
                {item.badge && <span className="inv-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Inventory User Badge Footer & Logout below Profile */}
        <div className="inv-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div className="inv-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}>
                <div className="inv-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="inv-user-details">
                  <span className="inv-user-name">{displayName}</span>
                  <span className="inv-user-role">Warehouse Manager</span>
                </div>
              </div>

              <button
                className="inv-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="inv-sidebar-logout-btn collapsed"
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
        className={`inv-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Bar */}
        <div className="inv-mobile-bar">
          <button
            className="inv-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>
            EPS Inventory Portal
          </span>
        </div>

        {/* Page Content Body */}
        <main className="inv-page-content">{renderActiveModule()}</main>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="inv-modal-overlay">
          <div className="inv-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>
              Confirm Inventory Manager Logout
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Inventory Control Portal?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="inv-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="inv-btn-primary-sm"
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

export default InventoryDashboard;
