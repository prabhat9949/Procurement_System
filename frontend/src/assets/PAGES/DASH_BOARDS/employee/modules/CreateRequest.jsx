import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  UploadCloud,
  FileText,
  CheckCircle2,
  Package,
  Building,
  User,
  Send,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR } from "../../../../../utils/format";

const CreateRequest = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "";
  const username = localStorage.getItem("eps_username") || "";

  const [me, setMe] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: displayName,
    employeeEmail: username,
    department: "—",
    costCenter: "—",

    productName: "",
    category: "Hardware & IT Equipment",
    vendorPreference: "",
    quantity: 1,
    unitPrice: "",
    priority: "MEDIUM",

    justification: "",
    requiredDate: "",
    deliveryAddress: "",
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedRef, setSubmittedRef] = useState("");

  useEffect(() => {
    apiGet("/api/auth/me")
      .then((meData) => {
        setMe(meData);
        setFormData((f) => ({
          ...f,
          employeeName: meData.displayName || f.employeeName,
          employeeEmail: meData.username || f.employeeEmail,
          department: meData.departmentId ? `Department #${meData.departmentId}` : "—",
          costCenter: meData.costCenterId ? `Cost Center #${meData.costCenterId}` : "—",
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files).map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
    }));
    setFiles([...files, ...uploaded]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!me?.employeeId || !me?.departmentId || !me?.costCenterId) {
      setError("Your account is not linked to an employee record yet. Please contact HR.");
      return;
    }
    const estimatedTotal = (parseFloat(formData.unitPrice) || 0) * (parseInt(formData.quantity) || 1);
    if (estimatedTotal <= 0) {
      setError("Please enter a valid unit price and quantity.");
      return;
    }
    if (!formData.requiredDate) {
      setError("Please select a required delivery date.");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(formData.requiredDate);
    if (chosen <= today) {
      setError("Required delivery date must be a future date.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const created = await apiPost("/api/purchase-requests", {
        requesterId: me.employeeId,
        departmentId: me.departmentId,
        costCenterId: me.costCenterId,
        requiredDate: formData.requiredDate,
        priority: formData.priority,
        purpose: formData.productName || formData.justification || "Purchase request",
        remarks: formData.justification,
        estimatedAmount: estimatedTotal,
      });
      // Creation deliberately produces a draft in the backend. Submit it as a
      // second operation so approval routing and its audit event are actually
      // persisted before showing the success state.
      const submitted = await apiPost(`/api/purchase-requests/${created.id}/submit`);
      setSubmittedRef(submitted.requestNumber || created.requestNumber || `PR #${created.id}`);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || "Unable to submit the request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedTotal =
    (parseFloat(formData.unitPrice) || 0) * (parseInt(formData.quantity) || 1);

  return (
    <div className="emp-create-request-container">
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <PlusCircle color="#f8b400" /> Create Purchase Requisition
          </h1>
          <p className="emp-page-subtitle">
            Submit a requisition against your department cost center. It is saved to the database and routed for approval.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff1f2", color: "#be123c", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Section 1: Employee & Department Details */}
            <div className="emp-card emp-card-gold-glow">
              <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <User size={18} color="#f8b400" /> Requester & Cost Center Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="emp-form-group">
                  <label className="emp-form-label">Full Name</label>
                  <input type="text" value={formData.employeeName} readOnly className="emp-form-input" style={{ background: "#f8f9fb", color: "#666666" }} />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Work Email / Username</label>
                  <input type="text" value={formData.employeeEmail} readOnly className="emp-form-input" style={{ background: "#f8f9fb", color: "#666666" }} />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Department</label>
                  <input type="text" value={formData.department} readOnly className="emp-form-input" style={{ background: "#f8f9fb", color: "#666666" }} />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Cost Center</label>
                  <input type="text" value={formData.costCenter} readOnly className="emp-form-input" style={{ background: "#f8f9fb", color: "#666666" }} />
                </div>
              </div>
            </div>

            {/* Section 2: Product / Item Details */}
            <div className="emp-card">
              <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Package size={18} color="#f8b400" /> Item & Product Specifications
              </h3>

              <div className="emp-form-group">
                <label className="emp-form-label">Product / Service Item Name *</label>
                <input type="text" name="productName" placeholder="e.g. Dell XPS 15 Laptop 32GB RAM" value={formData.productName} onChange={handleChange} required className="emp-form-input" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="emp-form-group">
                  <label className="emp-form-label">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="emp-form-select">
                    <option value="Hardware & IT Equipment">Hardware & IT Equipment</option>
                    <option value="Software & Subscriptions">Software & Subscriptions</option>
                    <option value="Office Supplies & Furniture">Office Supplies & Furniture</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Maintenance & Repair">Maintenance & Repair</option>
                  </select>
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Preferred Vendor / Supplier</label>
                  <input type="text" name="vendorPreference" placeholder="e.g. TechNova India" value={formData.vendorPreference} onChange={handleChange} className="emp-form-input" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="emp-form-group">
                  <label className="emp-form-label">Quantity</label>
                  <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} required className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Est. Unit Price (₹)</label>
                  <input type="number" step="0.01" name="unitPrice" placeholder="0.00" value={formData.unitPrice} onChange={handleChange} required className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Priority Level</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="emp-form-select">
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (Requires Justification)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Justification & Delivery */}
            <div className="emp-card">
              <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Building size={18} color="#f8b400" /> Justification & Delivery Location
              </h3>

              <div className="emp-form-group">
                <label className="emp-form-label">Business Justification *</label>
                <textarea name="justification" rows="3" placeholder="Explain why this procurement is required for business operations..." value={formData.justification} onChange={handleChange} required className="emp-form-textarea" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="emp-form-group">
                  <label className="emp-form-label">Required Delivery Date *</label>
                  <input type="date" name="requiredDate" min={new Date().toISOString().split("T")[0]} value={formData.requiredDate} onChange={handleChange} required className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Delivery Address</label>
                  <input type="text" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} placeholder="Office address / floor" className="emp-form-input" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary & File Attachments */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="emp-card" style={{ background: "linear-gradient(135deg, rgba(248, 180, 0, 0.1) 0%, rgba(255, 255, 255, 1) 100%)", border: "1px solid #f8b400" }}>
              <h3 style={{ color: "#111111", fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Requisition Cost Breakdown</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#555555" }}>
                  <span>Quantity:</span>
                  <span style={{ color: "#111111", fontWeight: "700" }}>{formData.quantity || 1}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#555555" }}>
                  <span>Unit Price:</span>
                  <span style={{ color: "#111111", fontWeight: "700" }}>{formatINR(formData.unitPrice || 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#555555" }}>
                  <span>Estimated Tax (10%):</span>
                  <span style={{ color: "#111111", fontWeight: "700" }}>{formatINR(estimatedTotal * 0.1)}</span>
                </div>
                <hr style={{ borderColor: "#ececec", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "800" }}>
                  <span style={{ color: "#111111" }}>Total Estimated:</span>
                  <span style={{ color: "#d97706" }}>{formatINR(estimatedTotal * 1.1)}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting || loading} className="emp-btn-primary-sm" style={{ width: "100%", marginTop: "20px", padding: "14px", justifyContent: "center", fontSize: "15px", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? (
                  <>
                    <Loader2 size={18} className="login-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Submit Requisition
                  </>
                )}
              </button>
            </div>

            {/* File Upload Dropzone */}
            <div className="emp-card">
              <h3 style={{ color: "#111111", fontSize: "16px", fontWeight: "700", marginBottom: "14px" }}>Quotations & Attachments</h3>
              <label className="emp-file-dropzone">
                <input type="file" multiple onChange={handleFileUpload} style={{ display: "none" }} />
                <UploadCloud size={32} color="#f8b400" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "13px", color: "#111111", fontWeight: "700" }}>Click to upload quotes or specifications</p>
                <p style={{ fontSize: "11px", color: "#666666", marginTop: "4px" }}>PDF, DOCX, PNG, JPG up to 15MB</p>
              </label>

              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {files.map((file, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f8f9fb", borderRadius: "8px", border: "1px solid #ececec" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                      <FileText size={16} color="#f8b400" />
                      <div>
                        <p style={{ fontSize: "12px", color: "#111111", fontWeight: "600", whiteSpace: "nowrap" }}>{file.name}</p>
                        <p style={{ fontSize: "10px", color: "#666666" }}>{file.size}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal" style={{ textAlign: "center" }}>
            <CheckCircle2 size={56} color="#059669" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "700" }}>Requisition Submitted Successfully!</h2>
            <p style={{ color: "#555555", fontSize: "14px", marginTop: "8px" }}>Your purchase request has been assigned Reference Number:</p>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#d97706", margin: "16px 0", padding: "12px", background: "rgba(248, 180, 0, 0.15)", borderRadius: "10px", border: "1px dashed #f8b400" }}>
              {submittedRef}
            </div>
            <p style={{ fontSize: "13px", color: "#666666", marginBottom: "24px" }}>An approval notification has been dispatched to your Department Manager.</p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="emp-btn-primary-sm" onClick={() => { setShowSuccessModal(false); onNavigate("my-requests"); }}>
                Go to My Requests
              </button>
              <button className="emp-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111111", border: "1px solid #d9d9d9" }} onClick={() => { setShowSuccessModal(false); onNavigate("dashboard"); }}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRequest;
