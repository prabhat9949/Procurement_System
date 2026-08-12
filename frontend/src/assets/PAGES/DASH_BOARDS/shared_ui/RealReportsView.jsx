import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  Loader2,
  WifiOff,
  AlertTriangle,
  Activity,
  Download,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { apiGet } from "../../../../services/apiClient";
import { formatINR, formatCount } from "../../../../utils/format";

/**
 * Shared real analytics / report view.
 *
 * Every number comes from the backend:
 *  - KPIs read /api/reports/dashboard (real SQL aggregates)
 *  - charts read dashboard chart fields or standalone /api/dashboard/charts/* endpoints
 *  - tables read real paged endpoints (PageResponse<ReportRowResponse> or raw lists)
 *
 * Props:
 *  - header: { title, subtitle, badge, icon: LucideIcon }
 *  - kpis:   [{ label, key, icon, color, format: 'inr'|'count' }]  (key = DashboardResponse field)
 *  - kpiFn:  optional (data) => [{ label, value, icon, color, format? }] for custom KPIs
 *  - charts: [{ label, color, type: 'area'|'bar'|'pie', source: 'dash'|'endpoint',
 *               key (dash field) OR endpoint (URL) }]
 *  - tables: [{ key, endpoint, title, maxRows, columns: [{header, accessor|render}] }]
 *  - exportReportType: string used for the PDF/Excel export buttons (e.g. 'purchase-orders')
 */
