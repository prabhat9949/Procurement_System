import React, { useState, useEffect } from "react";
import CreateRfqWizardModal from "./CreateRfqWizardModal";
import {
  FileText,
  Search,
  Send,
  ShoppingBag,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  X,
  FileCheck,
} from "lucide-react";
import { getPurchaseRequests } from "../../../../../services/purchaseRequestService";

const toProcurementRequest = (request) => ({
  ...request,
  id: request.requestNumber || String(request.id),
  backendId: request.id,
  requester: request.requesterName || request.requester?.fullName || "—",
  dept: request.departmentName || "—",
  managerApprovedBy: "Recorded in approval history",
  product: request.purpose || "—",
  targetCost: request.estimatedAmount === null || request.estimatedAmount === undefined ? "—" : `₹${Number(request.estimatedAmount).toLocaleString("en-IN")}`,
  priority: request.priority || "NORMAL",
  category: request.categoryName || "—",
  status: request.status || "—",
});

const PurchaseRequests = ({ onNavigate }) => {
  const [reqs, setReqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeReqModal, setActiveReqModal] = useState(null);
  const [targetReq, setTargetReq] = useState(null);
  const [showRfqWizardModal, setShowRfqWizardModal] = useState(false);
  const [selectedReqForRfq, setSelectedReqForRfq] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true); setLoadError("");
    try {
      const data = await getPurchaseRequests({ status: "APPROVED" });
      setReqs((Array.isArray(data) ? data : data?.content || []).map(toProcurementRequest));
    } catch (error) { setLoadError(error.message || "Unable to load approved purchase requests."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = reqs.filter((req) => {
    const matchesSearch =
      (req.id && req.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.product && req.product.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.requester && req.requester.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority =
      selectedPriority === "all" ||
      (req.priority && req.priority.toLowerCase() === selectedPriority.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      (req.category && req.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesPriority && matchesCat;
  });

  return (
    <div className="pe-purchase-requests-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <FileText color="#f8b400" /> Manager-Approved Requisitions Hub
          </h1>
          <p className="pe-page-subtitle">
            Review approved purchase requests ready for RFQ creation or direct Purchase Order issuance.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            background: "rgba(5, 150, 105, 0.12)",
            border: "1px solid #059669",
            color: "#059669",
            padding: "14px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontWeight: "700",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="pe-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ position: "relative", width: "340px" }}>
            <Search
              size={16}
              color="#666666"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by REQ ID, Item, or Requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="pe-form-select"
              style={{ width: "160px", height: "42px", fontSize: "13px" }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pe-form-select"
              style={{ width: "180px", height: "42px", fontSize: "13px" }}
            >
              <option value="all">All Categories</option>
              <option value="hardware">Hardware & IT</option>
              <option value="software">Software & SaaS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="pe-card">
        <div className="pe-table-container">
          <table className="pe-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Requester / Dept</th>
                <th>Approved By</th>
                <th>Product Name</th>
                <th>Est. Target Cost</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="7" style={{ padding: 28, textAlign: "center" }}>Loading approved requisitions…</td></tr>}
              {!loading && loadError && <tr><td colSpan="7" style={{ padding: 28, textAlign: "center", color: "#b91c1c" }}>{loadError} <button className="pe-btn-primary-sm" onClick={load}>Retry</button></td></tr>}
              {!loading && !loadError && filtered.length === 0 && <tr><td colSpan="7" style={{ padding: 28, textAlign: "center" }}>No approved purchase requests are ready for procurement.</td></tr>}
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: "700", color: "#d97706" }}>{req.id}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "700", color: "#111111" }}>{req.requester}</span>
                      <span style={{ fontSize: "11px", color: "#666666" }}>{req.dept}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "13px", color: "#059669", fontWeight: "600" }}>
                    {req.managerApprovedBy}
                  </td>
                  <td style={{ fontWeight: "600", color: "#111111" }}>{req.product}</td>
                  <td style={{ fontWeight: "800", color: "#111111" }}>{req.targetCost}</td>
                  <td>
                    <span className={`emp-priority ${req.priority.toLowerCase()}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {req.status === "RFQ_CREATED" ? (
                        <span
                          style={{
                            background: "rgba(5, 150, 105, 0.12)",
                            color: "#059669",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "800",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            border: "1px solid rgba(5, 150, 105, 0.3)"
                          }}
                        >
                          <CheckCircle2 size={14} /> RFQ Issued
                        </span>
                      ) : (
                        <button
                          className="pe-btn-primary-sm"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => {
                            setSelectedReqForRfq({ ...req, id: req.backendId });
                            setShowRfqWizardModal(true);
                          }}
                        >
                          <Send size={13} /> Create RFQ
                        </button>
                      )}
                      <span title="A purchase order can only be created from a backend quotation comparison." style={{ fontSize: "12px", color: "#666" }}><ShoppingBag size={13} /> Comparison required</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL-SCREEN CREATE RFQ WIZARD MODAL */}
      {showRfqWizardModal && (
        <CreateRfqWizardModal
          initialReqData={selectedReqForRfq}
          onClose={() => setShowRfqWizardModal(false)}
          onRfqCreated={async (createdRfqObj) => {
            setShowRfqWizardModal(false);
            setToastMsg(`RFQ ${createdRfqObj.rfqNumber || createdRfqObj.id} was created successfully.`);
            setTimeout(() => setToastMsg(""), 5000);
            load();
          }}
        />
      )}
    </div>
  );
};

export default PurchaseRequests;
