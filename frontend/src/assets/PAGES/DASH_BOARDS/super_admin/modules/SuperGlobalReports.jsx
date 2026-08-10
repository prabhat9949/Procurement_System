import React, { useState } from "react";
import { FolderKanban, Download, FileText, Search } from "lucide-react";

const initialReportsList = [
  { id: "REP-PRC-01", title: "Global_Procurement_Disbursement_Analysis_Q2.pdf", category: "Procurement Report", size: "12.4 MB", date: "2026-07-20", format: "PDF" },
  { id: "REP-FIN-02", title: "CFO_Remittance_Compliance_Audit_Statement.xlsx", category: "Financial Report", size: "4.2 MB", date: "2026-07-25", format: "Excel" },
  { id: "REP-INV-03", title: "Global_Warehouse_Intake_Audit_Logs.pdf", category: "Inventory Report", size: "8.8 MB", date: "2026-07-22", format: "PDF" },
  { id: "REP-VND-04", title: "Preferred_Supplier_SLA_Scorecards.pdf", category: "Vendor Report", size: "3.5 MB", date: "2026-07-24", format: "PDF" },
  { id: "REP-SEC-05", title: "Azure_AWS_Sentinel_Threat_Detection_Report.xlsx", category: "Security Report", size: "2.1 MB", date: "2026-07-27", format: "Excel" },
  { id: "REP-ORG-06", title: "Global_Tenant_Subsidiary_Standing_Summary.pdf", category: "Organization Report", size: "6.1 MB", date: "2026-07-15", format: "PDF" }
];

const SuperGlobalReports = () => {
  const [reports, setReports] = useState(initialReportsList);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("browse");

  // Generator form
  const [genCategory, setGenCategory] = useState("Procurement Report");
  const [genFormat, setGenFormat] = useState("PDF");

  const handleDownload = (title) => {
    alert(`Downloading ${title}...`);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    const newRep = {
      id: `REP-GEN-${Math.floor(Math.random() * 900 + 100)}`,
      title: `Generated_${genCategory.replace(" ", "_")}_Telemtry.${genFormat.toLowerCase()}`,
      category: genCategory,
      size: "2.8 MB",
      date: new Date().toISOString().split("T")[0],
      format: genFormat
    };
    setReports([newRep, ...reports]);
    setActiveSubTab("browse");
    alert(`Custom report generated successfully and added to browse list.`);
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="sadmin-reports-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <FolderKanban color="#f8b400" size={28} /> Master Global Reports Hub
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            View and download procurement, financial, inventory, vendor, security, and organization telemetry reports.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("browse")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "browse" ? "700" : "500",
            color: activeSubTab === "browse" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "browse" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Browse Reports Repository
        </button>
        <button
          onClick={() => setActiveSubTab("generate")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "generate" ? "700" : "500",
            color: activeSubTab === "generate" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "generate" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Generate Custom Global Report
        </button>
      </div>

      {/* Search and Filters */}
      {activeSubTab === "browse" && (
        <div className="sadmin-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", width: "300px" }}>
            <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search Report Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 38px",
                borderRadius: "8px",
                border: "1px solid #d9d9d9",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}
            >
              <option value="All">All Categories</option>
              <option value="Procurement Report">Procurement Reports</option>
              <option value="Financial Report">Financial Reports</option>
              <option value="Inventory Report">Inventory Reports</option>
              <option value="Vendor Report">Vendor Reports</option>
              <option value="Security Report">Security Reports</option>
              <option value="Organization Report">Organization Reports</option>
            </select>
          </div>
        </div>
      )}

      {/* 1. Browse Tab */}
      {activeSubTab === "browse" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredReports.map((r) => (
            <div key={r.id} className="sadmin-card" style={{ padding: "20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
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
                  <FileText size={22} />
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>
                    {r.category.toUpperCase()} • {r.id}
                  </span>
                  <h4 style={{ color: "#111", fontSize: "14px", fontWeight: "700", margin: "4px 0", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {r.title}
                  </h4>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    {r.size} • Generated {r.date}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #ececec", display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="sadmin-btn-primary-sm"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => handleDownload(r.title)}
                >
                  <Download size={14} /> Download {r.format}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Generate Tab */}
      {activeSubTab === "generate" && (
        <div className="sadmin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "520px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px" }}>
            Generate Custom System Report
          </h3>
          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Report Category</label>
              <select value={genCategory} onChange={(e) => setGenCategory(e.target.value)} className="sadmin-form-select">
                <option value="Procurement Report">Procurement Reports</option>
                <option value="Financial Report">Financial Reports</option>
                <option value="Inventory Report">Inventory Reports</option>
                <option value="Vendor Report">Vendor Reports</option>
                <option value="Security Report">Security Reports</option>
                <option value="Organization Report">Organization Reports</option>
              </select>
            </div>

            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Export File Format</label>
              <select value={genFormat} onChange={(e) => setGenFormat(e.target.value)} className="sadmin-form-select">
                <option value="PDF">PDF Document</option>
                <option value="Excel">Excel Spreadsheet</option>
              </select>
            </div>

            <button type="submit" className="sadmin-btn-primary-sm" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}>
              Request System Compilation
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default SuperGlobalReports;
