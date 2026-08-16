import React, { useState, useEffect } from 'react';
import { apiGet } from '../../../services/apiClient';

import SuperAdminDashboard from './super_admin/SuperAdminDashboard';
import OrgAdminDashboard from './org_admin/OrgAdminDashboard';
import EmployeeDashboard from './employee/EmployeeDashboard';
import DeptManagerDashboard from './dept_manager/DeptManagerDashboard';
import ProcExecDashboard from './proc_exec/ProcExecDashboard';
import ProcManagerDashboard from './proc_manager/ProcManagerDashboard';
import VendorDashboard from './vendor/VendorDashboard';
import InventoryDashboard from './inventory/InventoryDashboard';
import FinanceDashboard from './finance/FinanceDashboard';
import AuditorDashboard from './auditor/AuditorDashboard';
import SupportDashboard from './support/SupportDashboard';
import HrDashboard from './hr/HrDashboard';
import ManagementDashboard from './management/ManagementDashboard';
import FulfilmentDashboard from './fulfilment/FulfilmentDashboard';

// Maps the backend role code (database-driven) to the frontend dashboard key.
// Kept in sync with the ROLE_MAP in the login page so a role change by Admin
// immediately routes the account to the correct dashboard on next load.
const ROLE_MAP = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "org_admin",
  HR_MANAGER: "hr_manager",
  PROCUREMENT_MANAGER: "proc_manager",
  PROCUREMENT_OFFICER: "proc_executive",
  FINANCE_MANAGER: "finance_manager",
  WAREHOUSE_MANAGER: "inventory_manager",
  DEPARTMENT_MANAGER: "dept_manager",
  SENIOR_MANAGER: "senior_manager",
  HEAD: "head",
  EQUIPMENT_ASSET_TEAM: "equipment",
  IT_SOFTWARE_TEAM: "software",
  FACILITIES_TEAM: "facilities",
  EMPLOYEE: "employee",
  VENDOR: "vendor",
  AUDITOR: "auditor",
};

const Dashboard = () => {
  // First paint uses the role stored at login; then /api/auth/me refreshes it
  // from the database (the JWT filter reloads role + permissions on every
  // request), so Admin role/permission changes show up without re-login.
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem("eps_active_role") || "employee");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("eps_first_time_welcome") === "true") {
      setShowWelcome(true);
    }

    let mounted = true;
    apiGet("/api/auth/me")
      .then((me) => {
        if (!mounted || !me) return;
        const roleCode = me.roleCode || "";
        const resolved = ROLE_MAP[roleCode] || roleCode.toLowerCase();
        // Keep the localStorage snapshot in sync so every downstream screen
        // (permission-gated buttons, dev-login panels, profile) sees the
        // current role and permissions without a manual re-login.
        localStorage.setItem("eps_role_code", roleCode);
        localStorage.setItem("eps_active_role", resolved);
        // /api/auth/me serializes GrantedAuthority as { authority: "..." } objects.
        const permissionCodes = Array.isArray(me.authorities)
          ? me.authorities
              .map((a) => (a && typeof a === "object" && a.authority ? a.authority : a))
              .filter((a) => typeof a === "string" && !a.startsWith("ROLE_"))
              .sort()
          : [];
        localStorage.setItem("eps_permissions", JSON.stringify(permissionCodes));
        setActiveRole(resolved);
      })
      .catch(() => {
        // Backend unreachable — keep the login-time role; the app stays usable offline.
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleDismissWelcome = () => {
    localStorage.removeItem("eps_first_time_welcome");
    setShowWelcome(false);
  };

  // Generate 50 confetti particles
  const confettiParticles = Array.from({ length: 50 }).map((_, i) => {
    const left = Math.random() * 100; // random X position
    const delay = Math.random() * 4; // random start delay
    const duration = 3 + Math.random() * 3; // random fall speed
    const colors = ["#f8b400", "#059669", "#dc2626", "#2563eb", "#8b5cf6", "#ec4899"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8; // random particle size

    return (
      <div
        key={i}
        className="confetti-particle"
        style={{
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          backgroundColor: color,
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    );
  });

  const renderDashboard = () => {
    switch (activeRole) {
      case "super_admin":
        return <SuperAdminDashboard />;
      case "org_admin":
        return <OrgAdminDashboard />;
      case "employee":
        return <EmployeeDashboard />;
      case "dept_manager":
        return <DeptManagerDashboard />;
      case "proc_executive":
        return <ProcExecDashboard />;
      case "proc_manager":
        return <ProcManagerDashboard />;
      case "vendor":
        return <VendorDashboard />;
      case "inventory_manager":
        return <InventoryDashboard />;
      case "finance_manager":
        return <FinanceDashboard />;
      case "hr_manager":
        return <HrDashboard />;
      case "auditor":
        return <AuditorDashboard />;
      case "support_team":
        return <SupportDashboard />;
      case "senior_manager":
        return <ManagementDashboard role="senior_manager" />;
      case "head":
        return <ManagementDashboard role="head" />;
      case "equipment":
        return <FulfilmentDashboard team="equipment" />;
      case "software":
        return <FulfilmentDashboard team="software" />;
      case "facilities":
        return <FulfilmentDashboard team="facilities" />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <>
      {showWelcome && (
        <div className="welcome-popup-overlay">
          <style>{`
            .welcome-popup-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(8px);
              z-index: 99999;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
              font-family: 'Inter', sans-serif;
            }
            .welcome-card {
              background: #ffffff;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 50px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 480px;
              width: 90%;
              animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              position: relative;
              z-index: 10;
              border: 1px solid rgba(255,255,255,0.2);
            }
            .welcome-title {
              font-size: 28px;
              font-weight: 850;
              color: #111111;
              margin-bottom: 12px;
            }
            .welcome-text {
              font-size: 15px;
              color: #555555;
              line-height: 1.6;
              margin-bottom: 24px;
            }
            .welcome-btn {
              padding: 12px 32px;
              font-size: 15px;
              font-weight: 750;
              color: #ffffff;
              background: linear-gradient(135deg, #f8b400, #d97706);
              border: none;
              border-radius: 8px;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
              box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4);
            }
            .welcome-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(217, 119, 6, 0.6);
            }
            .confetti-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
            }
            .confetti-particle {
              position: absolute;
              top: -20px;
              border-radius: 3px;
              animation: fall linear infinite;
            }
            @keyframes fall {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(110vh) rotate(720deg);
                opacity: 0;
              }
            }
            @keyframes scaleUp {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
          <div className="confetti-container">
            {confettiParticles}
          </div>
          <div className="welcome-card">
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>*</div>
            <h2 className="welcome-title">Welcome to Enterprise!</h2>
            <p className="welcome-text">
              Your account has been fully verified and approved by your department manager. 
              You can now access your user portal and begin streamlining your procurement processes.
            </p>
            <button className="welcome-btn" onClick={handleDismissWelcome}>
              Get Started
            </button>
          </div>
        </div>
      )}
      {renderDashboard()}
    </>
  );
};

export default Dashboard;
