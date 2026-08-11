import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  FileText,
  Search,
  Download,
  Eye,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Building,
  Paperclip,
  ShieldCheck,
  ArrowRight,
  FileCheck,
  AlertCircle,
  Loader2,
  WifiOff
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusToUi = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED" || s === "COMPLETED") return "approved";
  if (s === "REJECTED" || s === "CANCELLED") return "rejected";
  return "pending";
};

const priorityToUi = (priority) => {
  const p = (priority || "").toUpperCase();
  if (p === "URGENT") return "Urgent";
  if (p === "HIGH") return "High";
  if (p === "LOW") return "Low";
  return "Medium";
};

const mapPrToUi = (pr, lines = []) => {
  const firstLine = lines[0];
  const productName = firstLine?.productName || pr.purpose || "General requirement";
  const rawCost = Number(firstLine?.estimatedAmount ?? pr.estimatedAmount ?? 0);
  const uiStatus = statusToUi(pr.approvalStatus || pr.status);
  const isApproved = uiStatus === "approved";
  const isRejected = uiStatus === "rejected";
  return {
    id: pr.requestNumber || `PR-${pr.id}`,
    numericId: pr.id,
    requester: pr.requesterName || "Team Member",
    email: "",
    role: "",
    empId: "",
    dept: pr.departmentName || "",
    costCenter: pr.costCenterName || "",
    product: productName,
    category: firstLine?.productName ? "Catalogue Item" : "General",
    vendor: "",
    cost: formatINR(rawCost),
    rawCost,
    priority: priorityToUi(pr.priority),
    status: uiStatus,
    date: formatDateIN(pr.requestDate || pr.createdAt, { withTime: false }) || "",
    time: "",
    justification: pr.purpose || "",
    projectCode: "",
    attachments: [],
    managerDecision: isApproved || isRejected
      ? {
          action: uiStatus,
          approvedBy: "Approval Workflow",
          decisionDate: pr.updatedAt ? formatDateIN(pr.updatedAt) : "",
          approvedCost: formatINR(rawCost),
          costCenterAllocated: pr.costCenterName || "—",
          slaTargetDate: pr.requiredDate ? formatDateIN(pr.requiredDate, { withTime: false }) : "—",
          notes: pr.remarks || (isApproved ? "Approved through the configured approval workflow." : "Rejected through the configured approval workflow."),
          verificationHash: `HASH-${pr.id}-${uiStatus.toUpperCase().slice(0, 4)}`,
        }
      : null,
  };
};

