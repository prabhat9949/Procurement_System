import React, { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  X,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { apiGet, apiPut } from "../../../../../services/apiClient";
import { formatDateIN } from "../../../../../utils/format";

const maskAccount = (acc) => (acc ? `•••• ${acc.slice(-4)}` : "—");

const SuperVendorMonitoring = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [kycTarget, setKycTarget] = useState(null);
  const [kycReason, setKycReason] = useState("");
  const [kycDecision, setKycDecision] = useState("APPROVE");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: "0", size: "200", sort: "vendorName", direction: "asc" });
    if (statusFilter) params.set("status", statusFilter);
    try {
      const data = await apiGet(`/api/vendors?${params.toString()}`);
      setVendors(data?.content || []);
    } catch (err) {
      setError(err.message || "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = vendors.filter((v) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      (v.vendorName || "").toLowerCase().includes(q) ||
      (v.vendorCode || "").toLowerCase().includes(q) ||
      (v.gstNumber || "").toLowerCase().includes(q) ||
      (v.city || "").toLowerCase().includes(q)
    );
  });

  const changeStatus = async (v, status) => {
    setSaving(true);
    try {
      await apiPut(`/api/vendors/${v.id}/status`, { status, approved: status === "ACTIVE" });
      triggerToast(`Vendor "${v.vendorName}" status set to ${status}.`);
      setSelectedVendor(null);
      loadData();
    } catch (err) {
      triggerToast(err.message || "Could not update vendor status.", "err");
    } finally {
      setSaving(false);
    }
  };

  const submitKyc = async () => {
    if (!kycTarget) return;
    setSaving(true);
    try {
      await apiPut(`/api/vendors/${kycTarget.id}/kyc`, { decision: kycDecision, reason: kycReason });
      triggerToast(`KYC ${kycDecision} recorded for "${kycTarget.vendorName}".`);
      setKycTarget(null);
      setKycReason("");
      loadData();
    } catch (err) {
      triggerToast(err.message || "Could not record KYC decision.", "err");
    } finally {
      setSaving(false);
    }
  };

  const countBy = (pred) => vendors.filter(pred).length;
  const isActive = (v) => /ACTIVE|APPROVED/i.test(v.status || "");
  const isSuspended = (v) => /SUSPEND|BLACKLIST/i.test(v.status || "");
  const isKycPending = (v) => !v.approved && /PENDING|DRAFT|DOCUMENT|VERIF|UNDER/i.test(v.status || "");

  return (
    <div className="sadmin-vnd-mon-container" style={{ padding: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.tone === "err" ? "#dc2626" : "#111", color: "#fff", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 1000, fontWeight: "700", fontSize: "14px", borderLeft: `4px solid ${toast.tone === "err" ? "#fff" : "#f8b400"}` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Truck color="#f8b400" size={28} /> Vendor & KYC Management
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Supplier lifecycle, KYC verification and eligibility — all live from the vendor database.
          </p>
        </div>
        <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={loadData} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ padding: "16px", background: "#f6faf8", border: "1px solid rgba(5,150,105,0.3)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Registered Vendors</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>{vendors.length}</h3>
        </div>
        <div style={{ padding: "16px", background: "#f0f6ff", border: "1px solid rgba(37,99,235,0.25)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Active / Approved</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#2563eb", margin: "2px 0 0" }}>{countBy(isActive)}</h3>
        </div>
        <div style={{ padding: "16px", background: "#fcf8f2", border: "1px solid rgba(248,180,0,0.3)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>KYC Pending</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "2px 0 0" }}>{countBy(isKycPending)}</h3>
        </div>
        <div style={{ padding: "16px", background: "#fcf2f2", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Suspended / Blacklisted</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#dc2626", margin: "2px 0 0" }}>{countBy(isSuspended)}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="sadmin-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", width: "300px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search vendor name, code, GST, city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="KYC_PENDING">KYC Pending</option>
            <option value="UNDER_VERIFICATION">Under Verification</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BLACKLISTED">Blacklisted</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: "10px", color: "#666" }}>
            <Loader2 size={20} className="login-spin" /> Loading vendors from the database...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>No vendors found. Seed data creates sample vendors.</div>
        ) : (
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>GST / PAN</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>KYC Status</th>
                  <th>Lifecycle Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: "800", color: "#111" }}>{v.vendorName}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{v.vendorCode}</div>
                    </td>
                    <td style={{ fontSize: "13px", fontWeight: "600" }}>
                      <div>{v.gstNumber || "—"}</div>
                      <div style={{ color: "#888", fontSize: "12px" }}>{v.panNumber || ""}</div>
                    </td>
                    <td style={{ fontSize: "13px" }}>
                      <div style={{ fontWeight: "600" }}>{v.contactPerson || "—"}</div>
                      <div style={{ color: "#888", fontSize: "12px" }}>{v.email || ""}</div>
                    </td>
                    <td style={{ fontSize: "13px", color: "#555" }}>{[v.city, v.state].filter(Boolean).join(", ") || "—"}</td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: v.approved ? "rgba(5, 150, 105, 0.12)" : "rgba(248, 180, 0, 0.14)", color: v.approved ? "#059669" : "#d97706" }}>
                        {v.approved ? "KYC APPROVED" : "KYC PENDING"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: isSuspended(v) ? "rgba(220, 38, 38, 0.12)" : isActive(v) ? "rgba(5, 150, 105, 0.12)" : "rgba(248, 180, 0, 0.14)", color: isSuspended(v) ? "#dc2626" : isActive(v) ? "#059669" : "#d97706" }}>
                        {(v.status || "DRAFT").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer" }}
                        onClick={() => setSelectedVendor(v)}
                        title="View vendor & KYC details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec", position: "sticky", top: 0, zIndex: 2 }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>VENDOR PROFILE & KYC</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>{selectedVendor.vendorName}</h3>
              </div>
              <button onClick={() => setSelectedVendor(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                <p style={{ margin: 0 }}><strong>Vendor Code:</strong> {selectedVendor.vendorCode}</p>
                <p style={{ margin: 0 }}><strong>Vendor Type:</strong> {selectedVendor.vendorType || "—"}</p>
                <p style={{ margin: 0 }}><strong>Contact Person:</strong> {selectedVendor.contactPerson || "—"}</p>
                <p style={{ margin: 0 }}><strong>Email:</strong> {selectedVendor.email || "—"}</p>
                <p style={{ margin: 0 }}><strong>Phone:</strong> {selectedVendor.phone || selectedVendor.mobile || "—"}</p>
                <p style={{ margin: 0 }}><strong>Website:</strong> {selectedVendor.website || "—"}</p>
                <p style={{ margin: 0 }}><strong>GST Number:</strong> {selectedVendor.gstNumber || "—"}</p>
                <p style={{ margin: 0 }}><strong>PAN Number:</strong> {selectedVendor.panNumber || "—"}</p>
                <p style={{ margin: 0 }}><strong>Registration No.:</strong> {selectedVendor.registrationNumber || "—"}</p>
                <p style={{ margin: 0 }}><strong>Payment Terms:</strong> {selectedVendor.paymentTerms || "—"}</p>
              </div>

              <div style={{ borderTop: "1px solid #ececec", paddingTop: "14px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#d97706", textTransform: "uppercase", margin: "0 0 8px" }}>Address</h4>
                <p style={{ margin: 0, color: "#555" }}>
                  {[selectedVendor.addressLine1, selectedVendor.addressLine2, selectedVendor.city, selectedVendor.state, selectedVendor.country, selectedVendor.postalCode].filter(Boolean).join(", ") || "—"}
                </p>
              </div>

              <div style={{ borderTop: "1px solid #ececec", paddingTop: "14px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#d97706", textTransform: "uppercase", margin: "0 0 8px" }}>Bank Details (masked)</h4>
                <p style={{ margin: 0, color: "#555" }}>
                  {selectedVendor.bankName ? `${selectedVendor.bankName} · A/C ${maskAccount(selectedVendor.bankAccountNumber)} · IFSC ${selectedVendor.ifscCode || "—"}` : "Not provided"}
                </p>
              </div>

              <div style={{ borderTop: "1px solid #ececec", paddingTop: "14px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#d97706", textTransform: "uppercase", margin: "0 0 8px" }}>Lifecycle Actions</h4>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="sadmin-btn-primary-sm" style={{ background: "#059669", border: "none" }} onClick={() => changeStatus(selectedVendor, "ACTIVE")} disabled={saving}>
                    <CheckCircle2 size={14} /> Activate
                  </button>
                  <button className="sadmin-btn-primary-sm" style={{ background: "#d97706", border: "none" }} onClick={() => changeStatus(selectedVendor, "SUSPENDED")} disabled={saving}>
                    <AlertTriangle size={14} /> Suspend
                  </button>
                  <button className="sadmin-btn-primary-sm" style={{ background: "#dc2626", border: "none" }} onClick={() => changeStatus(selectedVendor, "BLACKLISTED")} disabled={saving}>
                    <AlertTriangle size={14} /> Blacklist
                  </button>
                  <button className="sadmin-btn-primary-sm" style={{ background: "#2563eb", border: "none" }} onClick={() => { setKycTarget(selectedVendor); setKycDecision("APPROVE"); setKycReason(""); }} disabled={saving}>
                    <UserCheck size={14} /> Approve KYC
                  </button>
                  <button className="sadmin-btn-primary-sm" style={{ background: "#7c3aed", border: "none" }} onClick={() => { setKycTarget(selectedVendor); setKycDecision("REJECT"); setKycReason(""); }} disabled={saving}>
                    <ShieldCheck size={14} /> Reject KYC
                  </button>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #ececec", paddingTop: "14px", color: "#888", fontSize: "12.5px" }}>
                <div>Created: {formatDateIN(selectedVendor.createdAt)}</div>
                <div>Last updated: {formatDateIN(selectedVendor.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC Decision Modal */}
      {kycTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "460px", padding: "24px", boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
              {kycDecision === "APPROVE" ? "Approve KYC" : "Reject KYC"} — {kycTarget.vendorName}
            </h3>
            <p style={{ color: "#666", fontSize: "14px", margin: "8px 0 16px" }}>
              {kycDecision === "APPROVE"
                ? "The vendor becomes approved and eligible for procurement once saved."
                : "Provide the rejection reason. This is recorded in the audit log."}
            </p>
            <div className="sadmin-form-group">
              <label className="sadmin-form-label">{kycDecision === "APPROVE" ? "Approval Notes (optional)" : "Rejection Reason *"}</label>
              <textarea
                rows={3}
                placeholder="Add notes for the audit trail..."
                value={kycReason}
                onChange={(e) => setKycReason(e.target.value)}
                className="sadmin-form-input"
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setKycTarget(null)}>Cancel</button>
              <button className="sadmin-btn-primary-sm" style={{ background: kycDecision === "APPROVE" ? "#059669" : "#dc2626", border: "none" }} onClick={submitKyc} disabled={saving || (kycDecision === "REJECT" && !kycReason.trim())}>
                {saving ? <><Loader2 size={15} className="login-spin" /> Saving...</> : kycDecision === "APPROVE" ? "Approve KYC" : "Reject KYC"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperVendorMonitoring;
