import React, { useState } from "react";
import VendorProfileModal from "../../shared_ui/VendorProfileModal";
import {
  Users,
  Search,
  Star,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Building,
  Eye,
  Plus,
  BarChart3,
  TrendingUp,
  XCircle,
  FileText,
  Clock,
  DollarSign,
  Award,
  Lock,
  RotateCcw,
  Check
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const initialVendors = [
  {
    id: "VEN-2026-001",
    name: "ABC Technologies Pvt. Ltd.",
    type: "Electronics & Hardware",
    rating: 4.8,
    status: "Active", // 'Active' | 'Blacklisted'
    onTimeDelivery: "97.0%",
    completionRate: "98.0%",
    responseTime: "Within 4 Hours",
    complianceStatus: "Certified & GST Verified",
    certifications: ["GST Verified", "ISO Certified", "Company Verified", "Approved Vendor"],
    lastOrderValue: "₹2,50,000",
    lastOrderDate: "12 July 2026",
    totalTransactions: 185,
    email: "sales@abctech.com",
    phone: "+91 98765 43210",
    location: "Chennai, Tamil Nadu, India",
    leadTime: "3 - 5 Business Days",
    shippingCoverage: "PAN India",
  },
  {
    id: "VND-101",
    name: "Apple Business Direct",
    type: "Hardware & IT Workstations",
    rating: 4.9,
    status: "Active",
    onTimeDelivery: "99.2%",
    completionRate: "99.5%",
    responseTime: "Within 1 Hour",
    complianceStatus: "Tier 1 Enterprise Certified",
    certifications: ["GST Verified", "ISO Certified", "Tier 1 OEM Direct", "Approved Vendor"],
    lastOrderValue: "$36,990.00",
    lastOrderDate: "26 July 2026",
    totalTransactions: 240,
    email: "enterprise@apple.com",
    phone: "+1 (800) 692-7753",
    location: "Cupertino, CA, USA",
    leadTime: "2 - 3 Business Days",
    shippingCoverage: "Global Priority Express",
  },
  {
    id: "VND-102",
    name: "CDW Direct",
    type: "Hardware & Reseller SLA",
    rating: 4.7,
    status: "Active",
    onTimeDelivery: "96.5%",
    completionRate: "97.2%",
    responseTime: "Within 2 Hours",
    complianceStatus: "ISO Certified",
    certifications: ["GST Verified", "ISO Certified", "Approved Vendor"],
    lastOrderValue: "$38,490.00",
    lastOrderDate: "20 July 2026",
    totalTransactions: 142,
    email: "bids@cdw.com",
    phone: "+1 (800) 800-4239",
    location: "Vernon Hills, IL, USA",
    leadTime: "1 - 2 Business Days",
    shippingCoverage: "North America & International",
  },
  {
    id: "VND-104",
    name: "Datadog Inc.",
    type: "Software & SaaS",
    rating: 5.0,
    status: "Active",
    onTimeDelivery: "100.0%",
    completionRate: "100.0%",
    responseTime: "Instant Provisioning",
    complianceStatus: "SOC2 & ISO 27001",
    certifications: ["SOC2 Type II", "ISO 27001", "Approved Vendor"],
    lastOrderValue: "$8,500.00",
    lastOrderDate: "25 July 2026",
    totalTransactions: 98,
    email: "sales@datadoghq.com",
    phone: "+1 (866) 329-4448",
    location: "New York, NY, USA",
    leadTime: "Instant SLA",
    shippingCoverage: "Digital Cloud Tenant",
  },
  {
    id: "VND-106",
    name: "Cisco Systems Direct",
    type: "Networking & Infra",
    rating: 4.8,
    status: "Active",
    onTimeDelivery: "95.8%",
    completionRate: "97.0%",
    responseTime: "Within 3 Hours",
    complianceStatus: "OEM Certified",
    certifications: ["GST Verified", "ISO Certified", "OEM Direct"],
    lastOrderValue: "$28,400.00",
    lastOrderDate: "18 July 2026",
    totalTransactions: 115,
    email: "commercial@cisco.com",
    phone: "+1 (800) 553-6387",
    location: "San Jose, CA, USA",
    leadTime: "3 - 4 Business Days",
    shippingCoverage: "PAN India & Global",
  },
  {
    id: "VND-999",
    name: "Legacy Media Corp",
    type: "Promotional Print Supplies",
    rating: 3.2,
    status: "Blacklisted",
    onTimeDelivery: "72.0%",
    completionRate: "81.0%",
    responseTime: "Over 48 Hours",
    complianceStatus: "Non-Compliant SLA Violation",
    certifications: ["Company Verified"],
    lastOrderValue: "$10,500.00",
    lastOrderDate: "10 June 2026",
    totalTransactions: 12,
    email: "quotes@legacymedia.com",
    phone: "+1 (800) 555-9011",
    location: "Chicago, IL, USA",
    leadTime: "14+ Business Days",
    shippingCoverage: "Restricted Courier",
    blacklistReason: "Repeated contract delivery delays & quality non-compliance.",
  },
];

const vendorAnalyticsSpend = [
  { name: "Apple Direct", spend: 185000, orders: 42 },
  { name: "CDW Direct", spend: 115000, orders: 28 },
  { name: "Datadog SaaS", spend: 68500, orders: 14 },
  { name: "Cisco Systems", spend: 55200, orders: 19 },
  { name: "ABC Tech", spend: 42000, orders: 35 },
];

const vendorAnalyticsShare = [
  { name: "Apple Direct", value: 38, color: "#f8b400" },
  { name: "CDW Direct", value: 24, color: "#059669" },
  { name: "Datadog SaaS", value: 14, color: "#3b82f6" },
  { name: "Cisco Systems", value: 12, color: "#7c3aed" },
  { name: "ABC Tech", value: 12, color: "#d97706" },
];

const VendorManagement = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [activeTabFilter, setActiveTabFilter] = useState("all"); // 'all' | 'Active' | 'Blacklisted' | 'comparison' | 'analytics'
  const [searchTerm, setSearchTerm] = useState("");

  // Selected Vendor Profile Modal
  const [profileVendor, setProfileVendor] = useState(null);

  // Vendor Comparison Selection State
  const [comparedVendorIds, setComparedVendorIds] = useState(["VEN-2026-001", "VND-101"]);

  // Blacklist Confirmation Modal
  const [blacklistModalVendor, setBlacklistModalVendor] = useState(null);
  const [blacklistReasonInput, setBlacklistReasonInput] = useState("SLA Delivery Breach & Quality Non-Compliance");

  const [toastMsg, setToastMsg] = useState("");

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTabFilter === "all" ||
      (activeTabFilter === "Active" && v.status === "Active") ||
      (activeTabFilter === "Blacklisted" && v.status === "Blacklisted");
    return matchesSearch && matchesTab;
  });

  const handleToggleBlacklist = (vendorObj) => {
    const isCurrentlyBlacklisted = vendorObj.status === "Blacklisted";
    const updated = vendors.map((v) => {
      if (v.id === vendorObj.id) {
        return {
          ...v,
          status: isCurrentlyBlacklisted ? "Active" : "Blacklisted",
          blacklistReason: isCurrentlyBlacklisted ? null : blacklistReasonInput,
        };
      }
      return v;
    });
    setVendors(updated);
    setBlacklistModalVendor(null);
    setToastMsg(
      `Supplier "${vendorObj.name}" ${isCurrentlyBlacklisted ? "restored to Active status!" : "added to Blacklisted status!"}`
    );
    setTimeout(() => setToastMsg(""), 4000);
  };

  const activeCount = vendors.filter((v) => v.status === "Active").length;
  const blacklistedCount = vendors.filter((v) => v.status === "Blacklisted").length;

  return (
    <div className="pman-vendor-management-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Users color="#f8b400" /> Enterprise Vendor Management & Ratings Hub
          </h1>
          <p className="pman-page-subtitle">
            Evaluate vendor performance, compliance certifications, delivery metrics, analytics, and blacklisting status.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            background: "rgba(5, 150, 105, 0.12)",
            border: "1px solid #059669",
            color: "#059669",
            padding: "14px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontWeight: "700",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* FILTER TABS & SEARCH BAR */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Tabs: View All, Active, Blacklisted, Vendor Comparison, Vendor Analytics */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTabFilter("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "all" ? "#f8b400" : "#f8f9fb",
                color: activeTabFilter === "all" ? "#000000" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
              }}
            >
              View All Vendors ({vendors.length})
            </button>

            <button
              onClick={() => setActiveTabFilter("Active")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "Active" ? "#059669" : "#f8f9fb",
                color: activeTabFilter === "Active" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <CheckCircle2 size={15} /> Active Vendors ({activeCount})
            </button>

            <button
              onClick={() => setActiveTabFilter("Blacklisted")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "Blacklisted" ? "#dc2626" : "#f8f9fb",
                color: activeTabFilter === "Blacklisted" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <XCircle size={15} /> Blacklisted Vendors ({blacklistedCount})
            </button>

            <button
              onClick={() => setActiveTabFilter("comparison")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "comparison" ? "#3b82f6" : "#f8f9fb",
                color: activeTabFilter === "comparison" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Building size={15} /> Vendor Comparison Matrix
            </button>

            <button
              onClick={() => setActiveTabFilter("analytics")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTabFilter === "analytics" ? "#7c3aed" : "#f8f9fb",
                color: activeTabFilter === "analytics" ? "#ffffff" : "#555555",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <BarChart3 size={15} /> Vendor Analytics
            </button>
          </div>

          {/* Search Bar */}
          {activeTabFilter !== "comparison" && activeTabFilter !== "analytics" && (
            <div style={{ position: "relative", width: "300px" }}>
              <Search
                size={15}
                color="#666666"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search vendor name, ID or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pman-form-input"
                style={{ paddingLeft: "36px", height: "38px" }}
              />
            </div>
          )}

        </div>
      </div>

      {/* VIEW SECTION 1: VENDOR COMPARISON MATRIX */}
      {activeTabFilter === "comparison" ? (
        <div className="pman-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Building color="#f8b400" size={20} /> Side-by-Side Vendor Comparison Matrix
          </h3>

          <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
            {vendors.map((v) => (
              <label key={v.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", background: comparedVendorIds.includes(v.id) ? "rgba(248, 180, 0, 0.15)" : "#f8f9fb", padding: "6px 12px", borderRadius: "8px", border: "1px solid #d9d9d9" }}>
                <input
                  type="checkbox"
                  checked={comparedVendorIds.includes(v.id)}
                  onChange={() => {
                    if (comparedVendorIds.includes(v.id)) {
                      if (comparedVendorIds.length > 1) setComparedVendorIds(comparedVendorIds.filter((id) => id !== v.id));
                    } else {
                      setComparedVendorIds([...comparedVendorIds, v.id]);
                    }
                  }}
                  style={{ accentColor: "#f8b400" }}
                />
                <span style={{ fontWeight: "700", color: "#111" }}>{v.name}</span>
              </label>
            ))}
          </div>

          {/* Side by Side Grid */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${comparedVendorIds.length}, 1fr)`, gap: "20px" }}>
            {comparedVendorIds.map((id) => {
              const v = vendors.find((x) => x.id === id);
              if (!v) return null;
              return (
                <div key={v.id} className="pman-card pman-card-gold-glow" style={{ padding: "20px" }}>
                  <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>{v.id}</span>
                  <h4 style={{ fontSize: "18px", color: "#111", fontWeight: "800", margin: "4px 0" }}>{v.name}</h4>
                  <p style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}>{v.type}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                    <div style={{ background: "#f8f9fb", padding: "10px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Vendor Rating:</span>
                      <p style={{ fontSize: "16px", color: "#d97706", fontWeight: "800", margin: "2px 0 0" }}>{v.rating} / 5.0 ⭐</p>
                    </div>

                    <div style={{ background: "#f8f9fb", padding: "10px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>On-Time Delivery:</span>
                      <p style={{ fontSize: "16px", color: "#059669", fontWeight: "800", margin: "2px 0 0" }}>{v.onTimeDelivery}</p>
                    </div>

                    <div style={{ background: "#f8f9fb", padding: "10px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>SLA Lead Time:</span>
                      <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{v.leadTime}</p>
                    </div>

                    <div style={{ background: "#f8f9fb", padding: "10px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Certifications:</span>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                        {v.certifications.map((c, i) => (
                          <span key={i} style={{ fontSize: "11px", background: "rgba(5, 150, 105, 0.12)", color: "#059669", padding: "2px 6px", borderRadius: "6px", fontWeight: "700" }}>✓ {c}</span>
                        ))}
                      </div>
                    </div>

                    <button
                      className="pman-btn-primary-sm"
                      style={{ marginTop: "12px", justifyContent: "center" }}
                      onClick={() => setProfileVendor(v)}
                    >
                      <Eye size={14} /> Full Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTabFilter === "analytics" ? (
        /* VIEW SECTION 2: VENDOR ANALYTICS DASHBOARD */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="pman-card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", marginBottom: "16px" }}>
                Total Spend Awarded per Vendor ($USD)
              </h3>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorAnalyticsSpend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                    <XAxis dataKey="name" stroke="#666" fontSize={11} />
                    <YAxis stroke="#666" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #f8b400", borderRadius: "8px" }} />
                    <Bar dataKey="spend" name="Spend ($)" fill="#f8b400" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pman-card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", marginBottom: "16px" }}>
                Supplier Share Allocation (%)
              </h3>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={vendorAnalyticsShare} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={5} dataKey="value">
                      {vendorAnalyticsShare.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #f8b400", borderRadius: "8px" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* VIEW SECTION 3: VENDORS GRID & CARDS (View All, Active, Blacklisted) */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filtered.map((v) => (
            <div key={v.id} className="pman-card pman-card-gold-glow">
              
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>{v.id}</span>
                  <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "800", marginTop: "2px" }}>{v.name}</h3>
                </div>

                <span
                  style={{
                    fontSize: "12px",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontWeight: "800",
                    background: v.status === "Active" ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                    color: v.status === "Active" ? "#059669" : "#dc2626",
                  }}
                >
                  {v.status}
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "#666666", marginBottom: "14px" }}>Category: <strong>{v.type}</strong></p>

              {/* Performance Metrics Box */}
              <div
                style={{
                  padding: "14px",
                  background: "#f8f9fb",
                  borderRadius: "10px",
                  border: "1px solid #ececec",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Overall Rating:</span>
                  <strong style={{ color: "#d97706" }}>{v.rating} / 5.0 ⭐</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Delivery Performance:</span>
                  <strong style={{ color: "#059669" }}>{v.onTimeDelivery} On-Time</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Procurement History:</span>
                  <span>{v.totalTransactions} Orders (Last: {v.lastOrderValue})</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Compliance Status:</span>
                  <span style={{ fontWeight: "700", color: "#059669" }}>{v.complianceStatus}</span>
                </div>
              </div>

              {/* Certifications Badges */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                {v.certifications.map((c, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: "11px",
                      background: "rgba(5, 150, 105, 0.12)",
                      color: "#059669",
                      border: "1px solid #059669",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: "700",
                    }}
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>

              {/* Action Buttons: View Profile & Blacklist / Restore Button */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <button
                  className="pman-btn-primary-sm"
                  style={{ background: "#ffffff", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => setProfileVendor(v)}
                >
                  <Eye size={15} /> View Vendor Profile
                </button>

                {v.status === "Active" ? (
                  <button
                    className="pman-btn-primary-sm"
                    style={{ background: "#ffffff", color: "#dc2626", border: "1px solid #dc2626" }}
                    onClick={() => setBlacklistModalVendor(v)}
                  >
                    <XCircle size={15} /> Blacklist
                  </button>
                ) : (
                  <button
                    className="pman-btn-primary-sm"
                    style={{ background: "#059669", color: "#ffffff", border: "none" }}
                    onClick={() => handleToggleBlacklist(v)}
                  >
                    <CheckCircle2 size={15} /> Restore Active
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* VENDOR PROFILE MODAL (EXACT 8-SECTION SCHEMA) */}
      {profileVendor && (
        <VendorProfileModal
          vendor={{
            companyName: profileVendor.name,
            vendorId: profileVendor.id,
            vendorType: profileVendor.type,
            email: profileVendor.email,
            phone: profileVendor.phone,
            location: profileVendor.location,
            productsServices: ["Laptops", "Workstations", "Servers", "Printers", "Office Accessories"],
            performance: {
              rating: `${profileVendor.rating} / 5`,
              totalOrdersCompleted: profileVendor.totalTransactions,
              onTimeDeliveries: profileVendor.onTimeDelivery,
              successfulTransactions: profileVendor.completionRate,
              responseTime: profileVendor.responseTime,
            },
            pricingInfo: ["Competitive Enterprise Rate", "Bulk Discounts", "GST Included", "Negotiable"],
            deliveryInfo: {
              deliveryTime: profileVendor.leadTime,
              shippingAvailability: profileVendor.shippingCoverage,
            },
            certifications: profileVendor.certifications,
            recentProcurement: {
              lastOrderValue: profileVendor.lastOrderValue,
              lastOrderDate: profileVendor.lastOrderDate,
              totalTransactions: profileVendor.totalTransactions,
            },
          }}
          onClose={() => setProfileVendor(null)}
          onAction={(actionName, vendorData) => {
            setToastMsg(`Action [ ${actionName} ] executed for ${vendorData.companyName}`);
            setTimeout(() => setToastMsg(""), 4000);
          }}
        />
      )}

      {/* BLACKLIST CONFIRMATION MODAL */}
      {blacklistModalVendor && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(220, 38, 38, 0.12)", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <XCircle size={20} />
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "800", textTransform: "uppercase" }}>RESTRICT VENDOR</span>
                  <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800", margin: 0 }}>Blacklist {blacklistModalVendor.name}</h3>
                </div>
              </div>
              <button onClick={() => setBlacklistModalVendor(null)} style={{ background: "none", border: "none", color: "#666" }}><XCircle size={20} /></button>
            </div>

            <p style={{ fontSize: "13.5px", color: "#555", marginBottom: "16px" }}>
              Blacklisting vendor <strong>{blacklistModalVendor.name} ({blacklistModalVendor.id})</strong> will prevent sourcing executives from inviting them to new RFQs or issuing Purchase Orders.
            </p>

            <div className="pman-form-group" style={{ marginBottom: "20px" }}>
              <label className="pman-form-label">Blacklist Reason / Compliance Audit Record *</label>
              <textarea
                className="pman-form-input"
                rows={3}
                value={blacklistReasonInput}
                onChange={(e) => setBlacklistReasonInput(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="pman-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setBlacklistModalVendor(null)}>Cancel</button>
              <button className="pman-btn-primary-sm" style={{ background: "#dc2626", color: "#fff", border: "none" }} onClick={() => handleToggleBlacklist(blacklistModalVendor)}>
                <XCircle size={16} /> Confirm Blacklist
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorManagement;
