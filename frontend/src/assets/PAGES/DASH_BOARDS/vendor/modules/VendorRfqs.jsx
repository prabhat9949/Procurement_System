import React from "react";
import { AlertCircle, Send } from "lucide-react";

// The audited API exposes RFQs by procurement scope, but does not provide a
// verified vendor-scoped RFQ listing. Showing GET /api/rfqs here could reveal
// invitations belonging to other vendors, so this view intentionally does not
// issue that unsafe request.
const VendorRfqs = () => <div className="vnd-rfqs-container"><div className="vnd-page-header"><div><h1 className="vnd-page-title"><Send color="#f8b400" /> RFQs received</h1><p className="vnd-page-subtitle">Buyer RFQ invitations assigned to your vendor account.</p></div></div><div className="vnd-card" style={{ padding: 28, maxWidth: 760 }}><AlertCircle size={20} color="#d97706" /><h3 style={{ marginTop: 12 }}>Vendor RFQ listing is not configured</h3><p style={{ color: "#555", lineHeight: 1.6 }}>The current backend does not expose a verified vendor-scoped RFQ inbox. This page remains unavailable to prevent displaying RFQs that do not belong to the authenticated vendor.</p></div></div>;
export default VendorRfqs;
