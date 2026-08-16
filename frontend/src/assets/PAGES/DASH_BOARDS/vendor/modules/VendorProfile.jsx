import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  MapPin,
  FileText,
  Loader2,
  WifiOff,
  Star,
  Globe,
  BadgeCheck,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";

const VendorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p = await apiGet("/api/vendor/my/profile");
      setProfile(p);
    } catch (err) {
      setError(err.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const statusColor = (s) => {
    if (s === "ACTIVE") return "#059669";
    if (s === "PENDING" || s === "PENDING_APPROVAL") return "#d97706";
    if (s === "SUSPENDED" || s === "BLOCKED" || s === "INACTIVE") return "#dc2626";
    return "#64748b";
  };

  return (
    <div style={{ padding: "20px" }}>
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UserCheck color="#f8b400" /> Vendor Profile
          </h1>
          <p className="vnd-page-subtitle">Your company profile — live from the database. Verification status is controlled by Procurement.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading your profile...
        </div>
      ) : profile && (
        <>
          <div className="vnd-card" style={{ padding: "24px", marginBottom: "20px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building size={30} color="#d97706" />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111", margin: 0 }}>{profile.vendorName}</h2>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px", background: `${statusColor(profile.status)}14`, color: statusColor(profile.status) }}>
                  <BadgeCheck size={12} /> {profile.status}
                </span>
              </div>
              <p style={{ color: "#666", fontSize: "14px", margin: "4px 0 0" }}>
                {profile.vendorCode} · {profile.vendorType || "Supplier"}
              </p>
              {profile.rating != null && (
                <p style={{ display: "flex", alignItems: "center", gap: "4px", color: "#d97706", fontSize: "13px", fontWeight: 700, margin: "6px 0 0" }}>
                  <Star size={14} /> {Number(profile.rating).toFixed(1)} rating
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="vnd-card" style={{ padding: "22px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={16} color="#d97706" /> Contact Information
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
                <div><span style={{ color: "#888" }}>Contact Person</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.contactPerson || "—"}</p></div>
                <div><span style={{ color: "#888" }}>Email</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.email || "—"}</p></div>
                <div><span style={{ color: "#888" }}>Phone</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.phone || profile.mobile || "—"}</p></div>
                <div><span style={{ color: "#888" }}>Website</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.website || "—"}</p></div>
              </div>
            </div>

            <div className="vnd-card" style={{ padding: "22px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={16} color="#d97706" /> Registered Address
              </h4>
              <p style={{ fontSize: "13.5px", color: "#333", margin: "0 0 12px" }}>
                {[profile.addressLine1, profile.addressLine2, profile.city, profile.state, profile.postalCode, profile.country].filter(Boolean).join(", ") || "—"}
              </p>
              <div style={{ borderTop: "1px solid #ececec", paddingTop: "12px", fontSize: "13.5px" }}>
                <div><span style={{ color: "#888" }}>GSTIN</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.gstNumber || "—"}</p></div>
                <div style={{ marginTop: "8px" }}><span style={{ color: "#888" }}>PAN</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.panNumber || "—"}</p></div>
                <div style={{ marginTop: "8px" }}><span style={{ color: "#888" }}>Registration No</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.registrationNumber || "—"}</p></div>
              </div>
            </div>

            <div className="vnd-card" style={{ padding: "22px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={16} color="#d97706" /> Business & Payment Terms
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
                <div><span style={{ color: "#888" }}>Business Type</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.vendorType || "—"}</p></div>
                <div><span style={{ color: "#888" }}>Payment Terms</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.paymentTerms || "—"}</p></div>
                <div><span style={{ color: "#888" }}>Payment Method</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.paymentMethod || "—"}</p></div>
                <div><span style={{ color: "#888" }}>Credit Limit</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.creditLimit != null ? `₹${Number(profile.creditLimit).toLocaleString("en-IN")}` : "—"}</p></div>
              </div>
            </div>

            <div className="vnd-card" style={{ padding: "22px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="#d97706" /> Account Status
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
                <div>
                  <span style={{ color: "#888" }}>Status</span>
                  <p style={{ fontWeight: 800, margin: "2px 0 0", color: statusColor(profile.status) }}>{profile.status}</p>
                </div>
                <div><span style={{ color: "#888" }}>Approved</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.approved ? "Yes" : "No"}</p></div>
                <div><span style={{ color: "#888" }}>Currency</span><p style={{ fontWeight: 700, margin: "2px 0 0" }}>{profile.currency || "INR"}</p></div>
                <p style={{ fontSize: "12px", color: "#888", margin: "8px 0 0" }}>
                  Status changes are controlled by the procurement team — vendors cannot change their own verification status.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VendorProfile;
