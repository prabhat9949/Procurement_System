import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  Loader2,
  WifiOff,
  AlertTriangle,
  Activity,
  ArrowUpRight,
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
import { formatINR, formatDateIN, formatCount } from "../../../../utils/format";

/**
 * Shared live role overview.
 *
 * Props:
 *  - header:  { title, subtitle, badge, Icon, accent }
 *  - endpoints: { key: url }  — fetched in parallel with the JWT attached
 *  - kpiFn:   (data) => [{ label, value, icon, color, sub? }]  (value may be string|number)
 *  - charts:  [{ key, code?, label, color, type }] — reads data[key].charts by code,
 *             or data[key].points directly (standalone ChartResponse)
 *  - tables:  [{ key, title, columns, emptyText, maxRows? }]
 *             columns = [{ header, render(row) }]
 *  - activities: { key } — renders data[key].recentActivities feed
 *  - actions:    [{ label, icon, onClick }] — quick-action buttons in the header
 */
const LiveRoleOverview = ({
  header,
  endpoints,
  kpiFn,
  charts = [],
  tables = [],
  activities,
  actions = [],
}) => {
  const { title, subtitle, badge, Icon, accent = "#f8b400" } = header || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({});

  // Keep the latest config available to loadData without re-creating the callback.
  const propsRef = useRef({ endpoints, kpiFn, charts, tables, activities });
  propsRef.current = { endpoints, kpiFn, charts, tables, activities };

  const endpointKey = JSON.stringify(endpoints || {});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { endpoints: eps } = propsRef.current;
      const entries = await Promise.all(
        Object.entries(eps || {}).map(async ([key, url]) => {
          const res = await apiGet(url).catch(() => null);
          return [key, res];
        })
      );
      setData(Object.fromEntries(entries));
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [endpointKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kpis = useMemo(() => {
    if (!kpiFn) return [];
    try {
      return kpiFn(data) || [];
    } catch {
      return [];
    }
  }, [data, kpiFn]);

  const chartPoints = (key, code) => {
    const source = data[key];
    if (!source) return [];
    const points =
      code && Array.isArray(source?.charts)
        ? source.charts.find((c) => c.code === code)?.points
        : source?.points;
    return (points || []).map((p) => ({ name: p.label, value: Number(p.value) || 0 }));
  };

  const tableRows = (key) => {
    const source = data[key];
    if (!source) return [];
    if (Array.isArray(source)) return source;
    return source?.content || [];
  };

  const recentActivities = activities ? data[activities.key]?.recentActivities || [] : [];

  return (
    <div className="lro-root">
      <style>{`
        .lro-root { padding:20px; font-family:Inter, sans-serif; background:#f7f8fa; min-height:100vh; }
        .lro-card { background:#fff; border:1px solid #e7ebf0; border-radius:14px; }
        .lro-kpi { background:#fff; border:1px solid #e7ebf0; border-radius:14px; padding:16px 18px; display:flex; align-items:center; gap:14px; transition: transform .18s ease, box-shadow .18s ease; }
        .lro-kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(16,35,56,.08); }
        .lro-table { width:100%; border-collapse: collapse; font-size:13.5px; }
        .lro-table th { text-align:left; color:#7a8999; font-size:11.5px; text-transform:uppercase; letter-spacing:.4px; padding:10px 12px; border-bottom:1px solid #eceef1; }
        .lro-table td { padding:11px 12px; border-bottom:1px solid #f2f4f6; color:#33414f; }
        .lro-badge { font-size:11px; font-weight:800; padding:3px 10px; border-radius:999px; }
        .lro-activity { display:flex; align-items:center; gap:12px; padding:11px 4px; border-bottom:1px solid #f2f4f6; }
        .lro-activity:last-child { border-bottom:0; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {Icon && <Icon color={accent} size={26} />}
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111", margin: 0 }}>
              {title}
            </h1>
          </div>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>{subtitle}</p>
          {badge && (
            <span style={{ display: "inline-block", marginTop: "8px", fontSize: "12.5px", fontWeight: "700", color: "#b57a00", background: "#fff6de", border: "1px solid #f3d27a", padding: "5px 12px", borderRadius: "999px" }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {actions.map((a, idx) => {
            const AIcon = a.icon;
            return (
              <button
                key={idx}
                onClick={a.onClick}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 16px", border: "none", borderRadius: "9px", background: accent, color: a.primary ? "#111" : "#fff", cursor: "pointer", fontWeight: "800", fontSize: "13px", boxShadow: a.primary ? `0 4px 14px ${accent}55` : "none" }}
              >
                {AIcon && <AIcon size={15} />} {a.label}
              </button>
            );
          })}
          <button
            onClick={loadData}
            style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 16px", border: "1px solid #d9dee6", borderRadius: "9px", background: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#444" }}
          >
            <RefreshCw size={14} className={loading ? "lro-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

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
          <Loader2 size={22} className="lro-spin" /> Loading live data from the database...
        </div>
      ) : (
        <>
          {/* KPIs */}
          {kpis.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
              {kpis.map((k, idx) => {
                const KIcon = k.icon || Activity;
                const value = typeof k.value === "number" ? formatCount(k.value) : k.value;
                return (
                  <div className="lro-kpi" key={idx}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${k.color || accent}14`, color: k.color || accent, flexShrink: 0 }}>
                      <KIcon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: "#111", lineHeight: 1.1 }}>{value}</div>
                      <div style={{ fontSize: "12.5px", color: "#777", fontWeight: "600" }}>{k.label}</div>
                      {k.sub && <div style={{ fontSize: "11.5px", color: "#9aa8b8", marginTop: "2px" }}>{k.sub}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Charts */}
          {charts.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
              {charts.map((c) => {
                const points = chartPoints(c.key, c.code);
                return (
                  <div className="lro-card" key={c.label} style={{ padding: "20px" }}>
                    <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                      {c.label}
                    </h3>
                    {points.length === 0 ? (
                      <EmptyState text="No data recorded yet." />
                    ) : c.type === "area" ? (
                      <ResponsiveContainer width="100%" height={230}>
                        <AreaChart data={points}>
                          <defs>
                            <linearGradient id={`lroGrad-${c.label.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={c.color} stopOpacity={0.5} />
                              <stop offset="100%" stopColor={c.color} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a8999" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#7a8999" }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                          <Tooltip formatter={(v) => [formatINR(v), c.label]} />
                          <Area type="monotone" dataKey="value" stroke={c.color} strokeWidth={2.5} fill={`url(#lroGrad-${c.label.replace(/\W/g, "")})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={points}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a8999" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#7a8999" }} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" name="Count" fill={c.color} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent activities */}
          {recentActivities.length > 0 && (
            <div className="lro-card" style={{ padding: "20px", marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                <Activity size={15} style={{ verticalAlign: "-2px", marginRight: "6px", color: accent }} />
                Recent Activity
              </h3>
              {recentActivities.slice(0, 8).map((a, idx) => (
                <div className="lro-activity" key={idx}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: `${accent}14`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ArrowUpRight size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: "13px", color: "#111" }}>{a.referenceNumber || a.title}</strong>
                    <span style={{ fontSize: "12.5px", color: "#7a8999", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.title} · {a.type}
                    </span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span className="lro-badge" style={{ background: a.status === "APPROVED" || a.status === "COMPLETED" || a.status === "PAID" ? "rgba(5,150,105,.12)" : a.status === "REJECTED" || a.status === "CANCELLED" || a.status === "FAILED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: a.status === "APPROVED" || a.status === "COMPLETED" || a.status === "PAID" ? "#059669" : a.status === "REJECTED" || a.status === "CANCELLED" || a.status === "FAILED" ? "#dc2626" : "#d97706" }}>
                      {a.status}
                    </span>
                    <div style={{ fontSize: "11px", color: "#9aa8b8", marginTop: "3px" }}>{formatDateIN(a.occurredAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tables */}
          {tables.map((t) => {
            const rows = tableRows(t.key).slice(0, t.maxRows || 10);
            return (
              <div className="lro-card" key={t.title} style={{ padding: "20px", marginBottom: "18px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>{t.title}</h3>
                {rows.length === 0 ? (
                  <EmptyState text={t.emptyText || "No records found."} />
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="lro-table">
                      <thead>
                        <tr>
                          {t.columns.map((col, idx) => (
                            <th key={idx} style={{ textAlign: col.align || "left" }}>{col.header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr key={row.id || idx}>
                            {t.columns.map((col, cidx) => (
                              <td key={cidx} style={{ textAlign: col.align || "left" }}>
                                {col.render ? col.render(row) : row[col.accessor]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      <style>{`
        @keyframes lroSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .lro-spin { animation: lroSpin .9s linear infinite; }
      `}</style>
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "36px 0", color: "#9aa8b8" }}>
    <AlertTriangle size={22} style={{ opacity: 0.5 }} />
    <span style={{ fontSize: "13.5px", fontWeight: "600" }}>{text}</span>
  </div>
);

export default LiveRoleOverview;
