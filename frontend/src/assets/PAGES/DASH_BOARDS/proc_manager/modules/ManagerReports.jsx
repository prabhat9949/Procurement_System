import React, { useState } from "react";
import {
  FolderKanban,
  Search,
  Download,
  FileText,
  FileCheck,
  Loader2,
  WifiOff,
  Users,
  Send,
  ShoppingBag,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";

const downloadCsv = (filename, header, rows) => {
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v ?? ""}"`.replace(/"/g, '""')).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ManagerReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const exportReport = async (key, label, url, header, rowFn) => {
    setBusyKey(key);
    setError("");
    try {
      const page = await apiGet(url);
      const rows = (page?.content || []).map(rowFn);
      downloadCsv(`${key}-${new Date().toISOString().slice(0, 10)}.csv`, header, rows);
      triggerToast(`${label} exported (${rows.length} rows).`);
    } catch (err) {
      setError(err.message || `Unable to export ${label}.`);
    } finally {
      setBusyKey("");
    }
  };

  const reports = [
    {
      id: "REP-PR",
      category: "Requests",
      title: "Purchase Requests Register",
      icon: FileText,
      url: "/api/purchase-requests?page=0&size=500&sort=createdAt&direction=desc",
      header: ["Request Number", "Requester", "Department", "Cost Center", "Priority", "Status", "Approval Status", "Amount", "Purpose", "Created"],
      rowFn: (r) => [r.requestNumber, r.requesterName, r.departmentName, r.costCenterName, r.priority, r.status, r.approvalStatus, r.estimatedAmount, r.purpose, r.createdAt],
    },
    {
      id: "REP-RFQ",
      category: "RFQ",
      title: "RFQ Register",
      icon: Send,
      url: "/api/rfqs?page=0&size=500&sort=createdAt&direction=desc",
      header: ["RFQ Number", "Request", "Department", "Closing Date", "Opening Date", "Status", "Remarks"],
      rowFn: (r) => [r.rfqNumber, r.purchaseRequestNumber, r.departmentName, r.closingDate, r.quotationOpeningDate, r.status, r.remarks],
    },
    {
      id: "REP-PO",
      category: "Purchase Orders",
      title: "Purchase Order Register",
      icon: ShoppingBag,
      url: "/api/purchase-orders?page=0&size=500&sort=orderDate&direction=desc",
      header: ["PO Number", "Vendor", "Request", "Order Date", "Expected Delivery", "Subtotal", "Tax", "Grand Total", "Status"],
      rowFn: (r) => [r.poNumber, r.vendorName, r.requestNumber, r.orderDate, r.expectedDeliveryDate, r.subtotal, r.taxAmount, r.grandTotal, r.status],
    },
    {
      id: "REP-VENDOR",
      category: "Vendors",
      title: "Vendor Register",
      icon: Users,
      url: "/api/vendors?page=0&size=500&sort=vendorName&direction=asc",
      header: ["Vendor Code", "Vendor Name", "Type", "City", "GST", "Status", "Approved", "Rating"],
      rowFn: (r) => [r.vendorCode, r.vendorName, r.vendorType, r.city, r.gstNumber, r.status, r.approved, r.rating],
    },
    {
      id: "REP-QUOTE",
      category: "Quotations",
      title: "Vendor Quotation Register",
      icon: FileCheck,
      url: "/api/vendor-quotations?page=0&size=500&sort=createdAt&direction=desc",
      header: ["Quotation Number", "RFQ", "Vendor", "Amount", "Currency", "Status", "Submitted"],
      rowFn: (r) => [r.quotationNumber, r.rfqNumber, r.vendorName, r.totalAmount ?? r.amount, r.currency, r.status, r.createdAt],
    },
  ];

  const filtered = reports.filter((r) =>
    (r.title + " " + r.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pman-reports-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <FolderKanban color="#f8b400" /> Procurement Reports
          </h1>
          <p className="pman-page-subtitle">
            Live exports generated from the database — requests, RFQs, purchase orders, vendors and quotations.
          </p>
        </div>
      </div>

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

      {/* Search */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <Search size={16} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pman-form-input"
            style={{ paddingLeft: "42px", height: "42px" }}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {filtered.length === 0 && (
          <div className="pman-card" style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            <FolderKanban size={30} style={{ opacity: 0.4, marginBottom: 8 }} />
            <p>No reports match your search.</p>
          </div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="pman-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(248, 180, 0, 0.15)",
                  border: "1px solid #f8b400",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <r.icon size={22} />
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>
                  {r.category.toUpperCase()} • {r.id}
                </span>
                <h4
                  style={{
                    color: "#111111",
                    fontSize: "14px",
                    fontWeight: "700",
                    margin: "4px 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={r.title}
                >
                  {r.title}
                </h4>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  Live database export • CSV
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid #ececec",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "11px", color: "#555555" }}>All amounts in INR (₹)</span>
              <button
                className="pman-btn-primary-sm"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => exportReport(r.id, r.title, r.url, r.header, r.rowFn)}
                disabled={busyKey === r.id}
              >
                {busyKey === r.id ? <Loader2 size={14} className="login-spin" /> : <Download size={14} />} {busyKey === r.id ? "Exporting…" : "Download CSV"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerReports;
