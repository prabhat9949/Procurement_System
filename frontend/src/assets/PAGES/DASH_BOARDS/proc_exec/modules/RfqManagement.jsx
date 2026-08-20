import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  PlusCircle,
  Clock,
  Users,
  CheckCircle2,
  FileText,
  X,
  Search,
  Eye,
  Building,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";
import { hasPermission } from "../../../../../utils/permissions";

const RFQ_STATUS_STYLE = {
  DRAFT: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  OPEN: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  CLOSED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  CANCELLED: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
};

const RfqManagement = () => {
  // Resolve permissions at render time so admin grants/revocations are
  // reflected without a stale module-level snapshot.
  const canCreateRfq = hasPermission("CAN_CREATE_RFQ");
  const canInviteVendor = hasPermission("CAN_INVITE_VENDOR");
  const [tab, setTab] = useState("rfqs"); // 'rfqs' | 'vendors'
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [approvedPrs, setApprovedPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ purchaseRequestId: "", closingDate: "", quotationOpeningDate: "", selectedVendors: [], remarks: "" });
  const [creating, setCreating] = useState(false);

  // Detail state
  const [rfqVendors, setRfqVendors] = useState(null);
  const [prDetail, setPrDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rfqRes, vendorRes, prRes] = await Promise.all([
        apiGet("/api/rfqs?page=0&size=100&sort=createdAt&direction=desc").catch(() => null),
        apiGet("/api/vendors?page=0&size=200").catch(() => null),
        apiGet("/api/purchase-requests?status=APPROVED&page=0&size=50&sort=createdAt&direction=desc").catch(() => null),
      ]);
      setRfqs(rfqRes?.content || []);
      setVendors(vendorRes?.content || []);
      setApprovedPrs(prRes?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load RFQ data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const activeVendors = vendors.filter((v) => (v.status || "ACTIVE").toUpperCase() === "ACTIVE" || v.approved);
  const filteredVendors = activeVendors.filter((v) => {
    const q = vendorSearch.toLowerCase();
    if (!q) return true;
    return (
      (v.vendorName || "").toLowerCase().includes(q) ||
      (v.vendorCode || "").toLowerCase().includes(q) ||
      (v.vendorType || "").toLowerCase().includes(q) ||
      (v.city || "").toLowerCase().includes(q)
    );
  });

  const toggleVendor = (id) => {
    setForm((f) => ({
      ...f,
      selectedVendors: f.selectedVendors.includes(id) ? f.selectedVendors.filter((x) => x !== id) : [...f.selectedVendors, id],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.purchaseRequestId) { setError("Please select an approved purchase request."); return; }
    if (!form.closingDate) { setError("Please set the quotation closing date."); return; }
    setCreating(true);
    setError("");
    try {
      const rfq = await apiPost("/api/rfqs", {
        purchaseRequestId: Number(form.purchaseRequestId),
        closingDate: form.closingDate,
        quotationOpeningDate: form.quotationOpeningDate || form.closingDate,
        currency: "INR",
        remarks: form.remarks.trim() || null,
      });
      let invited = 0;
      for (const vendorId of form.selectedVendors) {
        if (!canInviteVendor) continue;
        await apiPost(`/api/rfqs/${rfq.id}/vendors`, { vendorId: Number(vendorId), remarks: "Invited for quotation" }).catch(() => null);
        invited += 1;
      }
      setShowCreate(false);
      setForm({ purchaseRequestId: "", closingDate: "", quotationOpeningDate: "", selectedVendors: [], remarks: "" });
      toast(`${rfq.rfqNumber} created and sent to ${invited} invited vendor(s).`);
      load();
    } catch (err) {
      setError(err.message || "Unable to create the RFQ.");
    } finally {
      setCreating(false);
    }
  };

  const openRfqVendors = async (rfq) => {
    const res = await apiGet(`/api/rfqs/${rfq.id}/vendors?page=0&size=50`).catch(() => null);
    setRfqVendors({ rfq, vendors: res?.content || [] });
  };

  const openPrDetail = async (id) => {
    const [pr, lineRes] = await Promise.all([
      apiGet(`/api/purchase-requests/${id}`).catch(() => null),
      apiGet(`/api/purchase-request-lines?purchaseRequestId=${id}&size=20`).catch(() => null),
    ]);
    setPrDetail({ pr, lines: lineRes?.content || [] });
  };

  const closeRfq = async (rfq) => {
    try {
      await apiPost(`/api/rfqs/${rfq.id}/close`);
      toast(`${rfq.rfqNumber} closed.`);
      load();
    } catch (err) {
      setError(err.message || "Unable to close the RFQ.");
    }
  };

  return (
    <div className="pe-rfq-management-container">
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <Send color="#f8b400" /> Request for Quotations (RFQ) Management Hub
          </h1>
          <p className="pe-page-subtitle">
            Create RFQs against approved requisitions, invite eligible vendors and track quotation responses — all from the database.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="pe-btn-primary-sm"
            style={{ background: tab === "vendors" ? "#f8b400" : "#fff", color: "#111", border: "1px solid #d9d9d9" }}
            onClick={() => setTab(tab === "rfqs" ? "vendors" : "rfqs")}
          >
            <Users size={16} /> {tab === "rfqs" ? "Vendor Directory" : "Active RFQs"}
          </button>
          {canCreateRfq && (
            <button className="pe-btn-primary-sm" onClick={() => setShowCreate(true)}>
              <PlusCircle size={16} /> Create &amp; Send New RFQ
            </button>
          )}
        </div>
      </div>

      {toastMsg && (
        <div style={{ background: "rgba(5,150,105,.12)", border: "1px solid #059669", color: "#059669", padding: "14px 20px", borderRadius: 12, marginBottom: 20, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
          <AlertTriangle size={17} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading RFQ data...
        </div>
      ) : tab === "vendors" ? (
        <div>
          <div className="pe-card" style={{ marginBottom: 24, padding: 20 }}>
            <h3 style={{ fontSize: 16, color: "#111", fontWeight: 700, marginBottom: 14 }}>Eligible Vendor Directory</h3>
            <div style={{ position: "relative", maxWidth: 420 }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search vendors by name, code, type or city..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                className="pe-form-input"
                style={{ paddingLeft: 42, height: 42 }}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filteredVendors.length === 0 ? (
              <div className="pe-card" style={{ padding: 40, textAlign: "center", color: "#9aa8b8" }}>No eligible vendors found.</div>
            ) : (
              filteredVendors.map((v) => (
                <div key={v.id} className="pe-card pe-card-gold-glow">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#d97706", fontWeight: 800 }}>{v.vendorCode || `VND-${v.id}`}</span>
                    <span style={{ background: "rgba(5,150,105,.12)", color: "#059669", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                      {v.status || "ACTIVE"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 17, color: "#111", fontWeight: 700 }}>{v.vendorName}</h3>
                  <p style={{ fontSize: 13, color: "#555" }}>{v.vendorType || "Supplier"}{v.city ? ` · ${v.city}` : ""}</p>
                  <div style={{ background: "#f8f9fb", padding: 12, borderRadius: 10, margin: "14px 0", fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                    {v.contactPerson && <div>Contact: <strong>{v.contactPerson}</strong></div>}
                    {v.email && <div>Email: <span style={{ color: "#3b82f6" }}>{v.email}</span></div>}
                    {v.phone && <div>Phone: <strong>{v.phone}</strong></div>}
                    {v.rating != null && <div>Rating: <strong>{Number(v.rating).toFixed(1)} / 5.0</strong></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {rfqs.length === 0 ? (
            <div className="pe-card" style={{ padding: 60, textAlign: "center", color: "#9aa8b8" }}>
              <Send size={30} style={{ opacity: 0.5, marginBottom: 8 }} />
              <div style={{ fontWeight: 700, fontSize: 15, color: "#475569" }}>No RFQs yet</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{canCreateRfq ? "Create an RFQ against an approved requisition to start sourcing." : "No RFQs have been created."}</div>
            </div>
          ) : (
            rfqs.map((rfq) => {
              const s = RFQ_STATUS_STYLE[rfq.status] || RFQ_STATUS_STYLE.DRAFT;
              return (
                <div key={rfq.id} className="pe-card pe-card-gold-glow">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#d97706", fontSize: 16 }}>{rfq.rfqNumber}</span>
                        <span style={{ fontSize: 12, color: "#666" }}>Purchase Req Ref: <strong>{rfq.purchaseRequestNumber}</strong></span>
                        <span className="pe-badge rfq" style={{ background: s.bg, color: s.color }}>{rfq.status}</span>
                      </div>
                      <h3 style={{ fontSize: 17, color: "#111", fontWeight: 700, marginTop: 4 }}>
                        {rfq.departmentName || "Department requisition"}
                      </h3>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 11, color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Quotation Deadline</span>
                      <p style={{ fontSize: 15, color: "#dc2626", fontWeight: 800, margin: "2px 0 0" }}>{formatDateIN(rfq.closingDate, { withTime: false })}</p>
                      <span style={{ fontSize: 11, color: "#666" }}>Currency: {rfq.currency || "INR"}</span>
                    </div>
                  </div>
                  {rfq.remarks && <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>{rfq.remarks}</p>}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap", borderTop: "1px solid #ececec", paddingTop: 14 }}>
                    <button className="pe-btn-primary-sm" style={{ background: "#fff", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => openRfqVendors(rfq)}>
                      <Users size={15} /> Invited Vendors
                    </button>
                    <button className="pe-btn-primary-sm" style={{ background: "#fff", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => openPrDetail(rfq.purchaseRequestId)}>
                      <FileText size={15} /> View Purchase Request
                    </button>
                    {rfq.status === "OPEN" && (
                      <button className="pe-btn-primary-sm" onClick={() => closeRfq(rfq)}>
                        <Clock size={15} /> Close RFQ
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create RFQ modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1000000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflow: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 640, width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,.25)", maxHeight: "92vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, color: "#111", fontWeight: 800 }}>Create &amp; Send New RFQ</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="pe-form-group" style={{ marginBottom: 16 }}>
                <label className="pe-form-label">Approved Purchase Request *</label>
                <select
                  className="pe-form-select"
                  value={form.purchaseRequestId}
                  onChange={(e) => setForm({ ...form, purchaseRequestId: e.target.value })}
                >
                  <option value="">Select an approved requisition…</option>
                  {approvedPrs.map((pr) => (
                    <option key={pr.id} value={pr.id}>{pr.requestNumber} — {pr.purpose?.slice(0, 60)} ({formatINR(pr.estimatedAmount)})</option>
                  ))}
                </select>
                {approvedPrs.length === 0 && (
                  <div style={{ fontSize: 12, color: "#b45309", marginTop: 6 }}>No approved purchase requests are currently waiting for sourcing.</div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="pe-form-group">
                  <label className="pe-form-label">Quotation Closing Date *</label>
                  <input type="date" className="pe-form-input" value={form.closingDate} onChange={(e) => setForm({ ...form, closingDate: e.target.value })} required />
                </div>
                <div className="pe-form-group">
                  <label className="pe-form-label">Quotation Opening Date</label>
                  <input type="date" className="pe-form-input" value={form.quotationOpeningDate} onChange={(e) => setForm({ ...form, quotationOpeningDate: e.target.value })} />
                </div>
              </div>
              <div className="pe-form-group" style={{ marginBottom: 16 }}>
                <label className="pe-form-label">Invite Vendors {canInviteVendor ? `(${form.selectedVendors.length} selected)` : "(permission required)"}</label>
                {canInviteVendor ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflow: "auto", border: "1px solid #d9d9d9", borderRadius: 10, padding: 10 }}>
                    {activeVendors.length === 0 ? (
                      <div style={{ fontSize: 12.5, color: "#9aa8b8" }}>No active vendors found in the database.</div>
                    ) : (
                      activeVendors.map((v) => (
                        <label key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
                          <input type="checkbox" checked={form.selectedVendors.includes(v.id)} onChange={() => toggleVendor(v.id)} />
                          <Building size={14} color="#f8b400" /> {v.vendorName} ({v.vendorCode || `VND-${v.id}`})
                        </label>
                      ))
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px" }}>
                    You do not have the CAN_INVITE_VENDOR permission. Vendors can be invited later by an authorized user.
                  </div>
                )}
              </div>
              <div className="pe-form-group" style={{ marginBottom: 20 }}>
                <label className="pe-form-label">Remarks / Terms</label>
                <textarea className="pe-form-input" rows={2} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Delivery terms, specifications notes, etc." />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" className="pe-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="pe-btn-primary-sm" disabled={creating}>
                  {creating ? <Loader2 size={16} className="login-spin" /> : <Send size={16} />} Create &amp; Send RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invited vendors modal */}
      {rfqVendors && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: "#d97706", fontWeight: 800 }}>INVITED VENDORS</span>
                <h3 style={{ fontSize: 18, color: "#111", fontWeight: 800, margin: "2px 0 0" }}>{rfqVendors.rfq.rfqNumber}</h3>
              </div>
              <button onClick={() => setRfqVendors(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            {rfqVendors.vendors.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "#9aa8b8" }}>No vendors have been invited to this RFQ yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {rfqVendors.vendors.map((v) => (
                  <div key={v.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8f9fb", border: "1px solid #ececec", borderRadius: 10, padding: "12px 14px" }}>
                    <div>
                      <strong style={{ fontSize: 14, color: "#111" }}>{v.vendorName}</strong>
                      <div style={{ fontSize: 12, color: "#666" }}>{v.vendorCode} · Invited {formatDateIN(v.invitationDate)}</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: v.responseStatus === "ACCEPTED" ? "#059669" : v.responseStatus === "DECLINED" ? "#dc2626" : "#d97706", background: "rgba(217,119,6,.1)", padding: "4px 10px", borderRadius: 999 }}>
                      {v.responseStatus || "PENDING"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button className="pe-btn-primary-sm" onClick={() => setRfqVendors(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PR detail modal */}
      {prDetail && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: "#d97706", fontWeight: 800 }}>PURCHASE REQUEST DETAILS</span>
                <h3 style={{ fontSize: 18, color: "#111", fontWeight: 800, margin: "2px 0 0" }}>{prDetail.pr?.requestNumber || ""}</h3>
              </div>
              <button onClick={() => setPrDetail(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            {prDetail.pr ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8f9fb", padding: 14, borderRadius: 10, border: "1px solid #ececec", fontSize: 13 }}>
                  <div><span style={{ color: "#666", fontSize: 11, textTransform: "uppercase" }}>Requester</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{prDetail.pr.requesterName}</p></div>
                  <div><span style={{ color: "#666", fontSize: 11, textTransform: "uppercase" }}>Department</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{prDetail.pr.departmentName}</p></div>
                  <div><span style={{ color: "#666", fontSize: 11, textTransform: "uppercase" }}>Estimated Amount</span><p style={{ fontWeight: 800, color: "#059669", fontSize: 15, margin: "2px 0 0" }}>{formatINR(prDetail.pr.estimatedAmount)}</p></div>
                  <div><span style={{ color: "#666", fontSize: 11, textTransform: "uppercase" }}>Priority</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{prDetail.pr.priority} · {prDetail.pr.status}</p></div>
                </div>
                {prDetail.pr.purpose && (
                  <p style={{ background: "#f8f9fb", padding: 12, borderRadius: 8, border: "1px solid #ececec", color: "#333", marginTop: 10, fontStyle: "italic", fontSize: 13 }}>
                    "{prDetail.pr.purpose}"
                  </p>
                )}
                {prDetail.lines.length > 0 && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 12 }}>
                    <thead>
                      <tr style={{ color: "#666", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                        <th style={{ padding: "8px 10px" }}>Item</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Qty</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prDetail.lines.map((l) => (
                        <tr key={l.id} style={{ borderTop: "1px solid #eee" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700 }}>{l.productName}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}>{l.quantity}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>{formatINR(l.estimatedAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              <div style={{ padding: 30, textAlign: "center", color: "#9aa8b8" }}>Unable to load this request.</div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button className="pe-btn-primary-sm" onClick={() => setPrDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RfqManagement;
