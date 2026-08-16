import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  Eye,
  ArrowRight,
  X,
  Calendar,
  MapPin,
  Layers,
  Package,
  Clock,
  Filter,
  FileText,
  Loader2,
  WifiOff,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatDateIN } from "../../../../../utils/format";

const statusToUi = (s) => {
  const map = { OPEN: "Open", DRAFT: "Draft", CLOSED: "Closed", AWARDED: "Awarded", CANCELLED: "Cancelled" };
  return map[s] || s;
};

const VendorProcRequests = ({ onNavigate }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeView, setActiveView] = useState("received"); // 'received' or 'history'

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/vendor/my/rfqs?page=0&size=50");
      setRequests(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load procurement opportunities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Map scoped RFQ records to the opportunity view model.
  const mockRequests = requests.map((rfq) => {
    const lines = rfq.lines || [];
    const itemName = rfq.item || (lines[0] ? lines[0].productName : "General requirement");
    const qty = rfq.quantity || (lines.length ? lines.reduce((a, l) => a + Number(l.quantity || 0), 0) : 1);
    const uiStatus = statusToUi(rfq.status);
    const specText = rfq.remarks || (lines.length ? lines.map((l) => `${l.productName} (${l.sku}) × ${l.quantity}`).join("; ") : "Refer to RFQ details.");
    return {
      id: rfq.rfqNumber,
      buyer: "Enterprise Procurement",
      dept: "Procurement",
      item: itemName,
      productRequirements: specText,
      targetQty: qty,
      category: lines[0]?.productName ? "Catalogue Item" : "General",
      publishDate: rfq.issueDate ? formatDateIN(rfq.issueDate, { withTime: false }) : "",
      deadline: rfq.closingDate ? formatDateIN(rfq.closingDate, { withTime: false }) : "",
      deliveryRequirements: "As per the RFQ requirements. Delivery details are shared with the awarded vendor.",
      status: uiStatus,
      isHistory: rfq.status === "CLOSED" || rfq.status === "AWARDED" || rfq.status === "CANCELLED",
    };
  });

  const categories = ["All", "Catalogue Item", "General"];
  const statuses = ["All", "Open", "Under Review", "Closed", "Awarded"];

  // Filter requests
  const filteredRequests = mockRequests.filter((req) => {
    const matchesSearch =
      (req.item || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.buyer || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || req.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || req.status === selectedStatus;

    const matchesTab =
      activeView === "received" ? !req.isHistory : req.isHistory;

    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  if (loading) {
    return (
      <div className="vnd-proc-requests-container" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "80px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading procurement opportunities...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vnd-proc-requests-container" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vnd-proc-requests-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="vnd-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", color: "#111111", fontWeight: "700" }}>
            <ShoppingBag color="#f8b400" size={28} /> Procurement Opportunities & Requests
          </h1>
          <p className="vnd-page-subtitle" style={{ color: "#666666", fontSize: "14px", marginTop: "4px" }}>
            View and review procurement opportunities, specifications, and deadlines shared with your organization.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "20px", paddingBottom: "1px" }}>
        <button
          onClick={() => {
            setActiveView("received");
            setSelectedStatus("All");
          }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeView === "received" ? "700" : "500",
            color: activeView === "received" ? "#d97706" : "#666666",
            borderBottom: activeView === "received" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Procurement Requests Received
        </button>
        <button
          onClick={() => {
            setActiveView("history");
            setSelectedStatus("All");
          }}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeView === "history" ? "700" : "500",
            color: activeView === "history" ? "#d97706" : "#666666",
            borderBottom: activeView === "history" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Request History
        </button>
      </div>

      {/* Search and Filters Section */}
      <div className="vnd-card" style={{ padding: "20px", marginBottom: "24px", background: "#ffffff", borderRadius: "12px", border: "1px solid #ececec" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          
          {/* Search bar */}
          <div style={{ flex: "1", minWidth: "260px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888888" }} />
            <input
              type="text"
              placeholder="Search by ID, product, or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                borderRadius: "8px",
                border: "1px solid #d9d9d9",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={16} color="#666666" />
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #d9d9d9",
                fontSize: "14px",
                background: "#fff",
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #d9d9d9",
                fontSize: "14px",
                background: "#fff",
              }}
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Grid/List */}
      {filteredRequests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "12px", border: "1px solid #ececec" }}>
          <FileText size={48} color="#cccccc" style={{ marginBottom: "12px" }} />
          <h3 style={{ fontSize: "18px", color: "#333", fontWeight: "600" }}>No procurement requests found</h3>
          <p style={{ color: "#777", fontSize: "14px", marginTop: "4px" }}>
            Try adjusting your search filters or check back later for new updates.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="vnd-card vnd-card-gold-glow"
              style={{
                background: "#ffffff",
                border: "1px solid #ececec",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800", background: "rgba(248, 180, 0, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                      {req.id}
                    </span>
                    <span style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>
                      Category: {req.category}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background:
                          req.status === "Open"
                            ? "rgba(5, 150, 105, 0.12)"
                            : req.status === "Under Review"
                            ? "rgba(217, 119, 6, 0.12)"
                            : "rgba(220, 38, 38, 0.12)",
                        color:
                          req.status === "Open"
                            ? "#059669"
                            : req.status === "Under Review"
                            ? "#d97706"
                            : "#dc2626",
                        border: `1px solid ${
                          req.status === "Open"
                            ? "rgba(5, 150, 105, 0.3)"
                            : req.status === "Under Review"
                            ? "rgba(217, 119, 6, 0.3)"
                            : "rgba(220, 38, 38, 0.3)"
                        }`,
                      }}
                    >
                      {req.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "10px", marginBottom: "4px" }}>
                    {req.item}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#555555" }}>
                    Buyer: <strong>{req.buyer}</strong> • Department: <strong>{req.dept}</strong>
                  </p>

                  <div style={{ display: "flex", gap: "24px", marginTop: "12px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#666" }}>
                      <Package size={15} color="#888" />
                      <span>Qty: <strong>{req.targetQty} units</strong></span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#666" }}>
                      <Calendar size={15} color="#888" />
                      <span>Deadline: <strong style={{ color: "#dc2626" }}>{req.deadline}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setSelectedRequest(req)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#f8f9fb",
                      color: "#111",
                      border: "1px solid #d9d9d9",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    <Eye size={16} /> View Details
                  </button>
                  
                  {req.status === "Open" && (
                    <button
                      className="vnd-btn-primary-sm"
                      onClick={() => onNavigate("rfqs")}
                      style={{ padding: "8px 14px" }}
                    >
                      Bid RFQ <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                background: "#f8f9fb",
                borderBottom: "1px solid #ececec",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>
                  Opportunity Details
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>
                  {selectedRequest.id} - {selectedRequest.item}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                
                {/* Status Row */}
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f2f2f2", paddingBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#666" }}>Procurement Status</span>
                    <div style={{ marginTop: "4px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          background:
                            selectedRequest.status === "Open"
                              ? "rgba(5, 150, 105, 0.12)"
                              : selectedRequest.status === "Under Review"
                              ? "rgba(217, 119, 6, 0.12)"
                              : "rgba(220, 38, 38, 0.12)",
                          color:
                            selectedRequest.status === "Open"
                              ? "#059669"
                              : selectedRequest.status === "Under Review"
                              ? "#d97706"
                              : "#dc2626",
                          border: `1px solid ${
                            selectedRequest.status === "Open"
                              ? "rgba(5, 150, 105, 0.3)"
                              : selectedRequest.status === "Under Review"
                              ? "rgba(217, 119, 6, 0.3)"
                              : "rgba(220, 38, 38, 0.3)"
                          }`,
                        }}
                      >
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>Submission Deadline</span>
                    <div style={{ marginTop: "4px", fontWeight: "700", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                      <Clock size={14} />
                      {selectedRequest.deadline}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Layers size={16} color="#f8b400" /> Product Requirements & Specifications
                  </h4>
                  <div
                    style={{
                      background: "#f8f9fb",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#444444",
                      lineHeight: "1.5",
                      borderLeft: "4px solid #f8b400",
                    }}
                  >
                    {selectedRequest.productRequirements}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "4px" }}>
                    Quantity Required
                  </h4>
                  <p style={{ fontSize: "14px", color: "#111", fontWeight: "600" }}>
                    {selectedRequest.targetQty} units
                  </p>
                </div>

                {/* Delivery Requirements */}
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={16} color="#d97706" /> Delivery Requirements
                  </h4>
                  <p style={{ fontSize: "14px", color: "#444", background: "#fff9f0", padding: "12px", borderRadius: "8px", border: "1px solid rgba(217,119,6,0.15)" }}>
                    {selectedRequest.deliveryRequirements}
                  </p>
                </div>

                {/* Extra Metadata */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderTop: "1px solid #f2f2f2", paddingTop: "12px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Target Category</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginTop: "2px" }}>{selectedRequest.category}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Published Date</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginTop: "2px" }}>{selectedRequest.publishDate}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                padding: "20px",
                background: "#f8f9fb",
                borderTop: "1px solid #ececec",
              }}
            >
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: "#f8f9fb",
                  color: "#111",
                  border: "1px solid #d9d9d9",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              
              {selectedRequest.status === "Open" && (
                <button
                  className="vnd-btn-primary-sm"
                  onClick={() => {
                    setSelectedRequest(null);
                    onNavigate("rfqs");
                  }}
                  style={{ padding: "10px 18px" }}
                >
                  Proceed to Bidding <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProcRequests;
