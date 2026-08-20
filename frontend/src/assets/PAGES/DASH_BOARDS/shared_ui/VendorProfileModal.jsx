import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Tag,
  Star,
  CheckCircle2,
  Package,
  IndianRupee,
  Truck,
  Award,
  Clock,
  X,
  Send,
  FileCheck2,
  BarChart2,
  Plus
} from "lucide-react";

export const defaultVendorProfile = {
  companyName: "ABC Technologies Pvt. Ltd.",
  vendorId: "VEN-2026-001",
  vendorType: "Electronics Supplier",
  email: "sales@abctech.com",
  phone: "+91 98765 43210",
  location: "Chennai, Tamil Nadu, India",
  productsServices: [
    "Laptops",
    "Desktop Computers",
    "Printers",
    "Computer Accessories",
    "Office Equipment",
  ],
  performance: {
    rating: "4.8 / 5",
    totalOrdersCompleted: 185,
    onTimeDeliveries: "97%",
    successfulTransactions: "98%",
    responseTime: "Within 4 Hours",
  },
  pricingInfo: [
    "Competitive Pricing",
    "Bulk Order Discounts Available",
    "GST Included",
    "Negotiable Prices",
  ],
  deliveryInfo: {
    deliveryTime: "3 - 5 Business Days",
    shippingAvailability: "PAN India",
  },
  certifications: [
    "GST Verified",
    "ISO Certified",
    "Company Verified",
    "Approved Vendor",
  ],
  recentProcurement: {
    lastOrderValue: "₹2,50,000",
    lastOrderDate: "12 July 2026",
    totalTransactions: 356,
  },
};

