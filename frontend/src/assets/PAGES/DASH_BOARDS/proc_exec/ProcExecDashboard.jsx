import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProcExecDashboard.css";
import { apiGet } from "../../../../services/apiClient";

import {
  LayoutDashboard,
  FileText,
  Send,
  FileCheck2,
  Award,
  ShoppingBag,
  Clock,
  BarChart3,
  FolderKanban,
  UserCheck,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import ExecOverview from "./modules/ExecOverview";
import PurchaseRequests from "./modules/PurchaseRequests";
import RfqManagement from "./modules/RfqManagement";
import VendorQuotations from "./modules/VendorQuotations";
import VendorSelection from "./modules/VendorSelection";
import PurchaseOrders from "./modules/PurchaseOrders";
import ExecInvoices from "./modules/ExecInvoices";
import ProcurementTracking from "./modules/ProcurementTracking";
import ProcurementAnalytics from "./modules/ProcurementAnalytics";
import ExecReports from "./modules/ExecReports";
import ExecProfile from "./modules/ExecProfile";

const ProcExecDashboard = () => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "Procurement Officer";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scope, setScope] = useState(null);

  // The backend enforces per-officer category scoping on every list (PRs, RFQs,
  // POs); this banner just surfaces the current officer's configured scope.
  useEffect(() => {
    apiGet("/api/procurement/my-scope")
      .then((s) => setScope(s))
      .catch(() => setScope(null));
  }, []);

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "purchase-requests", label: "Purchase Requests", icon: FileText },
    { id: "rfq-management", label: "RFQ Management", icon: Send },
    { id: "vendor-quotations", label: "Vendor Quotations", icon: FileCheck2 },
    { id: "vendor-selection", label: "Vendor Selection", icon: Award },
    { id: "purchase-orders", label: "Purchase Orders", icon: ShoppingBag },
    { id: "invoices", label: "Invoices", icon: FileCheck2 },
    { id: "procurement-tracking", label: "Procurement Tracking", icon: Clock },
    { id: "analytics", label: "Procurement Analytics", icon: BarChart3 },
    { id: "reports", label: "Documents", icon: FolderKanban },
    ];

  const handleLogout = () => {
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_access_token");
    navigate("/login");
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <ExecOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "purchase-requests":
        return <PurchaseRequests onNavigate={(tab) => setActiveTab(tab)} />;
      case "rfq-management":
        return <RfqManagement />;
      case "vendor-quotations":
        return <VendorQuotations />;
      case "vendor-selection": return <VendorSelection onNavigate={setActiveTab} />;
      case "purchase-orders": return <PurchaseOrders onNavigate={setActiveTab} />;
      case "invoices": return <ExecInvoices onNavigate={setActiveTab} />;
      case "procurement-tracking": return <ProcurementTracking onNavigate={setActiveTab} />;
      case "analytics":
        return <ProcurementAnalytics />;
      case "reports":
        return <ExecReports />;
      case "profile":
        return <ExecProfile />;
      default:
        return <ExecOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="pe-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`pe-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Brand */}
        <div className="pe-sidebar-header">
          <div className="pe-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="pe-brand-logo">EPS</div>
            {!isSidebarCollapsed && (
              <div className="pe-brand-text">
                <span className="pe-brand-title">Enterprise</span>
                <span className="pe-brand-subtitle">Procurement Exec</span>
              </div>
            )}
          </div>
          <button
            className="pe-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="pe-sidebar-nav">
          <div className="pe-nav-section-title">Executive Navigation</div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`pe-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="pe-nav-icon" size={19} />
                <span className="pe-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Executive User Badge & Logout Footer - Exactly like Employee Dashboard */}
        <div className="pe-sidebar-user">
          {!isSidebarCollapsed ? (
            <>
              <div className="pe-user-profile-row" onClick={() => { setActiveTab("profile"); setIsMobileOpen(false); }} style={{ cursor: 'pointer' }}>
                <div className="pe-user-avatar">{displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                <div className="pe-user-details">
                  <span className="pe-user-name">{displayName}</span>
                  <span className="pe-user-role">Procurement Executive</span>
                </div>
              </div>

              <button
                className="pe-sidebar-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              className="pe-sidebar-logout-btn collapsed"
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
        className={`pe-main-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Mobile Bar */}
        <div className="pe-mobile-bar">
          <button
            className="pe-mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>
            EPS Procurement Exec
          </span>
        </div>

        {/* Page Content Body */}
        <main className="pe-page-content">
          {scope && scope.scoped && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "14px",
                padding: "9px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(37,99,235,.18)",
                background: "rgba(37,99,235,.06)",
                fontSize: "12.5px",
                color: "#1e3a8a",
                fontWeight: "600",
              }}
            >
              <span>🎯 My Category Scope</span>
              {scope.categoryNames.map((c) => (
                <span
                  key={c}
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    borderRadius: "999px",
                    padding: "2px 10px",
                    fontSize: "11.5px",
                    fontWeight: "700",
                  }}
                >
                  {c}
                </span>
              ))}
              <span style={{ fontWeight: "500", color: "#4b5b6c", marginLeft: "auto" }}>
                You only see requests, RFQs and POs in these categories.
              </span>
            </div>
          )}
          {renderActiveModule()}
        </main>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutModal && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
            <AlertTriangle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>
              Confirm Executive Logout
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              Are you sure you want to log out of the Procurement Executive Portal?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="pe-btn-primary-sm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="pe-btn-primary-sm"
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

export default ProcExecDashboard;
