import React, { useState } from "react";
import ReactDOM from "react-dom";
import { AlertCircle, FileText, Send, X } from "lucide-react";
import { createRfq } from "../../../../../services/rfqService";

const today = new Date().toISOString().slice(0, 10);
const CreateRfqWizardModal = ({ onClose, onRfqCreated, initialReqData }) => {
  const [closingDate, setClosingDate] = useState("");
  const [quotationOpeningDate, setQuotationOpeningDate] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      const created = await createRfq({
        purchaseRequestId: initialReqData?.id,
        closingDate,
        quotationOpeningDate,
        currency,
        remarks,
      });
      onRfqCreated?.(created);
    } catch (saveError) { setError(saveError.message || "Unable to create RFQ."); }
    finally { setSaving(false); }
  };

  return ReactDOM.createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15,23,42,.55)", display: "grid", placeItems: "center", padding: 20 }}>
    <form onSubmit={submit} className="pe-card" style={{ width: "min(620px, 100%)", padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><div><h2 className="pe-page-title"><FileText color="#f8b400" /> Create RFQ</h2><p className="pe-page-subtitle">For {initialReqData?.id || "the selected purchase request"}</p></div><button type="button" className="pe-btn-primary-sm" onClick={onClose}><X size={17} /> Close</button></div>
      <p style={{ background: "#f8f9fb", padding: 12, borderRadius: 8 }}>{initialReqData?.product || "Purchase request"}</p>
      {error && <div style={{ color: "#b91c1c", marginBottom: 14 }}><AlertCircle size={15} /> {error}</div>}
      <label>Closing date<input className="pe-form-input" type="date" min={today} required value={closingDate} onChange={(event) => setClosingDate(event.target.value)} /></label>
      <label>Quotation opening date<input className="pe-form-input" type="date" min={closingDate || today} required value={quotationOpeningDate} onChange={(event) => setQuotationOpeningDate(event.target.value)} /></label>
      <label>Currency<select className="pe-form-select" value={currency} onChange={(event) => setCurrency(event.target.value)}><option>INR</option><option>USD</option><option>EUR</option></select></label>
      <label>Remarks<textarea className="pe-form-input" value={remarks} onChange={(event) => setRemarks(event.target.value)} rows="4" /></label>
      <p style={{ color: "#666", fontSize: 12 }}>Vendor invitations and RFQ line items are added from the RFQ management workflow after the RFQ is created.</p>
      <button className="pe-btn-primary-sm" type="submit" disabled={saving} style={{ marginTop: 16 }}><Send size={16} /> {saving ? "Creating…" : "Create RFQ"}</button>
    </form>
  </div>, document.body);
};
export default CreateRfqWizardModal;
