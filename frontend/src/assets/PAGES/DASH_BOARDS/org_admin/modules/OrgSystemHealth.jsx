import React, { useState, useEffect, useCallback } from "react";
import {
  HeartPulse,
  Database,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  Building2,
  Landmark,
  Truck,
  Briefcase,
  Clock,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";

const OrgSystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkedAt, setCheckedAt] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/system/health");
      setHealth(data);
      setCheckedAt(new Date());
    } catch (err) {
      setError(err.message || "Health check failed — is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const db = health?.database || {};
  const counts = health?.recordCounts || {};
  const overallUp = health?.overall === "UP";

  const statusChip = (ok, label) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "800", padding: "4px 12px", borderRadius: "12px", background: ok ? "rgba(5,150,105,0.12)" : "rgba(220,38,38,0.12)", color: ok ? "#059669" : "#dc2626" }}>
      {ok ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />} {label}
    </span>
  );

  const countCards = [
    { label: "User Accounts", value: counts.users, icon: Users, color: "#2563eb" },
    { label: "Employees", value: counts.employees, icon: Briefcase, color: "#059669" },
    { label: "Departments", value: counts.departments, icon: Building2, color: "#d97706" },
    { label: "Cost Centers", value: counts.costCenters, icon: Landmark, color: "#7c3aed" },
    { label: "Vendors", value: counts.vendors, icon: Truck, color: "#0891b2" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div className="sadmin-page-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111", margin: 0 }}>
            <HeartPulse color="#059669" size={28} /> System Health
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Live backend and database monitoring from the real health endpoint.
          </p>
        </div>
        <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={loadData} disabled={loading}>
          <RefreshCw size={15} className={loading ? "login-spin" : ""} /> Run Health Check
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "14px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading && !health ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: "10px", color: "#666" }}>
          <Loader2 size={20} className="login-spin" /> Checking backend & database health...
        </div>
      ) : health ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Overall status banner */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 24px", borderRadius: "12px", background: overallUp ? "linear-gradient(135deg, rgba(5,150,105,0.08), rgba(5,150,105,0.03))" : "linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.03))", border: `1px solid ${overallUp ? "rgba(5,150,105,0.35)" : "rgba(220,38,38,0.35)"}`, flexWrap: "wrap" }}>
            {overallUp ? <CheckCircle2 size={40} color="#059669" /> : <AlertCircle size={40} color="#dc2626" />}
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: overallUp ? "#059669" : "#dc2626" }}>
                System {overallUp ? "Operational" : "Degraded"}
              </h2>
              <div style={{ color: "#666", fontSize: "13.5px", marginTop: "2px" }}>
                {health.backend} backend · v{health.version} · Last checked {checkedAt?.toLocaleTimeString("en-IN")}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {statusChip(health.backend === "UP", "Backend")}
              {statusChip(db.status === "UP", "Database")}
            </div>
          </div>

          {/* Database card */}
          <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "20px 24px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", fontWeight: "700", color: "#111", margin: "0 0 14px" }}>
              <Database size={18} color="#d97706" /> Database Connection
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "14px", background: "#f8f9fb", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", fontWeight: "700" }}>Status</div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: db.status === "UP" ? "#059669" : "#dc2626", marginTop: "2px" }}>{db.status || "—"}</div>
              </div>
              <div style={{ padding: "14px", background: "#f8f9fb", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", fontWeight: "700" }}>Database</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#111", marginTop: "2px" }}>{db.database || "—"}</div>
              </div>
              <div style={{ padding: "14px", background: "#f8f9fb", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}><Clock size={12} /> Response Time</div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>{db.responseTimeMs != null ? `${db.responseTimeMs} ms` : "—"}</div>
              </div>
              <div style={{ padding: "14px", background: "#f8f9fb", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", fontWeight: "700" }}>Last Checked At</div>
                <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#111", marginTop: "2px" }}>{db.lastCheckedAt ? new Date(db.lastCheckedAt).toLocaleString("en-IN") : "—"}</div>
              </div>
            </div>
          </div>

          {/* Record counts */}
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "0 0 14px" }}>Database Record Counts</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
              {countCards.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} style={{ padding: "16px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
                    <Icon size={18} color={c.color} />
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#111", marginTop: "6px" }}>{(c.value ?? 0).toLocaleString()}</div>
                    <div style={{ fontSize: "12.5px", color: "#666", fontWeight: "600" }}>{c.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OrgSystemHealth;
