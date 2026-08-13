import React from "react";
import { FileLock2 } from "lucide-react";

const ExecInvoices = () => (
  <div className="pe-invoices-container" style={{ padding: 20 }}>
    <div className="pe-page-header" style={{ marginBottom: 24 }}>
      <h1 className="pe-page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}><FileLock2 color="#f8b400" size={28} /> Commercial Invoices & Billing</h1>
      <p className="pe-page-subtitle">Invoice records are protected finance data.</p>
    </div>
    <div className="pe-card" style={{ padding: 32, maxWidth: 720 }}>
      <h2 style={{ fontSize: 18, marginTop: 0 }}>Invoice access is not configured for this role</h2>
      <p style={{ color: "#555", lineHeight: 1.6 }}>The verified backend authorizes invoice listing only for Finance, Admin, and Super Admin roles. This page intentionally does not request organization-wide invoice data or filter it in the browser.</p>
      <p style={{ color: "#666" }}>Ask an administrator to provide a vendor- or procurement-scoped backend endpoint if this view is required.</p>
    </div>
  </div>
);
export default ExecInvoices;
