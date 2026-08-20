import React, { useState, useEffect, useCallback } from "react";
import VendorProfileModal from "../../shared_ui/VendorProfileModal";
import {
  Users,
  Search,
  Star,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building,
  Eye,
  Loader2,
  WifiOff,
  XCircle,
  FileText,
  RefreshCw,
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
} from "recharts";
import { apiGet, apiPut } from "../../../../../services/apiClient";
import { formatINR } from "../../../../../utils/format";

const STATUS_COLORS = {
  ACTIVE: "#059669",
  INACTIVE: "#64748b",
  SUSPENDED: "#dc2626",
  PENDING_APPROVAL: "#d97706",
};

const statusLabel = (s) =>
  ({ ACTIVE: "Active", INACTIVE: "Inactive", SUSPENDED: "Suspended", PENDING_APPROVAL: "Pending Approval" }[s] || s);

const toProfileShape = (v) => ({
  companyName: v.vendorName,
  vendorId: v.vendorCode,
  vendorType: v.vendorType || "General Supplier",
  email: v.email,
  phone: v.mobile || v.phone,
  location: [v.addressLine1, v.city, v.state, v.country].filter(Boolean).join(", ") || "—",
  productsServices: ["GST: " + (v.gstNumber || "—")].filter(Boolean),
  performance: {
    rating: `${v.rating || "—"} / 5`,
    totalOrdersCompleted: "—",
    onTimeDeliveries: "—",
    successfulTransactions: "—",
    responseTime: "—",
  },
  pricingInfo: [v.paymentTerms ? `Payment Terms: ${v.paymentTerms}` : "Payment Terms: Standard"].filter(Boolean),
  deliveryInfo: {
    deliveryTime: "—",
    shippingAvailability: "—",
  },
  certifications: [
    v.gstNumber ? "GST Verified" : null,
    v.panNumber ? "PAN Registered" : null,
    v.registrationNumber ? "Company Verified" : null,
    v.approved ? "Approved Vendor" : null,
  ].filter(Boolean),
  recentProcurement: {
    lastOrderValue: "—",
    lastOrderDate: "—",
    totalTransactions: "—",
  },
});

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [profileVendor, setProfileVendor] = useState(null);
  const [comparedVendorIds, setComparedVendorIds] = useState([]);
  const [statusModalVendor, setStatusModalVendor] = useState(null);
  const [statusReasonInput, setStatusReasonInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [spendChart, setSpendChart] = useState([]);

  const triggerToast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [page, spendRes] = await Promise.all([
        apiGet("/api/vendors?page=0&size=100&sort=vendorName&direction=asc"),
        apiGet("/api/dashboard/charts/spend").catch(() => null),
      ]);
      setVendors(page?.content || []);
      const spend = spendRes?.data || spendRes?.points || spendRes?.series || [];
      setSpendChart(Array.isArray(spend) ? spend : []);
    } catch (err) {
      setError(err.message || "Unable to load vendors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = vendors.filter((v) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (v.vendorName || "").toLowerCase().includes(q) ||
      (v.vendorCode || "").toLowerCase().includes(q) ||
      (v.city || "").toLowerCase().includes(q) ||
      (v.vendorType || "").toLowerCase().includes(q);
    const matchesTab = activeTabFilter === "all" || v.status === activeTabFilter;
    return matchesSearch && matchesTab;
  });

  const activeCount = vendors.filter((v) => v.status === "ACTIVE").length;
  const suspendedCount = vendors.filter((v) => v.status === "SUSPENDED").length;
  const pendingCount = vendors.filter((v) => v.status === "PENDING_APPROVAL").length;
  const inactiveCount = vendors.filter((v) => v.status === "INACTIVE").length;

  const openProfile = (v) => setProfileVendor(v);
  const openProfileById = (id) => {
    const v = vendors.find((x) => String(x.id) === String(id));
    if (v) setProfileVendor(v);
  };

  const toggleCompare = (v) => {
    setComparedVendorIds((prev) =>
      prev.includes(v.id) ? prev.filter((x) => x !== v.id) : [...prev, v.id]
    );
  };

  const handleStatusChange = async () => {
    if (!statusModalVendor) return;
    setBusy(true);
    setError("");
    try {
      const v = statusModalVendor;
      const newStatus = v.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await apiPut(`/api/vendors/${v.id}/status`, { status: newStatus, approved: newStatus === "ACTIVE" });
      triggerToast(`${v.vendorName} is now ${statusLabel(newStatus)}.`);
      setStatusModalVendor(null);
      loadData();
    } catch (err) {
      setError(err.message || "Unable to update vendor status.");
    } finally {
      setBusy(false);
    }
  };

  const pieData = [
    { name: "Active", value: activeCount },
    { name: "Inactive", value: inactiveCount },
    { name: "Suspended", value: suspendedCount },
    { name: "Pending Approval", value: pendingCount },
  ].filter((d) => d.value > 0);

  const tabBtn = (key, label, count, color) => (
    <button
      key={key}
      onClick={() => setActiveTabFilter(key)}
      style={{
        padding: "6px 14px",
        borderRadius: "8px",
        border: "none",
        background: activeTabFilter === key ? (color || "#f8b400") : "transparent",
        color: activeTabFilter === key ? (key === "all" ? "#000" : "#fff") : "#555555",
        fontWeight: activeTabFilter === key ? "700" : "600",
        fontSize: "13px",
        cursor: "pointer",
      }}
    >
      {label} {count > 0 ? `(${count})` : ""}
    </button>
  );

  return (
    <div className="pman-requests-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Users color="#f8b400" /> Vendor Management
          </h1>
          <p className="pman-page-subtitle">
            Approved vendor registry from the database — active, suspended and pending vendors with live eligibility status.
          </p>
        </div>
        <button className="pman-btn-primary-sm" onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {toastMsg && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", fontWeight: 600, border: "1px solid #a7f3d0" }}>
          <CheckCircle2 size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> {toastMsg}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search vendor name, code, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pman-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>
          <div style={{ display: "flex", background: "#f8f9fb", padding: "3px", borderRadius: "10px", border: "1px solid #d9d9d9" }}>
            {tabBtn("all", "All", vendors.length, "#f8b400")}
            {tabBtn("ACTIVE", "Active", activeCount, "#059669")}
            {tabBtn("SUSPENDED", "Suspended", suspendedCount, "#dc2626")}
            {tabBtn("PENDING_APPROVAL", "Pending", pendingCount, "#d97706")}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Active Vendors", value: activeCount, icon: <CheckCircle2 size={18} />, color: "#059669" },
          { label: "Inactive", value: inactiveCount, icon: <AlertCircle size={18} />, color: "#64748b" },
          { label: "Suspended", value: suspendedCount, icon: <XCircle size={18} />, color: "#dc2626" },
          { label: "Pending Approval", value: pendingCount, icon: <ShieldCheck size={18} />, color: "#d97706" },
        ].map((k) => (
          <div key={k.label} className="pman-kpi-card">
            <div className="pman-kpi-icon-wrapper" style={{ background: `${k.color}18`, color: k.color }}>
              {k.icon}
            </div>
            <div className="pman-kpi-info">
              <span className="pman-kpi-label">{k.label}</span>
              <span className="pman-kpi-value">{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="pman-card">
        <div className="pman-table-container">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#666666" }}>
              <Loader2 size={20} className="login-spin" /> Loading vendors…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#666666" }}>
              <Building size={32} style={{ marginBottom: "10px", opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>No vendors found.</p>
              <p style={{ fontSize: "13px" }}>No vendors match the current filter.</p>
            </div>
          ) : (
            <table className="pman-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>GST</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Approved</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "800", color: "#111111" }}>{v.vendorName}</span>
                        <span style={{ fontSize: "11px", color: "#666666" }}>{v.vendorCode}</span>
                      </div>
                    </td>
                    <td style={{ color: "#555555" }}>{v.vendorType || "—"}</td>
                    <td style={{ color: "#555555", fontSize: "13px" }}>{[v.city, v.state].filter(Boolean).join(", ") || "—"}</td>
                    <td style={{ color: "#555555", fontSize: "13px" }}>{v.gstNumber || "—"}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, color: "#d97706" }}>
                        <Star size={13} fill="#f8b400" color="#f8b400" /> {v.rating ?? "—"}
                      </span>
                    </td>
                    <td>
                      <span className="pman-badge" style={{ background: `${STATUS_COLORS[v.status] || "#64748b"}18`, color: STATUS_COLORS[v.status] || "#64748b", border: `1px solid ${STATUS_COLORS[v.status] || "#64748b"}33` }}>
                        <span className="pman-badge-dot"></span>
                        {statusLabel(v.status)}
                      </span>
                    </td>
                    <td style={{ fontSize: "12.5px", fontWeight: 700, color: v.approved ? "#059669" : "#d97706" }}>
                      {v.approved ? "Yes" : "No"}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        className="pman-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", marginRight: 6 }}
                        onClick={() => toggleCompare(v)}
                        title="Toggle comparison"
                      >
                        <FileText size={15} />
                      </button>
                      <button
                        className="pman-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", marginRight: 6 }}
                        onClick={() => openProfile(v)}
                        title="View profile"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="pman-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", background: v.status === "ACTIVE" ? "rgba(220,38,38,.1)" : "rgba(5,150,105,.1)", color: v.status === "ACTIVE" ? "#dc2626" : "#059669" }}
                        onClick={() => { setStatusReasonInput(""); setStatusModalVendor(v); }}
                        title={v.status === "ACTIVE" ? "Suspend vendor" : "Restore vendor"}
                      >
                        {v.status === "ACTIVE" ? <XCircle size={15} /> : <RefreshCw size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Comparison Section */}
      {comparedVendorIds.length > 1 && (
        <div className="pman-card" style={{ marginTop: "24px", padding: "24px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#111", marginBottom: "16px" }}>Vendor Comparison ({comparedVendorIds.length})</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="pman-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  {comparedVendorIds.map((id) => {
                    const v = vendors.find((x) => String(x.id) === String(id));
                    return v ? <th key={id}>{v.vendorName}</th> : null;
                  })}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Type", (v) => v.vendorType || "—"],
                  ["Location", (v) => [v.city, v.state, v.country].filter(Boolean).join(", ") || "—"],
                  ["Rating", (v) => `${v.rating ?? "—"} / 5`],
                  ["GST", (v) => v.gstNumber || "—"],
                  ["Status", (v) => statusLabel(v.status)],
                  ["Approved", (v) => (v.approved ? "Yes" : "No")],
                  ["Credit Limit", (v) => formatINR(v.creditLimit)],
                ].map(([label, fn]) => (
                  <tr key={label}>
                    <td style={{ fontWeight: 700, color: "#111" }}>{label}</td>
                    {comparedVendorIds.map((id) => {
                      const v = vendors.find((x) => String(x.id) === String(id));
                      return v ? <td key={id}>{fn(v)}</td> : null;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
        <div className="pman-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#111", marginBottom: "16px" }}>Vendor Status Distribution</h3>
          {pieData.length === 0 ? (
            <p style={{ color: "#888", fontSize: "13.5px", textAlign: "center", padding: "30px 0" }}>No vendor data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={["#059669", "#64748b", "#dc2626", "#d97706"][i % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="pman-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#111", marginBottom: "16px" }}>Spend Trend</h3>
          {spendChart.length === 0 ? (
            <p style={{ color: "#888", fontSize: "13.5px", textAlign: "center", padding: "30px 0" }}>No spend data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={spendChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={spendChart[0]?.label ? "label" : "month"} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey={spendChart[0]?.value !== undefined ? "value" : "spend"} name="Spend (₹)" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {profileVendor && (
        <VendorProfileModal
          vendor={toProfileShape(profileVendor)}
          onClose={() => setProfileVendor(null)}
          onAction={(actionName) => {
            triggerToast(`Action [ ${actionName} ] executed for ${profileVendor.vendorName}`);
          }}
        />
      )}

      {/* Status Change Modal */}
      {statusModalVendor && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(220, 38, 38, 0.12)", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <XCircle size={20} />
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "800", textTransform: "uppercase" }}>VENDOR STATUS</span>
                  <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800", margin: 0 }}>
                    {statusModalVendor.status === "ACTIVE" ? "Suspend" : "Restore"} {statusModalVendor.vendorName}
                  </h3>
                </div>
              </div>
              <button onClick={() => setStatusModalVendor(null)} style={{ background: "none", border: "none", color: "#666" }}>
                <XCircle size={20} />
              </button>
            </div>

            <p style={{ fontSize: "13.5px", color: "#555", marginBottom: "16px" }}>
              {statusModalVendor.status === "ACTIVE"
                ? `Suspending ${statusModalVendor.vendorName} prevents new RFQ invitations and purchase orders to this vendor.`
                : `Restoring ${statusModalVendor.vendorName} re-enables this vendor for sourcing activities.`}
            </p>

            <div className="pman-form-group" style={{ marginBottom: "20px" }}>
              <label className="pman-form-label">Reason / Record</label>
              <textarea
                className="pman-form-input"
                rows={3}
                value={statusReasonInput}
                onChange={(e) => setStatusReasonInput(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="pman-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setStatusModalVendor(null)} disabled={busy}>
                Cancel
              </button>
              <button
                className="pman-btn-primary-sm"
                style={{ background: statusModalVendor.status === "ACTIVE" ? "#dc2626" : "#059669", color: "#fff", border: "none" }}
                onClick={handleStatusChange}
                disabled={busy}
              >
                {busy ? <Loader2 size={15} className="login-spin" /> : statusModalVendor.status === "ACTIVE" ? "Confirm Suspension" : "Confirm Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
