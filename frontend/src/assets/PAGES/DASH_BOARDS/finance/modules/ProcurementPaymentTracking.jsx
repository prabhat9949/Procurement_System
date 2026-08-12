import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  UserCheck,
  Search,
  Download,
  Calendar,
  DollarSign,
  PlusCircle,
  Eye,
  FileText,
  Check,
  X,
  QrCode,
  Upload,
} from "lucide-react";
import {
  epsEventBus,
  getStoredVendorInvoices,
  saveStoredVendorInvoices,
  getStoredPurchaseOrders,
  saveStoredPurchaseOrders,
} from "../../../../../services/epsApiService";



const ProcurementPaymentTracking = () => {
  const [selectedPayCode, setSelectedPayCode] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [workflows, setWorkflows] = useState({});
  const [activeSubTab, setActiveSubTab] = useState("tracker"); // tracker, ledger, form
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create Payment State
  const [newVendor, setNewVendor] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newRoute, setNewRoute] = useState("FedWire ACH");
  const [newBankPerson, setNewBankPerson] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const unsub = epsEventBus.subscribe((event) => {
      if (event.type === "WIRE_AUTHORIZE_REQUEST") {
        const { vendor, amount, dueDate } = event.data;
        setNewVendor(vendor);
        setNewAmount(amount);
        setNewDate(dueDate || "");
        setActiveSubTab("form");
      }
    });
    return unsub;
  }, []);

  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleCreatePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(newAmount || 0);
    if (!newVendor || amount <= 0 || !newDate) {
      triggerToast("Please fill in all payment schedule details.");
      return;
    }

    const nextId = `PAY-2026-9${10 + transactions.length}`;
    const newTxn = {
      ref: nextId,
      vendor: newVendor,
      amount,
      scheduledDate: newDate,
      route: newRoute,
      bankPerson: newBankPerson,
      time: newTime,
      status: "Pending",
    };

    // Broadcast that a payment was officially created/wired (so supplier portal can see)
    epsEventBus.publish({ type: "PAYMENT_WIRED", data: newTxn });

    const newWf = {
      item: `Payment for ${newVendor}`,
      vendor: newVendor,
      amount: `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      currentStep: 1,
      steps: [
        { title: "1. Invoice Submitted", desc: "Invoice details generated.", actor: "Finance Team", timestamp: new Date().toLocaleString(), status: "done" },
        { title: "2. Invoice Verification", desc: "Pending", actor: "Pending", timestamp: "Pending", status: "active" },
        { title: "3. Budget Verification", desc: "Pending", actor: "Pending", timestamp: "Pending", status: "pending" },
        { title: "4. Payment Approval", desc: "Pending", actor: "Pending", timestamp: "Pending", status: "pending" },
        { title: "5. Payment Processing", desc: "Pending", actor: "Pending", timestamp: "Pending", status: "pending" },
        { title: "6. Transaction Completed", desc: "Pending", actor: "Pending", timestamp: "Pending", status: "pending" },
        { title: "7. Vendor Payment Confirmation", desc: "Pending", actor: "Pending", timestamp: "Pending", status: "pending" },
        { title: "8. Completed", desc: "Pending", actor: "Pending", timestamp: "Pending", status: "pending" }
      ]
    };

    setWorkflows((prev) => ({ ...prev, [nextId]: newWf }));
    if (!selectedPayCode) setSelectedPayCode(nextId);

    setTransactions([newTxn, ...transactions]);
    triggerToast(`Disbursement schedule ${nextId} created successfully!`);
    
    // Reset form
    setNewVendor("");
    setNewAmount("");
    setNewDate("");
    setNewBankPerson("");
    setNewTime("");
  };

  const handleDownloadReceipt = (txn) => {
    if (txn.status !== "Completed") {
      triggerToast("Remittance receipt is only available for Completed/Disbursed transactions.");
      return;
    }
    triggerToast(`Downloading remittance payment receipt document: ${txn.receipt}`);
  };

  const activeWorkflow = workflows[selectedPayCode] || Object.values(workflows)[0] || null;

  return (
    <div className="fin-tracking-container" style={{ padding: "20px" }}>
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
      <div className="fin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Clock color="#f8b400" size={28} /> Procurement Payments & Treasury Schedules
          </h1>
          <p className="fin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Track end-to-end payment status, view clearing schedules, compile remittance files, and verify FedWire clearing lifecycles.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("tracker")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "tracker" ? "700" : "500",
            color: activeSubTab === "tracker" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "tracker" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          8-Stage Payment Tracker
        </button>
        <button
          onClick={() => setActiveSubTab("ledger")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "ledger" ? "700" : "500",
            color: activeSubTab === "ledger" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "ledger" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Transaction History & Schedules
        </button>
        <button
          onClick={() => setActiveSubTab("form")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "form" ? "700" : "500",
            color: activeSubTab === "form" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "form" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Schedule New Payment
        </button>
      </div>

      {/* 1. 8-Stage Tracker */}
      {activeSubTab === "tracker" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Selector Card */}
          <div className="fin-card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #eee", borderRadius: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#333" }}>Select Payment Code to Trace:</span>
            <select
              value={selectedPayCode}
              onChange={(e) => setSelectedPayCode(e.target.value)}
              className="fin-form-select"
              style={{ width: "260px", fontWeight: "700", borderColor: "#f8b400" }}
            >
              {Object.keys(workflows).map((id) => (
                <option key={id} value={id}>
                  {id} - {workflows[id].vendor} ({workflows[id].amount})
                </option>
              ))}
            </select>
          </div>

          {!activeWorkflow ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
              <h2>No Active Payments</h2>
              <p>You have no active payment schedules to track at this time. Schedule a new payment to begin.</p>
            </div>
          ) : (
            <>
              {/* Banner Details */}
          <div className="fin-card fin-card-gold-glow" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span style={{ color: "#d97706", fontSize: "12px", fontWeight: "800" }}>
                  Active trace: {selectedPayCode} • Value: {activeWorkflow.amount}
                </span>
                <h2 style={{ fontSize: "20px", color: "#111", fontWeight: "700", marginTop: "4px" }}>{activeWorkflow.item}</h2>
                <p style={{ color: "#555", fontSize: "13px", margin: "2px 0 0" }}>
                  Beneficiary Supplier: <strong>{activeWorkflow.vendor}</strong>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "12px", color: "#666", textTransform: "uppercase" }}>Clearance stage</span>
                <p style={{ fontSize: "24px", color: "#d97706", fontWeight: "800", margin: 0 }}>Stage {activeWorkflow.currentStep} of 8</p>
              </div>
            </div>

            {/* Progress line */}
            <div style={{ width: "100%", height: "8px", background: "#ececec", borderRadius: "4px", marginTop: "18px", overflow: "hidden" }}>
              <div style={{ width: `${(activeWorkflow.currentStep / 8) * 100}%`, height: "100%", background: "linear-gradient(90deg, #f8b400, #059669)", borderRadius: "4px" }} />
            </div>
          </div>

          {/* Timeline Nodes */}
          <div className="fin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #eee", borderRadius: "12px" }}>
            <div className="emp-timeline-container">
              {activeWorkflow.steps.map((step, index) => (
                <div key={index} className={`emp-timeline-item ${step.status}`} style={{ opacity: step.status === "pending" ? 0.5 : 1 }}>
                  <div className="emp-timeline-node">
                    {step.status === "done" && <CheckCircle2 size={12} color="#ffffff" />}
                    {step.status === "active" && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#000" }} />}
                  </div>
                  <div className="emp-timeline-content">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <h4 style={{ color: step.status === "active" ? "#d97706" : "#111", fontSize: "15px", fontWeight: "700", margin: 0 }}>{step.title}</h4>
                      <span style={{ fontSize: "12px", color: "#666" }}>{step.timestamp}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#555", margin: "0 0 6px" }}>{step.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#d97706", fontWeight: "600" }}>
                      <UserCheck size={13} />
                      <span>Operator: <strong>{step.actor}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </>
          )}

        </div>
      )}

      {/* 2. Transaction Ledger & Schedules */}
      {activeSubTab === "ledger" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Search bar */}
          <div className="fin-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <div style={{ position: "relative", width: "320px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search vendor or reference code..."
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
          <div className="fin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="fin-table-container">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Payment Ref</th>
                    <th>Supplier / Beneficiary</th>
                    <th>Amount Value</th>
                    <th>Scheduled Posting Date</th>
                    <th>Remittance Method</th>
                    <th>Post Status</th>
                    <th style={{ textAlign: "right" }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || t.ref.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((t) => (
                      <tr key={t.ref}>
                        <td style={{ fontWeight: "800", color: "#d97706" }}>{t.ref}</td>
                        <td style={{ fontWeight: "700" }}>{t.vendor}</td>
                        <td style={{ fontWeight: "800", color: "#059669" }}>${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px" }}>
                            <Calendar size={14} color="#888" />
                            <span>{t.scheduledDate}</span>
                          </div>
                        </td>
                        <td style={{ color: "#666" }}>{t.route}</td>
                        <td>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              background: t.status === "Completed" ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                              color: t.status === "Completed" ? "#059669" : "#d97706",
                              border: `1px solid ${t.status === "Completed" ? "rgba(5,150,105,0.3)" : "rgba(217,119,6,0.3)"}`
                            }}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="fin-sidebar-toggle"
                            style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", opacity: t.status === "Completed" ? 1 : 0.4 }}
                            onClick={() => handleDownloadReceipt(t)}
                            title="Download Remittance Advice Receipt"
                          >
                            <Download size={14} />
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

      {/* 3. Create Payment Schedule Form */}
      {activeSubTab === "form" && (
        <div className="fin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "560px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={18} color="#f8b400" /> New Payment Schedule / Wire Dispatch
          </h3>

          <form onSubmit={handleCreatePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="fin-form-group">
              <label className="fin-form-label">Beneficiary Supplier Name *</label>
              <input
                type="text"
                placeholder="e.g. Apple Business Direct"
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
                className="fin-form-input"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="fin-form-group">
                <label className="fin-form-label">Settlement Amount ($) *</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="fin-form-input"
                  required
                />
              </div>

              <div className="fin-form-group">
                <label className="fin-form-label">Scheduled Due Date *</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="fin-form-input"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div className="fin-form-group">
                <label className="fin-form-label">Authorized Bank Person</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (Chase)"
                  value={newBankPerson}
                  onChange={(e) => setNewBankPerson(e.target.value)}
                  className="fin-form-input"
                  required
                />
              </div>

              <div className="fin-form-group">
                <label className="fin-form-label">Execution Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="fin-form-input"
                  required
                />
              </div>
            </div>

            <div className="fin-form-group">
              <label className="fin-form-label">Settlement Method Route</label>
              <select
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value)}
                className="fin-form-select"
              >
                <option value="FedWire ACH">FedWire ACH</option>
                <option value="Direct Wire Transfer">Direct Wire Transfer</option>
                <option value="Commercial Credit Card">Commercial Credit Card</option>
              </select>
            </div>

            <button
              type="submit"
              className="fin-btn-approve"
              style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}
            >
              Add Schedule & Dispatch
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default ProcurementPaymentTracking;
