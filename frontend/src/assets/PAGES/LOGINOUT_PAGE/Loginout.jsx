import React, { useState } from "react";
import "./loginout.css";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  LogIn,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Logo from "./Logo.jpg";
import { apiFetch } from "../../../services/apiClient";

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

// Development-only helper so every role can be tested.
// The account list is loaded from GET /api/dev/accounts (database-backed) when the
// backend is reachable; the static list below is only a last-resort fallback for
// demo/offline scenarios so the panel never breaks.
const FALLBACK_ACCOUNTS = [
  { role: "Admin", username: "admin@123", password: "Admin@123" },
  { role: "HR", username: "hr@123", password: "Hr@123" },
  { role: "Employee", username: "employee@123", password: "Employee@123" },
  { role: "Manager", username: "manager@123", password: "Manager@123" },
  { role: "Senior Manager", username: "seniormanager@123", password: "Senior@123" },
  { role: "Head", username: "head@123", password: "Head@123" },
  { role: "Procurement", username: "procurement@123", password: "Procurement@123" },
  { role: "Equipment", username: "equipment@123", password: "Equipment@123" },
  { role: "Software", username: "software@123", password: "Software@123" },
  { role: "Facilities", username: "facilities@123", password: "Facilities@123" },
  { role: "Warehouse", username: "warehouse@123", password: "Warehouse@123" },
  { role: "Finance", username: "finance@123", password: "Finance@123" },
  { role: "Auditor", username: "auditor@123", password: "Auditor@123" },
  { role: "Vendor", username: "vendor@123", password: "Vendor@123" },
];

const CATEGORY_ORDER = [
  "ADMIN", "HR", "EMPLOYEES", "MANAGERS", "SENIOR MANAGERS", "HEAD",
  "PROCUREMENT", "EQUIPMENT", "SOFTWARE", "FACILITIES", "WAREHOUSE",
  "FINANCE", "AUDITOR", "VENDORS", "OTHER",
];

const SHOW_DEMO_ACCOUNTS = import.meta.env.DEV;

