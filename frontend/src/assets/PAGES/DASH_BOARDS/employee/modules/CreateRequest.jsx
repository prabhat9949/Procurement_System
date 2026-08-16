import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  Package,
  Building,
  CalendarClock,
  AlertCircle,
  CheckCircle2,
  Send,
  Save,
  Loader2,
  IndianRupee,
  Search,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR } from "../../../../../utils/format";
import { hasPermission } from "../../../../../utils/permissions";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const CreateRequest = ({ onNavigate }) => {
  // Read effective permissions at render time so admin grants/revocations
  // take effect after a session refresh without a stale module-level value.
  const canCreate = hasPermission("CAN_CREATE_PR");
  const canSubmit = hasPermission("CAN_SUBMIT_PR");
  const [me, setMe] = useState(null);
  const [products, setProducts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    unitPrice: "",
    costCenterId: "",
    requiredDate: "",
    priority: "MEDIUM",
    purpose: "",
    remarks: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const employee = await apiGet("/api/employees/me");
        setMe(employee);
        const productList = await apiGet("/api/products/active");
        setProducts(productList || []);
        if (employee?.departmentId) {
          const cc = await apiGet(`/api/cost-centers/by-department/${employee.departmentId}`);
          setCostCenters(cc || []);
          setForm((f) => ({
            ...f,
            costCenterId:
              employee.costCenterId && cc?.some((c) => c.id === employee.costCenterId)
                ? employee.costCenterId
                : (cc?.[0]?.id ?? ""),
          }));
        }
      } catch (err) {
        setError(err.message || "Unable to load the request form data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedProduct = products.find((p) => p.id === Number(form.productId));
  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.categoryName).filter(Boolean)))];
  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === "ALL" || product.categoryName === categoryFilter;
    const q = productSearch.trim().toLowerCase();
    const matchesSearch = !q
      || (product.productName || "").toLowerCase().includes(q)
      || (product.sku || "").toLowerCase().includes(q)
      || (product.brand || "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleProductChange = (value) => {
    const product = products.find((p) => p.id === Number(value));
    setForm((f) => ({
      ...f,
      productId: value,
      unitPrice: product?.unitPrice != null ? product.unitPrice : f.unitPrice,
    }));
  };

  const total = Number(form.quantity || 0) * Number(form.unitPrice || 0);

  const validate = () => {
    if (!form.productId) return "Please select a product or service from the catalogue.";
    if (!form.quantity || Number(form.quantity) <= 0) return "Quantity must be a positive number.";
    if (form.unitPrice === "" || Number(form.unitPrice) < 0) return "Unit price is required.";
    if (!form.costCenterId) return "Please select a cost center.";
    if (!form.requiredDate) return "Required delivery/access date is required.";
    if (new Date(form.requiredDate) <= new Date(new Date().toDateString()))
      return "Required date must be in the future.";
    if (!form.purpose.trim()) return "Please provide a business justification.";
    return "";
  };

  const buildHeaderPayload = () => ({
    requesterId: me.employeeId || me.id,
    departmentId: me.departmentId,
    costCenterId: Number(form.costCenterId),
    requiredDate: form.requiredDate,
    priority: form.priority,
    purpose: form.purpose.trim(),
    remarks: form.remarks.trim() || null,
    estimatedAmount: Number(total.toFixed(2)),
  });

  const saveRequest = async (submitAfter) => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const pr = await apiPost("/api/purchase-requests", buildHeaderPayload());
      await apiPost("/api/purchase-request-lines", {
        purchaseRequestId: pr.id,
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        remarks: form.remarks.trim() || null,
      });
      if (submitAfter) {
        await apiPost(`/api/purchase-requests/${pr.id}/submit`);
        setSuccess(`${pr.requestNumber} submitted for approval.`);
      } else {
        setSuccess(`${pr.requestNumber} saved as draft.`);
      }
      setTimeout(() => onNavigate("my-requests"), 1400);
    } catch (err) {
      setError(err.message || "Failed to save the request. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d7dce3",
    borderRadius: "9px",
    fontSize: "13.5px",
    background: "#fff",
    outline: "none",
  };

  const fieldLabel = { display: "block", fontSize: "12.5px", fontWeight: "700", color: "#374151", marginBottom: "6px" };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "100px 0", color: "#888", fontWeight: 600 }}>
        <Loader2 size={22} className="lro-spin" /> Loading your request form...
      </div>
    );
  }

  return (
    <div className="emp-card" style={{ padding: "28px", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#2563eb14", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PlusCircle size={22} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111" }}>Create Purchase Request</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Raise a requirement — it will be routed through the configured approval workflow after submission.</p>
        </div>
      </div>

      {me && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "14px 0", padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #eef1f5", fontSize: 12.5, color: "#475569" }}>
          <span><strong>Requester:</strong> {me.firstName} {me.lastName}</span>
          <span><strong>ID:</strong> {me.employeeCode}</span>
          <span><strong>Department:</strong> {me.departmentName}</span>
          <span><strong>Role:</strong> {me.roleName}</span>
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, padding: "12px 14px", margin: "12px 0", fontSize: 13 }}>
          <AlertCircle size={17} /> {error}
        </div>
      )}
      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 10, padding: "12px 14px", margin: "12px 0", fontSize: 13 }}>
          <CheckCircle2 size={17} /> {success}
        </div>
      )}

      {/* ============ Item & Requirement ============ */}
      <section style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <Package size={16} color="#2563eb" /> Item &amp; Requirement
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={fieldLabel}>Product / Service *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10, marginBottom: 10 }}>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: 12, color: "#94a3b8" }} />
                <input
                  type="text"
                  style={{ ...inputStyle, paddingLeft: 34 }}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by product, SKU, or brand"
                />
              </div>
              <select style={inputStyle} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "ALL" ? "All categories" : category}
                  </option>
                ))}
              </select>
            </div>
            <select style={inputStyle} value={form.productId} onChange={(e) => handleProductChange(e.target.value)}>
              <option value="">Select from catalogue…</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} {p.sku ? `(${p.sku})` : ""} — {p.categoryName || "Uncategorised"}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                {selectedProduct.description || "No description on file"} · SKU {selectedProduct.sku || "—"} · Brand {selectedProduct.brand || "—"} · Reference price {formatINR(selectedProduct.unitPrice)}
              </div>
            )}
            {!selectedProduct && (
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                Only active catalogue products are shown. If the required item is missing, it needs the non-catalog request workflow.
              </div>
            )}
          </div>
          <div>
            <label style={fieldLabel}>Quantity *</label>
            <input type="number" min="0.001" step="any" style={inputStyle} value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
          </div>
          <div>
            <label style={fieldLabel}>Unit Price (₹) *</label>
            <input type="number" min="0" step="any" style={inputStyle} value={form.unitPrice} onChange={(e) => update("unitPrice", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 13.5, color: "#1e3a8a" }}>
          <IndianRupee size={16} />
          <strong>Estimated Total Cost:</strong>&nbsp;{formatINR(total)}
          <span style={{ color: "#64748b", fontSize: 12 }}>(quantity × unit price — final amount is validated by the backend)</span>
        </div>
      </section>

      {/* ============ Cost Center & Dates ============ */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <Building size={16} color="#2563eb" /> Cost Center &amp; Timeline
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={fieldLabel}>Cost Center *</label>
            <select style={inputStyle} value={form.costCenterId} onChange={(e) => update("costCenterId", e.target.value)}>
              <option value="">Select cost center…</option>
              {costCenters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            {costCenters.length === 0 && (
              <div style={{ fontSize: 12, color: "#b45309", marginTop: 6 }}>No active cost centers found for your department. Please contact Finance.</div>
            )}
          </div>
          <div>
            <label style={fieldLabel}>Required By (Delivery / Access) *</label>
            <input type="date" style={inputStyle} value={form.requiredDate} onChange={(e) => update("requiredDate", e.target.value)} />
          </div>
          <div>
            <label style={fieldLabel}>Priority *</label>
            <select style={inputStyle} value={form.priority} onChange={(e) => update("priority", e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ============ Justification ============ */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarClock size={16} color="#2563eb" /> Business Justification
        </h3>
        <div>
          <label style={fieldLabel}>Why is this product/service required? *</label>
          <textarea
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            value={form.purpose}
            maxLength={1000}
            onChange={(e) => update("purpose", e.target.value)}
            placeholder="e.g. Required for the new development workstation being onboarded this month."
          />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={fieldLabel}>Remarks / Delivery Notes (optional)</label>
          <textarea
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
            value={form.remarks}
            maxLength={1000}
            onChange={(e) => update("remarks", e.target.value)}
            placeholder="Delivery location, access details, or any additional notes."
          />
        </div>
      </section>

      {/* ============ Actions ============ */}
      <div style={{ display: "flex", gap: 12, marginTop: 28, paddingTop: 20, borderTop: "1px solid #eef1f5" }}>
        {canCreate && (
          <button
            className="emp-btn-primary-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#059669" }}
            disabled={saving}
            onClick={() => saveRequest(false)}
          >
            {saving ? <Loader2 size={15} className="lro-spin" /> : <Save size={15} />} Save Draft
          </button>
        )}
        {canSubmit && (
          <button
            className="emp-btn-primary-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
            disabled={saving}
            onClick={() => saveRequest(true)}
          >
            {saving ? <Loader2 size={15} className="lro-spin" /> : <Send size={15} />} Submit for Approval
          </button>
        )}
        {!canCreate && !canSubmit && (
          <div style={{ fontSize: 13, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} /> You do not have permission to create or submit purchase requests. Contact your administrator.
          </div>
        )}
        <button
          className="emp-btn-primary-sm"
          style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
          onClick={() => onNavigate("my-requests")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateRequest;
