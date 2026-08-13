import React from "react";
import { AlertCircle, FileCheck2 } from "lucide-react";

const VendorQuotations = () => <div className="vnd-quotations-container"><div className="vnd-page-header"><div><h1 className="vnd-page-title"><FileCheck2 color="#f8b400" /> My quotations</h1><p className="vnd-page-subtitle">Commercial quotations submitted by your vendor account.</p></div></div><div className="vnd-card" style={{ padding: 28, maxWidth: 760 }}><AlertCircle size={20} color="#d97706" /><h3 style={{ marginTop: 12 }}>Vendor quotation access is not configured</h3><p style={{ color: "#555", lineHeight: 1.6 }}>A vendor-isolated quotation query was not verified in the backend. The page is unavailable until the backend can enforce that the authenticated vendor only receives its own quotation records.</p></div></div>;
export default VendorQuotations;
