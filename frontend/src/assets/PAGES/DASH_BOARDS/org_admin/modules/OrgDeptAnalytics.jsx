import React from "react";
import { Building2, Activity } from "lucide-react";

const deptMatrixMock = [
  { dept: "Engineering & IT", head: "Robert Vance", users: 42, reqs: 48, spend: "$384,200", SLA: "99.1%" },
  { dept: "DevOps & Cloud Infra", head: "Tech Operations", users: 28, reqs: 34, spend: "$312,000", SLA: "98.5%" },
  { dept: "Product & UI/UX Design", head: "Product Lead", users: 18, reqs: 22, spend: "$168,500", SLA: "97.8%" },
  { dept: "Marketing & Growth", head: "Marketing Lead", users: 24, reqs: 28, spend: "$224,000", SLA: "98.0%" },
  { dept: "HR & Corporate Ops", head: "HR Lead", users: 15, reqs: 18, spend: "$144,200", SLA: "97.5%" },
];

const OrgDeptAnalytics = () => {
  return (
    <div className="org-dept-analytics-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <Building2 color="#f8b400" /> Departmental Performance & Cost Center Matrix
          </h1>
          <p className="org-page-subtitle">
            Cross-departmental comparison of user headcount, requisition volume, commercial spend, and SLA velocity.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="org-card">
        <div className="org-table-container">
          <table className="org-table">
            <thead>
              <tr>
                <th>Cost Center / Department</th>
                <th>Department Lead</th>
                <th>Active Users</th>
                <th>Requisitions YTD</th>
                <th>Consumed Spend</th>
                <th>Department SLA %</th>
              </tr>
            </thead>
            <tbody>
              {deptMatrixMock.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "800", color: "#111111" }}>{d.dept}</td>
                  <td style={{ color: "#555555" }}>{d.head}</td>
                  <td style={{ fontWeight: "700" }}>{d.users} Members</td>
                  <td style={{ fontWeight: "700", color: "#d97706" }}>{d.reqs}</td>
                  <td style={{ fontWeight: "800", color: "#059669" }}>{d.spend}</td>
                  <td style={{ fontWeight: "700", color: "#059669" }}>{d.SLA}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrgDeptAnalytics;
