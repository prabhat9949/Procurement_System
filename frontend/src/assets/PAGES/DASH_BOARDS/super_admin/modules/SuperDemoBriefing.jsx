import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../../../../services/apiClient";
import {
  Play,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

const PIPELINE = [
  { key: "purchaseRequest", label: "PR" },
  { key: "approvalStatus", label: "Approval" },
  { key: "rfq", label: "RFQ" },
  { key: "quotations", label: "Quotations" },
  { key: "comparison", label: "Vendor Selection" },
  { key: "purchaseOrder", label: "PO" },
  { key: "poStatus", label: "Status" },
];

const formatINR = (v) =>
  v == null || v === "" || v === 0
    ? "—"
    : "₹" + Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const SuperDemoBriefing = () => {
  const [status, setStatus] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRun, setConfirmRun] = useState(false);
  const [message, setMessage] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/demo/status");
      setStatus(data);
    } catch (e) {
      setMessage(e.message || "Unable to load demo status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const runDemo = async () => {
    setRunning(true);
    setMessage("");
    try {
      const data = await apiFetch("/api/demo/run", { method: "POST" });
      setLastRun(data);
      setStatus(await apiFetch("/api/demo/status"));
      setMessage("Demo scenario created in the database — all records are real and linked.");
    } catch (e) {
      setMessage(e.message || "Demo run failed.");
    } finally {
      setRunning(false);
      setConfirmRun(false);
    }
  };

  const resetDemo = async () => {
    setResetting(true);
    setMessage("");
    try {
      const data = await apiFetch("/api/demo/reset", { method: "POST" });
      setLastRun(null);
      setStatus(await apiFetch("/api/demo/status"));
      setMessage("Demo scenario removed. Real business data was not touched.");
    } catch (e) {
      setMessage(e.message || "Demo reset failed.");
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  const valueOf = (key) => {
    if (!status) return null;
    if (key === "quotations") return status.quotations ? `${status.quotations} quotes` : null;
    return status[key];
  };

  const hasDemo = Boolean(status?.purchaseRequest);

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
        <FlaskConical size={26} color="#f8b400" />
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111", margin: 0 }}>
            Demo / Mentor Briefing
          </h1>
          <p style={{ margin: "2px 0 0", color: "#667", fontSize: "13px" }}>
            Creates a complete, database-backed demonstration workflow (DEMO-2026-001). No fake frontend data.
          </p>
        </div>
      </div>

      {message && (
        <div
          style={{
            marginTop: "14px", padding: "10px 14px", borderRadius: "10px",
            background: "#eefaf3", color: "#047857", border: "1px solid #a7f3d0",
            fontSize: "13.5px", display: "flex", gap: "8px", alignItems: "center",
          }}
        >
          <CheckCircle2 size={17} /> {message}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", margin: "18px 0 22px", flexWrap: "wrap" }}>
        {!confirmRun ? (
          <button
            onClick={() => setConfirmRun(true)}
            disabled={running || resetting}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg,#f8b400,#f59e0b)", color: "#111",
              border: "none", padding: "11px 20px", borderRadius: "10px",
              fontWeight: "700", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 14px rgba(248,180,0,.35)",
            }}
          >
            {running ? <Loader2 size={17} className="login-spin" /> : <Play size={17} />}
            {running ? "Creating demo…" : "Run Demo"}
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fffbeb", border: "1px solid #fde68a", padding: "10px 16px", borderRadius: "12px" }}>
            <AlertTriangle size={18} color="#d97706" />
            <span style={{ fontSize: "13px", color: "#92400e", fontWeight: "600" }}>
              This creates a complete database-backed demo workflow. Continue?
            </span>
            <button onClick={runDemo} disabled={running} style={{ background: "#d97706", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
              {running ? "Running…" : "Yes, Run"}
            </button>
            <button onClick={() => setConfirmRun(false)} style={{ background: "transparent", border: "1px solid #d9d9d9", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
              Cancel
            </button>
          </div>
        )}

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            disabled={!hasDemo || resetting || running}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#fff", color: "#dc2626", border: "1px solid #fecaca",
              padding: "11px 20px", borderRadius: "10px", fontWeight: "700", fontSize: "14px",
              cursor: hasDemo ? "pointer" : "not-allowed", opacity: hasDemo ? 1 : 0.5,
            }}
          >
            {resetting ? <Loader2 size={17} className="login-spin" /> : <RotateCcw size={17} />}
            {resetting ? "Resetting…" : "Reset Demo"}
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 16px", borderRadius: "12px" }}>
            <AlertTriangle size={18} color="#dc2626" />
            <span style={{ fontSize: "13px", color: "#991b1b", fontWeight: "600" }}>
              Remove demo records only (real data is never touched)?
            </span>
            <button onClick={resetDemo} disabled={resetting} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
              {resetting ? "Resetting…" : "Yes, Reset"}
            </button>
            <button onClick={() => setConfirmReset(false)} style={{ background: "transparent", border: "1px solid #d9d9d9", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
              Cancel
            </button>
          </div>
        )}

        <button
          onClick={loadStatus}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f8f9fb", color: "#374151", border: "1px solid #e5e7eb",
            padding: "11px 20px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer",
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Pipeline */}
      <div style={{ background: "#fff", border: "1px solid #eef0f3", borderRadius: "14px", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#111", margin: "0 0 4px" }}>
          Workflow Pipeline — {hasDemo ? "demo records present" : "no demo records yet"}
        </h3>
        {loading ? (
          <div style={{ color: "#667", fontSize: "13px", padding: "20px 0" }}>Loading demo status…</div>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
              {PIPELINE.map((stage, i) => {
                const v = valueOf(stage.key);
                const done = v != null && v !== "" && v !== 0 && v !== "SKIPPED";
                return (
                  <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        display: "flex", flexDirection: "column", gap: "2px",
                        background: done ? "#eefaf3" : "#f8f9fb",
                        border: done ? "1px solid #a7f3d0" : "1px solid #e5e7eb",
                        borderRadius: "10px", padding: "8px 14px", minWidth: "110px",
                      }}
                    >
                      <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#8a94a3", textTransform: "uppercase", letterSpacing: ".5px" }}>
                        {stage.label}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: done ? "#047857" : "#9ca3af", fontFamily: "monospace" }}>
                        {done ? (stage.key === "quotations" ? v : v) : "—"}
                      </span>
                    </div>
                    {i < PIPELINE.length - 1 && <ArrowRight size={15} color="#cbd5e1" />}
                  </div>
                );
              })}
            </div>

            {hasDemo && (
              <div style={{ marginTop: "18px", borderTop: "1px dashed #e5e7eb", paddingTop: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "10px" }}>
                  {[
                    ["Scenario", status.demoScenarioId || "DEMO-2026-001"],
                    ["Employee", lastRun?.employee || "—"],
                    ["PR", status.purchaseRequest],
                    ["Approval", status.approvalStatus],
                    ["RFQ", status.rfq],
                    ["Quotations", status.quotations ? `${status.quotations} submitted` : "—"],
                    ["Selected Vendor", status.poVendor || "—"],
                    ["PO", status.purchaseOrder],
                    ["PO Status", status.poStatus],
                    ["Comparison", status.comparisonStatus],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", background: "#fafbfc", borderRadius: "8px", padding: "8px 12px" }}>
                      <span style={{ fontSize: "12px", color: "#8a94a3", fontWeight: "600" }}>{k}</span>
                      <span style={{ fontSize: "12.5px", fontWeight: "800", color: "#111", fontFamily: "monospace" }}>{v || "—"}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "#8a94a3", marginTop: "12px" }}>
                  All demo records live in MySQL and are visible through the normal dashboards (employee, manager,
                  procurement, vendors, warehouse, finance). The selected vendor's PO is only visible to that vendor.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SuperDemoBriefing;
