import React, { useState, useEffect } from "react";
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Send,
  Search,
  ArrowUpDown,
  Plus,
  Minus,
  RefreshCw,
  History,
  FileText,
  AlertOctagon,
  ArrowLeftRight,
} from "lucide-react";
import {
  epsEventBus,
  getStoredStockItems,
  saveStoredStockItems,
  getStoredStockHistory,
  saveStoredStockHistory
} from "../../../../../services/epsApiService";

const initialStockItems = [
  {
    sku: "SKU-MAC-101",
    name: "MacBook Pro M3 Max 64GB Workstation",
    category: "Laptops",
    available: 24,
    reserved: 10,
    incoming: 10,
    reorderLevel: 5,
    status: "Healthy",
    damagedCount: 0,
    returnedCount: 2,
  },
  {
    sku: "SKU-NET-992",
    name: "Cisco Catalyst 9300 Switch Module",
    category: "Networking",
    available: 2,
    reserved: 2,
    incoming: 4,
    reorderLevel: 5,
    status: "Low Stock Alert",
    damagedCount: 1,
    returnedCount: 0,
  },
  {
    sku: "SKU-DISP-401",
    name: "Dell UltraSharp 32'' 4K Monitor",
    category: "Displays",
    available: 1,
    reserved: 1,
    incoming: 0,
    reorderLevel: 3,
    status: "Critical Stock Alert",
    damagedCount: 0,
    returnedCount: 1,
  },
  {
    sku: "SKU-SERV-502",
    name: "Dell PowerEdge R760 Rack Server",
    category: "Servers",
    available: 8,
    reserved: 2,
    incoming: 2,
    reorderLevel: 2,
    status: "Healthy",
    damagedCount: 0,
    returnedCount: 0,
  },
];

const initialStockHistory = [
  { id: "LOG-1001", sku: "SKU-MAC-101", name: "MacBook Pro M3 Max 64GB Workstation", type: "Stock In", qty: 10, reason: "Vendor Delivery Received", date: "2026-07-26 10:15 AM", operator: "Robert V." },
  { id: "LOG-1002", sku: "SKU-NET-992", name: "Cisco Catalyst 9300 Switch Module", type: "Stock Out", qty: 2, reason: "Dispatched to IT Dept", date: "2026-07-25 03:00 PM", operator: "Sarah K." },
  { id: "LOG-1003", sku: "SKU-DISP-401", name: "Dell UltraSharp 32'' 4K Monitor", type: "Adjustment", qty: -1, reason: "Damaged during handling", date: "2026-07-24 09:30 AM", operator: "John D." },
  { id: "LOG-1004", sku: "SKU-MAC-101", name: "MacBook Pro M3 Max 64GB Workstation", type: "Returned", qty: 2, reason: "Unused department surplus", date: "2026-07-23 04:00 PM", operator: "Robert V." },
];

const initialTransfers = [
  { id: "TRF-901", sku: "SKU-MAC-101", fromWh: "Warehouse A (Chennai)", toWh: "Warehouse B (Bangalore)", qty: 5, status: "Approved", date: "2026-07-25" },
  { id: "TRF-902", sku: "SKU-SERV-502", fromWh: "Warehouse B (Bangalore)", toWh: "Warehouse A (Chennai)", qty: 2, status: "Pending Approval", date: "2026-07-27" },
];

