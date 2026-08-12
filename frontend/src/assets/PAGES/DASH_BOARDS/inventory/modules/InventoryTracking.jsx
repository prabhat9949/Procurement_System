import React, { useState } from "react";
import {
  Barcode,
  Search,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
  FileText,
  Calendar,
  X,
  TrendingUp,
} from "lucide-react";

const initialAssets = [
  {
    assetTag: "TAG-2026-MAC-01",
    serial: "C02G9901M3MX",
    item: "MacBook Pro M3 Max 64GB",
    batchLot: "LOT-AAPL-202607-01",
    location: "Aisle 2 - Rack B-04 (Shelf 3)",
    status: "Allocated",
    mfgDate: "2026-05-10",
    expDate: "N/A (Hardware)",
    dept: "Engineering",
    user: "David Chen",
    lifecycle: [
      { step: "Dock Verification Completed", date: "2026-07-26 04:30 PM", desc: "Pallet unloaded and checked by Dock Staff." },
      { step: "Quality Control Passed", date: "2026-07-26 05:15 PM", desc: "Optic review and hardware diagnostics verified." },
      { step: "Asset Tag Generated", date: "2026-07-26 05:30 PM", desc: "RFID tag TAG-2026-MAC-01 applied." },
      { step: "Assigned & Dispatched", date: "2026-07-27 09:00 AM", desc: "Dispatched to David Chen (Engineering)." }
    ]
  },
  {
    assetTag: "TAG-2026-MAC-02",
    serial: "C02G9902M3MX",
    item: "MacBook Pro M3 Max 64GB",
    batchLot: "LOT-AAPL-202607-01",
    location: "Aisle 2 - Rack B-04 (Shelf 3)",
    status: "In Stock",
    mfgDate: "2026-05-10",
    expDate: "N/A (Hardware)",
    dept: "Central IT Stock",
    user: "Unassigned",
    lifecycle: [
      { step: "Dock Verification Completed", date: "2026-07-26 04:30 PM", desc: "Pallet unloaded and checked by Dock Staff." },
      { step: "Quality Control Passed", date: "2026-07-26 05:15 PM", desc: "Optic review and hardware diagnostics verified." },
      { step: "Putaway Storage", date: "2026-07-26 06:00 PM", desc: "Placed in Aisle 2 - Rack B-04 (Shelf 3)." }
    ]
  },
  {
    assetTag: "TAG-2026-SER-01",
    serial: "DELL-R760-449102",
    item: "Dell PowerEdge R760 Server",
    batchLot: "LOT-DELL-202606-22",
    location: "Server Room A - Rack 04 (Slot 2)",
    status: "Allocated",
    mfgDate: "2026-04-18",
    expDate: "N/A (Hardware)",
    dept: "IT Infrastructure",
    user: "Data Center Node 4",
    lifecycle: [
      { step: "Dock Verification Completed", date: "2026-07-20 03:00 PM", desc: "Dock receiving checked." },
      { step: "Asset Tag Generated", date: "2026-07-21 10:00 AM", desc: "RFID tag TAG-2026-SER-01 applied." },
      { step: "Rack Integration Complete", date: "2026-07-22 11:30 AM", desc: "Racked in Server Room A Rack 04 Slot 2." }
    ]
  },
  {
    assetTag: "TAG-2026-BAT-09",
    serial: "SLA-BAT-900481",
    item: "UPS Backup Battery Pack (Lead Acid)",
    batchLot: "LOT-BAT-202511-04",
    location: "Hazardous Material Zone - Rack H-2",
    status: "Under QA Check",
    mfgDate: "2025-11-20",
    expDate: "2028-11-20",
    dept: "Facilities",
    user: "Unassigned",
    lifecycle: [
      { step: "Dock Verification Completed", date: "2026-07-27 07:15 AM", desc: "Unloaded at HAZ Dock Bay." },
      { step: "Under QA Audit", date: "2026-07-27 08:30 AM", desc: "Checking voltage stability parameters." }
    ]
  }
];

const initialLots = [
  { lotCode: "LOT-AAPL-202607-01", mfgDate: "2026-05-10", expDate: "N/A (Hardware)", item: "MacBook Pro M3 Max 64GB", totalQty: 10, remainingQty: 10, status: "Active" },
  { lotCode: "LOT-DELL-202606-22", mfgDate: "2026-04-18", expDate: "N/A (Hardware)", item: "Dell PowerEdge R760 Server", totalQty: 4, remainingQty: 2, status: "Active" },
  { lotCode: "LOT-BAT-202511-04", mfgDate: "2025-11-20", expDate: "2028-11-20", item: "UPS Backup Battery Pack", totalQty: 12, remainingQty: 12, status: "Under Audit" }
];

