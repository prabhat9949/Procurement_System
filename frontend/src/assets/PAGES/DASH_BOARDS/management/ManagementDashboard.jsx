import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  FileText,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  RefreshCw,
  Loader2,
  WifiOff,
  AlertTriangle,
  Crown,
  Users,
  LayoutDashboard,
  Scale,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { apiGet } from "../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../utils/format";
import RoleShell from "../shared_ui/RoleShell";

const ROLE_META = {
  senior_manager: {
    title: "Senior Manager",
    subtitle: "Escalated approvals, department monitoring and budget visibility",
    icon: Users,
    portal: "Senior Manager Portal",
  },
  head: {
    title: "Head / Executive",
    subtitle: "High-value approvals, executive spend visibility and governance",
    icon: Crown,
    portal: "Head Executive Portal",
  },
};

const ManagementDashboard = ({ role = "senior_manager" }) => {
  const meta = ROLE_META[role] || ROLE_META.senior_manager;
  const Icon = meta.icon;

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvalTasks, setApprovalTasks] = useState([]);
  const [requestStats, setRequestStats] = useState({ total: 0, approved: 0 });
  const [spendChart, setSpendChart] = useState([]);
  const [prChart, setPrChart] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tasks, prs, prApproved, spend, prTrend] = await Promise.all([
        apiGet("/api/approval-tasks?page=0&size=20&sort=assignedDate&direction=desc"),
        apiGet("/api/purchase-requests?page=0&size=1"),
        apiGet("/api/purchase-requests?status=APPROVED&page=0&size=1"),
        apiGet("/api/dashboard/charts/spend"),
        apiGet("/api/dashboard/charts/pr"),
      ]);

      setApprovalTasks(tasks?.content || []);
      setRequestStats({
        total: prs?.totalElements || 0,
        approved: prApproved?.totalElements || 0,
      });

      const toChart = (chart) =>
        (chart?.points || []).map((p) => ({ name: p.label, value: Number(p.value) || 0 }));
      setSpendChart(toChart(spend));
      setPrChart(toChart(prTrend));
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingTasks = useMemo(() => approvalTasks.filter((t) => t.status === "PENDING"), [approvalTasks]);
  const totalSpend = useMemo(
    () => spendChart.reduce((sum, p) => sum + (p.value || 0), 0),
    [spendChart]
  );

  const kpis = [
    { label: "Pending Approvals", value: pendingTasks.length, icon: ClipboardCheck, color: "#d97706" },
    { label: "Total Requests", value: requestStats.total, icon: FileText, color: "#2563eb" },
    { label: "Approved Requests", value: requestStats.approved, icon: CheckCircle2, color: "#059669" },
    { label: "Monthly Spend", value: formatINR(totalSpend), icon: IndianRupee, color: "#7c3aed" },
  ];

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "approvals", label: "Approval Tasks", icon: ClipboardCheck },
    { id: "analytics", label: "Analytics", icon: Scale },
  ];

  return (
    <RoleShell
      portalTitle={meta.portal}
      roleLabel={meta.title}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userMeta={{ dept: "Management & Governance" }}
    >
      <style>{`
        .mgmt-card { background:#fff; border:1px solid #e7ebf0; border-radius:14px; padding:20px; }
        .mgmt-kpi { background:#fff; border:1px solid #e7ebf0; border-radius:14px; padding:16px 18px; display:flex; align-items:center; gap:14px; transition: transform .18s ease, box-shadow .18s ease; }
        .mgmt-kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(16,35,56,.08); }
        .mgmt-table { width:100%; border-collapse: collapse; font-size:13.5px; }
        .mgmt-table th { text-align:left; color:#7a8999; font-size:11.5px; text-transform:uppercase; letter-spacing:.4px; padding:10px 12px; border-bottom:1px solid #eceef1; }
        .mgmt-table td { padding:11px 12px; border-bottom:1px solid #f2f4f6; color:#33414f; }
        .mgmt-badge { font-size:11px; font-weight:800; padding:3px 10px; border-radius:999px; }
        .mgmt-tabs { display:flex; gap:8px; background:#fff; border:1px solid #e7ebf0; border-radius:12px; padding:5px; margin-bottom:20px; width:fit-content; }
        .mgmt-tab { border:none; background:transparent; padding:9px 18px; border-radius:9px; font-size:13px; font-weight:700; color:#555; cursor:pointer; display:flex; align-items:center; gap:7px; }
        .mgmt-tab.active { background:#f8b400; color:#000; }        @keyframes mgmtSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .mgmt-spin { animation: mgmtSpin .9s linear infinite; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "800", color: "#111", margin: 0 }}>
            <Icon color="#f8b400" size={26} />
            {meta.title} Dashboard
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>{meta.subtitle}</p>
        </div>
        <button
          onClick={loadData}
          style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 16px", border: "1px solid #d9dee6", borderRadius: "9px", background: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#444" }}
        >
          <RefreshCw size={14} className={loading ? "mgmt-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Sidebar drives navigation — matching every other dashboard shell. */}

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px 20px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "12px", color: "#991b1b" }}>
          <WifiOff size={18} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: "14px" }}>Could not load dashboard data</strong>
            <span style={{ fontSize: "13px" }}>{error}</span>
          </div>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "80px 0", color: "#888", fontWeight: "600" }}>
          <Loader2 size={22} className="mgmt-spin" /> Loading live dashboard data...
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
            {kpis.map((k) => {
              const KIcon = k.icon;
              return (
                <div className="mgmt-kpi" key={k.label}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${k.color}14`, color: k.color, flexShrink: 0 }}>
                    <KIcon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "21px", fontWeight: "800", color: "#111", lineHeight: 1.1 }}>{k.value}</div>
                    <div style={{ fontSize: "12.5px", color: "#777", fontWeight: "600" }}>{k.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {(activeTab === "overview" || activeTab === "analytics") && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
              <div className="mgmt-card">
                <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                  <TrendingUp size={15} style={{ verticalAlign: "-2px", marginRight: "6px", color: "#7c3aed" }} />
                  Procurement Spend (₹)
                </h3>
                {spendChart.length === 0 ? (
                  <EmptyState text="No spend data recorded yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={spendChart}>
                      <defs>
                        <linearGradient id="mgmtSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f8b400" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#f8b400" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a8999" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#7a8999" }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                      <Tooltip formatter={(v) => [formatINR(v), "Spend"]} />
                      <Area type="monotone" dataKey="value" stroke="#f8b400" strokeWidth={2.5} fill="url(#mgmtSpend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mgmt-card">
                <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                  <FileText size={15} style={{ verticalAlign: "-2px", marginRight: "6px", color: "#2563eb" }} />
                  Purchase Request Trend
                </h3>
                {prChart.length === 0 ? (
                  <EmptyState text="No purchase request trends yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={prChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a8999" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#7a8999" }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Requests" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {(activeTab === "overview" || activeTab === "approvals") && (
            <div className="mgmt-card">
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                <ClipboardCheck size={15} style={{ verticalAlign: "-2px", marginRight: "6px", color: "#d97706" }} />
                Approval Tasks
              </h3>
              {approvalTasks.length === 0 ? (
                <EmptyState text="No approval tasks have been created yet." />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Request</th>
                        <th>Stage</th>
                        <th>Assigned To</th>
                        <th>Assigned</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvalTasks.slice(0, activeTab === "approvals" ? 20 : 10).map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: "700" }}>{t.taskNumber}</td>
                          <td>{t.requestNumber}</td>
                          <td>{t.stageName}</td>
                          <td>{t.assignedEmployeeName}</td>
                          <td style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(t.assignedDate)}</td>
                          <td>
                            <span
                              className="mgmt-badge"
                              style={{
                                background: t.status === "PENDING" ? "rgba(217,119,6,.12)" : t.status === "APPROVED" ? "rgba(5,150,105,.12)" : t.status === "REJECTED" ? "rgba(220,38,38,.12)" : "rgba(100,116,139,.12)",
                                color: t.status === "PENDING" ? "#d97706" : t.status === "APPROVED" ? "#059669" : t.status === "REJECTED" ? "#dc2626" : "#64748b",
                              }}
                            >
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </RoleShell>
  );
};

const EmptyState = ({ text }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "36px 0", color: "#9aa8b8" }}>
    <AlertTriangle size={22} style={{ opacity: 0.5 }} />
    <span style={{ fontSize: "13.5px", fontWeight: "600" }}>{text}</span>
  </div>
);

export default ManagementDashboard;
