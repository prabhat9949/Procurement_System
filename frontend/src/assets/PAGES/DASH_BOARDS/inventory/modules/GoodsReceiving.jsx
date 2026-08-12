import React, { useState } from "react";
import {
  Truck,
  CheckCircle2,
  UserCheck,
  PlusCircle,
  X,
  Barcode,
  Search,
  Download,
  AlertTriangle,
  Upload,
  Layers,
  FileText,
  FileCheck,
} from "lucide-react";

const initialDeliveries = [
  {
    poId: "PO-2026-4401",
    vendor: "Apple Business Direct",
    item: "MacBook Pro M3 Max 64GB Workstations",
    orderedQty: 10,
    expectedDate: "2026-07-27",
    status: "Arrived at Dock",
    deliverySlip: "",
  },
  {
    poId: "PO-2026-4412",
    vendor: "Dell Technologies",
    item: "PowerEdge R760 Rack Servers",
    orderedQty: 4,
    expectedDate: "2026-07-28",
    status: "In Transit",
    deliverySlip: "",
  },
  {
    poId: "PO-2026-4389",
    vendor: "HP Inc. Enterprise",
    item: "LaserJet Pro Enterprise MFP M528dn",
    orderedQty: 5,
    expectedDate: "2026-07-30",
    status: "In Transit",
    deliverySlip: "",
  },
];

const initialGrnHistory = [
  {
    grnId: "GRN-2026-041",
    poId: "PO-2026-4350",
    vendor: "Apple Business Direct",
    item: "Studio Display 27'' Monitors",
    receivedQty: 5,
    rejectedQty: 0,
    inspectedBy: "Marcus Vance",
    date: "2026-07-24",
    status: "Completed",
    document: "GRN_041_StudioDisplays.pdf",
  },
  {
    grnId: "GRN-2026-039",
    poId: "PO-2026-4299",
    vendor: "Logitech Logistics",
    item: "Logitech MX Master 3S Mouse",
    receivedQty: 48,
    rejectedQty: 2,
    inspectedBy: "QA Inspector John",
    date: "2026-07-20",
    status: "Discrepancy Logged",
    document: "GRN_039_MXMaster.pdf",
  },
];

import { useEffect } from "react";
import {
  epsEventBus,
  getStoredVendorInvoices,
  saveStoredVendorInvoices,
  getStoredGrnHistory,
  saveStoredGrnHistory,
  addStockItemAfterGrn,
  advanceRequestStep,
  createPaymentRequestFromInvoice,
} from "../../../../../services/epsApiService";