const InventoryTracking = () => {
  const [assets, setAssets] = useState(initialAssets);
  const [lots, setLots] = useState(initialLots);
  const [activeTab, setActiveTab] = useState("assets"); // assets, lots
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssetTimeline, setSelectedAssetTimeline] = useState(null);

  const filteredAssets = assets.filter(
    (a) =>
      a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inv-tracking-container" style={{ padding: "20px" }}>
      
      {/* Header */}
      <div className="inv-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Barcode color="#f8b400" size={28} /> Serial Number, Batch & Asset Tagging Tracker
          </h1>
          <p className="inv-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Real-time physical asset mapping, lot/batch lifecycle audits, shelf layout locations, and hardware assignment timelines.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("assets")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "assets" ? "700" : "500",
            color: activeTab === "assets" ? "#d97706" : "#666",
            borderBottom: activeTab === "assets" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Real-time Inventory Tracking ({assets.length} RFID tags)
        </button>
        <button
          onClick={() => setActiveTab("lots")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "lots" ? "700" : "500",
            color: activeTab === "lots" ? "#d97706" : "#666",
            borderBottom: activeTab === "lots" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Batch / Lot Records
        </button>
      </div>

      {/* Search Bar */}
      <div className="inv-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder={activeTab === "assets" ? "Search RFID tag, serial, product or location..." : "Search lot number..."}
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

      {/* Assets Tab */}
      {activeTab === "assets" && (
        <div className="inv-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>RFID Asset Tag</th>
                  <th>Manufacturer Serial No</th>
                  <th>Hardware Specification</th>
                  <th>Batch / Lot Reference</th>
                  <th>Stock Location (Rack/Shelf)</th>
                  <th>Assigned End-User / Node</th>
                  <th>Department</th>
                  <th>Lifecycle Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((a) => (
                  <tr key={a.assetTag}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{a.assetTag}</td>
                    <td style={{ color: "#111111", fontWeight: "700" }}>{a.serial}</td>
                    <td style={{ fontWeight: "600" }}>{a.item}</td>
                    <td style={{ color: "#666" }}>{a.batchLot}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={13} color="#d97706" />
                        <span>{a.location}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: "700" }}>{a.user}</td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{a.dept}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background:
                            a.status === "In Stock"
                              ? "rgba(5, 150, 105, 0.12)"
                              : a.status === "Allocated"
                              ? "rgba(59, 130, 246, 0.12)"
                              : "rgba(217, 119, 6, 0.12)",
                          color:
                            a.status === "In Stock"
                              ? "#059669"
                              : a.status === "Allocated"
                              ? "#3b82f6"
                              : "#d97706",
                          border: `1px solid ${
                            a.status === "In Stock"
                              ? "rgba(5, 150, 105, 0.3)"
                              : a.status === "Allocated"
                              ? "rgba(59, 130, 246, 0.3)"
                              : "rgba(217, 119, 6, 0.3)"
                          }`,
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="inv-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                        onClick={() => setSelectedAssetTimeline(a)}
                        title="View Asset Lifecycle Timeline"
                      >
                        <Clock size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lots Tab */}
      {activeTab === "lots" && (
        <div className="inv-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Batch / Lot Code</th>
                  <th>Product Name</th>
                  <th>Manufacturing Date</th>
                  <th>Expiration Date</th>
                  <th>Total Lot Qty</th>
                  <th>Remaining Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lots
                  .filter(l => l.lotCode.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((l) => (
                    <tr key={l.lotCode}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{l.lotCode}</td>
                      <td style={{ fontWeight: "700" }}>{l.item}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#555" }}>
                          <Calendar size={14} color="#888" />
                          <span>{l.mfgDate}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: l.expDate !== "N/A (Hardware)" ? "#dc2626" : "#555" }}>
                          <Calendar size={14} color="#888" />
                          <span>{l.expDate}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: "700" }}>{l.totalQty} Units</td>
                      <td style={{ fontWeight: "800", color: "#059669" }}>{l.remainingQty} Units</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: l.status === "Active" ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                            color: l.status === "Active" ? "#059669" : "#d97706",
                          }}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIFECYCLE TIMELINE MODAL */}
      {selectedAssetTimeline && (
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
              maxWidth: "520px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>ASSET LIFECYCLE AUDIT TRAIL</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  RFID: {selectedAssetTimeline.assetTag}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssetTimeline(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Meta details */}
                <div style={{ borderBottom: "1px solid #eee", paddingBottom: "12px", fontSize: "13.5px" }}>
                  <strong>Product Specification:</strong> {selectedAssetTimeline.item} <br />
                  <strong>Serial Number:</strong> {selectedAssetTimeline.serial} <br />
                  <strong>Storage Rack:</strong> {selectedAssetTimeline.location} <br />
                  <strong>Batch Lot Ref:</strong> {selectedAssetTimeline.batchLot}
                </div>

                {/* Timeline rendering */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", marginTop: "8px" }}>
                  {selectedAssetTimeline.lifecycle.map((step, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start", position: "relative" }}>
                      
                      {/* Connection Line */}
                      {idx < selectedAssetTimeline.lifecycle.length - 1 && (
                        <div
                          style={{
                            position: "absolute",
                            left: "9px",
                            top: "20px",
                            bottom: "-16px",
                            width: "2px",
                            background: "#e2e8f0",
                            zIndex: 1,
                          }}
                        />
                      )}

                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#f8b400",
                          color: "#111",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "800",
                          zIndex: 2,
                        }}
                      >
                        ✓
                      </div>

                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: 0 }}>{step.step}</p>
                        <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "700" }}>{step.date}</span>
                        <p style={{ fontSize: "12.5px", color: "#555", margin: "2px 0 0" }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="inv-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedAssetTimeline(null)}
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryTracking;