const RealReportsView = ({
  header,
  kpis = [],
  kpiFn,
  charts = [],
  tables = [],
  exportReportType = "purchase-orders",
  accent = "#f8b400",
}) => {
  const { title, subtitle, badge, icon: Icon } = header || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const [exporting, setExporting] = useState("");

  const propsRef = useRef({ tables, charts });
  propsRef.current = { tables, charts };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { tables: tbls, charts: chs } = propsRef.current;
      const standaloneCharts = chs.filter((c) => c.source === "endpoint");
      const entries = await Promise.all([
        ["dash", apiGet("/api/reports/dashboard").catch((e) => {
          console.warn("Reports dashboard API failed:", e?.message);
          return null;
        })],
        ...tbls.map((t) => [t.key, apiGet(t.endpoint).catch((e) => {
          console.warn(`Table API failed (${t.key}):`, e?.message);
          return null;
        })]),
        ...standaloneCharts.map((c) => [c.key, apiGet(c.endpoint).catch((e) => {
          console.warn(`Chart API failed (${c.key}):`, e?.message);
          return null;
        })]),
      ]);
      setData(Object.fromEntries(entries));
    } catch (err) {
      setError(err.message || "Unable to load analytics data.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kpiList = useMemo(() => {
    if (kpiFn) {
      try {
        return kpiFn(data) || [];
      } catch {
        return [];
      }
    }
    return kpis
      .filter((k) => data.dash && data.dash[k.key] !== undefined)
      .map((k) => ({ ...k, value: data.dash[k.key] }));
  }, [data, kpis, kpiFn]);

  const chartData = useMemo(
    () =>
      charts.map((c) => ({
        ...c,
        points:
          c.source === "endpoint"
            ? (data[c.key]?.points || []).map((p) => ({ name: p.label, value: Number(p.value) || 0 }))
            : (data.dash?.[c.key] || []).map((p) => ({ name: p.label, value: Number(p.value) || 0 })),
      })),
    [data, charts]
  );

  const tableRows = (key) => {
    const source = data[key];
    if (!source) return [];
    if (Array.isArray(source)) return source;
    return source?.content || [];
  };

  const PIE_COLORS = ["#f8b400", "#2563eb", "#059669", "#7c3aed", "#dc2626", "#0891b2", "#d97706", "#ec4899"];

  const renderChart = (c) => {
    if (c.points.length === 0) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "36px 0", color: "#9aa8b8" }}>
          <AlertTriangle size={22} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: "13.5px", fontWeight: "600" }}>No data recorded yet.</span>
        </div>
      );
    }
    if (c.type === "pie") {
      return (
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie data={c.points} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={82} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {c.points.map((p, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [formatCount(v), c.label]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (c.type === "area") {
      return (
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={c.points}>
            <defs>
              <linearGradient id={`rrvGrad-${c.label.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={c.color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a8999" }} />
            <YAxis tick={{ fontSize: 11, fill: "#7a8999" }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
            <Tooltip formatter={(v) => [formatINR(v), c.label]} />
            <Area type="monotone" dataKey="value" stroke={c.color} strokeWidth={2.5} fill={`url(#rrvGrad-${c.label.replace(/\W/g, "")})`} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={c.points}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a8999" }} />
          <YAxis tick={{ fontSize: 11, fill: "#7a8999" }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" name="Count" fill={c.color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const handleExport = async (fmt) => {
    setExporting(fmt);
    try {
      const res = await apiGet(`/api/reports/export/${fmt}?reportType=${encodeURIComponent(exportReportType)}`);
      if (res?.dataBase64 && res?.fileName) {
        const a = document.createElement("a");
        a.href = `data:${res.contentType || "application/octet-stream"};base64,${res.dataBase64}`;
        a.download = res.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err.message || "Export failed.");
    } finally {
      setExporting("");
    }
  };

  return (
    <div className="rrv-root" style={{ padding: "20px", fontFamily: "Inter, sans-serif", background: "#f7f8fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {Icon && <Icon color={accent} size={26} />}
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111", margin: 0 }}>{title}</h1>
          </div>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>{subtitle}</p>
          {badge && (
            <span style={{ display: "inline-block", marginTop: "8px", fontSize: "12.5px", fontWeight: "700", color: "#b57a00", background: "#fff6de", border: "1px solid #f3d27a", padding: "5px 12px", borderRadius: "999px" }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => handleExport("pdf")} disabled={!!exporting} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 16px", border: "1px solid #d9dee6", borderRadius: "9px", background: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#444" }}>
            <Download size={14} /> {exporting === "pdf" ? "Exporting..." : "Export PDF"}
          </button>
          <button onClick={() => handleExport("excel")} disabled={!!exporting} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 16px", border: "1px solid #d9dee6", borderRadius: "9px", background: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#444" }}>
            <FileText size={14} /> {exporting === "excel" ? "Exporting..." : "Export Excel"}
          </button>
          <button onClick={loadData} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 16px", border: "1px solid #d9dee6", borderRadius: "9px", background: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#444" }}>
            <RefreshCw size={14} className={loading ? "lro-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px 20px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "12px", color: "#991b1b" }}>
          <WifiOff size={18} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: "14px" }}>Could not load data</strong>
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
          {kpiList.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
              {kpiList.map((k, idx) => {
                const KIcon = k.icon || Activity;
                const raw = k.value;
                const value = k.format === "inr" ? formatINR(raw) : typeof raw === "number" ? formatCount(raw) : raw ?? "—";
                return (
                  <div key={idx} style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px", transition: "transform .18s ease, box-shadow .18s ease" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${k.color || accent}14`, color: k.color || accent, flexShrink: 0 }}>
                      <KIcon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: "#111", lineHeight: 1.1 }}>{value}</div>
                      <div style={{ fontSize: "12.5px", color: "#777", fontWeight: "600" }}>{k.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Charts */}
          {charts.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
              {chartData.map((c) => (
                <div key={c.label} style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: "14px", padding: "20px" }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>{c.label}</h3>
                  {renderChart(c)}
                </div>
              ))}
            </div>
          )}

          {/* Tables */}
          {tables.map((t) => {
            const rows = tableRows(t.key).slice(0, t.maxRows || 10);
            return (
              <div key={t.title} style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: "14px", padding: "20px", marginBottom: "18px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>{t.title}</h3>
                {rows.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "36px 0", color: "#9aa8b8" }}>
                    <AlertTriangle size={22} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: "13.5px", fontWeight: "600" }}>{t.emptyText || "No records found."}</span>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                      <thead>
                        <tr>
                          {t.columns.map((col, idx) => (
                            <th key={idx} style={{ textAlign: col.align || "left", color: "#7a8999", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: ".4px", padding: "10px 12px", borderBottom: "1px solid #eceef1" }}>
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr key={row.id || idx}>
                            {t.columns.map((col, cidx) => (
                              <td key={cidx} style={{ textAlign: col.align || "left", padding: "11px 12px", borderBottom: "1px solid #f2f4f6", color: "#33414f" }}>
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

export default RealReportsView;
