import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Download,
  ShoppingBag,
  Send,
  FileCheck2,
  Loader2,
  WifiOff,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR } from "../../../../../utils/format";

const PO_STATUS_COLORS = {
  DRAFT: "#64748b",
  GENERATED: "#d97706",
  SENT: "#2563eb",
  ACKNOWLEDGED: "#7c3aed",
  PARTIALLY_RECEIVED: "#0891b2",
  FULLY_RECEIVED: "#059669",
  CANCELLED: "#dc2626",
  CLOSED: "#059669",
};

const ProcurementAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kpis, setKpis] = useState({});
  const [spendChart, setSpendChart] = useState([]);
  const [prChart, setPrChart] = useState([]);
  const [rfqChart, setRfqChart] = useState([]);
  const [poChart, setPoChart] = useState([]);
  const [poValue, setPoValue] = useState(0);
  const [poStatusDist, setPoStatusDist] = useState([]);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [dash, spend, pr, rfq, po, pos] = await Promise.all([
          apiGet("/api/dashboard/procurement").catch(() => null),
          apiGet("/api/dashboard/charts/spend").catch(() => null),
          apiGet("/api/dashboard/charts/pr").catch(() => null),
          apiGet("/api/dashboard/charts/rfq").catch(() => null),
          apiGet("/api/dashboard/charts/po").catch(() => null),
          apiGet("/api/purchase-orders?page=0&size=500&sort=orderDate&direction=desc").catch(() => null),
        ]);
        const kpiMap = {};
        (dash?.kpis || []).forEach((k) => { kpiMap[k.code] = k.count ?? k.value ?? 0; });
        setKpis(kpiMap);
        setSpendChart(spend?.points || []);
        setPrChart(pr?.points || []);
        setRfqChart(rfq?.points || []);
        setPoChart(po?.points || []);
        const poRows = pos?.content || [];
        setPoValue(poRows.reduce((s, p) => s + Number(p.grandTotal || 0), 0));
        const dist = {};
        poRows.forEach((p) => { dist[p.status] = (dist[p.status] || 0) + 1; });
        setPoStatusDist(Object.entries(dist).map(([name, value]) => ({ name, value })));
      } catch (err) {
        setError(err.message || "Unable to load procurement analytics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const exportCsv = () => {
    const rows = spendChart.map((p) => [p.label, p.value]);
    const csv = [["Month", "Spend (INR)"], ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `procurement-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMsg("Analytics CSV exported.");
    setTimeout(() => setToastMsg(""), 4000);
  };

  const chartData = (points) => points.map((p) => ({ label: p.label, value: Number(p.value || 0) }));

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "12px", color: "#666" }}>
        <Loader2 size={22} className="login-spin" /> Loading procurement analytics…
      </div>
    );
  }

  const card = { background: "#fff", borderRadius: "12px", border: "1px solid #ececec", padding: "20px" };

  return (
    <div className="pe-analytics-container" style={{ padding: "20px" }}>
      {toastMsg && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", fontWeight: 600, border: "1px solid #a7f3d0" }}>
          {toastMsg}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      <div className="pe-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="pe-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "800", color: "#111111" }}>
            <BarChart3 color="#f8b400" size={28} /> Procurement Analytics
          </h1>
          <p className="pe-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Live spend, request, RFQ and PO trends computed from the database.
          </p>
        </div>
        <button className="pe-btn-primary-sm" onClick={exportCsv}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="pe-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Open RFQs", value: kpis.OPEN_RFQS || 0, icon: <Send size={22} />, color: "#7c3aed" },
          { label: "Purchase Requests", value: kpis.PURCHASE_REQUESTS || 0, icon: <FileCheck2 size={22} />, color: "#2563eb" },
          { label: "Quotations for Comparison", value: kpis.QUOTATIONS_AWAITING_COMPARISON || 0, icon: <BarChart3 size={22} />, color: "#0891b2" },
          { label: "PO Value", value: formatINR(poValue), icon: <IndianRupee size={22} />, color: "#059669" },
          { label: "POs Awaiting Delivery", value: kpis.POS_AWAITING_DELIVERY || 0, icon: <ShoppingBag size={22} />, color: "#d97706" },
        ].map((k) => (
          <div key={k.label} className="pe-kpi-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="pe-kpi-info">
              <span className="pe-kpi-label" style={{ display: "block", fontSize: "12px", color: "#666", fontWeight: 700 }}>{k.label}</span>
              <span className="pe-kpi-value" style={{ display: "block", fontSize: "22px", fontWeight: "800", color: "#111", marginTop: "4px" }}>{k.value}</span>
            </div>
            <div className="pe-kpi-icon-wrapper" style={{ width: "42px", height: "42px", borderRadius: "10px", background: `${k.color}14`, color: k.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {k.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div style={card}>
          <h3 style={{ color: "#111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>Monthly Procurement Spend (₹)</h3>
          <div style={{ width: "100%", height: 260 }}>
            {spendChart.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center", paddingTop: 80 }}>No spend data available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData(spendChart)}>
                  <defs>
                    <linearGradient id="peSpendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                  <XAxis dataKey="label" stroke="#666666" fontSize={11} />
                  <YAxis stroke="#666666" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #f8b400", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="value" stroke="#059669" fill="url(#peSpendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={card}>
          <h3 style={{ color: "#111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>Purchase Request Trend</h3>
          <div style={{ width: "100%", height: 260 }}>
            {prChart.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center", paddingTop: 80 }}>No purchase request data available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData(prChart)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                  <XAxis dataKey="label" stroke="#666666" fontSize={11} />
                  <YAxis stroke="#666666" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #f8b400", borderRadius: "8px" }} />
                  <Bar dataKey="value" fill="#f8b400" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={card}>
          <h3 style={{ color: "#111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>RFQ Trend</h3>
          <div style={{ width: "100%", height: 260 }}>
            {rfqChart.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center", paddingTop: 80 }}>No RFQ data available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData(rfqChart)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                  <XAxis dataKey="label" stroke="#666666" fontSize={11} />
                  <YAxis stroke="#666666" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #f8b400", borderRadius: "8px" }} />
                  <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={card}>
          <h3 style={{ color: "#111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>Purchase Order Status Distribution</h3>
          <div style={{ width: "100%", height: 260 }}>
            {poStatusDist.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center", paddingTop: 80 }}>No purchase orders available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={poStatusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} label>
                    {poStatusDist.map((entry, i) => (
                      <Cell key={i} fill={PO_STATUS_COLORS[entry.name] || "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #f8b400", borderRadius: "8px" }} />
                  <Legend formatter={(value) => <span style={{ color: "#111", fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementAnalytics;
