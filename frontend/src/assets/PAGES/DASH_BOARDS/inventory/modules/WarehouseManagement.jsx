import React, { useState } from "react";
import {
  Warehouse,
  Boxes,
  Server,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Layers,
  Activity,
  ArrowRight,
  PieChart,
} from "lucide-react";

const initialWarehouses = [
  {
    code: "WH-CHN-01",
    name: "Warehouse A (Chennai HQ)",
    location: "DLF Logistics Park, Chennai, India",
    manager: "Marcus Vance",
    sqFt: "45,000 Sq. Ft.",
    occupancy: "82%",
    throughput: "94.5% (High Efficiency)",
    zones: [
      { name: "Zone A - Hardware & Tech", capacity: "90% Full", items: "Laptops, Servers, Switches" },
      { name: "Zone B - General Supplies", capacity: "75% Full", items: "Paper Reams, Inks, Cables" },
      { name: "Zone C - Furnitures & Fixtures", capacity: "60% Full", items: "Ergonomic Chairs, Desks" }
    ],
    performance: {
      dockTurnaround: "45 mins avg",
      handlingErrorRate: "0.08%",
      dailyShipments: 120,
    }
  },
  {
    code: "WH-BLR-02",
    name: "Warehouse B (Bangalore)",
    location: "Whitefield Industrial Area, Bangalore, India",
    manager: "Rajesh Kumar",
    sqFt: "30,000 Sq. Ft.",
    occupancy: "68%",
    throughput: "88.2% (Standard Efficiency)",
    zones: [
      { name: "Zone A - IT Hardware Reserve", capacity: "65% Full", items: "MacBooks, Monitors" },
      { name: "Zone B - Office Stationery", capacity: "80% Full", items: "Standard Reams, Writing Kits" },
      { name: "Zone C - Bulky Assets", capacity: "55% Full", items: "Tables, Executive Desks" }
    ],
    performance: {
      dockTurnaround: "55 mins avg",
      handlingErrorRate: "0.15%",
      dailyShipments: 85,
    }
  }
];

