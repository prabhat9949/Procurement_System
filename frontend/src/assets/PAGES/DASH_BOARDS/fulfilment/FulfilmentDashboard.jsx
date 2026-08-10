import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Laptop,
  Wrench,
  CheckCircle2,
  FileText,
  IndianRupee,
  RefreshCw,
  Loader2,
  WifiOff,
  AlertTriangle,
  PackageCheck,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
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

const TEAM_META = {
  equipment: {
    title: "Equipment & Asset Team",
    subtitle: "Equipment and asset procurement — delivery verification, GRN and employee handover",
    icon: Boxes,
    focus: "Laptops · Desktops · Monitors · Printers · Networking & office equipment",
    portal: "Equipment & Asset Portal",
  },
  software: {
    title: "IT Software & Digital Services Team",
    subtitle: "Software and license fulfilment — availability check, activation, assignment and expiry",
    icon: Laptop,
    focus: "Microsoft 365 · Dev tools · Cloud subscriptions · SaaS licences",
    portal: "Software & Digital Services Portal",
  },
  facilities: {
    title: "Facilities Team",
    subtitle: "Facilities procurement and service fulfilment — suppliers, delivery and completion",
    icon: Wrench,
    focus: "Furniture · Maintenance · Facility services · Office infrastructure",
    portal: "Facilities Portal",
  },
};

