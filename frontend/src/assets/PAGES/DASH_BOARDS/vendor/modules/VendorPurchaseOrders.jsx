import React from "react";
import { AlertCircle, ShoppingBag } from "lucide-react";

const VendorPurchaseOrders = () => <div className="vnd-purchase-orders-container"><div className="vnd-page-header"><div><h1 className="vnd-page-title"><ShoppingBag color="#f8b400" /> Buyer purchase orders</h1><p className="vnd-page-subtitle">Purchase orders assigned to your vendor account.</p></div></div><div className="vnd-card" style={{ padding: 28, maxWidth: 760 }}><AlertCircle size={20} color="#d97706" /><h3 style={{ marginTop: 12 }}>Vendor purchase-order inbox is not configured</h3><p style={{ color: "#555", lineHeight: 1.6 }}>The audit did not verify a vendor-isolated purchase-order listing. To avoid exposing another vendor’s orders, PO details and acknowledgement are unavailable until the backend provides that scoped contract.</p></div></div>;
export default VendorPurchaseOrders;
