import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  Send,
  PlusCircle,
  Clock,
  Users,
  CheckCircle2,
  FileText,
  X,
  Search,
  Building,
  Filter,
  ShieldCheck,
  Award,
  IndianRupee,
  Plus,
  Trash2,
  Upload,
  Calendar,
  Package,
  Truck,
  FileCheck2,
  Eye,
  Copy,
  Save,
  AlertCircle
} from "lucide-react";
import { createRfq } from "../../../../../services/epsApiService";

const availableVendorsList = [
  {
    id: "VEN-2026-001",
    name: "ABC Technologies Pvt. Ltd.",
    category: "Electronics & Hardware",
    rating: "4.8 ⭐",
    location: "Chennai, Tamil Nadu, India",
    productsServices: ["Laptops", "Desktop Computers", "Printers", "Computer Accessories"],
    deliveryPerformance: "97% On-Time",
    certificationStatus: "GST & ISO Certified",
    email: "sales@abctech.com",
  },
  {
    id: "VND-101",
    name: "Apple Business Direct",
    category: "Hardware & IT",
    rating: "4.9 ⭐",
    location: "Cupertino, CA, USA",
    productsServices: ["MacBook Pro Workstations", "iPad Pro", "AppleCare Enterprise"],
    deliveryPerformance: "99% On-Time",
    certificationStatus: "Tier 1 Verified",
    email: "enterprise@apple.com",
  },
  {
    id: "VND-102",
    name: "CDW Direct",
    category: "Hardware & IT",
    rating: "4.7 ⭐",
    location: "Vernon Hills, IL, USA",
    productsServices: ["Server Hardware", "Networking", "Laptops & Displays"],
    deliveryPerformance: "96% On-Time",
    certificationStatus: "ISO Certified",
    email: "bids@cdw.com",
  },
  {
    id: "VND-104",
    name: "Datadog Direct",
    category: "Software & SaaS",
    rating: "5.0 ⭐",
    location: "New York, NY, USA",
    productsServices: ["APM Observability", "Log Management", "Infrastructure Monitoring"],
    deliveryPerformance: "100% Instant SLA",
    certificationStatus: "SOC2 & ISO 27001",
    email: "sales@datadoghq.com",
  },
  {
    id: "VND-106",
    name: "Cisco Systems Direct",
    category: "Networking",
    rating: "4.9 ⭐",
    location: "San Jose, CA, USA",
    productsServices: ["Core Switches", "Enterprise Routers", "Firewalls"],
    deliveryPerformance: "98% On-Time",
    certificationStatus: "OEM Certified",
    email: "commercial@cisco.com",
  },
];

const mockPurchaseRequests = [
  { id: "REQ-2026-8921", title: "MacBook Pro M3 Max Workstations", dept: "Engineering & IT", qty: 10, budget: "₹38,990.00" },
  { id: "REQ-2026-8945", title: "Datadog Enterprise APM License", dept: "Engineering & IT", qty: 1, budget: "₹8,500.00" },
  { id: "REQ-2026-8972", title: "Cisco Catalyst 9300 Switches", dept: "Engineering & IT", qty: 2, budget: "₹6,200.00" },
];