const TeamRequisitions = ({ onTrackForm }) => {
  const [teamRequests, setTeamRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [viewReq, setViewReq] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = await apiGet("/api/auth/me").catch(() => null);
      const deptId = me?.departmentId;
      const query = deptId
        ? `?departmentId=${deptId}&page=0&size=200&sort=createdAt&direction=desc`
        : "?page=0&size=200&sort=createdAt&direction=desc";
      const page = await apiGet(`/api/purchase-requests${query}`);
      const prs = page?.content || [];

      const withLines = await Promise.all(
        prs.map(async (pr) => {
          const linePage = await apiGet(`/api/purchase-request-lines?purchaseRequestId=${pr.id}&page=0&size=20`)
            .catch(() => null);
          return mapPrToUi(pr, linePage?.content || []);
        })
      );
      setTeamRequests(withLines);
    } catch (err) {
      setError(err.message || "Unable to load team requisitions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = teamRequests.filter((req) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (req.id && req.id.toLowerCase().includes(q)) ||
      (req.requester && req.requester.toLowerCase().includes(q)) ||
      (req.product && req.product.toLowerCase().includes(q));
    const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" ||
      (req.priority && req.priority.toLowerCase() === selectedPriority.toLowerCase());

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="dm-team-requisitions-container">
      {/* Header */}
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">
            <FileText color="#f8b400" /> Department Requisitions Directory
          </h1>
          <p className="dm-page-subtitle">
            Live purchase requisitions submitted within your department, straight from the database.
          </p>
        </div>

        <button
          className="dm-btn-primary-sm"
          onClick={() => alert("Exporting Department Requisitions CSV...")}
        >
          <Download size={16} /> Export Requisitions CSV
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="dm-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ position: "relative", width: "320px" }}>
            <Search
              size={16}
              color="#666666"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by ID, Requester, or Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dm-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                background: "#f8f9fb",
                padding: "3px",
                borderRadius: "10px",
                border: "1px solid #d9d9d9",
              }}
            >
              {["all", "pending", "approved", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: selectedStatus === st ? "#f8b400" : "transparent",
                    color: selectedStatus === st ? "#000000" : "#555555",
                    fontWeight: selectedStatus === st ? "700" : "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="dm-form-select"
              style={{ width: "160px", height: "42px", fontSize: "13px" }}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="dm-card">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
            <Loader2 size={22} className="login-spin" /> Loading requisitions from the database...
          </div>
        ) : (
          <div className="dm-table-container">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee / Role</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Est. Cost</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                      No requisitions found.
                    </td>
                  </tr>
                )}
                {filtered.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: "700", color: "#d97706" }}>{req.id}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "700", color: "#111111" }}>{req.requester}</span>
                        <span style={{ fontSize: "11px", color: "#666666" }}>{req.dept || "Team Member"}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: "600", color: "#111111" }}>{req.product}</td>
                    <td style={{ color: "#555555" }}>{req.category}</td>
                    <td style={{ fontWeight: "800", color: "#111111" }}>{req.cost}</td>
                    <td>
                      <span className={`emp-priority ${(req.priority || "medium").toLowerCase()}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`dm-badge ${req.status}`}>
                        <span className="dm-badge-dot"></span>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{req.date}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        {req.status === "approved" && onTrackForm && (
                          <button
                            className="dm-sidebar-toggle"
                            style={{
                              width: "32px",
                              height: "32px",
                              display: "inline-flex",
                              borderColor: "#059669",
                              color: "#059669",
                              background: "rgba(5, 150, 105, 0.08)",
                            }}
                            title="Track Approved Form Status"
                            onClick={() => onTrackForm(req.numericId || req.id)}
                          >
                            <Clock size={15} />
                          </button>
                        )}
                        <button
                          className="dm-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex" }}
                          title="View Full Requisition & Decision Form"
                          onClick={() => setViewReq(req)}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REACT PORTAL: FULL SCREEN ENTIRE FORM & MANAGER FILLED VIEW */}
      {viewReq &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 999999,
              background: "#f8f9fb",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top Bar */}
            <div
              style={{
                background: "#ffffff",
                borderBottom: "1px solid #ececec",
                padding: "16px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                zIndex: 10,
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#f8b400",
                    color: "#000000",
                    fontWeight: "800",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  EPS
                </div>
                <div>
                  <span
                    style={{
                      background: "rgba(248, 180, 0, 0.15)",
                      color: "#d97706",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "800",
                      marginRight: "8px",
                    }}
                  >
                    FULL AUDIT FORM VIEW
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: "800", color: "#111111" }}>
                    {viewReq.id}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "800" }}>
                Complete Purchase Requisition & Manager Decision Record
              </h3>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {viewReq.status === "approved" && onTrackForm && (
                  <button
                    className="dm-btn-primary-sm"
                    style={{ background: "#059669", border: "none", color: "#ffffff" }}
                    onClick={() => {
                      const reqId = viewReq.numericId || viewReq.id;
                      setViewReq(null);
                      onTrackForm(reqId);
                    }}
                  >
                    <Clock size={16} /> Track Live Workflow
                  </button>
                )}
                <button
                  onClick={() => setViewReq(null)}
                  className="dm-btn-primary-sm"
                  style={{
                    background: "#ffffff",
                    color: "#111111",
                    border: "1px solid #d9d9d9",
                    padding: "8px 16px",
                  }}
                >
                  <X size={18} /> Close Full View
                </button>
              </div>
            </div>

            {/* Full Screen Body Content - 2 Columns */}
            <div style={{ padding: "32px", maxWidth: "1500px", margin: "0 auto", width: "100%", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px", alignItems: "start" }}>
                
                {/* LEFT COLUMN: Entire Employee Filled Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* Employee Requester Details Card */}
                  <div className="dm-card">
                    <h4 style={{ fontSize: "16px", color: "#d97706", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <User size={18} /> 1. Employee Requester Profile & Metadata
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13.5px" }}>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Employee Name:</span>
                        <p style={{ color: "#111111", fontWeight: "700", fontSize: "15px" }}>{viewReq.requester}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Department:</span>
                        <p style={{ color: "#111111", fontWeight: "700" }}>{viewReq.dept || "—"}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Cost Center:</span>
                        <p style={{ color: "#111111", fontWeight: "600" }}>{viewReq.costCenter || "—"}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Submitted Date:</span>
                        <p style={{ color: "#111111", fontWeight: "600" }}>{viewReq.date}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Priority Urgency:</span>
                        <p style={{ marginTop: "2px" }}>
                          <span className={`emp-priority ${(viewReq.priority || "medium").toLowerCase()}`}>
                            {viewReq.priority} Priority
                          </span>
                        </p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Current Form Status:</span>
                        <p style={{ marginTop: "2px" }}>
                          <span className={`dm-badge ${viewReq.status}`}>
                            <span className="dm-badge-dot"></span>
                            {viewReq.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product Specs Card */}
                  <div className="dm-card">
                    <h4 style={{ fontSize: "16px", color: "#d97706", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={18} /> 2. Requested Product & Financial Specifications
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13.5px" }}>
                      <div style={{ gridColumn: "span 2" }}>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Product Item Name:</span>
                        <p style={{ color: "#111111", fontWeight: "800", fontSize: "17px" }}>{viewReq.product}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Category:</span>
                        <p style={{ color: "#111111", fontWeight: "600" }}>{viewReq.category}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Total Estimated Cost:</span>
                        <p style={{ color: "#059669", fontWeight: "800", fontSize: "18px" }}>{viewReq.cost}</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Justification Card */}
                  <div className="dm-card">
                    <h4 style={{ fontSize: "16px", color: "#d97706", fontWeight: "800", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building size={18} /> 3. Business Justification
                    </h4>
                    <div style={{ background: "#f8f9fb", padding: "16px", borderRadius: "10px", border: "1px solid #ececec" }}>
                      <p style={{ fontSize: "14px", color: "#333333", lineHeight: "1.6", fontStyle: "italic" }}>
                        "{viewReq.justification}"
                      </p>
                    </div>
                  </div>

                  {/* Attached Vendor Documents */}
                  <div className="dm-card">
                    <h4 style={{ fontSize: "16px", color: "#d97706", fontWeight: "800", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Paperclip size={18} /> 4. Attached Documents
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {(viewReq.attachments || []).length === 0 && (
                        <p style={{ fontSize: "13px", color: "#666" }}>No documents attached to this requisition.</p>
                      )}
                      {(viewReq.attachments || []).map((att, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            background: "#f8f9fb",
                            borderRadius: "10px",
                            border: "1px solid #ececec",
                          }}
                        >
                          <span style={{ color: "#111111", fontWeight: "700", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <Paperclip size={16} color="#f8b400" /> {att}
                          </span>
                          <button
                            className="dm-btn-primary-sm"
                            style={{ padding: "6px 14px", fontSize: "12px" }}
                            onClick={() => alert(`Downloading document: ${att}`)}
                          >
                            Download PDF
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Manager Filled Form & Decision Record */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "90px" }}>
                  <div className="dm-card dm-card-gold-glow" style={{ borderLeft: viewReq.status === "approved" ? "5px solid #059669" : viewReq.status === "rejected" ? "5px solid #dc2626" : "5px solid #f8b400" }}>
                    <div style={{ borderBottom: "1px solid #ececec", paddingBottom: "16px", marginBottom: "20px" }}>
                      <span style={{ fontSize: "11px", color: viewReq.status === "approved" ? "#059669" : viewReq.status === "rejected" ? "#dc2626" : "#d97706", fontWeight: "800", letterSpacing: "0.5px" }}>
                        APPROVAL STATUS
                      </span>
                      <h3 style={{ fontSize: "20px", color: "#111111", fontWeight: "800", marginTop: "4px" }}>
                        Workflow Decision Record
                      </h3>
                      <p style={{ fontSize: "13px", color: "#555555" }}>
                        Approval state as recorded by the configured approval workflow.
                      </p>
                    </div>

                    {/* MANAGER DECISION STATUS BOX */}
                    {viewReq.managerDecision ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        {/* Status Badge */}
                        <div
                          style={{
                            background: viewReq.status === "approved" ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                            border: viewReq.status === "approved" ? "1px solid #059669" : "1px solid #dc2626",
                            padding: "14px 18px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          {viewReq.status === "approved" ? (
                            <CheckCircle2 size={24} color="#059669" />
                          ) : (
                            <XCircle size={24} color="#dc2626" />
                          )}
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: viewReq.status === "approved" ? "#059669" : "#dc2626" }}>
                              DECISION RESULT
                            </span>
                            <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#111111", margin: "2px 0 0" }}>
                              {viewReq.status === "approved" ? "APPROVED" : "REJECTED"}
                            </h4>
                          </div>
                        </div>

                        {/* Manager Filled Fields Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                          <div style={{ gridColumn: "span 2" }}>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Decision By:</span>
                            <p style={{ fontWeight: "800", color: "#111111", fontSize: "14.5px" }}>
                              {viewReq.managerDecision.approvedBy}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Decision Timestamp:</span>
                            <p style={{ fontWeight: "700", color: "#111111" }}>{viewReq.managerDecision.decisionDate || "—"}</p>
                          </div>
                          <div>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Approved Amount:</span>
                            <p style={{ fontWeight: "800", color: viewReq.status === "approved" ? "#059669" : "#dc2626", fontSize: "15px" }}>
                              {viewReq.managerDecision.approvedCost}
                            </p>
                          </div>
                          <div style={{ gridColumn: "span 2" }}>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Allocated Cost Center:</span>
                            <p style={{ fontWeight: "700", color: "#111111" }}>{viewReq.managerDecision.costCenterAllocated}</p>
                          </div>
                          <div>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Target SLA Fulfillment:</span>
                            <p style={{ fontWeight: "700", color: "#111111" }}>{viewReq.managerDecision.slaTargetDate}</p>
                          </div>
                          <div>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Security Hash:</span>
                            <p style={{ fontSize: "10px", color: "#666666", fontFamily: "monospace", fontWeight: "700" }}>
                              {viewReq.managerDecision.verificationHash}
                            </p>
                          </div>
                        </div>

                        {/* Manager Notes */}
                        <div>
                          <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>
                            Remarks:
                          </span>
                          <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", marginTop: "6px" }}>
                            <p style={{ fontSize: "13.5px", color: "#222222", lineHeight: "1.5" }}>
                              {viewReq.managerDecision.notes}
                            </p>
                          </div>
                        </div>

                        {/* Track button for approved forms */}
                        {viewReq.status === "approved" && onTrackForm && (
                          <button
                            className="dm-btn-primary-sm"
                            style={{
                              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                              color: "#ffffff",
                              fontWeight: "800",
                              padding: "12px 20px",
                              width: "100%",
                              justifyContent: "center",
                              marginTop: "8px",
                            }}
                            onClick={() => {
                              const reqId = viewReq.numericId || viewReq.id;
                              setViewReq(null);
                              onTrackForm(reqId);
                            }}
                          >
                            <Clock size={18} /> Track Live Workflow Pipeline
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Pending Manager Decision State */
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div
                          style={{
                            background: "rgba(248, 180, 0, 0.15)",
                            border: "1px solid #f8b400",
                            padding: "16px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <Clock size={24} color="#d97706" />
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#d97706" }}>
                              DECISION STATUS
                            </span>
                            <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#111111", margin: "2px 0 0" }}>
                              PENDING REVIEW
                            </h4>
                          </div>
                        </div>

                        <p style={{ fontSize: "13px", color: "#555555", lineHeight: "1.5" }}>
                          This requisition has been submitted by employee <strong>{viewReq.requester}</strong> and is currently waiting for review and sign-off in your Approval Queue.
                        </p>

                        <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", fontSize: "12.5px", color: "#666" }}>
                          <span style={{ fontWeight: "700", color: "#111" }}>Next Step:</span> Open the Approval Queue to approve, reject, or request clarification on this requisition.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TeamRequisitions;
