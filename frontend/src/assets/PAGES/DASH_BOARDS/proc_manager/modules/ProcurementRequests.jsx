import React, { useState } from "react";
import {
  FileText,
  Search,
  Download,
  Eye,
  X,
} from "lucide-react";

const allRequestsMock = [
  {
    id: "REQ-2026-8921",
    requester: "Alex Morgan",
    dept: "Engineering & IT",
    product: "MacBook Pro M3 Max 64GB (x10)",
    category: "Hardware & IT",
    cost: "$38,990.00",
    priority: "Urgent",
    status: "approved",
    date: "2026-07-24",
  },
  {
    id: "REQ-2026-8945",
    requester: "David Miller",
    dept: "DevOps & Cloud",
    product: "Datadog APM Enterprise Renewal",
    category: "Software & SaaS",
    cost: "$8,500.00",
    priority: "High",
    status: "approved",
    date: "2026-07-25",
  },
  {
    id: "REQ-2026-8894",
    requester: "Hannah Lee",
    dept: "Product & UI/UX",
    product: "Figma Enterprise License (20 Seats)",
    category: "Software & SaaS",
    cost: "$4,500.00",
    priority: "High",
    status: "completed",
    date: "2026-07-20",
  },
  {
    id: "REQ-2026-8850",
    requester: "James Kim",
    dept: "QA Engineering",
    product: "Ergonomic Office Chairs (x5)",
    category: "Office Supplies",
    cost: "$1,250.00",
    priority: "Medium",
    status: "completed",
    date: "2026-07-15",
  },
];

const ProcurementRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewReq, setViewReq] = useState(null);

  const filtered = allRequestsMock.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || req.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pman-requests-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <FileText color="#f8b400" /> Organizational Purchase Requests Directory
          </h1>
          <p className="pman-page-subtitle">
            Comprehensive audit registry of all employee purchase requisitions submitted across departments.
          </p>
        </div>

        <button
          className="pman-btn-primary-sm"
          onClick={() => alert("Exporting Organizational Purchase Requests CSV...")}
        >
          <Download size={16} /> Export All Requisitions CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
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
              placeholder="Search REQ ID, Requester, or Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pman-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              background: "#f8f9fb",
              padding: "3px",
              borderRadius: "10px",
              border: "1px solid #d9d9d9",
            }}
          >
            {["all", "pending", "approved", "completed"].map((st) => (
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
        </div>
      </div>

      {/* Table */}
      <div className="pman-card">
        <div className="pman-table-container">
          <table className="pman-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee / Dept</th>
                <th>Product Description</th>
                <th>Category</th>
                <th>Total Cost</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: "800", color: "#d97706" }}>{req.id}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "700", color: "#111111" }}>{req.requester}</span>
                      <span style={{ fontSize: "11px", color: "#666666" }}>{req.dept}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: "600", color: "#111111" }}>{req.product}</td>
                  <td style={{ color: "#555555" }}>{req.category}</td>
                  <td style={{ fontWeight: "800", color: "#111111" }}>{req.cost}</td>
                  <td>
                    <span className={`emp-priority ${req.priority.toLowerCase()}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`pman-badge ${req.status}`}>
                      <span className="pman-badge-dot"></span>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ color: "#666666", fontSize: "13px" }}>{req.date}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="pman-sidebar-toggle"
                      style={{ width: "32px", height: "32px", display: "inline-flex" }}
                      onClick={() => setViewReq(req)}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {viewReq && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "560px" }}>
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #ececec",
                paddingBottom: "14px",
                marginBottom: "18px",
              }}
            >
              <div>
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800" }}>
                  ORGANIZATIONAL AUDIT VIEW
                </span>
                <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700" }}>
                  {viewReq.id}
                </h2>
              </div>
              <button
                onClick={() => setViewReq(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                    Requester Employee
                  </label>
                  <p style={{ fontWeight: "700", color: "#111111" }}>{viewReq.requester}</p>
                  <p style={{ fontSize: "12px", color: "#666666" }}>{viewReq.dept}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                    Total Estimated Cost
                  </label>
                  <p style={{ fontSize: "18px", fontWeight: "800", color: "#d97706" }}>
                    {viewReq.cost}
                  </p>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                  Item Specification
                </label>
                <p style={{ fontWeight: "700", color: "#111111" }}>{viewReq.product}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button className="pman-btn-primary-sm" onClick={() => setViewReq(null)}>
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementRequests;
