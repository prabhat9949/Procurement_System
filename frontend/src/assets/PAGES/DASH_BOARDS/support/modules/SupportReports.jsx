import React, { useState } from "react";
import {
  FolderKanban,
  Download,
  FileText,
  Calendar,
  Search,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

const initialReports = [
  { id: "REP-SUP-2026-01", title: "Q2_2026_Enterprise_Support_Desk_SLA_Audit.pdf", category: "SLA Resolution", size: "4.5 MB", date: "2026-07-01" },
  { id: "REP-SUP-2026-02", title: "Customer_Vendor_CSAT_Satisfaction_Summary_July.pdf", category: "CSAT Feedback", size: "2.8 MB", date: "2026-07-20" },
  { id: "REP-SUP-2026-03", title: "Escalations_Department_Performance_Review.xlsx", category: "Escalation Report", size: "1.9 MB", date: "2026-07-26" },
  { id: "REP-SUP-2026-04", title: "Monthly_Support_Performance_Report_June.pdf", category: "Monthly Summary", size: "3.7 MB", date: "2026-07-05" }
];

const SupportReports = () => {
  const [reports, setReports] = useState(initialReports);
  const [activeSubTab, setActiveSubTab] = useState("all-reports"); // all-reports, custom
  const [searchTerm, setSearchTerm] = useState("");

  // Custom Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deptSelector, setDeptSelector] = useState("All Departments");
  const [reportFormat, setReportFormat] = useState("PDF");
  const [success, setSuccess] = useState(false);

  const triggerDownload = (title) => {
    alert(`Downloading compliance report: ${title}...`);
  };

  const handleGenerateCustom = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      // Add custom report mock
      const newReport = {
        id: `REP-SUP-2026-0${reports.length + 1}`,
        title: `Custom_Support_${deptSelector.replace(/\s+/g, "_")}_Performance.${reportFormat.toLowerCase()}`,
        category: "Custom Report",
        size: "1.2 MB",
        date: new Date().toISOString().split("T")[0],
      };
      setReports([newReport, ...reports]);
      setActiveSubTab("all-reports");
    }, 2000);
  };

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sup-reports-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sup-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sup-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <FolderKanban color="#f8b400" size={28} /> Support Reports Hub
          </h1>
          <p className="sup-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            View and export support team resolution rates, SLA performance audits, escalation breakdowns, and custom range satisfaction summaries.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("all-reports")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "all-reports" ? "700" : "500",
            color: activeSubTab === "all-reports" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "all-reports" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          All Support & SLA Reports
        </button>
        <button
          onClick={() => setActiveSubTab("custom")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "custom" ? "700" : "500",
            color: activeSubTab === "custom" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "custom" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Generate Custom Report
        </button>
      </div>

      {/* 1. All Reports Tab */}
      {activeSubTab === "all-reports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Search bar */}
          <div className="sup-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <div style={{ position: "relative", width: "360px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search report titles, categories..."
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
          </div>

          {/* Grid list */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {filteredReports.map((r) => (
              <div key={r.id} className="sup-card" style={{ padding: "20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
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
                    <h4 style={{ color: "#111111", fontSize: "14px", fontWeight: "700", margin: "4px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.title}
                    </h4>
                    <p style={{ fontSize: "12px", color: "#666666" }}>
                      {r.size} • Generated {r.date}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #ececec", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="sup-btn-primary-sm"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    onClick={() => triggerDownload(r.title)}
                  >
                    <Download size={14} /> Download Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Custom Generation Tab */}
      {activeSubTab === "custom" && (
        <div className="sup-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "560px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px" }}>
            Generate Custom Support Report
          </h3>

          {success && (
            <div style={{ background: "rgba(5, 150, 105, 0.12)", color: "#059669", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} /> Generating custom support performance metrics log...
            </div>
          )}

          <form onSubmit={handleGenerateCustom} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sup-form-group">
                <label className="sup-form-label">Start Date *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="sup-form-input" required />
              </div>
              <div className="sup-form-group">
                <label className="sup-form-label">End Date *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="sup-form-input" required />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sup-form-group">
                <label className="sup-form-label">Target Support Area *</label>
                <select value={deptSelector} onChange={(e) => setDeptSelector(e.target.value)} className="sup-form-select">
                  <option value="All Departments">All Departments</option>
                  <option value="Procurement Support Desk">Procurement Support Desk</option>
                  <option value="Vendor Operations Desk">Vendor Operations Desk</option>
                  <option value="Finance Support Desk">Finance Support Desk</option>
                  <option value="Warehouse Support Desk">Warehouse Support Desk</option>
                </select>
              </div>
              <div className="sup-form-group">
                <label className="sup-form-label">File Export Format *</label>
                <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="sup-form-select">
                  <option value="PDF">PDF Document (.pdf)</option>
                  <option value="Excel">Excel Worksheet (.xlsx)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="sup-btn-primary-sm" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}>
              Generate Custom Performance Report
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default SupportReports;