const initialRacks = [
  { rack: "Rack A-01", zone: "Zone A", items: "MacBook Pro Workstations", allocation: "Shelves 1, 2 & 3", utilized: "90% Full (18/20 bins)" },
  { rack: "Rack A-05", zone: "Zone A", items: "Dell PowerEdge Rack Servers", allocation: "Shelves 4 & 5", utilized: "60% Full (6/10 slots)" },
  { rack: "Rack B-04", zone: "Zone B", items: "Cisco Switches & Networking Hardware", allocation: "Shelves 1 & 2", utilized: "80% Full (8/10 bins)" },
  { rack: "Rack C-02", zone: "Zone C", items: "Herman Miller Office Chairs", allocation: "Pallet Bays 1-5", utilized: "75% Full (15/20 slots)" },
];

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [racks, setRacks] = useState(initialRacks);
  const [activeTab, setActiveTab] = useState("locations"); // locations, racks, stats
  const [selectedWhCode, setSelectedWhCode] = useState("WH-CHN-01");

  const currentWh = warehouses.find(w => w.code === selectedWhCode) || warehouses[0];

  return (
    <div className="inv-wh-mgmt-container" style={{ padding: "20px" }}>
      
      {/* Header */}
      <div className="inv-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Warehouse color="#f8b400" size={28} /> Warehouse Locations & Storage Capacity Management
          </h1>
          <p className="inv-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Analyze storage capacities, rack configuration layouts, stock allocations, and spatial utilization metrics.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("locations")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "locations" ? "700" : "500",
            color: activeTab === "locations" ? "#d97706" : "#666",
            borderBottom: activeTab === "locations" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Warehouse Locations & Details
        </button>
        <button
          onClick={() => setActiveTab("racks")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "racks" ? "700" : "500",
            color: activeTab === "racks" ? "#d97706" : "#666",
            borderBottom: activeTab === "racks" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Rack / Shelf Layout Config
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "stats" ? "700" : "500",
            color: activeTab === "stats" ? "#d97706" : "#666",
            borderBottom: activeTab === "stats" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Utilization Statistics & Performance
        </button>
      </div>

      {/* 1. Locations Tab */}
      {activeTab === "locations" && (
        <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: "24px" }}>
          
          {/* Location Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {warehouses.map((wh) => (
              <div
                key={wh.code}
                onClick={() => setSelectedWhCode(wh.code)}
                style={{
                  background: "#ffffff",
                  border: `1px solid ${wh.code === selectedWhCode ? "#f8b400" : "#ececec"}`,
                  borderRadius: "12px",
                  padding: "18px",
                  cursor: "pointer",
                  boxShadow: wh.code === selectedWhCode ? "0 4px 14px rgba(248, 180, 0, 0.15)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={16} color={wh.code === selectedWhCode ? "#d97706" : "#666"} />
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#888" }}>{wh.code}</span>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#111", marginTop: "8px" }}>{wh.name}</h3>
                <p style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{wh.location}</p>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", borderTop: "1px dashed #eee", paddingTop: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>Occupancy:</span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#059669" }}>{wh.occupancy}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Details Panel */}
          <div className="inv-card" style={{ padding: "28px", background: "#ffffff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px" }}>
              Warehouse Operations Audit: {currentWh.code}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#777" }}>Warehouse Manager</span>
                <p style={{ fontSize: "14.5px", fontWeight: "700", color: "#333", marginTop: "2px" }}>{currentWh.manager}</p>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#777" }}>Total Storage Area</span>
                <p style={{ fontSize: "14.5px", fontWeight: "700", color: "#333", marginTop: "2px" }}>{currentWh.sqFt}</p>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#777" }}>Utilization Rate</span>
                <p style={{ fontSize: "15px", fontWeight: "800", color: "#059669", marginTop: "2px" }}>{currentWh.occupancy} Allocated</p>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#777" }}>Operations Throughput</span>
                <p style={{ fontSize: "14.5px", fontWeight: "700", color: "#d97706", marginTop: "2px" }}>{currentWh.throughput}</p>
              </div>
            </div>

            {/* Zones list */}
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#333", marginBottom: "12px" }}>Active Storage Zones Allocations</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {currentWh.zones.map((zone, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fb", padding: "14px", border: "1px solid #eee", borderRadius: "8px" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: 0 }}>{zone.name}</h4>
                    <span style={{ fontSize: "12px", color: "#666" }}>Items: {zone.items}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      background: "rgba(5, 150, 105, 0.12)",
                      color: "#059669",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: "1px solid rgba(5,150,105,0.3)"
                    }}
                  >
                    {zone.capacity}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* 2. Racks Tab */}
      {activeTab === "racks" && (
        <div className="inv-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#111", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
            Storage Rack & Shelf Layout Allocations
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {racks.map((r, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #ececec",
                  borderRadius: "10px",
                  padding: "16px",
                  background: "#f8f9fb",
                }}
              >
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>{r.zone}</span>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111", margin: "4px 0 8px" }}>{r.rack}</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#555" }}>
                  <div>
                    <span style={{ color: "#888" }}>Product Allocations:</span>
                    <p style={{ fontWeight: "700", color: "#333", margin: "2px 0 0" }}>{r.items}</p>
                  </div>
                  <div>
                    <span style={{ color: "#888" }}>Shelves Range:</span>
                    <p style={{ fontWeight: "700", color: "#333", margin: "2px 0 0" }}>{r.allocation}</p>
                  </div>
                  <div style={{ borderTop: "1px dashed #ddd", paddingTop: "8px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "700" }}>Rack Utilized:</span>
                    <strong style={{ color: "#059669" }}>{r.utilized}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Performance & Stats Tab */}
      {activeTab === "stats" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Warehouse Performance Metrics */}
          <div className="inv-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} color="#059669" /> Operational Performance Index
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Dock Receiving Turnaround Rate</span>
                  <span style={{ color: "#059669" }}>92%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                  <div style={{ width: "92%", height: "100%", background: "#059669", borderRadius: "4px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Cargo Putaway Handling Accuracy</span>
                  <span style={{ color: "#3b82f6" }}>99.2%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                  <div style={{ width: "99.2%", height: "100%", background: "#3b82f6", borderRadius: "4px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Dispatch Turnaround Speed</span>
                  <span style={{ color: "#f8b400" }}>87%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                  <div style={{ width: "87%", height: "100%", background: "#f8b400", borderRadius: "4px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Utilization Statistics */}
          <div className="inv-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "10px" }}>
              Total Storage Capacity Utilization
            </h3>

            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "10px" }}>
              <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "conic-gradient(#f8b400 0% 82%, #e2e8f0 82% 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: "24px", fontWeight: "900", color: "#111" }}>82%</span>
                  <span style={{ fontSize: "10px", color: "#777", textTransform: "uppercase" }}>Utilized</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#666", textAlign: "center", marginTop: "16px" }}>
                <strong>36,900 / 45,000 Sq. Ft.</strong> actively occupied across storage racks.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default WarehouseManagement;
