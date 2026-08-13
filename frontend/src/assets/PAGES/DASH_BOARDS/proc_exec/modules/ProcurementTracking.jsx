import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react";
import { getPurchaseRequests } from "../../../../../services/purchaseRequestService";
import { getApprovalHistories } from "../../../../../services/approvalService";
import { getRfqs } from "../../../../../services/rfqService";
import { getPurchaseOrders } from "../../../../../services/purchaseOrderService";

const list = (data) => Array.isArray(data) ? data : data?.content || [];
const display = (value) => String(value || "—").replaceAll("_", " ");

const ProcurementTracking = () => {
  const [requests, setRequests] = useState([]); const [selectedId, setSelectedId] = useState("");
  const [history, setHistory] = useState([]); const [rfqs, setRfqs] = useState([]); const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try {
    const rows = list(await getPurchaseRequests()); setRequests(rows); setSelectedId((id) => id || String(rows[0]?.id || ""));
  } catch (loadError) { setError(loadError.message || "Unable to load procurement tracking."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (!selectedId) return; let active = true; Promise.all([
    getApprovalHistories({ purchaseRequestId: selectedId }), getRfqs({ purchaseRequestId: selectedId }), getPurchaseOrders(),
  ]).then(([events, rfqRows, orderRows]) => { if (active) { setHistory(list(events)); setRfqs(list(rfqRows)); setOrders(list(orderRows).filter((order) => String(order.purchaseRequestId || order.requestId || "") === String(selectedId))); } }).catch((loadError) => active && setError(loadError.message || "Unable to load workflow records.")); return () => { active = false; }; }, [selectedId]);
  const request = requests.find((row) => String(row.id) === String(selectedId));
  return <div className="pe-tracking-container"><div className="pe-page-header"><div><h1 className="pe-page-title"><Clock color="#f8b400" /> Procurement tracker</h1><p className="pe-page-subtitle">Recorded purchase request, approval, RFQ, and purchase order state.</p></div></div>
    <div className="pe-card" style={{ padding: 20, marginBottom: 20 }}><select className="pe-form-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={loading} style={{ width: "100%" }}><option value="">Select purchase request</option>{requests.map((row) => <option value={row.id} key={row.id}>{row.requestNumber || row.id} — {row.purpose || "Untitled"}</option>)}</select></div>
    {loading && <div className="pe-card" style={{ padding: 30, textAlign: "center" }}>Loading procurement records…</div>}
    {!loading && error && <div className="pe-card" style={{ padding: 24, color: "#b91c1c" }}><AlertCircle size={16} /> {error} <button className="pe-btn-primary-sm" onClick={load}>Retry</button></div>}
    {!loading && !error && !request && <div className="pe-card" style={{ padding: 30, textAlign: "center" }}>No purchase requests are available.</div>}
    {!loading && !error && request && <><div className="pe-card" style={{ padding: 20, marginBottom: 20 }}><h2>{request.requestNumber || request.id}</h2><p>{request.purpose || "—"}</p><strong>Status: {display(request.status)}</strong></div><div className="pe-card" style={{ padding: 20 }}><h3><FileText size={18} /> Backend workflow records</h3>
      {[...history.map((entry) => ({ key: `a-${entry.id}`, label: `Approval: ${display(entry.action || entry.status)}`, date: entry.createdAt || entry.actionDate, detail: entry.comments || entry.approverName })), ...rfqs.map((entry) => ({ key: `r-${entry.id}`, label: `RFQ: ${entry.rfqNumber || entry.id} — ${display(entry.status)}`, date: entry.createdAt, detail: entry.remarks })), ...orders.map((entry) => ({ key: `p-${entry.id}`, label: `Purchase order: ${entry.poNumber || entry.id} — ${display(entry.status)}`, date: entry.createdAt, detail: entry.remarks }))].length === 0 ? <p style={{ padding: 20, textAlign: "center", color: "#666" }}>No downstream workflow records have been created yet.</p> : [...history.map((entry) => ({ key: `a-${entry.id}`, label: `Approval: ${display(entry.action || entry.status)}`, date: entry.createdAt || entry.actionDate, detail: entry.comments || entry.approverName })), ...rfqs.map((entry) => ({ key: `r-${entry.id}`, label: `RFQ: ${entry.rfqNumber || entry.id} — ${display(entry.status)}`, date: entry.createdAt, detail: entry.remarks })), ...orders.map((entry) => ({ key: `p-${entry.id}`, label: `Purchase order: ${entry.poNumber || entry.id} — ${display(entry.status)}`, date: entry.createdAt, detail: entry.remarks }))].map((entry) => <div key={entry.key} style={{ borderLeft: "3px solid #f8b400", padding: "0 0 16px 14px", marginTop: 16 }}><CheckCircle2 size={15} color="#059669" /> <strong>{entry.label}</strong><p>{entry.detail || "No details recorded."}</p><small>{entry.date ? new Date(entry.date).toLocaleString("en-IN") : "—"}</small></div>)}</div></>}
  </div>;
};
export default ProcurementTracking;