const GoodsReceiving = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [grnHistory, setGrnHistory] = useState(() => getStoredGrnHistory());
  const [activeTab, setActiveTab] = useState("incoming"); // incoming, history
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);
  
  // Inspection Form State
  const [formReceivedQty, setFormReceivedQty] = useState(0);
  const [formRejectedQty, setFormRejectedQty] = useState(0);
  const [formRejectedReason, setFormRejectedReason] = useState("");
  const [uploadedSlip, setUploadedSlip] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const loadDeliveriesAndGrns = () => {
    const activeGrnHistory = getStoredGrnHistory();
    setGrnHistory(activeGrnHistory);

    // Initial deliveries (exclude any that have been completed in grn history)
    const filteredInitial = initialDeliveries.filter(
      (d) => !activeGrnHistory.some((g) => g.poId === d.poId)
    );

    // Invoices generated (exclude any that have been completed in grn history)
    const activeInvoices = getStoredVendorInvoices();
    const mappedInvoices = activeInvoices.map((inv) => {
      const qtyMatch = inv.item.match(/\(x(\d+)\)/);
      const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      return {
        poId: inv.poId,
        vendor: inv.vendor,
        item: inv.item,
        orderedQty: qty,
        expectedDate: inv.dueDate || "2026-08-30",
        status: "Arrived at Dock", // Once invoice is generated, it arrives at dock
        deliverySlip: "",
      };
    });

    const filteredInvoices = mappedInvoices.filter(
      (inv) => !activeGrnHistory.some((g) => g.poId === inv.poId)
    );

    // Combine them, filter by unique poId
    const combined = [...filteredInvoices, ...filteredInitial];
    const unique = Array.from(new Map(combined.map(d => [d.poId, d])).values());

    setDeliveries(unique);
  };

  useEffect(() => {
    loadDeliveriesAndGrns();
    const unsub = epsEventBus.subscribe((e) => {
      if (e.type === "VENDOR_INVOICE_CREATED" || e.type === "INVOICE_SUBMITTED" || e.type === "GRN_UPDATED") {
        loadDeliveriesAndGrns();
      }
    });
    return unsub;
  }, []);

  const handleOpenInspect = (delivery) => {
    setSelectedInspection(delivery);
    setFormReceivedQty(delivery.orderedQty);
    setFormRejectedQty(0);
    setFormRejectedReason("");
    setUploadedSlip("");
  };

  const handleSubmitVerification = (e) => {
    e.preventDefault();
    const received = parseInt(formReceivedQty || 0);
    const rejected = parseInt(formRejectedQty || 0);
    
    if (received + rejected !== selectedInspection.orderedQty) {
      triggerToast("Sum of Received and Rejected quantities must match the ordered quantity!");
      return;
    }

    const grnId = `GRN-2026-0${42 + grnHistory.length}`;
    const newGrn = {
      grnId,
      poId: selectedInspection.poId,
      vendor: selectedInspection.vendor,
      item: selectedInspection.item,
      receivedQty: received,
      rejectedQty: rejected,
      inspectedBy: "Marcus Vance (Mgr)",
      date: new Date().toISOString().split("T")[0],
      status: rejected > 0 ? "Discrepancy Logged" : "Completed",
      document: `${grnId.toLowerCase().replace(/-/g, "_")}_receipt.pdf`,
    };

    const updatedHistory = [newGrn, ...grnHistory];
    saveStoredGrnHistory(updatedHistory);
    addStockItemAfterGrn(selectedInspection.item, received, selectedInspection.poId, grnId);

    // Update matching invoice status in global store
    const invoicesList = getStoredVendorInvoices();
    let matchedInvoice = null;
    const updatedInvoicesList = invoicesList.map((inv) => {
      if (inv.poId === selectedInspection.poId) {
        matchedInvoice = { ...inv, status: "Pending Auditor Verification" };
        return matchedInvoice;
      }
      return inv;
    });
    saveStoredVendorInvoices(updatedInvoicesList);
    epsEventBus.publish({ type: "VENDOR_INVOICE_CREATED" }); // Broadcast to refresh invoices view

    // Advance tracking to Step 6 — Goods Delivered
    advanceRequestStep(selectedInspection.poId, 6);

    // Create a pending payment request in Finance portal from the invoice
    if (matchedInvoice) {
      createPaymentRequestFromInvoice({
        ...matchedInvoice,
        item: selectedInspection.item,
        grnId,
      });
    }

    setGrnHistory(updatedHistory);
    setDeliveries(deliveries.filter((d) => d.poId !== selectedInspection.poId));
    setSelectedInspection(null);
    triggerToast(`Goods Received Note ${grnId} generated! Payment request created in Finance portal.`);
  };

  const handleDownloadGrn = (grn) => {
    triggerToast(`Downloading Goods Received Note document: ${grn.document}`);
  };

  const filteredHistory = grnHistory.filter(
    (g) =>
      g.grnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inv-goods-receiving-container" style={{ padding: "20px" }}>
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
            <Truck color="#f8b400" size={28} /> Goods Receiving & Inspection Desk
          </h1>
          <p className="inv-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Verify products delivered by suppliers against active Purchase Orders, manage quality inspections, and issue Goods Received Notes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("incoming")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "incoming" ? "700" : "500",
            color: activeTab === "incoming" ? "#d97706" : "#666",
            borderBottom: activeTab === "incoming" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Incoming Deliveries ({deliveries.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "history" ? "700" : "500",
            color: activeTab === "history" ? "#d97706" : "#666",
            borderBottom: activeTab === "history" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Goods Receiving History (GRN Ledger)
        </button>
      </div>

      {/* Incoming Deliveries Panel */}
      {activeTab === "incoming" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {deliveries.map((del) => (
            <div
              key={del.poId}
              className="inv-card inv-card-gold-glow"
              style={{
                background: "#ffffff",
                border: "1px solid #ececec",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800", background: "rgba(248, 180, 0, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                      {del.poId}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: del.status === "Arrived at Dock" ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                        color: del.status === "Arrived at Dock" ? "#059669" : "#d97706",
                      }}
                    >
                      {del.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "17px", color: "#111", fontWeight: "700", marginTop: "10px", marginBottom: "4px" }}>
                    {del.item}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#555" }}>
                    Supplier: <strong>{del.vendor}</strong> • Ordered Qty: <strong>{del.orderedQty} units</strong>
                  </p>
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>
                    Expected Delivery: <strong>{del.expectedDate}</strong>
                  </p>
                </div>

                {del.status === "Arrived at Dock" ? (
                  <button
                    className="inv-btn-primary-sm"
                    onClick={() => handleOpenInspect(del)}
                  >
                    Inspect & Verify Goods
                  </button>
                ) : (
                  <span style={{ fontSize: "13px", color: "#777", fontStyle: "italic", alignSelf: "center" }}>
                    Awaiting Arrival
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Ledger Panel */}
      {activeTab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Search bar */}
          <div className="inv-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <div style={{ position: "relative", width: "360px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search GRNs, Purchase Orders, or Vendors..."
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

          {/* Table */}
          <div className="inv-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="inv-table-container">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>GRN ID</th>
                    <th>PO Code</th>
                    <th>Supplier / Vendor</th>
                    <th>Product Description</th>
                    <th>Approved Qty</th>
                    <th>Rejected Qty</th>
                    <th>Inspected By</th>
                    <th>Posting Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((grn) => (
                    <tr key={grn.grnId}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{grn.grnId}</td>
                      <td style={{ color: "#666", fontSize: "13px" }}>{grn.poId}</td>
                      <td style={{ fontWeight: "700" }}>{grn.vendor}</td>
                      <td>{grn.item}</td>
                      <td style={{ fontWeight: "800", color: "#059669" }}>{grn.receivedQty} Units</td>
                      <td style={{ fontWeight: "800", color: grn.rejectedQty > 0 ? "#dc2626" : "#666" }}>{grn.rejectedQty} Units</td>
                      <td style={{ color: "#555" }}>{grn.inspectedBy}</td>
                      <td style={{ color: "#666", fontSize: "13px" }}>{grn.date}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: grn.status === "Completed" ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                            color: grn.status === "Completed" ? "#059669" : "#d97706",
                          }}
                        >
                          {grn.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="inv-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                          onClick={() => handleDownloadGrn(grn)}
                          title="Download GRN Document"
                        >
                          <Download size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION & VERIFICATION MODAL */}
      {selectedInspection && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
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
              maxWidth: "560px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>VERIFY DELIVERED PRODUCTS</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  Match & Audit PO: {selectedInspection.poId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitVerification} style={{ padding: "24px" }}>
              <div style={{ background: "#fcf8f2", padding: "14px", borderRadius: "8px", border: "1px solid rgba(248,180,0,0.2)", marginBottom: "20px" }}>
                <span style={{ fontSize: "11px", color: "#666" }}>Ordered Product specifications</span>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#333", margin: "2px 0 0" }}>{selectedInspection.item}</p>
                <p style={{ fontSize: "13px", color: "#d97706", fontWeight: "800", margin: "4px 0 0" }}>Total Ordered: {selectedInspection.orderedQty} units</p>
              </div>

              {/* Match Products Section */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="inv-form-group">
                  <label className="inv-form-label">Approved Quantity *</label>
                  <input
                    type="number"
                    max={selectedInspection.orderedQty}
                    value={formReceivedQty}
                    onChange={(e) => setFormReceivedQty(e.target.value)}
                    className="inv-form-input"
                    required
                  />
                </div>
                <div className="inv-form-group">
                  <label className="inv-form-label">Rejected / Damaged Qty</label>
                  <input
                    type="number"
                    max={selectedInspection.orderedQty}
                    value={formRejectedQty}
                    onChange={(e) => setFormRejectedQty(e.target.value)}
                    className="inv-form-input"
                    required
                  />
                </div>
              </div>

              {formRejectedQty > 0 && (
                <div className="inv-form-group" style={{ marginBottom: "16px" }}>
                  <label className="inv-form-label">Reason for Rejection *</label>
                  <input
                    type="text"
                    value={formRejectedReason}
                    onChange={(e) => setFormRejectedReason(e.target.value)}
                    placeholder="e.g. Scratched casing / Broken seals"
                    className="inv-form-input"
                    required
                  />
                </div>
              )}

              {/* Document upload mock */}
              <div className="inv-form-group" style={{ marginBottom: "20px" }}>
                <label className="inv-form-label">Upload Delivery Docket / Slip</label>
                <div
                  style={{
                    border: "1.5px dashed #d9d9d9",
                    padding: "16px",
                    borderRadius: "8px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#fafafa"
                  }}
                  onClick={() => {
                    const name = prompt("Enter slip PDF filename:", "delivery_docket_signed.pdf");
                    if (name) setUploadedSlip(name);
                  }}
                >
                  <Upload size={18} color="#666" style={{ margin: "0 auto 4px" }} />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>
                    {uploadedSlip ? `Attached: ${uploadedSlip}` : "Upload Supplier Packing Slip Document"}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <button
                  type="button"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  onClick={() => setSelectedInspection(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inv-btn-primary-sm"
                  style={{ padding: "10px 20px" }}
                >
                  Generate GRN & Post Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoodsReceiving;
