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
  Search,
  Eye,
  MessageSquare,
  XCircle,
  RotateCcw,
  Package,
  User,
  Building,
  Clock,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Hourglass,
  AlertOctagon,
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
import { apiGet, apiPost } from "../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../utils/format";
import { hasPermission } from "../../../../utils/permissions";
import RoleShell from "../shared_ui/RoleShell";

const ROLE_META = {
  senior_manager: {
    title: "Senior Manager",
    subtitle: "Second-level approvals, escalated requests and department oversight",
    icon: Users,
    portal: "Senior Manager Portal",
  },
  head: {
    title: "Head / Executive",
    subtitle: "Higher-level approvals, executive spend visibility and governance",
    icon: Crown,
    portal: "Head Executive Portal",
  },
};

const STATUS_STYLE = {
  PENDING: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  APPROVED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  REJECTED: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
  RETURNED: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
};

const PRIORITY_COLOR = {
  LOW: "#64748b",
  MEDIUM: "#d97706",
  HIGH: "#ea580c",
  URGENT: "#dc2626",
};

const statusBadge = (status) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.PENDING;
  return (
    <span className="mgmt-badge" style={{ background: s.bg, color: s.color }}>
      {status === "RETURNED" ? "RETURNED" : status}
    </span>
  );
};

const ManagementDashboard = ({ role = "senior_manager" }) => {
  // Resolve permissions during render so newly assigned senior-manager/head
  // permissions are reflected without a stale module-level snapshot.
  const canApprove = hasPermission("CAN_APPROVE_PR");
  const canReject = hasPermission("CAN_REJECT_PR");
  const canReturn = hasPermission("CAN_RETURN_PR");
  const meta = ROLE_META[role] || ROLE_META.senior_manager;
  const Icon = meta.icon;

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState(null);
  const [authority, setAuthority] = useState(null);
  const [queue, setQueue] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [spendChart, setSpendChart] = useState([]);
  const [prChart, setPrChart] = useState([]);

  // Queue filters & sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [sortBy, setSortBy] = useState("dueSoon");

  const [detailTask, setDetailTask] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [decisionTask, setDecisionTask] = useState(null);
  const [decision, setDecision] = useState("APPROVED");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Resolve the authenticated employee id first — it scopes the history query.
      const meRes = await apiGet("/api/auth/me").catch(() => null);
      const empId = meRes?.employeeId;
      const [queueRes, authRes, histRes, spend, prTrend] = await Promise.all([
        apiGet("/api/approval-tasks/my-queue?size=100").catch(() => null),
        apiGet("/api/approval-tasks/my-authority").catch(() => null),
        empId ? apiGet(`/api/approval-histories?performedById=${empId}&size=50`).catch(() => null) : Promise.resolve(null),
        apiGet("/api/dashboard/charts/spend").catch(() => null),
        apiGet("/api/dashboard/charts/pr").catch(() => null),
      ]);
      setMe(meRes);
      setQueue(queueRes?.content || []);
      setAuthority(authRes);
      setMyHistory(histRes?.content || []);
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

  const pending = useMemo(() => queue.filter((t) => t.status === "PENDING"), [queue]);
  const pendingValue = useMemo(
    () => pending.reduce((sum, t) => sum + (Number(t.approvedAmount) || 0), 0),
    [pending]
  );
  const overdue = useMemo(() => pending.filter((t) => t.overdue), [pending]);
  const dueToday = useMemo(() => {
    const today = new Date().toDateString();
    return pending.filter((t) => t.assignedDate && new Date(t.assignedDate).toDateString() === today);
  }, [pending]);
  const urgent = useMemo(
    () => pending.filter((t) => t.priority === "URGENT" || t.priority === "HIGH"),
    [pending]
  );
  const approvedThisMonth = useMemo(() => {
    const now = new Date();
    return myHistory.filter(
      (h) => h.action === "APPROVED" && h.performedAt && new Date(h.performedAt).getMonth() === now.getMonth() && new Date(h.performedAt).getFullYear() === now.getFullYear()
    ).length;
  }, [myHistory]);
  const returnedCount = useMemo(() => queue.filter((t) => t.status === "RETURNED").length, [queue]);
  const rejectedCount = useMemo(() => queue.filter((t) => t.status === "REJECTED").length, [queue]);

  const departments = useMemo(() => [...new Set(queue.map((t) => t.departmentName).filter(Boolean))].sort(), [queue]);
  const categories = useMemo(() => [...new Set(queue.map((t) => t.category).filter(Boolean))].sort(), [queue]);
  const employees = useMemo(
    () =>
      Array.from(
        new Map(
          queue
            .filter((t) => t.requesterId && t.requesterName)
            .map((t) => [t.requesterId, `${t.requesterName}${t.employeeCode ? ` (${t.employeeCode})` : ""}`])
        ).entries()
      ).sort((a, b) => a[1].localeCompare(b[1])),
    [queue]
  );

  const filteredQueue = useMemo(() => {
    const q = searchTerm.toLowerCase();
    let rows = queue.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (departmentFilter && t.departmentName !== departmentFilter) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (employeeFilter && String(t.requesterId) !== employeeFilter) return false;
      if (!q) return true;
      return (
        (t.requestNumber || "").toLowerCase().includes(q) ||
        (t.taskNumber || "").toLowerCase().includes(q) ||
        (t.requesterName || "").toLowerCase().includes(q) ||
        (t.employeeCode || "").toLowerCase().includes(q) ||
        (t.departmentName || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q) ||
        (t.purpose || "").toLowerCase().includes(q)
      );
    });
    const prio = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    switch (sortBy) {
      case "newest":
        rows = rows.sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate));
        break;
      case "oldest":
        rows = rows.sort((a, b) => new Date(a.assignedDate) - new Date(b.assignedDate));
        break;
      case "amountHigh":
        rows = rows.sort((a, b) => (Number(b.approvedAmount) || 0) - (Number(a.approvedAmount) || 0));
        break;
      case "amountLow":
        rows = rows.sort((a, b) => (Number(a.approvedAmount) || 0) - (Number(b.approvedAmount) || 0));
        break;
      case "priority":
        rows = rows.sort((a, b) => (prio[a.priority] ?? 9) - (prio[b.priority] ?? 9));
        break;
      default: // dueSoon
        rows = rows.sort((a, b) => {
          const aOver = a.overdue ? 0 : 1;
          const bOver = b.overdue ? 0 : 1;
          if (aOver !== bOver) return aOver - bOver;
          return new Date(a.requiredDate || a.assignedDate) - new Date(b.requiredDate || b.assignedDate);
        });
    }
    return rows;
  }, [queue, statusFilter, priorityFilter, departmentFilter, categoryFilter, employeeFilter, searchTerm, sortBy]);

  const kpis = [
    { label: "Pending Approvals", value: pending.length, icon: ClipboardCheck, color: "#d97706" },
    { label: "Pending Value", value: formatINR(pendingValue), icon: IndianRupee, color: "#7c3aed" },
    { label: "Overdue", value: overdue.length, icon: AlertOctagon, color: "#dc2626" },
    { label: "Due Today", value: dueToday.length, icon: Hourglass, color: "#2563eb" },
    { label: "Approved This Month", value: approvedThisMonth, icon: CheckCircle2, color: "#059669" },
    { label: "Returned", value: returnedCount, icon: RotateCcw, color: "#b45309" },
    { label: "Rejected", value: rejectedCount, icon: XCircle, color: "#64748b" },
  ];

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "approvals", label: "Approval Queue", icon: ClipboardCheck },
    { id: "history", label: "My History", icon: Scale },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  const openDetail = async (task) => {
    setDetailTask(task);
    setDetail(null);
    setDetailLoading(true);
    try {
      const [pr, lineRes, histRes, poRes] = await Promise.all([
        apiGet(`/api/purchase-requests/${task.purchaseRequestId}`).catch(() => null),
        apiGet(`/api/purchase-request-lines?purchaseRequestId=${task.purchaseRequestId}&size=20`).catch(() => null),
        apiGet(`/api/approval-histories?purchaseRequestId=${task.purchaseRequestId}&size=50&sort=performedAt&direction=asc`).catch(() => null),
        apiGet(`/api/purchase-orders/by-request/${task.purchaseRequestId}?size=1`).catch(() => null),
      ]);
      setDetail({ pr, lines: lineRes?.content || [], history: histRes?.content || [], po: poRes?.content?.[0] || null });
    } catch (err) {
      setError(err.message || "Unable to load request details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const submitDecision = async (e) => {
    e.preventDefault();
    if (!decisionTask) return;
    if ((decision === "REJECTED" || decision === "RETURNED") && !comments.trim()) {
      setError("A reason is required when rejecting or returning a request.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body = { comments: comments.trim() || null };
      if (decision === "APPROVED") await apiPost(`/api/approval-tasks/${decisionTask.id}/approve`, body);
      else if (decision === "REJECTED") await apiPost(`/api/approval-tasks/${decisionTask.id}/reject`, body);
      else await apiPost(`/api/approval-tasks/${decisionTask.id}/return`, body);
      setToast({
        type: decision === "APPROVED" ? "success" : decision === "REJECTED" ? "danger" : "info",
        text: `${decisionTask.taskNumber} ${decision === "APPROVED" ? "approved" : decision === "REJECTED" ? "rejected" : "returned for correction"}.`,
      });
      setDecisionTask(null);
      setComments("");
      loadData();
    } catch (err) {
      setError(err.message || "Unable to submit the decision.");
    } finally {
      setSubmitting(false);
    }
  };

  const aboveAuthority = (amount) =>
    authority?.maximumAmount != null && (Number(amount) || 0) > Number(authority.maximumAmount);

  const renderQueueCard = (t) => {
    const above = aboveAuthority(t.approvedAmount);
    return (
      <div key={t.id} className="mgmt-card" style={{ padding: "18px 20px", marginBottom: 14, borderLeft: t.overdue ? "4px solid #dc2626" : t.priority === "URGENT" ? "4px solid #dc2626" : t.priority === "HIGH" ? "4px solid #ea580c" : "4px solid #f8b400" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 15, color: "#111" }}>{t.requestNumber}</strong>
                {statusBadge(t.status)}
                {t.overdue && <span className="mgmt-badge" style={{ background: "rgba(220,38,38,.12)", color: "#dc2626" }}>OVERDUE BY {Math.max(t.pendingDays - 3, 1)} DAY(S)</span>}
                {t.priority === "URGENT" && <span className="mgmt-badge" style={{ background: "rgba(220,38,38,.12)", color: "#dc2626" }}>URGENT</span>}
                {t.priority === "HIGH" && <span className="mgmt-badge" style={{ background: "rgba(234,88,12,.12)", color: "#ea580c" }}>HIGH</span>}
              </div>
              <div style={{ fontSize: 12.5, color: "#475569", marginTop: 5 }}>
                <User size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                <strong>{t.requesterName}</strong> {t.employeeCode ? `(${t.employeeCode})` : ""} · {t.departmentName || "—"} · {t.category || "Uncategorised"}
              </div>
              {t.purpose && (
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 5, maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.purpose}
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{formatINR(t.approvedAmount)}</div>
            <div style={{ fontSize: 11.5, color: "#7a8999" }}>Created {formatDateIN(t.createdAt, { withTime: false })}</div>
            <div style={{ fontSize: 11.5, color: "#7a8999" }}>Pending since {formatDateIN(t.assignedDate)}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, margin: "14px 0", padding: "12px 14px", background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, fontSize: 12 }}>
          <div>
            <div style={{ color: "#7a8999", textTransform: "uppercase", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3 }}>Current Stage</div>
            <div style={{ fontWeight: 700, color: "#111", marginTop: 2 }}>{t.stageName}</div>
          </div>
          <div>
            <div style={{ color: "#7a8999", textTransform: "uppercase", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3 }}>Previous Approval</div>
            <div style={{ fontWeight: 700, color: "#111", marginTop: 2 }}>
              {t.previousApprover ? `${t.previousApprover} — ${t.previousApproval || "decided"}` : "—"}
            </div>
          </div>
          <div>
            <div style={{ color: "#7a8999", textTransform: "uppercase", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3 }}>Approval Reason</div>
            <div style={{ fontWeight: 600, color: "#475569", marginTop: 2 }}>{t.approvalReason}</div>
          </div>
          <div>
            <div style={{ color: "#7a8999", textTransform: "uppercase", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3 }}>Next Stage</div>
            <div style={{ fontWeight: 700, color: "#2563eb", marginTop: 2 }}>{t.nextStageName ? `${t.nextStageName} (${t.nextApproverRole})` : "Procurement"}</div>
          </div>
        </div>

        {above && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 8, padding: "9px 12px", fontSize: 12.5, marginBottom: 12 }}>
            <AlertTriangle size={14} />
            <span><strong>Approval limit exceeded.</strong> This request requires higher-level authorization{authority?.higherRoleName ? ` — next approver: ${authority.higherRoleName}` : ""}.</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid #eceef1", paddingTop: 12, flexWrap: "wrap" }}>
          <button className="mgmt-action-btn" style={{ background: "#eff6ff", color: "#2563eb" }} onClick={() => openDetail(t)}>
            <Eye size={14} /> View Details
          </button>
          {t.status === "PENDING" && !above && (canApprove || canReject || canReturn) && (
            <button
              className="mgmt-action-btn"
              style={{ background: "#f8b400", color: "#000" }}
              onClick={() => { setDecisionTask(t); setDecision(canApprove ? "APPROVED" : canReject ? "REJECTED" : "RETURNED"); setComments(""); }}
            >
              <ClipboardCheck size={14} /> Review &amp; Decide
            </button>
          )}
          {t.status === "PENDING" && above && (
            <button className="mgmt-action-btn" style={{ background: "#f8f9fb", color: "#991b1b", border: "1px solid #fecaca", cursor: "not-allowed" }}>
              <AlertTriangle size={14} /> Above Authority
            </button>
          )}
        </div>
      </div>
    );
  };

  const approvalTrend = useMemo(() => {
    const days = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toDateString()] = 0;
    }
    myHistory.forEach((h) => {
      if (h.performedAt) {
        const key = new Date(h.performedAt).toDateString();
        if (key in days) days[key] += 1;
      }
    });
    return Object.entries(days)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, value]) => ({ name: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), value }));
  }, [myHistory]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    pending.forEach((t) => {
      const key = t.category || "Uncategorised";
      map[key] = (map[key] || 0) + (Number(t.approvedAmount) || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [pending]);

  const departmentBreakdown = useMemo(() => {
    const map = {};
    pending.forEach((t) => {
      const key = t.departmentName || "—";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [pending]);

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
        .mgmt-kpi { background:#fff; border:1px solid #e7ebf0; border-radius:14px; padding:14px 16px; display:flex; align-items:center; gap:12px; transition: transform .18s ease, box-shadow .18s ease; }
        .mgmt-kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(16,35,56,.08); }
        .mgmt-table { width:100%; border-collapse: collapse; font-size:13.5px; }
        .mgmt-table th { text-align:left; color:#7a8999; font-size:11.5px; text-transform:uppercase; letter-spacing:.4px; padding:10px 12px; border-bottom:1px solid #eceef1; }
        .mgmt-table td { padding:11px 12px; border-bottom:1px solid #f2f4f6; color:#33414f; }
        .mgmt-badge { font-size:11px; font-weight:800; padding:3px 10px; border-radius:999px; }
        .mgmt-tabs { display:flex; gap:8px; background:#fff; border:1px solid #e7ebf0; border-radius:12px; padding:5px; margin-bottom:20px; width:fit-content; flex-wrap:wrap; }
        .mgmt-tab { border:none; background:transparent; padding:9px 18px; border-radius:9px; font-size:13px; font-weight:700; color:#555; cursor:pointer; display:flex; align-items:center; gap:7px; }
        .mgmt-tab.active { background:#f8b400; color:#000; }        @keyframes mgmtSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .mgmt-spin { animation: mgmtSpin .9s linear infinite; }
        .mgmt-action-btn { border:none; display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:9px; font-size:12.5px; font-weight:800; cursor:pointer; }
        .mgmt-filter { padding:8px 12px; border:1px solid #d9dee6; border-radius:9px; font-size:12.5px; background:#fff; outline:none; }
      `}</style>

      {/* Toast */}
      {toast.text && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderRadius: 10, marginBottom: 18, fontSize: 13.5, fontWeight: 700, background: toast.type === "danger" ? "rgba(220,38,38,.12)" : toast.type === "info" ? "rgba(37,99,235,.12)" : "rgba(5,150,105,.12)", border: `1px solid ${toast.type === "danger" ? "#fca5a5" : toast.type === "info" ? "#93c5fd" : "#6ee7b7"}`, color: toast.type === "danger" ? "#dc2626" : toast.type === "info" ? "#2563eb" : "#059669" }}>
          <CheckCircle2 size={17} /> {toast.text}
          <button onClick={() => setToast({ type: "", text: "" })} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", marginLeft: "auto" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
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

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px 20px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "12px", color: "#991b1b" }}>
          <WifiOff size={18} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: "14px" }}>Unable to load approval data. Please try again.</strong>
            <span style={{ fontSize: "13px" }}>{error}</span>
          </div>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "80px 0", color: "#888", fontWeight: "600" }}>
          <Loader2 size={22} className="mgmt-spin" /> Loading live approval data...
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            {kpis.map((k) => {
              const KIcon = k.icon;
              return (
                <div className="mgmt-kpi" key={k.label}>
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

          {/* Approval authority card */}
          {authority && (
            <div className="mgmt-card" style={{ marginBottom: 18, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: "linear-gradient(135deg,#fff 0%,#fffbeb 100%)", border: "1px solid #fde68a" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(248,180,0,.15)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck size={22} />
              </div>
              <div style={{ flex: "1 1 240px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: "#b45309", textTransform: "uppercase" }}>My Approval Authority</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#111", marginTop: 2 }}>
                  {authority.roleName || authority.roleCode} —{" "}
                  {authority.minimumAmount != null ? formatINR(authority.minimumAmount) : "₹0"} to{" "}
                  {authority.maximumAmount != null ? formatINR(authority.maximumAmount) : "No upper limit"}
                </div>
                <div style={{ fontSize: 12, color: "#78350f", marginTop: 2 }}>
                  SLA {authority.slaDays || 3} working days per approval · {pending.length} in queue · {overdue.length} overdue
                </div>
              </div>
              {authority.higherRoleName && (
                <div style={{ fontSize: 12.5, color: "#78350f", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, padding: "8px 12px" }}>
                  Above this authority → <strong>{authority.higherRoleName}</strong>
                </div>
              )}
            </div>
          )}

          {/* Nav tabs */}
          <div className="mgmt-tabs">
            {navItems.map((n) => {
              const NIcon = n.icon;
              return (
                <button key={n.id} className={`mgmt-tab ${activeTab === n.id ? "active" : ""}`} onClick={() => setActiveTab(n.id)}>
                  <NIcon size={15} /> {n.label}
                </button>
              );
            })}
          </div>

          {/* ============ OVERVIEW ============ */}
          {activeTab === "overview" && (
            <>
              {urgent.length > 0 && (
                <div className="mgmt-card" style={{ marginBottom: 18 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                    <AlertOctagon size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#dc2626" }} />
                    Urgent &amp; Overdue ({urgent.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {urgent.slice(0, 5).map((t) => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: t.overdue ? "#fef2f2" : "#fff7ed", border: `1px solid ${t.overdue ? "#fecaca" : "#fed7aa"}`, borderRadius: 10, fontSize: 13, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#111" }}>{t.requestNumber}</span>
                        <span style={{ color: "#dc2626", fontWeight: 800 }}>{formatINR(t.approvedAmount)}</span>
                        <span style={{ color: "#475569" }}>{t.requesterName} · {t.departmentName}</span>
                        <span className="mgmt-badge" style={{ background: "rgba(220,38,38,.12)", color: "#dc2626" }}>{t.priority}{t.overdue ? " · OVERDUE" : ""}</span>
                        <button className="mgmt-action-btn" style={{ marginLeft: "auto", background: "#eff6ff", color: "#2563eb" }} onClick={() => openDetail(t)}>
                          <Eye size={13} /> View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <div className="mgmt-card">
                  <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                    <ClipboardCheck size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#d97706" }} />
                    Approval Queue ({pending.length} pending)
                  </h3>
                  {pending.length === 0 ? (
                    <EmptyState text="All clear — no purchase requests are currently waiting for your approval." />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {pending.slice(0, 5).map((t) => (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, fontSize: 13, flexWrap: "wrap", cursor: "pointer" }} onClick={() => openDetail(t)}>
                          <strong style={{ color: "#111" }}>{t.requestNumber}</strong>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatINR(t.approvedAmount)}</span>
                          <span style={{ color: "#475569" }}>{t.requesterName}</span>
                          <span style={{ color: "#7a8999", fontSize: 12 }}>{t.stageName}</span>
                          <ChevronRight size={14} color="#9aa8b8" style={{ marginLeft: "auto" }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mgmt-card">
                  <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                    <Clock size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#2563eb" }} />
                    Recent Approval Activity
                  </h3>
                  {myHistory.length === 0 ? (
                    <EmptyState text="No approval decisions recorded yet." />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {myHistory.slice(0, 6).map((h, idx) => {
                        const color = h.action === "APPROVED" ? "#059669" : h.action === "REJECTED" ? "#dc2626" : h.action === "RETURNED" ? "#2563eb" : "#d97706";
                        const HIcon = h.action === "APPROVED" ? CheckCircle2 : h.action === "REJECTED" ? XCircle : h.action === "RETURNED" ? RotateCcw : Clock;
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                            <HIcon size={15} color={color} style={{ flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, color: "#111" }}>{h.requestNumber}</span>
                            <span style={{ color: color, fontWeight: 700 }}>{h.action}</span>
                            <span style={{ color: "#64748b", marginLeft: "auto" }}>{formatDateIN(h.performedAt)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ============ APPROVAL QUEUE ============ */}
          {activeTab === "approvals" && (
            <div className="mgmt-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#111" }}>
                  <ClipboardCheck size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#d97706" }} />
                  Approval Queue <span style={{ color: "#7a8999", fontSize: 12.5, fontWeight: 600 }}>({filteredQueue.length} shown)</span>
                </h3>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
                <div style={{ position: "relative", flex: "1 1 240px", minWidth: 220 }}>
                  <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9aa8b8" }} />
                  <input
                    style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #d9dee6", borderRadius: 9, fontSize: 12.5, outline: "none", boxSizing: "border-box" }}
                    placeholder="Search PR number, employee, department, category…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select className="mgmt-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  {["PENDING", "APPROVED", "REJECTED", "RETURNED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select className="mgmt-filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="">All Priorities</option>
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select className="mgmt-filter" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                  <option value="">All Departments</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="mgmt-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="mgmt-filter" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
                  <option value="">All Employees</option>
                  {employees.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
                <select className="mgmt-filter" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="dueSoon">Sort: Due Soon</option>
                  <option value="newest">Sort: Newest</option>
                  <option value="oldest">Sort: Oldest</option>
                  <option value="amountHigh">Sort: Highest Amount</option>
                  <option value="amountLow">Sort: Lowest Amount</option>
                  <option value="priority">Sort: Priority</option>
                </select>
              </div>

              {filteredQueue.length === 0 ? (
                <EmptyState text={statusFilter === "PENDING" ? "All clear — no purchase requests are currently waiting for your approval." : "No approval tasks match these filters."} />
              ) : (
                <div>
                  {filteredQueue.map(renderQueueCard)}
                </div>
              )}
            </div>
          )}

          {/* ============ MY HISTORY ============ */}
          {activeTab === "history" && (
            <div className="mgmt-card">
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                <Scale size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#7c3aed" }} />
                My Approval History
              </h3>
              <div className="mgmt-tabs" style={{ marginBottom: 16 }}>
                {[
                  { id: "PENDING", label: "Pending" },
                  { id: "APPROVED", label: "Approved" },
                  { id: "REJECTED", label: "Rejected" },
                  { id: "RETURNED", label: "Returned" },
                ].map((t) => (
                  <button key={t.id} className={`mgmt-tab ${statusFilter === t.id ? "active" : ""}`} onClick={() => setStatusFilter(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
              {filteredQueue.length === 0 ? (
                <EmptyState text="No tasks in this category." />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>PR Number</th>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Amount</th>
                        <th>Stage</th>
                        <th>Decision Date</th>
                        <th>Comment</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQueue.map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: "700" }}>{t.requestNumber}</td>
                          <td>{t.requesterName} {t.employeeCode ? `(${t.employeeCode})` : ""}</td>
                          <td>{t.departmentName}</td>
                          <td style={{ fontWeight: 700, color: "#0f172a" }}>{formatINR(t.approvedAmount)}</td>
                          <td>{t.stageName}</td>
                          <td style={{ color: "#7a8999", fontSize: 12.5 }}>{formatDateIN(t.completedDate || t.assignedDate)}</td>
                          <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#64748b" }}>{t.comments || "—"}</td>
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <button className="mgmt-action-btn" style={{ background: "#eff6ff", color: "#2563eb" }} onClick={() => openDetail(t)}>
                              <Eye size={13} /> View
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

          {/* ============ ANALYTICS ============ */}
          {activeTab === "analytics" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <div className="mgmt-card">
                  <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                    <TrendingUp size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#2563eb" }} />
                    My Decisions — Last 30 Days
                  </h3>
                  {approvalTrend.every((p) => p.value === 0) ? (
                    <EmptyState text="No approval activity in the last 30 days." />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={approvalTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#7a8999" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#7a8999" }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" name="Decisions" fill="#f8b400" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="mgmt-card">
                  <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                    <TrendingUp size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#7c3aed" }} />
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
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <div className="mgmt-card">
                  <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                    <Package size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#d97706" }} />
                    Pending Value by Category
                  </h3>
                  {categoryBreakdown.length === 0 ? (
                    <EmptyState text="Nothing pending." />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {categoryBreakdown.map((c) => {
                        const max = categoryBreakdown[0].value || 1;
                        return (
                          <div key={c.name}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, color: "#33414f" }}>{c.name}</span>
                              <span style={{ fontWeight: 800, color: "#0f172a" }}>{formatINR(c.value)}</span>
                            </div>
                            <div style={{ background: "#eef1f5", borderRadius: 6, height: 8, overflow: "hidden" }}>
                              <div style={{ width: `${(c.value / max) * 100}%`, background: "#f8b400", height: "100%", borderRadius: 6 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="mgmt-card">
                  <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                    <Building size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#2563eb" }} />
                    Pending by Department
                  </h3>
                  {departmentBreakdown.length === 0 ? (
                    <EmptyState text="Nothing pending." />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {departmentBreakdown.map((d) => {
                        const max = departmentBreakdown[0].count || 1;
                        return (
                          <div key={d.name}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, color: "#33414f" }}>{d.name}</span>
                              <span style={{ fontWeight: 800, color: "#0f172a" }}>{d.count} PR{d.count === 1 ? "" : "s"}</span>
                            </div>
                            <div style={{ background: "#eef1f5", borderRadius: 6, height: 8, overflow: "hidden" }}>
                              <div style={{ width: `${(d.count / max) * 100}%`, background: "#2563eb", height: "100%", borderRadius: 6 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mgmt-card">
                <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#111" }}>
                  <FileText size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "#2563eb" }} />
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
            </>
          )}
        </>
      )}

      {/* ============ PR DETAIL DRAWER ============ */}
      {detailTask && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, overflow: "auto", padding: "24px 12px" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "26px 28px", width: "100%", maxWidth: 880, maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 60px rgba(15,23,42,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: "#d97706" }}>PURCHASE REQUEST DETAILS</span>
                <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "#111" }}>
                  {detail?.pr?.requestNumber || detailTask.requestNumber}
                </h3>
              </div>
              <button onClick={() => setDetailTask(null)} style={{ background: "#f8f9fb", border: "1px solid #d9dee6", borderRadius: 9, width: 34, height: 34, cursor: "pointer", fontWeight: 800, color: "#555" }}>✕</button>
            </div>

            {detailLoading || !detail ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "70px 0", color: "#888", fontWeight: 600 }}>
                <Loader2 size={20} className="mgmt-spin" /> Loading request details…
              </div>
            ) : detail.pr ? (
              <>
                {/* Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }}>
                  <SummaryBox icon={User} label="Requester" value={detail.pr.requesterName} />
                  <SummaryBox icon={Building} label="Department" value={detail.pr.departmentName} />
                  <SummaryBox icon={IndianRupee} label="Amount" value={formatINR(detail.pr.estimatedAmount)} />
                  <SummaryBox icon={ClipboardCheck} label="Status" value={`${detail.pr.status}${detail.pr.approvalStatus ? ` · ${detail.pr.approvalStatus}` : ""}`} />
                </div>

                {/* Your action panel */}
                {detailTask.status === "PENDING" && (canApprove || canReject || canReturn) && !aboveAuthority(detailTask.approvedAmount) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "14px 16px", marginBottom: 18, flexWrap: "wrap" }}>
                    <AlertTriangle size={20} color="#b45309" />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: "#92400e", letterSpacing: 0.4, textTransform: "uppercase" }}>Your Action Required</div>
                      <div style={{ fontSize: 13, color: "#78350f" }}>{detailTask.stageName} — assigned to you on {formatDateIN(detailTask.assignedDate)}</div>
                    </div>
                    <button
                      className="mgmt-action-btn"
                      style={{ background: "#f8b400", color: "#000" }}
                      onClick={() => { setDecisionTask(detailTask); setDecision("APPROVED"); setComments(""); }}
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    {canReturn && (
                      <button className="mgmt-action-btn" style={{ background: "#eff6ff", color: "#2563eb" }} onClick={() => { setDecisionTask(detailTask); setDecision("RETURNED"); setComments(""); }}>
                        <RotateCcw size={14} /> Return
                      </button>
                    )}
                    {canReject && (
                      <button className="mgmt-action-btn" style={{ background: "#fef2f2", color: "#dc2626" }} onClick={() => { setDecisionTask(detailTask); setDecision("REJECTED"); setComments(""); }}>
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                  </div>
                )}
                {detailTask.status !== "PENDING" && (
                  <div style={{ fontSize: 13, color: "#475569", background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "11px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                    <ShieldCheck size={15} color="#059669" /> No action required — this task is {detailTask.status}.
                  </div>
                )}

                {detail.pr.purpose && (
                  <div style={{ background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: 13, color: "#475569" }}>
                    <strong>Justification:</strong> {detail.pr.purpose}
                  </div>
                )}

                {/* Line items */}
                {detail.lines.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 7 }}>
                      <Package size={15} color="#2563eb" /> Requested Items
                    </h4>
                    <table className="mgmt-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th style={{ textAlign: "right" }}>Qty</th>
                          <th style={{ textAlign: "right" }}>Unit Price</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.lines.map((l) => (
                          <tr key={l.id}>
                            <td style={{ fontWeight: 700, color: "#111" }}>{l.productName}</td>
                            <td style={{ textAlign: "right", color: "#475569" }}>{l.quantity}</td>
                            <td style={{ textAlign: "right", color: "#475569" }}>{formatINR(l.unitPrice)}</td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>{formatINR(l.estimatedAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Approval chain */}
                <h4 style={{ margin: "0 0 12px", fontSize: 13.5, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 7 }}>
                  <ArrowRight size={15} color="#d97706" /> Approval Chain
                </h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                  {[
                    { label: "Employee", state: detail.history.some((h) => h.action === "SUBMITTED") ? "done" : "todo" },
                    ...(detail.history.length
                      ? detail.history
                          .filter((h) => h.action !== "SUBMITTED")
                          .map((h) => ({
                            label: `${h.performedByName || "Approver"} — ${h.action}`,
                            state: h.action === "APPROVED" ? "done" : h.action === "REJECTED" || h.action === "RETURNED" ? "bad" : "todo",
                          }))
                      : [{ label: detailTask.stageName, state: "current" }]),
                    { label: "Procurement", state: "todo" },
                  ].map((step, idx, arr) => (
                    <React.Fragment key={idx}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          padding: "7px 12px",
                          borderRadius: 999,
                          background: step.state === "done" ? "rgba(5,150,105,.12)" : step.state === "bad" ? "rgba(220,38,38,.12)" : step.state === "current" ? "rgba(217,119,6,.12)" : "#f1f5f9",
                          color: step.state === "done" ? "#059669" : step.state === "bad" ? "#dc2626" : step.state === "current" ? "#d97706" : "#94a3b8",
                        }}
                      >
                        {step.state === "done" ? "✓" : step.state === "bad" ? "✕" : step.state === "current" ? "⏳" : "○"} {step.label}
                      </div>
                      {idx < arr.length - 1 && <ChevronRight size={13} color="#cbd5e1" style={{ alignSelf: "center" }} />}
                    </React.Fragment>
                  ))}
                </div>

                {/* Timeline */}
                <h4 style={{ margin: "0 0 12px", fontSize: 13.5, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 7 }}>
                  <Clock size={15} color="#d97706" /> Full Workflow Timeline
                </h4>
                {detail.history.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#7a8999", background: "#f8fafc", borderRadius: 10, padding: "14px" }}>
                    No workflow events recorded yet for this request.
                  </div>
                ) : (
                  <div style={{ position: "relative", paddingLeft: 28 }}>
                    {detail.history.map((h, idx) => {
                      const color = h.action === "APPROVED" ? "#059669" : h.action === "REJECTED" ? "#dc2626" : h.action === "RETURNED" ? "#2563eb" : "#d97706";
                      return (
                        <div key={idx} style={{ position: "relative", paddingBottom: 16 }}>
                          <div style={{ position: "absolute", left: -28, top: 2, width: 28, height: 28, borderRadius: "50%", background: `${color}14`, color, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${color}` }}>
                            {h.action === "REJECTED" ? <XCircle size={12} /> : h.action === "RETURNED" ? <RotateCcw size={12} /> : h.action === "APPROVED" ? <CheckCircle2 size={12} /> : <ClipboardCheck size={12} />}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{h.action}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {formatDateIN(h.performedAt)} {h.performedByName ? `· ${h.performedByName}` : ""}
                          </div>
                          {h.comments && (
                            <div style={{ fontSize: 12.5, color: "#475569", marginTop: 4, background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>“{h.comments}”</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PO card */}
                {detail.po ? (
                  <div style={{ marginTop: 14, border: "1px solid #a7f3d0", background: "#ecfdf5", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#065f46", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <Package size={14} /> Purchase Order Issued
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, fontSize: 12.5 }}>
                      <div><span style={{ color: "#6b7280", fontSize: 11 }}>PO Number</span><div style={{ fontWeight: 700, color: "#065f46" }}>{detail.po.poNumber}</div></div>
                      <div><span style={{ color: "#6b7280", fontSize: 11 }}>Vendor</span><div style={{ fontWeight: 700, color: "#065f46" }}>{detail.po.vendorName}</div></div>
                      <div><span style={{ color: "#6b7280", fontSize: 11 }}>Amount</span><div style={{ fontWeight: 700, color: "#065f46" }}>{formatINR(detail.po.grandTotal)}</div></div>
                      <div><span style={{ color: "#6b7280", fontSize: 11 }}>Status</span><div style={{ fontWeight: 700, color: "#065f46" }}>{detail.po.status}</div></div>
                    </div>
                  </div>
                ) : (
                  detail.pr.status !== "DRAFT" && (
                    <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "#7a8999", fontSize: 12.5, background: "#f8fafc", borderRadius: 10, padding: "11px 14px" }}>
                      <Clock size={14} /> No purchase order generated yet — procurement will raise one after sourcing.
                    </div>
                  )
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                  <button className="mgmt-action-btn" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9dee6" }} onClick={() => setDetailTask(null)}>Close</button>
                </div>
              </>
            ) : (
              <EmptyState text="Unable to load this request — it may have been removed." />
            )}
          </div>
        </div>
      )}

      {/* ============ DECISION MODAL ============ */}
      {decisionTask && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 310, overflow: "auto", padding: "24px 12px" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "26px 28px", width: "100%", maxWidth: 580, boxShadow: "0 24px 60px rgba(15,23,42,.25)" }}>
            <div style={{ borderBottom: "1px solid #ececec", paddingBottom: 14, marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: "#d97706" }}>APPROVAL DECISION</span>
              <h3 style={{ margin: "4px 0 0", fontSize: 19, fontWeight: 800, color: "#111" }}>
                {decisionTask.requestNumber} — {decisionTask.stageName}
              </h3>
              <p style={{ fontSize: 13, color: "#555", margin: "6px 0 0" }}>
                Amount {formatINR(decisionTask.approvedAmount)} · {decisionTask.requesterName} ({decisionTask.employeeCode}) · {decisionTask.departmentName} · {decisionTask.category || "Uncategorised"}
              </p>
              {decisionTask.previousApprover && (
                <p style={{ fontSize: 12.5, color: "#78350f", margin: "6px 0 0" }}>
                  Previous approval: <strong>{decisionTask.previousApprover}</strong> — {decisionTask.previousApproval || "decided"} · {decisionTask.approvalReason}
                </p>
              )}
            </div>

            <form onSubmit={submitDecision}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
                {[
                  { value: "APPROVED", label: "Approve", icon: CheckCircle2, color: "#059669", bg: "rgba(5,150,105,.08)", visible: canApprove },
                  { value: "REJECTED", label: "Reject", icon: XCircle, color: "#dc2626", bg: "rgba(220,38,38,.08)", visible: canReject },
                  { value: "RETURNED", label: "Return", icon: RotateCcw, color: "#2563eb", bg: "rgba(37,99,235,.08)", visible: canReturn },
                ].filter((o) => o.visible).map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setDecision(opt.value)}
                      style={{
                        padding: "14px 10px",
                        borderRadius: 10,
                        border: decision === opt.value ? `2px solid ${opt.color}` : "1px solid #ececec",
                        background: decision === opt.value ? opt.bg : "#fff",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 800,
                        color: decision === opt.value ? opt.color : "#111",
                      }}
                    >
                      <OptIcon size={20} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                  <MessageSquare size={14} /> Comments {decision !== "APPROVED" ? "(required for reject / return)" : ""}
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={decision === "APPROVED" ? "Optional remarks for the requester..." : "Please provide a reason for this decision..."}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d9dee6", borderRadius: 9, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {decisionTask.nextStageName && decision === "APPROVED" && (
                <div style={{ fontSize: 12.5, color: "#1e3a8a", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "9px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <ArrowRight size={14} /> After approval this request moves to <strong>{decisionTask.nextStageName}</strong> ({decisionTask.nextApproverRole}).
                </div>
              )}
              {decisionTask.nextStageName == null && decision === "APPROVED" && (
                <div style={{ fontSize: 12.5, color: "#065f46", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, padding: "9px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={14} /> This is the final approval stage — the request will be fully approved and move to <strong>Procurement</strong>.
                </div>
              )}

              {!canApprove && !canReject && !canReturn && (
                <div style={{ fontSize: 12.5, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={15} /> You do not have permission to approve, reject or return requests. Contact your administrator.
                </div>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="mgmt-action-btn" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9dee6" }} onClick={() => setDecisionTask(null)}>Cancel</button>
                {(canApprove || canReject || canReturn) && (
                  <button type="submit" disabled={submitting} className="mgmt-action-btn" style={{ background: decision === "REJECTED" ? "#dc2626" : decision === "RETURNED" ? "#2563eb" : "#f8b400", color: decision === "REJECTED" || decision === "RETURNED" ? "#fff" : "#000", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? <Loader2 size={14} className="mgmt-spin" /> : decision === "APPROVED" ? <CheckCircle2 size={14} /> : decision === "REJECTED" ? <XCircle size={14} /> : <RotateCcw size={14} />}
                    {submitting ? " Submitting..." : ` ${decision === "APPROVED" ? "Approve" : decision === "REJECTED" ? "Reject" : "Return for Correction"}`}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </RoleShell>
  );
};

const SummaryBox = ({ icon: Icon, label, value }) => (
  <div style={{ background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "12px 14px" }}>
    <div style={{ fontSize: 11, color: "#7a8999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, display: "flex", alignItems: "center", gap: 5 }}>
      <Icon size={12} /> {label}
    </div>
    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{value || "—"}</div>
  </div>
);

const EmptyState = ({ text }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "36px 0", color: "#9aa8b8" }}>
    <CheckCircle2 size={22} style={{ opacity: 0.5 }} />
    <span style={{ fontSize: "13.5px", fontWeight: "600" }}>{text}</span>
  </div>
);

export default ManagementDashboard;