const CreateRfqWizardModal = ({ onClose, onRfqCreated, initialReqData }) => {
  // 1. RFQ Information
  const [rfqId] = useState(`RFQ-2026-${Math.floor(930 + Math.random() * 60)}`);
  const [rfqTitle, setRfqTitle] = useState(
    initialReqData?.product || initialReqData?.item || "Procurement of Enterprise Laptops & High-Perf Workstations"
  );
  const [linkedReqId, setLinkedReqId] = useState(initialReqData?.id || "REQ-2026-8921");
  const [departmentName, setDepartmentName] = useState(initialReqData?.dept || "Engineering & IT");
  const [rfqPriority, setRfqPriority] = useState(initialReqData?.priority || "High"); // High, Medium, Low
  const [creationDate] = useState("2026-07-27");
  const [submissionDeadline, setSubmissionDeadline] = useState("2026-08-05");
  const [rfqStatus] = useState("Draft / Ready to Broadcast");

  // 2. Product Requirement Details (Multiple Product Support)
  const [productsList, setProductsList] = useState([
    {
      id: 1,
      productName: initialReqData?.product || initialReqData?.item || "MacBook Pro M3 Max 64GB Unified Memory",
      productCategory: initialReqData?.category || "Hardware & IT",
      quantityRequired: initialReqData?.quantity || initialReqData?.qty || 10,
      unitOfMeasurement: "Units",
      productSpecifications: initialReqData?.justification || "Apple M3 Max 16-Core CPU, 40-Core GPU, 64GB Memory, 1TB SSD Space Gray",
      expectedDeliveryDate: "2026-08-12",
      estimatedBudget: initialReqData?.targetCost || initialReqData?.estimatedCost || "₹38,990.00",
    },
  ]);

  // 3. Vendor Selection
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState("all");
  const [selectedVendors, setSelectedVendors] = useState([
    "ABC Technologies Pvt. Ltd.",
    "Apple Business Direct",
    "CDW Direct",
  ]);

  // 4. Delivery & Shipping Information
  const [deliveryAddress, setDeliveryAddress] = useState("HQ Tech Center, Building 3 Receiving Bay 4, San Jose CA");
  const [deliveryInstructions, setDeliveryInstructions] = useState("Notify Inventory Bay 2 hours prior to arrival. Liftgate truck required.");
  const [deliveryTerms, setDeliveryTerms] = useState("FOB Destination (Prepaid)");
  const [shippingRequirements, setShippingRequirements] = useState("Fragile Air Freight, Temperature Controlled");
  const [warrantyRequirements, setWarrantyRequirements] = useState("3 Years On-Site Enterprise OEM Warranty");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");

  // 5. Quotation Requirements
  const [quotationDeadline, setQuotationDeadline] = useState("2026-08-05 17:00");
  const [requiredDocs, setRequiredDocs] = useState([
    "Commercial Financial Proposal",
    "Technical Compliance Sheet",
    "GST / Tax Verification",
  ]);
  const [currencySelection, setCurrencySelection] = useState("INR (₹)");
  const [taxInformation, setTaxInformation] = useState("GST Included");
  const [specialProcurementReqs, setSpecialProcurementReqs] = useState("Vendor must provide proof of authorized OEM direct reseller status.");
  const [additionalNotes, setAdditionalNotes] = useState("Bids must remain valid for minimum 30 calendar days.");

  // 6. Attachments Section
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "Hardware_Specs_MacBook_Pro.pdf", type: "Technical Spec", size: "2.4 MB" },
    { name: "IT_Procurement_Terms_2026.pdf", type: "Terms & Conditions", size: "1.1 MB" },
  ]);
  const [previewFile, setPreviewFile] = useState(null);

  // Modal feedback
  const [toastMsg, setToastMsg] = useState("");
  const [previewRfqModal, setPreviewRfqModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("2026-07-28 09:00");

  // Helper functions
  const handleAddProduct = () => {
    const newProd = {
      id: Date.now(),
      productName: "",
      productCategory: "Hardware & IT",
      quantityRequired: 1,
      unitOfMeasurement: "Units",
      productSpecifications: "",
      expectedDeliveryDate: submissionDeadline,
      estimatedBudget: "",
    };
    setProductsList([...productsList, newProd]);
  };

  const handleRemoveProduct = (id) => {
    if (productsList.length === 1) {
      alert("At least 1 product requirement is required.");
      return;
    }
    setProductsList(productsList.filter((p) => p.id !== id));
  };

  const handleUpdateProduct = (id, field, val) => {
    setProductsList(
      productsList.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleToggleVendor = (vName) => {
    if (selectedVendors.includes(vName)) {
      setSelectedVendors(selectedVendors.filter((v) => v !== vName));
    } else {
      setSelectedVendors([...selectedVendors, vName]);
    }
  };

  const handleSimulateFileUpload = (e, docType) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setUploadedFiles([
        ...uploadedFiles,
        { name: f.name, type: docType, size: `${(f.size / 1024 / 1024).toFixed(1)} MB` },
      ]);
    }
  };

  const handleRemoveFile = (idx) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx));
  };

  // Section 8 Broadcast Options Handlers
  const handleSendToSelectedVendors = () => {
    if (selectedVendors.length === 0) {
      alert("Please select at least 1 vendor to broadcast the RFQ.");
      return;
    }
    const createdRfqObj = {
      id: rfqId,
      reqId: linkedReqId,
      item: productsList[0]?.productName || rfqTitle,
      category: productsList[0]?.productCategory || "Hardware & IT",
      targetQty: productsList.reduce((acc, curr) => acc + (parseInt(curr.quantityRequired) || 0), 0),
      deadline: submissionDeadline,
      invitedVendors: selectedVendors,
      bidsReceived: 0,
      status: "Active Bidding",
    };
    createRfq(createdRfqObj);
    if (onRfqCreated) onRfqCreated(createdRfqObj);
    setToastMsg(`RFQ ${rfqId} successfully broadcasted to ${selectedVendors.length} selected vendors!`);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleBroadcastToAllApproved = () => {
    const allVendorNames = availableVendorsList.map((v) => v.name);
    setSelectedVendors(allVendorNames);
    setToastMsg(`RFQ ${rfqId} broadcasted to ALL ${allVendorNames.length} approved vendors in directory!`);
    const allRfqObj = {
      id: rfqId,
      reqId: linkedReqId,
      item: productsList[0]?.productName || rfqTitle,
      category: productsList[0]?.productCategory || "Hardware & IT",
      targetQty: productsList.reduce((acc, curr) => acc + (parseInt(curr.quantityRequired) || 0), 0),
      deadline: submissionDeadline,
      invitedVendors: allVendorNames,
      bidsReceived: 0,
      status: "Active Bidding",
    };
    createRfq(allRfqObj);
    setTimeout(() => {
      if (onRfqCreated) {
        onRfqCreated(allRfqObj);
      }
      onClose();
    }, 2200);
  };

  const handleSaveAsDraft = () => {
    setToastMsg(`RFQ ${rfqId} saved as Draft! You can resume editing anytime.`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDuplicateRfq = () => {
    const dupId = `RFQ-2026-${Math.floor(970 + Math.random() * 20)}`;
    setRfqTitle(`[COPY] ${rfqTitle}`);
    setToastMsg(`RFQ duplicated cleanly! New Draft ID: ${dupId}`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const filteredVendors = availableVendorsList.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(vendorSearchTerm.toLowerCase());
    const matchesCat =
      vendorCategoryFilter === "all" || v.category === vendorCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalQuantitySum = productsList.reduce(
    (acc, curr) => acc + (parseInt(curr.quantityRequired) || 0),
    0
  );

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(5px)",
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
          maxWidth: "1180px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
          border: "1px solid #d9d9d9",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* TOP MODAL HEADER */}
        <div
          style={{
            padding: "20px 32px",
            borderBottom: "1px solid #ececec",
            background: "linear-gradient(135deg, rgba(248, 180, 0, 0.15) 0%, #ffffff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
              }}
            >
              <Send size={22} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
                ENTERPRISE SOURCING WIZARD
              </span>
              <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "800", margin: "2px 0 0" }}>
                Create & Broadcast New RFQ
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ background: "rgba(5,150,105,0.12)", color: "#059669", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "800" }}>
              Status: {rfqStatus}
            </span>
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
                color: "#555",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* TOAST FEEDBACK */}
        {toastMsg && (
          <div
            style={{
              background: "rgba(5, 150, 105, 0.15)",
              borderBottom: "1px solid #059669",
              color: "#059669",
              padding: "14px 32px",
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

        {/* WIZARD LAYOUT: LEFT FORM (8 SECTIONS) & RIGHT STICKY SUMMARY PANEL */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "28px", padding: "32px" }}>
          
          {/* LEFT FORM CONTENT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* ------------------------------------------------------------- */}
            {/* SECTION 1: RFQ INFORMATION */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: "#ffffff", border: "1px solid #ececec", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="#f8b400" /> 1. RFQ Information
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="pe-form-label">Auto-generated RFQ ID <span style={{ fontSize: "11px", color: "#666", fontWeight: "400" }}>(System Auto)</span></label>
                  <input type="text" className="pe-form-input" value={rfqId} readOnly style={{ background: "#f8f9fb", fontWeight: "800", color: "#d97706" }} />
                </div>

                <div>
                  <label className="pe-form-label">Linked Purchase Request ID * <span style={{ fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>🔒 Signed Off (Dept Manager)</span></label>
                  <select
                    className="pe-form-select"
                    value={linkedReqId}
                    onChange={(e) => {
                      setLinkedReqId(e.target.value);
                      const selectedPr = mockPurchaseRequests.find((r) => r.id === e.target.value);
                      if (selectedPr) {
                        setDepartmentName(selectedPr.dept);
                        if (productsList[0]) {
                          handleUpdateProduct(productsList[0].id, "productName", selectedPr.title);
                          handleUpdateProduct(productsList[0].id, "quantityRequired", selectedPr.qty);
                          handleUpdateProduct(productsList[0].id, "estimatedBudget", selectedPr.budget);
                        }
                      }
                    }}
                  >
                    {mockPurchaseRequests.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.id} - {pr.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pe-form-group" style={{ marginBottom: "16px" }}>
                <label className="pe-form-label">RFQ Title * <span style={{ fontSize: "10px", background: "#ecfdf5", color: "#047857", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>✏️ Procurement Executive Editable</span></label>
                <input
                  type="text"
                  className="pe-form-input"
                  value={rfqTitle}
                  onChange={(e) => setRfqTitle(e.target.value)}
                  placeholder="Enter descriptive RFQ title..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="pe-form-label">Department Name <span style={{ fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>🔒 Read-Only</span></label>
                  <input
                    type="text"
                    className="pe-form-input"
                    value={departmentName}
                    readOnly
                    style={{ background: "#f8f9fb" }}
                  />
                </div>

                <div>
                  <label className="pe-form-label">RFQ Priority *</label>
                  <select
                    className="pe-form-select"
                    value={rfqPriority}
                    onChange={(e) => setRfqPriority(e.target.value)}
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="pe-form-label">RFQ Submission Deadline *</label>
                  <input
                    type="date"
                    className="pe-form-input"
                    value={submissionDeadline}
                    onChange={(e) => setSubmissionDeadline(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 2: PRODUCT REQUIREMENT DETAILS (MULTI-PRODUCT SUPPORT) */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: "#ffffff", border: "1px solid #ececec", borderRadius: "14px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Package size={18} color="#f8b400" /> 2. Product Requirement Details
                </h3>

                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ padding: "6px 14px", fontSize: "12px" }}
                  onClick={handleAddProduct}
                >
                  <Plus size={14} /> Add More Products
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {productsList.map((prod, idx) => (
                  <div
                    key={prod.id}
                    style={{
                      background: "#f8f9fb",
                      border: "1px solid #d9d9d9",
                      borderRadius: "12px",
                      padding: "18px",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ fontWeight: "800", color: "#d97706", fontSize: "13px" }}>
                        Item #{idx + 1} Specification
                      </span>
                      {productsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(prod.id)}
                          style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px", marginBottom: "12px" }}>
                      <div>
                        <label className="pe-form-label">Product Name *</label>
                        <input
                          type="text"
                          className="pe-form-input"
                          value={prod.productName}
                          onChange={(e) => handleUpdateProduct(prod.id, "productName", e.target.value)}
                          placeholder="e.g. MacBook Pro M3 Max 64GB"
                        />
                      </div>

                      <div>
                        <label className="pe-form-label">Product Category *</label>
                        <select
                          className="pe-form-select"
                          value={prod.productCategory}
                          onChange={(e) => handleUpdateProduct(prod.id, "productCategory", e.target.value)}
                        >
                          <option value="Hardware & IT">Hardware & IT</option>
                          <option value="Software & SaaS">Software & SaaS</option>
                          <option value="Office Equipment">Office Equipment</option>
                          <option value="Networking">Networking</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div>
                        <label className="pe-form-label">Quantity Required *</label>
                        <input
                          type="number"
                          className="pe-form-input"
                          value={prod.quantityRequired}
                          onChange={(e) => handleUpdateProduct(prod.id, "quantityRequired", parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div>
                        <label className="pe-form-label">Unit of Measurement</label>
                        <select
                          className="pe-form-select"
                          value={prod.unitOfMeasurement}
                          onChange={(e) => handleUpdateProduct(prod.id, "unitOfMeasurement", e.target.value)}
                        >
                          <option value="Units">Units</option>
                          <option value="Licenses">Licenses</option>
                          <option value="Boxes">Boxes</option>
                          <option value="Sets">Sets</option>
                        </select>
                      </div>

                      <div>
                        <label className="pe-form-label">Expected Delivery Date</label>
                        <input
                          type="date"
                          className="pe-form-input"
                          value={prod.expectedDeliveryDate}
                          onChange={(e) => handleUpdateProduct(prod.id, "expectedDeliveryDate", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="pe-form-label">Estimated Budget (Optional)</label>
                        <input
                          type="text"
                          className="pe-form-input"
                          value={prod.estimatedBudget}
                          onChange={(e) => handleUpdateProduct(prod.id, "estimatedBudget", e.target.value)}
                          placeholder="e.g. ₹38,990.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="pe-form-label">Detailed Product Specifications</label>
                      <textarea
                        className="pe-form-input"
                        rows={2}
                        value={prod.productSpecifications}
                        onChange={(e) => handleUpdateProduct(prod.id, "productSpecifications", e.target.value)}
                        placeholder="Provide detailed technical parameters, model numbers, memory, build standards..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 3: VENDOR SELECTION */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: "#ffffff", border: "1px solid #ececec", borderRadius: "14px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={18} color="#f8b400" /> 3. Vendor Selection & Supplier Multi-Select
                </h3>
                <span style={{ background: "#f8b400", color: "#000", fontWeight: "800", fontSize: "12px", padding: "4px 12px", borderRadius: "14px" }}>
                  Selected Vendors: {selectedVendors.length}
                </span>
              </div>

              {/* Search & Category Filter */}
              <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={15} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="pe-form-input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="Search approved vendors by name or ID..."
                    value={vendorSearchTerm}
                    onChange={(e) => setVendorSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="pe-form-select"
                  style={{ width: "200px" }}
                  value={vendorCategoryFilter}
                  onChange={(e) => setVendorCategoryFilter(e.target.value)}
                >
                  <option value="all">All Vendor Categories</option>
                  <option value="Hardware & IT">Hardware & IT</option>
                  <option value="Software & SaaS">Software & SaaS</option>
                  <option value="Electronics & Hardware">Electronics & Hardware</option>
                  <option value="Networking">Networking</option>
                </select>
              </div>

              {/* Vendor Cards Grid displaying Company Name, Vendor ID, Rating, Location, Products, Delivery, Certification */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
                {filteredVendors.map((v) => {
                  const isChecked = selectedVendors.includes(v.name);
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleToggleVendor(v.name)}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border: isChecked ? "2px solid #f8b400" : "1px solid #ececec",
                        background: isChecked ? "rgba(248, 180, 0, 0.08)" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>{v.id}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ width: "16px", height: "16px", accentColor: "#f8b400" }}
                        />
                      </div>

                      <h4 style={{ fontSize: "14px", color: "#111", fontWeight: "800", margin: 0 }}>{v.name}</h4>
                      <div style={{ fontSize: "11px", color: "#666" }}>Location: {v.location}</div>

                      <div style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", marginTop: "4px", background: "#f8f9fb", padding: "6px 8px", borderRadius: "6px" }}>
                        <span style={{ fontWeight: "700", color: "#d97706" }}>{v.rating}</span>
                        <span style={{ fontWeight: "700", color: "#059669" }}>{v.deliveryPerformance}</span>
                      </div>

                      <div style={{ fontSize: "11px", color: "#059669", fontWeight: "700", marginTop: "2px" }}>
                        ✓ {v.certificationStatus}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 4: DELIVERY & SHIPPING INFORMATION */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: "#ffffff", border: "1px solid #ececec", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} color="#f8b400" /> 4. Delivery & Shipping Information
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="pe-form-label">Delivery Address *</label>
                  <input
                    type="text"
                    className="pe-form-input"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label className="pe-form-label">Delivery Instructions</label>
                  <input
                    type="text"
                    className="pe-form-input"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="pe-form-label">Delivery Terms</label>
                  <input
                    type="text"
                    className="pe-form-input"
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                  />
                </div>

                <div>
                  <label className="pe-form-label">Shipping Requirements</label>
                  <input
                    type="text"
                    className="pe-form-input"
                    value={shippingRequirements}
                    onChange={(e) => setShippingRequirements(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="pe-form-label">Warranty Requirements</label>
                  <input
                    type="text"
                    className="pe-form-input"
                    value={warrantyRequirements}
                    onChange={(e) => setWarrantyRequirements(e.target.value)}
                  />
                </div>

                <div>
                  <label className="pe-form-label">Payment Terms *</label>
                  <select
                    className="pe-form-select"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  >
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="Advance Payment">Advance Payment</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 5: QUOTATION REQUIREMENTS */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: "#ffffff", border: "1px solid #ececec", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileCheck2 size={18} color="#f8b400" /> 5. Quotation Requirements & Terms
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="pe-form-label">Submission Deadline (Time)</label>
                  <input
                    type="text"
                    className="pe-form-input"
                    value={quotationDeadline}
                    onChange={(e) => setQuotationDeadline(e.target.value)}
                  />
                </div>

                <div>
                  <label className="pe-form-label">Currency Selection</label>
                  <select
                    className="pe-form-select"
                    value={currencySelection}
                    onChange={(e) => setCurrencySelection(e.target.value)}
                  >
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="pe-form-label">Tax Information</label>
                  <select
                    className="pe-form-select"
                    value={taxInformation}
                    onChange={(e) => setTaxInformation(e.target.value)}
                  >
                    <option value="GST Included">GST Included</option>
                    <option value="GST Extra as Applicable">GST Extra as Applicable</option>
                    <option value="Tax Exempt">Tax Exempt</option>
                  </select>
                </div>
              </div>

              <div className="pe-form-group" style={{ marginBottom: "16px" }}>
                <label className="pe-form-label">Special Procurement Requirements</label>
                <input
                  type="text"
                  className="pe-form-input"
                  value={specialProcurementReqs}
                  onChange={(e) => setSpecialProcurementReqs(e.target.value)}
                />
              </div>

              <div className="pe-form-group">
                <label className="pe-form-label">Additional Notes for Bidding Vendors</label>
                <textarea
                  className="pe-form-input"
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 6: ATTACHMENTS SECTION */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: "#ffffff", border: "1px solid #ececec", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Upload size={18} color="#f8b400" /> 6. Attachments & Technical Documents
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <label style={{ border: "2px dashed #d9d9d9", borderRadius: "12px", padding: "16px", textAlign: "center", cursor: "pointer", background: "#f8f9fb" }}>
                  <Upload size={24} color="#f8b400" style={{ margin: "0 auto 6px" }} />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#111", display: "block" }}>Upload Technical Specs PDF</span>
                  <input type="file" onChange={(e) => handleSimulateFileUpload(e, "Technical Spec")} style={{ display: "none" }} />
                </label>

                <label style={{ border: "2px dashed #d9d9d9", borderRadius: "12px", padding: "16px", textAlign: "center", cursor: "pointer", background: "#f8f9fb" }}>
                  <Upload size={24} color="#059669" style={{ margin: "0 auto 6px" }} />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#111", display: "block" }}>Upload Terms & Conditions PDF</span>
                  <input type="file" onChange={(e) => handleSimulateFileUpload(e, "Terms Document")} style={{ display: "none" }} />
                </label>
              </div>

              {/* Uploaded Files Preview List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8f9fb",
                      borderRadius: "10px",
                      border: "1px solid #ececec",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FileText size={16} color="#f8b400" />
                      <strong style={{ color: "#111" }}>{file.name}</strong>
                      <span style={{ fontSize: "11px", color: "#666" }}>({file.type} • {file.size})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT SIDEBAR: SECTION 7 (SUMMARY PANEL) & SECTION 8 (BROADCAST OPTIONS) */}
          {/* ------------------------------------------------------------- */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* SECTION 7: RFQ SUMMARY PANEL */}
            <div
              style={{
                background: "linear-gradient(180deg, rgba(248, 180, 0, 0.12) 0%, #ffffff 100%)",
                border: "2px solid #f8b400",
                borderRadius: "14px",
                padding: "20px",
                position: "sticky",
                top: "85px",
                zIndex: 10,
              }}
            >
              <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", marginBottom: "16px", borderBottom: "1px solid #ececec", paddingBottom: "10px" }}>
                7. RFQ Live Summary Panel
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>RFQ Number:</span>
                  <strong style={{ color: "#d97706", fontWeight: "800" }}>{rfqId}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Total Products:</span>
                  <strong style={{ color: "#111" }}>{productsList.length} Item(s)</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Total Quantity:</span>
                  <strong style={{ color: "#111" }}>{totalQuantitySum} Units</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Selected Vendors Count:</span>
                  <strong style={{ color: "#059669", fontWeight: "800" }}>{selectedVendors.length} Suppliers</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>RFQ Deadline:</span>
                  <strong style={{ color: "#dc2626" }}>{submissionDeadline}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Priority:</span>
                  <span style={{ background: "#f8b400", color: "#000", padding: "2px 8px", borderRadius: "10px", fontWeight: "800", fontSize: "11px" }}>
                    {rfqPriority}
                  </span>
                </div>
              </div>

              {/* SECTION 8: BROADCAST OPTIONS */}
              <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #ececec", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "#111", fontWeight: "800", textTransform: "uppercase" }}>
                  8. Confirm & Broadcast Options
                </span>

                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg, #059669 0%, #047857 100%)", color: "#ffffff", fontWeight: "800", fontSize: "14px", padding: "12px 16px", borderRadius: "10px", boxShadow: "0 4px 14px rgba(5, 150, 105, 0.25)" }}
                  onClick={handleSendToSelectedVendors}
                >
                  <CheckCircle2 size={18} /> Confirm & Broadcast RFQ
                </button>

                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)", color: "#000", fontWeight: "800" }}
                  onClick={handleSendToSelectedVendors}
                >
                  <Send size={15} /> Send to Selected Vendors
                </button>

                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ width: "100%", justifyContent: "center", background: "#059669", color: "#ffffff", border: "none" }}
                  onClick={handleBroadcastToAllApproved}
                >
                  <Users size={15} /> Broadcast to All Approved
                </button>

                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ width: "100%", justifyContent: "center", background: "#ffffff", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => setScheduleModal(true)}
                >
                  <Calendar size={15} /> Schedule Broadcast
                </button>

                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ width: "100%", justifyContent: "center", background: "#f8f9fb", color: "#555", border: "1px solid #d9d9d9" }}
                  onClick={handleSaveAsDraft}
                >
                  <Save size={15} /> Save as Draft
                </button>

                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ width: "100%", justifyContent: "center", background: "#ffffff", color: "#3b82f6", border: "1px solid #3b82f6" }}
                  onClick={() => setPreviewRfqModal(true)}
                >
                  <Eye size={15} /> Preview RFQ Before Sending
                </button>

                <button
                  type="button"
                  className="pe-btn-primary-sm"
                  style={{ width: "100%", justifyContent: "center", background: "#ffffff", color: "#666", border: "1px solid #d9d9d9" }}
                  onClick={handleDuplicateRfq}
                >
                  <Copy size={15} /> Duplicate Existing RFQ
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* SCHEDULE BROADCAST MODAL */}
      {scheduleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "14px", width: "420px" }}>
            <h3 style={{ fontSize: "16px", color: "#111", fontWeight: "800", marginBottom: "12px" }}>Schedule RFQ Broadcast</h3>
            <div className="pe-form-group" style={{ marginBottom: "16px" }}>
              <label className="pe-form-label">Broadcast Date & Time *</label>
              <input
                type="text"
                className="pe-form-input"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="pe-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111" }} onClick={() => setScheduleModal(false)}>Cancel</button>
              <button className="pe-btn-primary-sm" onClick={() => { setScheduleModal(false); setToastMsg(`RFQ scheduled for broadcast on ${scheduledDate}!`); }}>Schedule Now</button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW RFQ BEFORE SENDING MODAL */}
      {previewRfqModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", padding: "28px", borderRadius: "14px", maxWidth: "600px", width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>RFQ DISPATCH PREVIEW</span>
                <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800" }}>{rfqId} - {rfqTitle}</h3>
              </div>
              <button onClick={() => setPreviewRfqModal(false)} style={{ background: "none", border: "none", color: "#666" }}><X size={20} /></button>
            </div>
            <div style={{ background: "#f8f9fb", padding: "16px", borderRadius: "10px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>Linked Requisition: <strong>{linkedReqId}</strong></div>
              <div>Invited Suppliers: <strong>{selectedVendors.join(", ")}</strong></div>
              <div>Submission Deadline: <strong>{submissionDeadline}</strong></div>
              <div>Products: <strong>{productsList.length} items ({totalQuantitySum} total qty)</strong></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="pe-btn-primary-sm" onClick={() => setPreviewRfqModal(false)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
};

export default CreateRfqWizardModal;
