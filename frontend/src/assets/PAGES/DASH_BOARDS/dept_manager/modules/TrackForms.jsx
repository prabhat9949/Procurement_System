import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, FileText, Search, UserCheck } from "lucide-react";
import { getCurrentUser } from "../../../../../services/authService";
import { getApprovalHistories } from "../../../../../services/approvalService";
import { getPurchaseRequests } from "../../../../../services/purchaseRequestService";

const list = (value) => Array.isArray(value) ? value : value?.content || [];
const label = (value) => String(value || "—").replaceAll("_", " ");
const dateTime = (value) => value ? new Date(value).toLocaleString("en-IN") : "—";

const TrackForms = ({ initialReqId }) => {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(initialReqId || "");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    setLoading(true); setError("");
    try {
      const me = await getCurrentUser();
      if (!me.departmentId) throw new Error("Your account has no department scope configured.");
      const rows = list(await getPurchaseRequests({ departmentId: me.departmentId }));
      setRequests(rows);
      setSelectedId((current) => current || String(rows[0]?.id || ""));
    } catch (loadError) {
      setError(loadError.message || "Unable to load requisitions.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadRequests(); }, []);
  useEffect(() => {
    if (!selectedId) { setHistory([]); return; }
    let active = true;
    setError("");
    getApprovalHistories({ purchaseRequestId: selectedId })
      .then((rows) => active && setHistory(list(rows)))
      .catch((loadError) => active && setError(loadError.message || "Unable to load approval history."));
    return () => { active = false; };
  }, [selectedId]);

  const selected = requests.find((request) => String(request.id) === String(selectedId));
  return <div className="dm-track-forms-container">
    <div className="dm-page-header"><div><h1 className="dm-page-title"><FileText color="#f8b400" /> Requisition approval history</h1><p className="dm-page-subtitle">Recorded backend approval events for your department.</p></div></div>
    <div className="dm-card" style={{ padding: 20, marginBottom: 20 }}>
      <label style={{ fontWeight: 700, display: "block", marginBottom: 8 }}><Search size={15} /> Select requisition</label>
      <select className="dm-form-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={loading} style={{ width: "100%" }}>
        <option value="">Select a requisition</option>
        {requests.map((request) => <option key={request.id} value={request.id}>{request.requestNumber || request.id} — {request.purpose || "Untitled request"}</option>)}
      </select>
    </div>
    {loading && <div className="dm-card" style={{ padding: 32, textAlign: "center" }}>Loading requisition history…</div>}
    {!loading && error && <div className="dm-card" style={{ padding: 24, color: "#b91c1c" }}><AlertCircle size={17} /> {error} <button className="dm-btn-primary-sm" onClick={loadRequests} style={{ marginLeft: 12 }}>Retry</button></div>}
    {!loading && !error && !selected && <div className="dm-card" style={{ padding: 32, textAlign: "center" }}>No requisitions are available for your department.</div>}
    {!loading && !error && selected && <>
      <div className="dm-card" style={{ padding: 20, marginBottom: 20 }}><h3>{selected.requestNumber || selected.id}</h3><p>{selected.purpose || "—"}</p><p style={{ color: "#666" }}>Status: <strong>{label(selected.status)}</strong> · Estimated amount: <strong>{selected.estimatedAmount ?? "—"}</strong></p></div>
      <div className="dm-card" style={{ padding: 20 }}><h3 style={{ marginBottom: 16 }}>Approval history</h3>
        {history.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: "#666" }}><Clock size={18} /> No approval events have been recorded yet.</div> : history.map((entry) => <div key={entry.id} style={{ borderLeft: "3px solid #f8b400", padding: "0 0 20px 16px", marginBottom: 12 }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><CheckCircle2 size={17} color="#059669" /><strong>{label(entry.action || entry.status)}</strong></div><p style={{ margin: "8px 0" }}>{entry.comments || "No comments were recorded."}</p><small><UserCheck size={13} /> {entry.approverName || entry.actionedByName || "—"} · {dateTime(entry.createdAt || entry.actionDate)}</small></div>)}
      </div>
    </>}
  </div>;
};

export default TrackForms;