const VendorProfileModal = ({ vendor = defaultVendorProfile, onClose, onAction }) => {
  const [toastMsg, setToastMsg] = useState("");

  const data = {
    ...defaultVendorProfile,
    ...vendor,
    performance: { ...defaultVendorProfile.performance, ...(vendor.performance || {}) },
    deliveryInfo: { ...defaultVendorProfile.deliveryInfo, ...(vendor.deliveryInfo || {}) },
    recentProcurement: { ...defaultVendorProfile.recentProcurement, ...(vendor.recentProcurement || {}) },
  };

  const handleButtonClick = (actionName) => {
    setToastMsg(`Action Triggered: ${actionName} for ${data.companyName}!`);
    if (onAction) onAction(actionName, data);
    setTimeout(() => setToastMsg(""), 3500);
  };

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
          border: "1px solid #d9d9d9",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid #ececec",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, rgba(248, 180, 0, 0.12) 0%, #ffffff 100%)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)",
                color: "#000000",
                fontWeight: "800",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building size={22} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
                OFFICIAL VENDOR PROFILE
              </span>
              <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "800", margin: "2px 0 0" }}>
                {data.companyName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#ffffff",
              border: "1px solid #d9d9d9",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#555555",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Toast Feedback */}
        {toastMsg && (
          <div
            style={{
              background: "rgba(5, 150, 105, 0.12)",
              borderBottom: "1px solid #059669",
              color: "#059669",
              padding: "12px 28px",
              fontWeight: "700",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} /> {toastMsg}
          </div>
        )}

        {/* Modal Body Scrollable Content */}
        <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
          
          {/* SECTION 1: COMPANY & CONTACT IDENTIFICATION */}
          <div
            style={{
              background: "#f8f9fb",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #ececec",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              fontSize: "13.5px",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                Company Name
              </span>
              <p style={{ fontWeight: "800", color: "#111111", fontSize: "16px", margin: "2px 0" }}>
                {data.companyName}
              </p>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                Vendor ID
              </span>
              <p style={{ fontWeight: "800", color: "#d97706", fontSize: "15px", margin: "2px 0" }}>
                {data.vendorId || data.id}
              </p>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                Vendor Type
              </span>
              <p style={{ fontWeight: "700", color: "#111111", margin: "2px 0" }}>
                {data.vendorType || data.category}
              </p>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                Official Email
              </span>
              <p style={{ fontWeight: "700", color: "#3b82f6", margin: "2px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} /> {data.email}
              </p>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                Phone Number
              </span>
              <p style={{ fontWeight: "700", color: "#111111", margin: "2px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone size={14} /> {data.phone}
              </p>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                Location / Registered Address
              </span>
              <p style={{ fontWeight: "700", color: "#111111", margin: "2px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={14} color="#d97706" /> {data.location}
              </p>
            </div>
          </div>

          {/* SECTION 2: PRODUCTS / SERVICES */}
          <div>
            <h3
              style={{
                fontSize: "15px",
                color: "#111111",
                fontWeight: "800",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Package size={18} color="#f8b400" /> Products / Services Catalog
            </h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {(data.productsServices || []).map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #d9d9d9",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    color: "#111111",
                    fontWeight: "700",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  • {item}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION 3: VENDOR PERFORMANCE */}
          <div>
            <h3
              style={{
                fontSize: "15px",
                color: "#111111",
                fontWeight: "800",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Award size={18} color="#f8b400" /> Vendor Performance Scorecard
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat( auto-fit, minmax(130px, 1fr) )",
                gap: "12px",
              }}
            >
              <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>Overall Rating</span>
                <p style={{ fontSize: "18px", color: "#d97706", fontWeight: "800", margin: "4px 0 0" }}>{data.performance.rating}</p>
              </div>

              <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>Orders Completed</span>
                <p style={{ fontSize: "18px", color: "#111", fontWeight: "800", margin: "4px 0 0" }}>{data.performance.totalOrdersCompleted}</p>
              </div>

              <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>On-Time Deliveries</span>
                <p style={{ fontSize: "18px", color: "#059669", fontWeight: "800", margin: "4px 0 0" }}>{data.performance.onTimeDeliveries}</p>
              </div>

              <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>Successful Txns</span>
                <p style={{ fontSize: "18px", color: "#059669", fontWeight: "800", margin: "4px 0 0" }}>{data.performance.successfulTransactions}</p>
              </div>

              <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>Response Time</span>
                <p style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "800", margin: "6px 0 0" }}>{data.performance.responseTime}</p>
              </div>
            </div>
          </div>

          {/* SECTION 4 & 5: PRICING INFORMATION & DELIVERY INFORMATION */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Pricing Information */}
            <div style={{ background: "#ffffff", border: "1px solid #ececec", padding: "16px", borderRadius: "12px" }}>
              <h4 style={{ fontSize: "14px", color: "#111", fontWeight: "800", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <IndianRupee size={16} color="#059669" /> Pricing Information
              </h4>
              <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "13px", color: "#444", display: "flex", flexDirection: "column", gap: "6px" }}>
                {(data.pricingInfo || []).map((p, i) => (
                  <li key={i} style={{ fontWeight: "600" }}>{p}</li>
                ))}
              </ul>
            </div>

            {/* Delivery Information */}
            <div style={{ background: "#ffffff", border: "1px solid #ececec", padding: "16px", borderRadius: "12px" }}>
              <h4 style={{ fontSize: "14px", color: "#111", fontWeight: "800", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Truck size={16} color="#f8b400" /> Delivery Information
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase" }}>Delivery Time:</span>
                  <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{data.deliveryInfo.deliveryTime}</p>
                </div>
                <div>
                  <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase" }}>Shipping Availability:</span>
                  <p style={{ fontWeight: "700", color: "#059669", margin: "2px 0 0" }}>{data.deliveryInfo.shippingAvailability}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: CERTIFICATIONS */}
          <div>
            <h3
              style={{
                fontSize: "15px",
                color: "#111111",
                fontWeight: "800",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle2 size={18} color="#059669" /> Enterprise Certifications
            </h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {(data.certifications || []).map((c, i) => (
                <span
                  key={i}
                  style={{
                    background: "rgba(5, 150, 105, 0.12)",
                    border: "1px solid #059669",
                    color: "#059669",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "800",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION 7: RECENT PROCUREMENT DETAILS */}
          <div style={{ background: "#f8f9fb", padding: "18px", borderRadius: "12px", border: "1px solid #ececec" }}>
            <h4 style={{ fontSize: "14px", color: "#111", fontWeight: "800", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} color="#d97706" /> Recent Procurement Details
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", fontSize: "13px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Last Order Value</span>
                <p style={{ fontWeight: "800", color: "#059669", fontSize: "16px", margin: "2px 0 0" }}>{data.recentProcurement.lastOrderValue}</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Last Order Date</span>
                <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{data.recentProcurement.lastOrderDate}</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Total Transactions</span>
                <p style={{ fontWeight: "800", color: "#111", margin: "2px 0 0" }}>{data.recentProcurement.totalTransactions}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Buttons */}
        <div
          style={{
            padding: "20px 28px",
            borderTop: "1px solid #ececec",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            flexWrap: "wrap",
            position: "sticky",
            bottom: 0,
          }}
        >
          <button
            className="pe-btn-primary-sm"
            style={{ background: "#ffffff", color: "#111111", border: "1px solid #d9d9d9" }}
            onClick={() => handleButtonClick("View Products")}
          >
            <Package size={15} /> View Products
          </button>

          <button
            className="pe-btn-primary-sm"
            style={{ background: "#ffffff", color: "#111111", border: "1px solid #d9d9d9" }}
            onClick={() => handleButtonClick("View Quotations")}
          >
            <FileCheck2 size={15} /> View Quotations
          </button>

          <button
            className="pe-btn-primary-sm"
            style={{ background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)", color: "#000000", fontWeight: "800" }}
            onClick={() => handleButtonClick("Send RFQ")}
          >
            <Send size={15} /> Send RFQ
          </button>

          <button
            className="pe-btn-primary-sm"
            style={{ background: "#059669", color: "#ffffff", border: "none", fontWeight: "700" }}
            onClick={() => handleButtonClick("Add to Comparison")}
          >
            <Plus size={15} /> Add to Comparison
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VendorProfileModal;
