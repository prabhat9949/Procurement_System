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
  UserCheck,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Eye,
  X,
  Package,
  Truck,
  ShieldCheck,
  User,
  Building,
  Clock,
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
    keyword: "Equipment",
  },
  software: {
    title: "IT Software & Digital Services Team",
    subtitle: "Software and license fulfilment — availability check, activation, assignment and expiry",
    icon: Laptop,
    focus: "Microsoft 365 · Dev tools · Cloud subscriptions · SaaS licences",
    portal: "Software & Digital Services Portal",
    keyword: "Software",
  },
  facilities: {
    title: "Facilities Team",
    subtitle: "Facilities procurement and service fulfilment — suppliers, delivery and completion",
    icon: Wrench,
    focus: "Furniture · Maintenance · Facility services · Office infrastructure",
    portal: "Facilities Portal",
    keyword: "Facilities",
  },
};

const FulfilmentDashboard = ({ team = "equipment" }) => {
  const meta = TEAM_META[team] || TEAM_META.equipment;
  const Icon = meta.icon;

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [approved, setApproved] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0 });
  const [prChart, setPrChart] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [linesByRequest, setLinesByRequest] = useState({});
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prs, prApproved, prTrend, products, myWork] = await Promise.all([
        apiGet("/api/purchase-requests?page=0&size=50&sort=createdAt&direction=desc").catch(() => null),
        apiGet("/api/purchase-requests?status=APPROVED&page=0&size=50").catch(() => null),
        apiGet("/api/dashboard/charts/pr").catch(() => null),
        apiGet("/api/products?page=0&size=500").catch(() => null),
        // User-scoped queue from the central workflow assignment engine.
        apiGet("/api/workflow/my-tasks?size=100").catch(() => null),
      ]);
      const myWorkList = (myWork?.content || []).filter(
        (t) => t.entityType === "PR" && (t.status === "ASSIGNED" || t.status === "IN_PROGRESS")
      );
      setMyTasks(myWorkList);

      const all = prs?.content || [];
      const approvedList = prApproved?.content || [];
      const prodMap = {};
      (products?.content || []).forEach((p) => { prodMap[p.id] = p.categoryName || "Uncategorised"; });

      // Attach category to each approved request from its first line item.
      const lineMap = {};
      await Promise.all(
        approvedList.map(async (r) => {
          const lines = await apiGet(`/api/purchase-request-lines?purchaseRequestId=${r.id}&size=5`).catch(() => null);
          lineMap[r.id] = lines?.content || [];
        })
      );
      const withCategory = approvedList.map((r) => {
        const first = (lineMap[r.id] || [])[0];
        return { ...r, category: first ? (prodMap[first.productId] || "Uncategorised") : "Uncategorised" };
      });

      setRequests(all);
      setApproved(withCategory);
      setLinesByRequest(lineMap);
      setProductMap(prodMap);
      setStats({ total: prs?.totalElements || 0, approved: prApproved?.totalElements || 0 });
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

  // Requests relevant to this team (category matches the team focus). Requests the
  // logged-in user is explicitly assigned come first; legacy approved records without
  // an assignment remain visible so no approved request is ever silently lost.
  const teamQueue = useMemo(() => {
    const relevant = approved.filter((r) => (r.category || "").toLowerCase().includes(meta.keyword.toLowerCase()));
    const assigned = relevant.filter((r) => myTasks.some((t) => Number(t.entityId) === Number(r.id)));
    const rest = relevant.filter((r) => !myTasks.some((t) => Number(t.entityId) === Number(r.id)));
    return [...assigned, ...rest];
  }, [approved, myTasks, meta.keyword]);
  const assignmentFor = (prId) => myTasks.find((t) => Number(t.entityId) === Number(prId)) || null;
  const inProgress = useMemo(
    () => requests.filter((r) => r.status !== "APPROVED" && r.status !== "DRAFT" && r.status !== "COMPLETED"),
    [requests]
  );
  const completed = useMemo(() => requests.filter((r) => r.status === "COMPLETED"), [requests]);

  const kpis = [
    { label: "Assigned to Me", value: myTasks.length, icon: UserCheck, color: "#059669" },
    { label: "Awaiting Fulfilment", value: teamQueue.length, icon: PackageCheck, color: "#0ea5e9" },
    { label: "In Progress", value: inProgress.length, icon: FileText, color: "#2563eb" },
    { label: "Completed", value: completed.length, icon: CheckCircle2, color: "#7c3aed" },
    { label: "Total Routed", value: stats.total, icon: ClipboardList, color: "#d97706" },
  ];

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "queue", label: "Fulfilment Queue", icon: ClipboardList },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const openDetail = async (r) => {
    setDetail({ pr: r, lines: linesByRequest[r.id] || [], history: [], po: null, grn: null, inventory: [] });
    setDetailLoading(true);
    try {
      const [tlRes, poRes, invRes] = await Promise.all([
        // Unified source-of-truth timeline: approvals + assignments + RFQ/PO/GRN + audit.
        apiGet(`/api/procurement/${r.id}/timeline`).catch(() => null),
        apiGet(`/api/purchase-orders/by-request/${r.id}?size=1`).catch(() => null),
        Promise.all(
          (linesByRequest[r.id] || []).slice(0, 3).map((l) =>
            apiGet(`/api/inventory?productId=${l.productId}&page=0&size=10`).catch(() => null)
          )
        ),
      ]);
      const po = poRes?.content?.[0] || null;
      const grnRes = po ? await apiGet(`/api/goods-receipts?purchaseOrderId=${po.id}&page=0&size=5`).catch(() => null) : null;
      const tl = tlRes?.events || [];
      setDetail({
        pr: r,
        lines: linesByRequest[r.id] || [],
        history: tl,
        po,
        grn: grnRes?.content?.[0] || null,
        inventory: invRes.map((res) => res?.content || []).flat(),
      });
    } catch (err) {
      setError(err.message || "Unable to load request details.");
    } finally {
      setDetailLoading(false);
    }
  };

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
        .ful-kpi { background:#fff; border:1px solid #e7ebf0; border-radius:14px; padding:14px 16px; display:flex; align-items:center; gap:12px; transition: transform .18s ease, box-shadow .18s ease; }
        .ful-kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(16,35,56,.08); }
        .ful-table { width:100%; border-collapse: collapse; font-size:13.5px; }
        .ful-table th { text-align:left; color:#7a8999; font-size:11.5px; text-transform:uppercase; letter-spacing:.4px; padding:10px 12px; border-bottom:1px solid #eceef1; }
        .ful-table td { padding:11px 12px; border-bottom:1px solid #f2f4f6; color:#33414f; }
        .ful-badge { font-size:11px; font-weight:800; padding:3px 10px; border-radius:999px; }
        .ful-tabs { display:flex; gap:8px; background:#fff; border:1px solid #e7ebf0; border-radius:12px; padding:5px; margin-bottom:20px; width:fit-content; flex-wrap:wrap; }
        .ful-tab { border:none; background:transparent; padding:9px 18px; border-radius:9px; font-size:13px; font-weight:700; color:#555; cursor:pointer; display:flex; align-items:center; gap:7px; }
        .ful-tab.active { background:#f8b400; color:#000; }        @keyframes fulSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .ful-spin { animation: fulSpin .9s linear infinite; }
        .ful-action-btn { border:none; display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:9px; font-size:12.5px; font-weight:800; cursor:pointer; }
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

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px 20px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "12px", color: "#991b1b" }}>
          <WifiOff size={18} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: "14px" }}>Unable to load fulfilment data. Please try again.</strong>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            {kpis.map((k) => {
              const KIcon = k.icon;
              return (
                <div className="ful-kpi" key={k.label}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${k.color}14`, color: k.color, flexShrink: 0 }}>
                    <KIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "19px", fontWeight: "800", color: "#111", lineHeight: 1.1 }}>{k.value}</div>
                    <div style={{ fontSize: "11.5px", color: "#777", fontWeight: "600" }}>{k.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ful-tabs">
            {navItems.map((n) => {
              const NIcon = n.icon;
              return (
                <button key={n.id} className={`ful-tab ${activeTab === n.id ? "active" : ""}`} onClick={() => setActiveTab(n.id)}>
                  <NIcon size={15} /> {n.label}
                </button>
              );
            })}
          </div>

          {/* Fulfilment queue */}
          {activeTab !== "analytics" && (
            <div className="ful-card" style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                <PackageCheck size={15} style={{ verticalAlign: "-2px", marginRight: "6px", color: "#059669" }} />
                Approved Requests Awaiting {meta.title.replace(" Team", "")} Fulfilment
              </h3>
              {teamQueue.length === 0 ? (
                <EmptyState text="No approved requisitions are currently awaiting your team — all clear." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "420px", overflowY: "auto" }}>
                  {teamQueue.map((r) => (
                    <div
                      key={r.id}
                      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", border: "1px solid #eef1f5", borderRadius: "10px", background: "#fbfcfe", cursor: "pointer" }}
                      onClick={() => openDetail(r)}
                    >
                      <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "rgba(5,150,105,.1)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileText size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: "block", fontSize: "13px", color: "#111" }}>{r.requestNumber}</strong>
                        <span style={{ fontSize: "12.5px", color: "#7a8999", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.purpose} · {r.requesterName} · {r.departmentName}
                        </span>
                      </div>
                      <span className="ful-badge" style={{ background: "rgba(5,150,105,.12)", color: "#059669" }}>{r.category}</span>
                      {assignmentFor(r.id) && (
                        <span className="ful-badge" style={{ background: "rgba(37,99,235,.12)", color: "#2563eb" }}>
                          Assigned to you · {assignmentFor(r.id).stage}
                        </span>
                      )}
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

          {/* Requests table (overview) */}
          {activeTab === "overview" && (
            <div className="ful-card">
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                <FileText size={15} style={{ verticalAlign: "-2px", marginRight: "6px", color: "#d97706" }} />
                Routed Purchase Requests
              </h3>
              {requests.length === 0 ? (
                <EmptyState text="No purchase requests have been routed yet." />
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
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, 12).map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: "700" }}>{r.requestNumber}</td>
                          <td style={{ maxWidth: "220px" }}>{r.purpose}</td>
                          <td>{r.requesterName}</td>
                          <td>{r.departmentName}</td>
                          <td style={{ fontWeight: "700" }}>{formatINR(r.estimatedAmount)}</td>
                          <td>{r.priority}</td>
                          <td>
                            <span className="ful-badge" style={{ background: r.status === "APPROVED" ? "rgba(5,150,105,.12)" : r.status === "DRAFT" ? "rgba(100,116,139,.12)" : r.status === "COMPLETED" ? "rgba(124,58,237,.12)" : "rgba(217,119,6,.12)", color: r.status === "APPROVED" ? "#059669" : r.status === "DRAFT" ? "#64748b" : r.status === "COMPLETED" ? "#7c3aed" : "#d97706" }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button className="ful-action-btn" style={{ background: "#eff6ff", color: "#2563eb" }} onClick={() => openDetail(r)}>
                              <Eye size={13} /> Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <div className="ful-card">
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
        </>
      )}

      {/* Detail drawer */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, overflow: "auto", padding: "24px 12px" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "26px 28px", width: "100%", maxWidth: 860, maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 60px rgba(15,23,42,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: "#059669" }}>FULFILMENT REQUEST DETAILS</span>
                <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "#111" }}>{detail.pr.requestNumber}</h3>
                <div style={{ fontSize: 12.5, color: "#666", marginTop: 4 }}>
                  {detail.pr.requesterName} · {detail.pr.departmentName} · <strong>{formatINR(detail.pr.estimatedAmount)}</strong> · {detail.pr.priority} priority
                </div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: "#f8f9fb", border: "1px solid #d9dee6", borderRadius: 9, width: 34, height: 34, cursor: "pointer", fontWeight: 800, color: "#555" }}>✕</button>
            </div>

            {detailLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "70px 0", color: "#888", fontWeight: 600 }}>
                <Loader2 size={20} className="ful-spin" /> Loading details…
              </div>
            ) : (
              <>
                {/* Items */}
                {detail.lines.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 7 }}>
                      <Package size={15} color="#2563eb" /> Requested Items
                    </h4>
                    <table className="ful-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Category</th>
                          <th style={{ textAlign: "right" }}>Qty</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.lines.map((l) => (
                          <tr key={l.id}>
                            <td style={{ fontWeight: 700, color: "#111" }}>{l.productName}</td>
                            <td><span className="ful-badge" style={{ background: "rgba(217,119,6,.12)", color: "#d97706" }}>{productMap[l.productId] || "Uncategorised"}</span></td>
                            <td style={{ textAlign: "right" }}>{l.quantity}</td>
                            <td style={{ textAlign: "right", fontWeight: 700 }}>{formatINR(l.estimatedAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Inventory availability */}
                {detail.inventory.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 7 }}>
                      <ShieldCheck size={15} color="#059669" /> Inventory Availability
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                      {detail.inventory.map((inv) => {
                        const line = detail.lines.find((l) => String(l.productId) === String(inv.productId));
                        const required = line ? Number(line.quantity) : 0;
                        const available = Number(inv.availableQuantity) || 0;
                        const usable = Math.max(available - (Number(inv.reservedQuantity) || 0), 0);
                        const state = usable >= required ? "AVAILABLE" : usable > 0 ? "PARTIALLY_AVAILABLE" : "OUT_OF_STOCK";
                        const color = state === "AVAILABLE" ? "#059669" : state === "PARTIALLY_AVAILABLE" ? "#d97706" : "#dc2626";
                        return (
                          <div key={inv.id} style={{ background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#111" }}>{inv.productName}</div>
                            <div style={{ fontSize: 11.5, color: "#7a8999" }}>{inv.warehouseName}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8 }}>
                              <span style={{ color: "#475569" }}>Required: <strong>{required}</strong></span>
                              <span style={{ color: "#475569" }}>Available: <strong>{available}</strong></span>
                            </div>
                            <span className="ful-badge" style={{ background: `${color}14`, color, marginTop: 8 }}>
                              {state === "AVAILABLE" ? "✓ AVAILABLE" : state === "PARTIALLY_AVAILABLE" ? "PARTIALLY AVAILABLE" : "OUT OF STOCK"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {detail.inventory.some((inv) => {
                      const line = detail.lines.find((l) => String(l.productId) === String(inv.productId));
                      return line && (Number(inv.availableQuantity) || 0) < Number(line.quantity);
                    }) && (
                      <div style={{ marginTop: 8, fontSize: 12.5, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "9px 12px" }}>
                        Insufficient stock — this requirement needs external sourcing. Procurement initiates the RFQ.
                      </div>
                    )}
                  </div>
                )}

                {/* PO + GRN */}
                {detail.po && (
                  <div style={{ marginBottom: 16, border: "1px solid #a7f3d0", background: "#ecfdf5", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#065f46", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <Truck size={14} /> Purchase Order Issued
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, fontSize: 12.5 }}>
                      <div><span style={{ color: "#6b7280", fontSize: 11 }}>PO Number</span><div style={{ fontWeight: 700, color: "#065f46" }}>{detail.po.poNumber}</div></div>
                      <div><span style={{ color: "#6b7280", fontSize: 11 }}>Vendor</span><div style={{ fontWeight: 700, color: "#065f46" }}>{detail.po.vendorName}</div></div>
                      <div><span style={{ color: "#6b7280", fontSize: 11 }}>Amount</span><div style={{ fontWeight: 700, color: "#065f46" }}>{formatINR(detail.po.grandTotal)}</div></div>
                      <div><span style={{ color: "#6b7280", fontSize: 11 }}>Expected Delivery</span><div style={{ fontWeight: 700, color: "#065f46" }}>{formatDateIN(detail.po.expectedDeliveryDate, { withTime: false })}</div></div>
                      <div><span style={{ color: "#6b7280", fontSize: 11 }}>Status</span><div style={{ fontWeight: 700, color: "#065f46" }}>{detail.po.status}</div></div>
                    </div>
                    {detail.grn && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #a7f3d0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, fontSize: 12.5 }}>
                        <div><span style={{ color: "#6b7280", fontSize: 11 }}>GRN Number</span><div style={{ fontWeight: 700, color: "#065f46" }}>{detail.grn.grnNumber || "—"}</div></div>
                        <div><span style={{ color: "#6b7280", fontSize: 11 }}>GRN Status</span><div style={{ fontWeight: 700, color: "#065f46" }}>{detail.grn.status || "—"}</div></div>
                        <div><span style={{ color: "#6b7280", fontSize: 11 }}>Warehouse</span><div style={{ fontWeight: 700, color: "#065f46" }}>{detail.grn.warehouseName || "—"}</div></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <h4 style={{ margin: "0 0 12px", fontSize: 13.5, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 7 }}>
                  <Clock size={15} color="#d97706" /> Workflow Timeline
                </h4>
                {detail.history.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#7a8999", background: "#f8fafc", borderRadius: 10, padding: "14px" }}>No workflow events recorded yet for this request.</div>
                ) : (
                  <div style={{ position: "relative", paddingLeft: 28 }}>
                    {detail.history.map((h, idx) => {
                      const rejected = h.type === "APPROVAL_REJECTED";
                      const returned = h.type === "APPROVAL_RETURNED";
                      const done = h.type.includes("APPROVED") || h.type === "COMPLETED" || h.type === "GRN_CREATED";
                      const color = rejected ? "#dc2626" : returned ? "#2563eb" : done ? "#059669" : "#d97706";
                      return (
                        <div key={idx} style={{ position: "relative", paddingBottom: 14 }}>
                          <div style={{ position: "absolute", left: -28, top: 2, width: 28, height: 28, borderRadius: "50%", background: `${color}14`, color, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${color}` }}>
                            {rejected ? <AlertTriangle size={12} /> : returned ? <X size={12} /> : done ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{h.title}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {formatDateIN(h.occurredAt)} {h.performedByName ? `· ${h.performedByName}` : ""} {h.stage ? `· ${h.stage}` : ""}
                          </div>
                          {h.description && <div style={{ fontSize: 12.5, color: "#475569", marginTop: 4 }}>“{h.description}”</div>}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button className="ful-action-btn" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9dee6" }} onClick={() => setDetail(null)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </RoleShell>
  );
};

const EmptyState = ({ text }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "36px 0", color: "#9aa8b8" }}>
    <CheckCircle2 size={22} style={{ opacity: 0.5 }} />
    <span style={{ fontSize: "13.5px", fontWeight: "600" }}>{text}</span>
  </div>
);

export default FulfilmentDashboard;