const Loginout = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState(() => localStorage.getItem("eps_remember_username") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(Boolean(localStorage.getItem("eps_remember_username")));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Database-backed dev login panel.
  const [devGroups, setDevGroups] = useState(null); // { CATEGORY: [accounts] }
  const [devSearch, setDevSearch] = useState("");
  const [devLoading, setDevLoading] = useState(false);

  // Load dev accounts from the backend once (dev mode only).
  React.useEffect(() => {
    if (!SHOW_DEMO_ACCOUNTS || devGroups) return;
    let cancelled = false;
    setDevLoading(true);
    apiFetch("/api/dev/accounts", { auth: false })
      .then((groups) => {
        if (!cancelled) setDevGroups(groups || {});
      })
      .catch(() => {
        // Backend unavailable: fall back to the static matrix so the panel still works.
        if (!cancelled) {
          const fallback = {};
          FALLBACK_ACCOUNTS.forEach((acc) => {
            const cat = acc.role.toUpperCase() === "SENIOR MANAGER" ? "SENIOR MANAGERS"
              : acc.role.toUpperCase() === "VENDOR" ? "VENDORS"
              : acc.role.toUpperCase() + "S";
            const key = cat === "EMPLOYEES" ? "EMPLOYEES" : cat;
            (fallback[key] = fallback[key] || []).push({
              name: acc.role,
              username: acc.username,
              password: acc.password,
              roleName: acc.role,
              category: key,
            });
          });
          setDevGroups(fallback);
        }
      })
      .finally(() => {
        if (!cancelled) setDevLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [devGroups]);

  const filteredGroups = React.useMemo(() => {
    if (!devGroups) return null;
    const q = devSearch.trim().toLowerCase();
    const out = {};
    Object.keys(devGroups).forEach((cat) => {
      const list = devGroups[cat].filter((a) => {
        if (!q) return true;
        return (
          (a.name || "").toLowerCase().includes(q) ||
          (a.username || "").toLowerCase().includes(q) ||
          (a.employeeCode || "").toLowerCase().includes(q) ||
          (a.employeeId || "").toLowerCase().includes(q) ||
          (a.vendorId || "").toLowerCase().includes(q) ||
          (a.department || "").toLowerCase().includes(q) ||
          (a.roleName || "").toLowerCase().includes(q)
        );
      });
      if (list.length) out[cat] = list;
    });
    return out;
  }, [devGroups, devSearch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const session = await apiFetch("/api/auth/login", {
        method: "POST",
        auth: false,
        body: { username: username.trim(), password },
      });

      const backendRole = session.roleCode || session.role || "";
      const role = ROLE_MAP[backendRole] || backendRole.toLowerCase();

      localStorage.setItem("eps_access_token", session.accessToken);
      localStorage.setItem("eps_username", session.username);
      localStorage.setItem("eps_display_name", session.displayName || session.username);
      localStorage.setItem("eps_role_code", backendRole);
      localStorage.setItem("eps_active_role", role);

      if (remember) {
        localStorage.setItem("eps_remember_username", username.trim());
      } else {
        localStorage.removeItem("eps_remember_username");
      }

      // replace: true so the browser Back button does not return to the login
      // page (which would look like being logged out).
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to the login service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative background orbs */}
      <div className="login-orb login-orb-a" />
      <div className="login-orb login-orb-b" />
      <div className="login-orb login-orb-c" />
      <div className="login-grid-overlay" />

      <div className="login-box">
        <div className="login-box-topbar" />

        <div className="brand-row">
          <div className="brand-badge">
            <img src={Logo} alt="Enterprise Logo" />
          </div>
          <span className="brand-name">
            Enterprise <em>Procurement</em> System
          </span>
        </div>

        <div className="login-heading">
          <h3 className="login-title">Welcome back</h3>
          <p className="login-subtitle">
            Sign in to access your dashboard
            <Sparkles size={13} className="login-subtitle-spark" />
          </p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="login-field">
            <label htmlFor="eps-username">Username</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <UserIcon size={17} />
              </span>
              <input
                id="eps-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="eps-password">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <Lock size={17} />
              </span>
              <input
                id="eps-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-toggle-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember" htmlFor="eps-remember">
              <input
                id="eps-remember"
                name="remember-username"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="remember-check">
                <svg viewBox="0 0 12 10" fill="none">
                  <path d="M1 5.5L4.2 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Remember username
            </label>
            <span className="secure-note">
              <ShieldCheck size={13} /> Secured
            </span>
          </div>

          <button type="submit" className="next-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={19} className="login-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        {SHOW_DEMO_ACCOUNTS && (
          <details className="demo-accounts" open={devGroups ? false : undefined}>
            <summary>
              Demo accounts <span className="demo-hint">(dev only — from database)</span>
            </summary>
            {devLoading && <p className="demo-loading">Loading development accounts…</p>}
            {filteredGroups && (
              <>
                <input
                  type="text"
                  className="demo-search"
                  placeholder="Search by name, username, ID, role or department…"
                  value={devSearch}
                  onChange={(e) => setDevSearch(e.target.value)}
                />
                {CATEGORY_ORDER.filter((c) => filteredGroups[c]).map((cat) => (
                  <div key={cat} className="demo-group">
                    <div className="demo-group-title">{cat}</div>
                    <div className="demo-accounts-grid">
                      {filteredGroups[cat].map((acc) => (
                        <button
                          type="button"
                          key={acc.username}
                          className="demo-account-chip"
                          onClick={() => {
                            setUsername(acc.username);
                            setPassword(acc.password || "");
                            setError("");
                          }}
                        >
                          <strong>{acc.name || acc.roleName || acc.username}</strong>
                          <span>{acc.username}</span>
                          {(acc.employeeCode || acc.vendorId) && (
                            <small className="demo-chip-meta">
                              {acc.employeeCode || `VEN-${acc.vendorId}`}
                              {acc.department ? ` · ${acc.department}` : ""}
                            </small>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </details>
        )}

        <p className="footer">
          <strong>Enterprise Procurement System © 2026</strong>
        </p>
      </div>
    </div>
  );
};

export default Loginout;
