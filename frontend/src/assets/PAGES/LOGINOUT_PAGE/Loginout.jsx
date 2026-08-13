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
import { clearSession, loadVerifiedSession } from "../../../services/session";

// Development-only helper so every role can be tested. These match the accounts seeded by
// the backend DataInitializer (the simple role-based login matrix).
const DEMO_ACCOUNTS = [
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

const SHOW_DEMO_ACCOUNTS = import.meta.env.DEV;

const Loginout = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState(() => localStorage.getItem("eps_remember_username") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(Boolean(localStorage.getItem("eps_remember_username")));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      localStorage.setItem("eps_access_token", session.accessToken);
      await loadVerifiedSession();

      if (remember) {
        localStorage.setItem("eps_remember_username", username.trim());
      } else {
        localStorage.removeItem("eps_remember_username");
      }

      // replace: true so the browser Back button does not return to the login
      // page (which would look like being logged out).
      navigate("/dashboard", { replace: true });
    } catch (err) {
      clearSession();
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
          <details className="demo-accounts">
            <summary>
              Demo accounts <span className="demo-hint">(dev only)</span>
            </summary>
            <div className="demo-accounts-grid">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  type="button"
                  key={acc.username}
                  className="demo-account-chip"
                  onClick={() => {
                    setUsername(acc.username);
                    setPassword(acc.password);
                    setError("");
                  }}
                >
                  <strong>{acc.role}</strong>
                  <span>{acc.username}</span>
                </button>
              ))}
            </div>
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
