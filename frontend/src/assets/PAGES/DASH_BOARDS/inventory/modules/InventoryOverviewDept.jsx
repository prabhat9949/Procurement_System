import React from "react";
import { Warehouse, Boxes, PackageCheck } from "lucide-react";

const warehouseZonesMock = [
  {
    name: "Zone A - Main Tech Hardware Warehouse",
    location: "Central Building 4 - Ground Floor",
    capacity: "88% Occupied",
    skus: 210,
    totalUnits: 4500,
    manager: "Marcus Vance",
  },
  {
    name: "Zone B - SaaS & License Digital Vault",
    location: "Encrypted Cloud Storage Node",
    capacity: "45% Occupied",
    skus: 140,
    totalUnits: 6200,
    manager: "Digital Security Desk",
  },
  {
    name: "Zone C - Office Ergonomics & Facilities",
    location: "Annex Building 2 - Floor 1",
    capacity: "76% Occupied",
    skus: 132,
    totalUnits: 1750,
    manager: "Facilities Ops",
  },
];

const InventoryOverviewDept = () => {
  return (
    <div className="inv-overview-dept-container">
      {/* Header */}
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title">
            <Warehouse color="#f8b400" /> Multi-Zone Warehouse Overview
          </h1>
          <p className="inv-page-subtitle">
            Cross-facility storage allocation, physical warehouse capacities, and active storage zones.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {warehouseZonesMock.map((zone, idx) => (
          <div key={idx} className="inv-card inv-card-gold-glow">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>
                  STORAGE FACILITY #{idx + 1}
                </span>
                <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "2px" }}>
                  {zone.name}
                </h3>
                <p style={{ fontSize: "13px", color: "#666666" }}>{zone.location}</p>
              </div>

              <span
                style={{
                  background: "rgba(248, 180, 0, 0.15)",
                  color: "#d97706",
                  padding: "6px 14px",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "13px",
                }}
              >
                {zone.capacity}
              </span>
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                padding: "14px",
                background: "#f8f9fb",
                borderRadius: "10px",
                border: "1px solid #ececec",
                fontSize: "13px",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>
                  Cataloged SKUs
                </span>
                <p style={{ fontSize: "16px", color: "#111", fontWeight: "800", marginTop: "2px" }}>
                  {zone.skus} Types
                </p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>
                  Held Inventory Units
                </span>
                <p style={{ fontSize: "16px", color: "#059669", fontWeight: "800", marginTop: "2px" }}>
                  {zone.totalUnits.toLocaleString()} Units
                </p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>
                  Lead Supervisor
                </span>
                <p style={{ fontSize: "14px", color: "#111", fontWeight: "700", marginTop: "2px" }}>
                  {zone.manager}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryOverviewDept;
