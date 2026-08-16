import React, { useState, useEffect, useCallback } from "react";
import { PieChart, Loader2, WifiOff, IndianRupee, AlertTriangle, CheckCircle2 } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR } from "../../../../../utils/format";

const FinanceBudgetMgmt = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/cost-centers?page=0&size=200").catch(() => apiGet("/api/cost-centers"));
      setCenters(page?.content || page || []);
    } catch (err) {
      setError(err.message || "Unable to load budget data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalBudget = centers.reduce((a, c) => a + Number(c.budget || 0), 0);
  const totalUsed = centers.reduce((a, c) => a + Number(c.usedBudget || 0), 0);
  const pct = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;

  return (
    <div style={{ padding: "20px" }}>
      <div className="fin-page-header">
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <PieChart color="#f8b400" /> Budget Management
          </h1>
          <p className="fin-page-subtitle">Cost-center budgets, commitment and utilisation — live from the database.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading budget data...
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>TOTAL BUDGET</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#111", margin: "4px 0" }}>{formatINR(totalBudget)}</p>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>SPENT</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{formatINR(totalUsed)}</p>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>AVAILABLE</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{formatINR(totalBudget - totalUsed)}</p>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>UTILISATION</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: pct >= 90 ? "#dc2626" : pct >= 70 ? "#d97706" : "#111", margin: "4px 0" }}>{pct}%</p>
            </div>
          </div>

          <div className="fin-card" style={{ overflow: "hidden" }}>
            <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
              <IndianRupee size={16} color="#f8b400" /> Budget by Cost Center
            </h4>
            <div className="fin-table-container">
              <table className="fin-table">
                <thead>
                  <tr><th>Code</th><th>Cost Center</th><th>Department</th><th>Budget</th><th>Spent</th><th>Available</th><th>Utilisation</th></tr>
                </thead>
                <tbody>
                  {centers.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "28px", color: "#666" }}>No cost-center budget data available.</td></tr>
                  ) : centers.map((c) => {
                    const cp = Number(c.budget || 0) > 0 ? Math.round((Number(c.usedBudget || 0) / Number(c.budget || 0)) * 100) : 0;
                    const remaining = Number(c.budget || 0) - Number(c.usedBudget || 0);
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: "800", color: "#d97706" }}>{c.code}</td>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td style={{ fontSize: "13px" }}>{c.departmentName || "—"}</td>
                        <td style={{ fontWeight: 700 }}>{formatINR(c.budget)}</td>
                        <td style={{ color: "#d97706", fontWeight: 600 }}>{formatINR(c.usedBudget)}</td>
                        <td style={{ color: remaining < 0 ? "#dc2626" : "#059669", fontWeight: 700 }}>{formatINR(remaining)}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flex: 1, background: "#ececec", borderRadius: 6, height: 8, minWidth: 60 }}>
                              <div style={{ width: `${Math.min(cp, 100)}%`, height: 8, borderRadius: 6, background: cp >= 90 ? "#dc2626" : cp >= 70 ? "#d97706" : "#059669" }} />
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: cp >= 90 ? "#dc2626" : "#555" }}>{cp}%</span>
                            {cp >= 90 && <AlertTriangle size={14} color="#dc2626" />}
                            {cp >= 90 && <span style={{ fontSize: "10px", fontWeight: 800, color: "#dc2626" }}>BUDGET WARNING</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceBudgetMgmt;
