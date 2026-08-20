import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLogoutHandler } from "../../../../services/logout";
import {
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserCircle2,
} from "lucide-react";
import ProfileDrawer from "./ProfileDrawer";

/**
 * RoleShell — professional application shell shared by every role dashboard.
 *
 * Props:
 *  - portalTitle:  sidebar brand subtitle (e.g. "Senior Manager Portal")
 *  - roleLabel:    user badge role text (e.g. "Senior Manager")
 *  - accent:       accent color (default gold #f8b400)
 *  - navItems:     [{ id, label, icon }] — rendered in the sidebar
 *  - activeTab:    current tab id
 *  - onTabChange:  (id) => void
 *  - userMeta:     { dept, phone, empId, joinDate } — optional profile extras
 *  - children:     main page content
 */
const RoleShell = ({
  portalTitle = "Enterprise Portal",
  roleLabel = "Team Member",
  accent = "#f8b400",
  navItems = [],
  activeTab,
  onTabChange,
  userMeta = {},
  children,
}) => {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("eps_display_name") || "User";
  const username = localStorage.getItem("eps_username") || "";

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);

  // Collapsed rendering only applies on desktop; on mobile the sidebar always
  // shows the full content so a collapsed state carried from desktop never
  // produces an icon-only sidebar at full width.
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const collapsed = !isMobile && isSidebarCollapsed;

  const handleLogout = createLogoutHandler(navigate);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rshell-root">
      <style>{`
        .rshell-root { display:flex; min-height:100vh; font-family:Inter,sans-serif; background:#f7f8fa; }
        .rshell-sidebar { width:250px; background:#0f1b2d; color:#cbd5e1; display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; z-index:100; transition:width .22s ease, transform .22s ease; box-shadow:2px 0 18px rgba(0,0,0,.12); }
        .rshell-sidebar.collapsed { width:72px; }
        .rshell-sidebar-header { display:flex; align-items:center; gap:10px; padding:18px 16px; border-bottom:1px solid rgba(255,255,255,.08); }
        .rshell-brand { display:flex; align-items:center; gap:10px; flex:1; cursor:pointer; min-width:0; }
        .rshell-brand-logo { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,${accent},#d97706); color:#0f1b2d; font-weight:900; font-size:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .rshell-brand-text { display:flex; flex-direction:column; min-width:0; }
        .rshell-brand-title { color:#fff; font-weight:800; font-size:15px; white-space:nowrap; }
        .rshell-brand-subtitle { color:#8ea0b8; font-size:11px; font-weight:600; white-space:nowrap; }
        .rshell-sidebar-toggle { background:rgba(255,255,255,.06); border:none; color:#cbd5e1; width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .rshell-sidebar-toggle:hover { background:rgba(255,255,255,.14); color:#fff; }
        .rshell-nav { flex:1; overflow-y:auto; padding:14px 10px; }
        .rshell-nav-section { font-size:10px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:#64748b; padding:0 12px 8px; white-space:nowrap; }
        .rshell-nav-item { display:flex; align-items:center; gap:11px; width:100%; background:none; border:none; color:#a7b6c9; font-size:13.5px; font-weight:600; padding:11px 12px; border-radius:9px; cursor:pointer; margin-bottom:3px; text-align:left; transition:background .16s ease, color .16s ease; white-space:nowrap; }
        .rshell-nav-item:hover { background:rgba(255,255,255,.07); color:#fff; }
        .rshell-nav-item.active { background:${accent}22; color:${accent}; box-shadow:inset 3px 0 0 ${accent}; }
        .rshell-nav-icon { flex-shrink:0; }
        .rshell-user { border-top:1px solid rgba(255,255,255,.08); padding:14px 12px; }
        .rshell-user-row { display:flex; align-items:center; gap:10px; cursor:pointer; border-radius:9px; padding:8px; }
        .rshell-user-row:hover { background:rgba(255,255,255,.06); }
        .rshell-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,${accent},#d97706); color:#0f1b2d; font-weight:900; font-size:14px; display:flex; align-items:center; justify-content:center; border:2px solid ${accent}; flex-shrink:0; }
        .rshell-user-details { display:flex; flex-direction:column; min-width:0; }
        .rshell-user-name { color:#fff; font-weight:700; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .rshell-user-role { color:#8ea0b8; font-size:11px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .rshell-logout-btn { display:flex; align-items:center; gap:9px; width:100%; background:none; border:none; color:#f87171; font-size:13px; font-weight:700; padding:10px 12px; border-radius:9px; cursor:pointer; margin-top:4px; white-space:nowrap; }
        .rshell-logout-btn:hover { background:rgba(248,113,113,.12); color:#fca5a5; }
        .rshell-logout-btn.collapsed { justify-content:center; padding:10px; }
        .rshell-main { flex:1; margin-left:250px; min-width:0; transition:margin-left .22s ease; display:flex; flex-direction:column; }
        .rshell-main.collapsed { margin-left:72px; }
        .rshell-mobile-bar { display:none; align-items:center; gap:12px; background:#0f1b2d; color:#fff; padding:12px 16px; position:sticky; top:0; z-index:90; }
        .rshell-mobile-menu-btn { background:rgba(255,255,255,.08); border:none; color:#fff; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .rshell-page { flex:1; padding:20px; min-width:0; }
        .rshell-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(4px); z-index:95; }
        @media (max-width: 900px) {
          .rshell-sidebar { transform:translateX(-100%); width:250px; }
          .rshell-sidebar.mobile-open { transform:translateX(0); }
          .rshell-sidebar.collapsed { width:250px; }
          .rshell-main, .rshell-main.collapsed { margin-left:0; }
          .rshell-mobile-bar { display:flex; }
        }
      `}</style>

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`rshell-sidebar ${collapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="rshell-sidebar-header">
          <div
            className="rshell-brand"
            onClick={() => {
              if (onTabChange) onTabChange(navItems[0]?.id || activeTab);
              setIsMobileOpen(false);
            }}
          >
            <div className="rshell-brand-logo">EPS</div>
            {!collapsed && (
              <div className="rshell-brand-text">
                <span className="rshell-brand-title">Enterprise</span>
                <span className="rshell-brand-subtitle">{portalTitle}</span>
              </div>
            )}
          </div>
          <button
            className="rshell-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        <div className="rshell-nav">
          <div className="rshell-nav-section">Modules</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`rshell-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  if (onTabChange) onTabChange(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="rshell-nav-icon" size={19} />
                <span className="rshell-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User badge + logout */}
        <div className="rshell-user">
          {!collapsed ? (
            <>
              <div
                className="rshell-user-row"
                title="View Profile"
                onClick={() => setShowProfileDrawer(true)}
              >
                <div className="rshell-avatar">{initials}</div>
                <div className="rshell-user-details">
                  <span className="rshell-user-name">{displayName}</span>
                  <span className="rshell-user-role">{roleLabel}</span>
                </div>
              </div>
              <button className="rshell-logout-btn" onClick={() => setShowLogoutModal(true)}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="rshell-logout-btn collapsed"
                onClick={() => setShowProfileDrawer(true)}
                title="Profile"
                style={{ color: "#cbd5e1", marginBottom: "2px" }}
              >
                <UserCircle2 size={18} />
              </button>
              <button
                className="rshell-logout-btn collapsed"
                onClick={() => setShowLogoutModal(true)}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && <div className="rshell-overlay" onClick={() => setIsMobileOpen(false)} />}

      {/* ================= MAIN ================= */}
      <div className={`rshell-main ${collapsed ? "collapsed" : ""}`}>
        <div className="rshell-mobile-bar">
          <button className="rshell-mobile-menu-btn" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: "700", fontSize: "15px" }}>{portalTitle}</span>
        </div>
        <div className="rshell-page">{children}</div>
      </div>

      {/* Profile drawer */}
      <ProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        user={{
          name: displayName,
          role: roleLabel,
          email: username,
          phone: userMeta.phone || "—",
          dept: userMeta.dept || "—",
          empId: userMeta.empId || "",
          joinDate: userMeta.joinDate || "",
        }}
        accentColor={accent}
        onLogout={() => {
          setShowProfileDrawer(false);
          setShowLogoutModal(true);
        }}
      />

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            backdropFilter: "blur(4px)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "420px",
              width: "100%",
              padding: "28px 26px",
              textAlign: "center",
              animation: "rshellModalIn .22s ease",
            }}
          >
            <style>{`
              @keyframes rshellModalIn { from { transform:scale(.92); opacity:0; } to { transform:scale(1); opacity:1; } }
            `}</style>
            <AlertTriangle size={46} color="#d97706" style={{ margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "800", margin: 0 }}>
              Confirm Logout
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px", lineHeight: 1.5 }}>
              Are you sure you want to log out of the {roleLabel} portal?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 22px", border: "none", borderRadius: "9px", cursor: "pointer",
                  background: "linear-gradient(135deg,#f8b400,#d97706)", color: "#111",
                  fontWeight: "800", fontSize: "14px", boxShadow: "0 4px 14px rgba(217,119,6,.35)",
                }}
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: "10px 22px", border: "1px solid #d9d9d9", borderRadius: "9px",
                  cursor: "pointer", background: "#f8f9fb", color: "#111", fontWeight: "700", fontSize: "14px",
                }}
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

export default RoleShell;
