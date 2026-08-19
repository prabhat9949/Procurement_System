import React, { useState, useEffect } from "react";
import { Database, Users, Briefcase, Boxes, IndianRupee, ShieldCheck } from "lucide-react";
import {
  getStoredUsers,
  getStoredMasterRequests,
  getStoredVendorProfiles,
  getStoredStockItems,
  getStoredPaymentRequests,
  getBudgetAllocations,
  epsEventBus
} from "../../../../../services/epsApiService";

const OrgMasterDataView = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const load = () => {
      setUsers(getStoredUsers());
      setRequests(getStoredMasterRequests());
      setVendors(getStoredVendorProfiles());
      setInventory(getStoredStockItems());
      setPayments(getStoredPaymentRequests());
      setBudgets(getBudgetAllocations());
    };
    load();
    const unsub = epsEventBus.subscribe(() => {
      load();
    });
    return unsub;
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "28px", fontWeight: "800", color: "#111" }}>
          <Database color="#2563eb" size={32} /> Organization Master Data View
        </h1>
        <p style={{ color: "#666", fontSize: "15px", marginTop: "4px" }}>
          Read-only systemic overview of all entities, resources, and transactional flows across Enterprise Procurement System.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        
        {/* Users */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Users size={18} color="#2563eb" /> All Employees ({users.length})</h3>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {users.map(u => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                <span><strong>{u.name}</strong><br/><span style={{ color: "#666" }}>{u.role}</span></span>
                <span style={{ color: u.status === "Active" ? "#059669" : "#d97706" }}>{u.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Procurement / Requests */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Briefcase size={18} color="#d97706" /> Procurement Status</h3>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {requests.map(r => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                <span><strong>{r.id}</strong> - {r.items?.[0]?.name || "Items"}<br/><span style={{ color: "#666" }}>By: {r.requestor}</span></span>
                <span style={{ fontWeight: "700" }}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Briefcase size={18} color="#6366f1" /> Vendor Status</h3>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {vendors.map(v => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                <span><strong>{v.name}</strong></span>
                <span style={{ color: "#059669" }}>{v.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Boxes size={18} color="#8b5cf6" /> Inventory Data</h3>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {inventory.map(i => (
              <div key={i.sku} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                <span><strong>{i.name}</strong><br/><span style={{ color: "#666" }}>{i.sku}</span></span>
                <span>Avail: <strong>{i.available}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Finance */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><IndianRupee size={18} color="#10b981" /> Finance Management</h3>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {payments.map(p => (
              <div key={p.payId} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                <span><strong>{p.vendorName}</strong> - ${p.amount.toLocaleString()}<br/><span style={{ color: "#666" }}>PO: {p.poId}</span></span>
                <span style={{ fontWeight: "700", color: p.status === "Approved & Wired" ? "#059669" : "#d97706" }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit / Budget */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><ShieldCheck size={18} color="#ef4444" /> Audit Allocated Status</h3>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {budgets.map(b => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                <span><strong>{b.department}</strong><br/><span style={{ color: "#666" }}>{b.id}</span></span>
                <span style={{ color: "#059669", fontWeight: "700" }}>${b.allocatedAmt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrgMasterDataView;
