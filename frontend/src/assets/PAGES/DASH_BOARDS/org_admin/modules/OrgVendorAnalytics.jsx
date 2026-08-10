import React from "react";
import { Truck, Star, ShieldCheck } from "lucide-react";

const vendorAnalyticsMock = [
  { vendor: "Apple Business Direct", tier: "Tier 1 Preferred", spend: "$520,800.00", SLA: "99.2%", rating: "4.9 ⭐" },
  { vendor: "Dell Technologies", tier: "Tier 1 Preferred", spend: "$347,200.00", SLA: "97.0%", rating: "4.8 ⭐" },
];

const OrgVendorAnalytics = () => {
  return (
    <div className="org-vnd-analytics-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <Truck color="#f8b400" /> Supplier & Vendor Network Analytics
          </h1>
          <p className="org-page-subtitle">
            Commercial spend per supplier, vendor SLA fulfillment ratings, and preferred supplier distribution.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="org-card">
        <div className="org-table-container">
          <table className="org-table">
            <thead>
              <tr>
                <th>Supplier / Vendor</th>
                <th>Classification Tier</th>
                <th>Commercial Spend YTD</th>
                <th>SLA Fulfillment %</th>
                <th>Overall CSAT Rating</th>
              </tr>
            </thead>
            <tbody>
              {vendorAnalyticsMock.map((v, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "800", color: "#111111" }}>{v.vendor}</td>
                  <td style={{ fontWeight: "700", color: "#d97706" }}>{v.tier}</td>
                  <td style={{ fontWeight: "800", color: "#059669" }}>{v.spend}</td>
                  <td style={{ fontWeight: "700" }}>{v.SLA}</td>
                  <td style={{ fontWeight: "700", color: "#f8b400" }}>{v.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrgVendorAnalytics;