const FulfilmentDashboard = ({ team = "equipment" }) => {
  const meta = TEAM_META[team] || TEAM_META.equipment;
  const Icon = meta.icon;

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0 });
  const [prChart, setPrChart] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prs, prApproved, prTrend] = await Promise.all([
        apiGet("/api/purchase-requests?page=0&size=20&sort=createdAt&direction=desc").catch(() => null),
        apiGet("/api/purchase-requests?status=APPROVED&page=0&size=50").catch(() => null),
        apiGet("/api/dashboard/charts/pr").catch(() => null),
      ]);

      setRequests(prs?.content || []);
      setStats({
        total: prs?.totalElements || 0,
        approved: prApproved?.totalElements || 0,
      });
      setPrChart((prTrend?.points || []).map((p) => ({ name: p.label, value: Number(p.value) || 0 })));
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const approvedQueue = useMemo(() => requests.filter((r) => r.status === "APPROVED"), [requests]);
  const estimatedPipeline = useMemo(
    () => requests.filter((r) => r.status !== "APPROVED" && r.status !== "DRAFT").length,
    [requests]
  );

  const kpis = [
    { label: "Approved · Awaiting Fulfilment", value: stats.approved, icon: PackageCheck, color: "#059669" },
    { label: "In Progress", value: estimatedPipeline, icon: FileText, color: "#2563eb" },
    { label: "Total Requests Routed", value: stats.total, icon: CheckCircle2, color: "#d97706" },
  ];

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "queue", label: "Fulfilment Queue", icon: ClipboardList },
    { id: "requests", label: "All Requests", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <RoleShell
      portalTitle={meta.portal}
      roleLabel={meta.title}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userMeta={{ dept: "Procurement Fulfilment" }}
    >
      <style>{`
        .ful-card { background:#fff; border:1px solid #e7ebf0; border-radius:14px; padding:20px; }
        .ful-kpi { background:#fff; border:1px solid #e7ebf0; border-radius:14px; padding:16px 18px; display:flex; align-items:center; gap:14px; transition: transform .18s ease, box-shadow .18s ease; }
        .ful-kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(16,35,56,.08); }
        .ful-table { width:100%; border-collapse: collapse; font-size:13.5px; }
        .ful-table th { text-align:left; color:#7a8999; font-size:11.5px; text-transform:uppercase; letter-spacing:.4px; padding:10px 12px; border-bottom:1px solid #eceef1; }
        .ful-table td { padding:11px 12px; border-bottom:1px solid #f2f4f6; color:#33414f; }
        .ful-badge { font-size:11px; font-weight:800; padding:3px 10px; border-radius:999px; }
        .ful-tabs { display:flex; gap:8px; background:#fff; border:1px solid #e7ebf0; border-radius:12px; padding:5px; margin-bottom:20px; width:fit-content; }
        .ful-tab { border:none; background:transparent; padding:9px 18px; border-radius:9px; font-size:13px; font-weight:700; color:#555; cursor:pointer; display:flex; align-items:center; gap:7px; }
        .ful-tab.active { background:#f8b400; color:#000; }        @keyframes fulSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .ful-spin { animation: fulSpin .9s linear infinite; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "800", color: "#111", margin: 0 }}>
            <Icon color="#f8b400" size={26} />
            {meta.title} Dashboard
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>{meta.subtitle}</p>
          <span style={{ display: "inline-block", marginTop: "8px", fontSize: "12.5px", fontWeight: "700", color: "#b57a00", background: "#fff6de", border: "1px solid #f3d27a", padding: "5px 12px", borderRadius: "999px" }}>
            {meta.focus}
          </span>
        </div>
        <button
          onClick={loadData}
          style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 16px", border: "1px solid #d9dee6", borderRadius: "9px", background: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#444" }}
        >
          <RefreshCw size={14} className={loading ? "ful-spin" : ""} /> Refresh
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
          <Loader2 size={22} className="ful-spin" /> Loading live fulfilment data...
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
            {kpis.map((k) => {
              const KIcon = k.icon;
              return (
                <div className="ful-kpi" key={k.label}>
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

          {(activeTab === "overview" || activeTab === "queue") && (
            <div className="ful-card" style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                <PackageCheck size={15} style={{ verticalAlign: "-2px", marginRight: "6px", color: "#059669" }} />
                Approved Requests Awaiting Fulfilment
              </h3>
              {approvedQueue.length === 0 ? (
                <EmptyState text="No approved requisitions awaiting your team." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                  {approvedQueue.map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", border: "1px solid #eef1f5", borderRadius: "10px", background: "#fbfcfe" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(5,150,105,.1)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileText size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: "block", fontSize: "13px", color: "#111" }}>{r.requestNumber}</strong>
                        <span style={{ fontSize: "12.5px", color: "#7a8999", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.purpose} · {r.requesterName}
                        </span>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <strong style={{ fontSize: "13px", color: "#111", display: "block" }}>{formatINR(r.estimatedAmount)}</strong>
                        <span style={{ fontSize: "11px", color: "#7a8999" }}>{r.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === "overview" || activeTab === "analytics") && (
            <div className="ful-card" style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                <IndianRupee size={15} style={{ verticalAlign: "-2px", marginRight: "6px", color: "#2563eb" }} />
                Purchase Request Trend
              </h3>
              {prChart.length === 0 ? (
                <EmptyState text="No purchase request trends yet." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={prChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a8999" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#7a8999" }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Requests" fill="#f8b400" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {(activeTab === "overview" || activeTab === "requests") && (
            <div className="ful-card">
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                <FileText size={15} style={{ verticalAlign: "-2px", marginRight: "6px", color: "#d97706" }} />
                Routed Purchase Requests
              </h3>
              {requests.length === 0 ? (
                <EmptyState text="No purchase requests have been routed to your team yet." />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="ful-table">
                    <thead>
                      <tr>
                        <th>Request</th>
                        <th>Purpose</th>
                        <th>Requester</th>
                        <th>Department</th>
                        <th>Amount</th>
                        <th>Priority</th>
                        <th>Requested By</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, activeTab === "requests" ? 20 : 12).map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: "700" }}>{r.requestNumber}</td>
                          <td style={{ maxWidth: "220px" }}>{r.purpose}</td>
                          <td>{r.requesterName}</td>
                          <td>{r.departmentName}</td>
                          <td style={{ fontWeight: "700" }}>{formatINR(r.estimatedAmount)}</td>
                          <td>{r.priority}</td>
                          <td style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.requestDate, { withTime: false })}</td>
                          <td>
                            <span className="ful-badge" style={{ background: r.status === "APPROVED" ? "rgba(5,150,105,.12)" : r.status === "DRAFT" ? "rgba(100,116,139,.12)" : "rgba(217,119,6,.12)", color: r.status === "APPROVED" ? "#059669" : r.status === "DRAFT" ? "#64748b" : "#d97706" }}>
                              {r.status}
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

export default FulfilmentDashboard;