const StockManagement = () => {
  const [stockItems, setStockItems] = useState(() => getStoredStockItems());
  const [historyLogs, setHistoryLogs] = useState(() => getStoredStockHistory());
  const [transfers, setTransfers] = useState(initialTransfers);
  
  useEffect(() => {
    const unsub = epsEventBus.subscribe((e) => {
      if (e.type === "STOCK_UPDATED") {
        setStockItems(getStoredStockItems());
        setHistoryLogs(getStoredStockHistory());
      }
    });
    return unsub;
  }, []);
  
  const [activeSubTab, setActiveSubTab] = useState("levels"); // levels, adjustment, damage-return, transfer, history
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Adjustment Form State
  const [adjSku, setAdjSku] = useState("SKU-MAC-101");
  const [adjType, setAdjType] = useState("Stock In"); // Stock In, Stock Out, Adjustment, Damaged, Returned
  const [adjQty, setAdjQty] = useState("");
  const [adjReason, setAdjReason] = useState("");

  // Transfer Form State
  const [trfSku, setTrfSku] = useState("SKU-MAC-101");
  const [trfFrom, setTrfFrom] = useState("Warehouse A (Chennai)");
  const [trfTo, setTrfTo] = useState("Warehouse B (Bangalore)");
  const [trfQty, setTrfQty] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleReorder = (sku) => {
    const updated = stockItems.map((item) => {
      if (item.sku === sku) {
        return { ...item, status: "Restocking Requisition Sent", incoming: item.incoming + 10 };
      }
      return item;
    });
    setStockItems(updated);
    saveStoredStockItems(updated);
    triggerToast(`Restocking request dispatched to Procurement Executive for ${sku}.`);
  };

  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(adjQty || 0);
    if (qty <= 0) {
      triggerToast("Please enter a valid quantity.");
      return;
    }

    const targetItem = stockItems.find((i) => i.sku === adjSku);
    if (!targetItem) return;

    let updatedQty = targetItem.available;
    let damagedChange = 0;
    let returnedChange = 0;

    if (adjType === "Stock In") {
      updatedQty += qty;
    } else if (adjType === "Stock Out") {
      if (updatedQty < qty) {
        triggerToast("Insufficient available stock!");
        return;
      }
      updatedQty -= qty;
    } else if (adjType === "Adjustment") {
      updatedQty = qty; // Override stock levels
    } else if (adjType === "Damaged") {
      if (updatedQty < qty) {
        triggerToast("Insufficient stock to mark as damaged!");
        return;
      }
      updatedQty -= qty;
      damagedChange = qty;
    } else if (adjType === "Returned") {
      updatedQty += qty;
      returnedChange = qty;
    }

    // Determine status
    let status = "Healthy";
    if (updatedQty <= 0) {
      status = "Critical Stock Alert";
    } else if (updatedQty <= targetItem.reorderLevel) {
      status = "Low Stock Alert";
    }

    const updatedStock = stockItems.map((item) => {
      if (item.sku === adjSku) {
        return {
          ...item,
          available: updatedQty,
          damagedCount: item.damagedCount + damagedChange,
          returnedCount: item.returnedCount + returnedChange,
          status,
        };
      }
      return item;
    });

    setStockItems(updatedStock);
    saveStoredStockItems(updatedStock);

    // Add log
    const newLog = {
      id: `LOG-${1000 + historyLogs.length + 1}`,
      sku: adjSku,
      name: targetItem.name,
      type: adjType,
      qty: adjType === "Stock Out" || adjType === "Damaged" ? -qty : qty,
      reason: adjReason || "Manual adjustment",
      date: new Date().toLocaleString(),
      operator: "Marcus V. (Mgr)",
    };

    const updatedLogs = [newLog, ...historyLogs];
    setHistoryLogs(updatedLogs);
    saveStoredStockHistory(updatedLogs);
    triggerToast(`Inventory levels adjusted for SKU ${adjSku}!`);
    
    // Clear form
    setAdjQty("");
    setAdjReason("");
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(trfQty || 0);
    if (qty <= 0) {
      triggerToast("Please enter a valid quantity.");
      return;
    }

    const targetItem = stockItems.find((i) => i.sku === trfSku);
    if (!targetItem) return;

    if (targetItem.available < qty) {
      triggerToast("Insufficient stock available for transfer!");
      return;
    }

    const newTransfer = {
      id: `TRF-${900 + transfers.length + 1}`,
      sku: trfSku,
      fromWh: trfFrom,
      toWh: trfTo,
      qty,
      status: "Pending Approval",
      date: new Date().toISOString().split("T")[0],
    };

    setTransfers([newTransfer, ...transfers]);
    triggerToast(`Stock Transfer request ${newTransfer.id} submitted!`);
    setTrfQty("");
  };

  const filteredStock = stockItems.filter(
    (item) =>
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inv-stock-mgmt-container" style={{ padding: "20px" }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#111111",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            fontWeight: "700",
            fontSize: "14px",
            borderLeft: "4px solid #f8b400",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="inv-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Boxes color="#f8b400" size={28} /> Stock Level Reserves & Reorder Control
          </h1>
          <p className="inv-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Monitor physical warehouse stock, log incoming/outgoing adjustments, log damaged goods, and manage stock transfer orders.
          </p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("levels")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "levels" ? "700" : "500",
            color: activeSubTab === "levels" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "levels" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Current Stock Levels
        </button>
        <button
          onClick={() => setActiveSubTab("adjustment")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "adjustment" ? "700" : "500",
            color: activeSubTab === "adjustment" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "adjustment" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Stock In/Out & Adjustments
        </button>
        <button
          onClick={() => setActiveSubTab("damage-return")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "damage-return" ? "700" : "500",
            color: activeSubTab === "damage-return" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "damage-return" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Damaged & Returned Goods
        </button>
        <button
          onClick={() => setActiveSubTab("transfer")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "transfer" ? "700" : "500",
            color: activeSubTab === "transfer" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "transfer" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Stock Transfer Requests
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "history" ? "700" : "500",
            color: activeSubTab === "history" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "history" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Stock History Log
        </button>
      </div>

      {/* 1. Levels Subtab */}
      {activeSubTab === "levels" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Search bar */}
          <div className="inv-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <div style={{ position: "relative", width: "360px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search inventory items by SKU or Name..."
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

          {/* Low Stock Alerts Banner */}
          {stockItems.some(i => i.available <= i.reorderLevel) && (
            <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "8px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertTriangle color="#dc2626" size={24} />
              <div>
                <strong style={{ color: "#dc2626", fontSize: "14px" }}>Low Stock Trigger Warning</strong>
                <p style={{ color: "#555", fontSize: "13px", margin: "2px 0 0" }}>
                  The items highlighted in red have dropped below or met their designated Reorder Thresholds. restock cycles must be initiated.
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="inv-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="inv-table-container">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>SKU Code</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Available Stock</th>
                    <th>Reserved for Depts</th>
                    <th>Incoming Freight</th>
                    <th>Reorder Level</th>
                    <th>Stock Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((item) => (
                    <tr key={item.sku}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{item.sku}</td>
                      <td style={{ fontWeight: "700", color: "#111111" }}>{item.name}</td>
                      <td style={{ color: "#666" }}>{item.category}</td>
                      <td style={{ fontWeight: "800", color: item.available <= item.reorderLevel ? "#dc2626" : "#059669" }}>
                        {item.available} Units
                      </td>
                      <td style={{ color: "#555555" }}>{item.reserved} Units</td>
                      <td style={{ color: "#3b82f6", fontWeight: "700" }}>+{item.incoming} Units</td>
                      <td style={{ color: "#666", fontWeight: "600" }}>{item.reorderLevel} Units</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background:
                              item.available <= 0
                                ? "rgba(220, 38, 38, 0.12)"
                                : item.available <= item.reorderLevel
                                ? "rgba(217, 119, 6, 0.12)"
                                : "rgba(5, 150, 105, 0.12)",
                            color:
                              item.available <= 0
                                ? "#dc2626"
                                : item.available <= item.reorderLevel
                                ? "#d97706"
                                : "#059669",
                            border: `1px solid ${
                              item.available <= 0
                                ? "rgba(220, 38, 38, 0.3)"
                                : item.available <= item.reorderLevel
                                ? "rgba(217, 119, 6, 0.3)"
                                : "rgba(5, 150, 105, 0.3)"
                            }`,
                          }}
                        >
                          {item.available <= 0 ? "Out of Stock" : item.available <= item.reorderLevel ? "Low Stock Alert" : "Healthy"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {item.available <= item.reorderLevel ? (
                          <button
                            className="inv-btn-primary-sm"
                            style={{ fontSize: "12px", padding: "6px 12px" }}
                            onClick={() => handleReorder(item.sku)}
                          >
                            <Send size={14} /> Reorder Stock
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#059669", fontWeight: "700" }}>
                            Stock Sufficient
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Adjustment Tab */}
      {activeSubTab === "adjustment" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
          
          {/* Form Card */}
          <div className="inv-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px" }}>
              Perform Inventory Adjustments
            </h3>

            <form onSubmit={handleAdjustmentSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="inv-form-group">
                <label className="inv-form-label">Select SKU / Product Item</label>
                <select
                  value={adjSku}
                  onChange={(e) => setAdjSku(e.target.value)}
                  className="inv-form-select"
                >
                  {stockItems.map((item) => (
                    <option key={item.sku} value={item.sku}>
                      {item.sku} - {item.name} (Qty: {item.available})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="inv-form-group">
                  <label className="inv-form-label">Adjustment Type</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value)}
                    className="inv-form-select"
                  >
                    <option value="Stock In">Stock In (Add Stock)</option>
                    <option value="Stock Out">Stock Out (Subtract Stock)</option>
                    <option value="Adjustment">Adjustment (Override Levels)</option>
                  </select>
                </div>

                <div className="inv-form-group">
                  <label className="inv-form-label">Quantity</label>
                  <input
                    type="number"
                    value={adjQty}
                    onChange={(e) => setAdjQty(e.target.value)}
                    placeholder="e.g. 5"
                    className="inv-form-input"
                    required
                  />
                </div>
              </div>

              <div className="inv-form-group">
                <label className="inv-form-label">Reason / Memo</label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Regular monthly replenishment / Surplus adjustment"
                  className="inv-form-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="inv-btn-primary-sm"
                style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}
              >
                Submit Stock Adjustment
              </button>
            </form>
          </div>

          {/* Quick Stats sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="inv-card" style={{ padding: "20px", background: "#f8f9fb", border: "1px solid #ececec", borderRadius: "12px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", margin: "0 0 12px" }}>Adjustments Information</h4>
              <ul style={{ fontSize: "13px", color: "#555", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong>Stock In:</strong> Adds units directly to physical inventory balances.</li>
                <li><strong>Stock Out:</strong> Substracts active available reserves.</li>
                <li><strong>Override Adjustment:</strong> Sets available levels manually. Use with audit authorization.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* 3. Damage & Return Tab */}
      {activeSubTab === "damage-return" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Log Damaged/Returned Form */}
          <div className="inv-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertOctagon size={18} color="#dc2626" /> Log Damaged & Returned Items
            </h3>

            <form onSubmit={handleAdjustmentSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="inv-form-group">
                <label className="inv-form-label">Select SKU / Product Item</label>
                <select
                  value={adjSku}
                  onChange={(e) => setAdjSku(e.target.value)}
                  className="inv-form-select"
                >
                  {stockItems.map((item) => (
                    <option key={item.sku} value={item.sku}>
                      {item.sku} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="inv-form-group">
                  <label className="inv-form-label">Log Type</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value)}
                    className="inv-form-select"
                  >
                    <option value="Damaged">Damaged Products (Subtracts Stock)</option>
                    <option value="Returned">Returned Products (Adds Stock)</option>
                  </select>
                </div>

                <div className="inv-form-group">
                  <label className="inv-form-label">Units Quantity</label>
                  <input
                    type="number"
                    value={adjQty}
                    onChange={(e) => setAdjQty(e.target.value)}
                    placeholder="e.g. 2"
                    className="inv-form-input"
                    required
                  />
                </div>
              </div>

              <div className="inv-form-group">
                <label className="inv-form-label">Technical Condition / Inspection Notes</label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Defective logic boards / Screen flickering return"
                  className="inv-form-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="inv-btn-primary-sm"
                style={{ width: "100%", justifyContent: "center", padding: "12px", background: adjType === "Damaged" ? "#dc2626" : "#059669", color: "#fff", border: "none" }}
              >
                Log Status Change
              </button>
            </form>
          </div>

          {/* Damaged & Returns Status List */}
          <div className="inv-card" style={{ padding: "24px", background: "#ffffff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
              Inspection Ledger Summary
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {stockItems.map((item) => (
                <div key={item.sku} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fb", padding: "14px", border: "1px solid #eee", borderRadius: "8px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777", fontWeight: "700" }}>{item.sku}</span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#333", margin: "2px 0 0" }}>{item.name}</p>
                  </div>

                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "10px", color: "#777", textTransform: "uppercase" }}>Damaged</span>
                      <p style={{ fontSize: "14px", fontWeight: "800", color: "#dc2626", margin: 0 }}>{item.damagedCount} Units</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "10px", color: "#777", textTransform: "uppercase" }}>Returned</span>
                      <p style={{ fontSize: "14px", fontWeight: "800", color: "#3b82f6", margin: 0 }}>{item.returnedCount} Units</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. Transfer Tab */}
      {activeSubTab === "transfer" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
          
          {/* Submit Transfer Request */}
          <div className="inv-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowLeftRight size={18} color="#f8b400" /> New Stock Transfer Order
            </h3>

            <form onSubmit={handleTransferSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="inv-form-group">
                <label className="inv-form-label">Select SKU / Product Item</label>
                <select
                  value={trfSku}
                  onChange={(e) => setTrfSku(e.target.value)}
                  className="inv-form-select"
                >
                  {stockItems.map((item) => (
                    <option key={item.sku} value={item.sku}>
                      {item.sku} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="inv-form-group">
                  <label className="inv-form-label">From Warehouse Location</label>
                  <select
                    value={trfFrom}
                    onChange={(e) => setTrfFrom(e.target.value)}
                    className="inv-form-select"
                  >
                    <option value="Warehouse A (Chennai)">Warehouse A (Chennai)</option>
                    <option value="Warehouse B (Bangalore)">Warehouse B (Bangalore)</option>
                    <option value="Warehouse C (Delhi)">Warehouse C (Delhi)</option>
                  </select>
                </div>

                <div className="inv-form-group">
                  <label className="inv-form-label">To Warehouse Location</label>
                  <select
                    value={trfTo}
                    onChange={(e) => setTrfTo(e.target.value)}
                    className="inv-form-select"
                  >
                    <option value="Warehouse B (Bangalore)">Warehouse B (Bangalore)</option>
                    <option value="Warehouse A (Chennai)">Warehouse A (Chennai)</option>
                    <option value="Warehouse C (Delhi)">Warehouse C (Delhi)</option>
                  </select>
                </div>
              </div>

              <div className="inv-form-group">
                <label className="inv-form-label">Transfer Quantity</label>
                <input
                  type="number"
                  value={trfQty}
                  onChange={(e) => setTrfQty(e.target.value)}
                  placeholder="e.g. 5"
                  className="inv-form-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="inv-btn-primary-sm"
                style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              >
                Submit Transfer Request
              </button>
            </form>
          </div>

          {/* Transfers Table */}
          <div className="inv-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
              Active Transfer Orders
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {transfers.map((trf) => (
                <div key={trf.id} style={{ border: "1px solid #ececec", borderRadius: "8px", padding: "14px", background: "#fafafa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800" }}>{trf.id}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: trf.status === "Approved" ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                        color: trf.status === "Approved" ? "#059669" : "#d97706",
                      }}
                    >
                      {trf.status}
                    </span>
                  </div>

                  <p style={{ fontSize: "14px", fontWeight: "700", margin: "8px 0 2px" }}>{trf.sku} (x{trf.qty})</p>
                  <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
                    Route: {trf.fromWh} ➔ {trf.toWh}
                  </p>
                  <p style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>Submitted: {trf.date}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 5. History Log Subtab */}
      {activeSubTab === "history" && (
        <div className="inv-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>SKU Code</th>
                  <th>Product Description</th>
                  <th>Adjustment Type</th>
                  <th>Delta Qty</th>
                  <th>Reconciliation Memo</th>
                  <th>Date & Time</th>
                  <th>Audited By</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{log.id}</td>
                    <td style={{ fontWeight: "700" }}>{log.sku}</td>
                    <td style={{ color: "#111" }}>{log.name}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background:
                            log.type === "Stock In" || log.type === "Returned"
                              ? "rgba(5, 150, 105, 0.12)"
                              : log.type === "Stock Out" || log.type === "Damaged"
                              ? "rgba(220, 38, 38, 0.12)"
                              : "rgba(217, 119, 6, 0.12)",
                          color:
                            log.type === "Stock In" || log.type === "Returned"
                              ? "#059669"
                              : log.type === "Stock Out" || log.type === "Damaged"
                              ? "#dc2626"
                              : "#d97706",
                        }}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: "800", color: log.qty > 0 ? "#059669" : "#dc2626" }}>
                      {log.qty > 0 ? `+${log.qty}` : log.qty} Units
                    </td>
                    <td style={{ color: "#555" }}>{log.reason}</td>
                    <td style={{ color: "#666", fontSize: "13px" }}>{log.date}</td>
                    <td style={{ fontWeight: "600", fontSize: "13px" }}>{log.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default StockManagement;
