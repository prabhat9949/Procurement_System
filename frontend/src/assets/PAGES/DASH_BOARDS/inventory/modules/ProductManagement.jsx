import React, { useState } from "react";
import {
  Boxes,
  Search,
  Eye,
  Edit3,
  CheckCircle2,
  X,
  Package,
  Barcode,
  Building,
} from "lucide-react";

const masterProductCatalogMock = [
  {
    sku: "SKU-MAC-101",
    name: "MacBook Pro M3 Max 64GB Workstation",
    category: "Hardware & IT",
    qty: 24,
    unitCost: "$3,699.00",
    location: "Rack A-01 (Zone A)",
    status: "Available",
    barcode: "880942001928",
    reorderPoint: 5,
  },
  {
    sku: "SKU-SER-202",
    name: "Dell PowerEdge R760 Rack Server",
    category: "DevOps & Infra",
    qty: 6,
    unitCost: "$13,550.00",
    location: "Rack A-05 (Zone A)",
    status: "Available",
    barcode: "880942001995",
    reorderPoint: 2,
  },
  {
    sku: "SKU-NET-992",
    name: "Cisco Catalyst 9300 Switch Module",
    category: "Networking",
    qty: 2,
    unitCost: "$7,100.00",
    location: "Rack B-04 (Zone A)",
    status: "Low Stock Alert",
    barcode: "880942001882",
    reorderPoint: 5,
  },
  {
    sku: "SKU-CHAIR-50",
    name: "Herman Miller Aeron Ergonomic Chair",
    category: "Office Furniture",
    qty: 18,
    unitCost: "$1,450.00",
    location: "Rack C-02 (Zone C)",
    status: "Available",
    barcode: "880942001712",
    reorderPoint: 4,
  },
];

const ProductManagement = () => {
  const [catalog, setCatalog] = useState(masterProductCatalogMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewProduct, setPreviewProduct] = useState(null);

  const categories = ["All", "Hardware & IT", "DevOps & Infra", "Networking", "Office Furniture"];

  const filtered = catalog.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="inv-product-mgmt-container">
      {/* Header */}
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title">
            <Boxes color="#f8b400" /> Master Product Catalog & SKU Registry
          </h1>
          <p className="inv-page-subtitle">
            Enterprise SKU database, barcode indexing, stock levels, and warehouse rack placement.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="inv-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", width: "320px" }}>
            <Search
              size={16}
              color="#666666"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search SKU Code or Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inv-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "700",
                  border: selectedCategory === cat ? "1px solid #f8b400" : "1px solid #ececec",
                  background: selectedCategory === cat ? "rgba(248,180,0,0.18)" : "#ffffff",
                  color: selectedCategory === cat ? "#111111" : "#555555",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="inv-card">
        <div className="inv-table-container">
          <table className="inv-table">
            <thead>
              <tr>
                <th>SKU Code</th>
                <th>Product Description</th>
                <th>Category</th>
                <th>Available Units</th>
                <th>Unit Cost</th>
                <th>Warehouse Rack Location</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.sku}>
                  <td style={{ fontWeight: "800", color: "#d97706" }}>{item.sku}</td>
                  <td style={{ fontWeight: "700", color: "#111111" }}>{item.name}</td>
                  <td style={{ color: "#666666", fontSize: "13px" }}>{item.category}</td>
                  <td style={{ fontWeight: "800" }}>{item.qty} Units</td>
                  <td style={{ fontWeight: "700", color: "#059669" }}>{item.unitCost}</td>
                  <td style={{ color: "#555555" }}>{item.location}</td>
                  <td>
                    <span
                      className={`inv-badge ${
                        item.status.includes("Low") ? "lowstock" : "available"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="inv-sidebar-toggle"
                      style={{ width: "32px", height: "32px", display: "inline-flex" }}
                      onClick={() => setPreviewProduct(item)}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {previewProduct && (
        <div className="inv-modal-overlay">
          <div className="inv-modal" style={{ maxWidth: "560px" }}>
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                SKU Specification: {previewProduct.sku}
              </h3>
              <button
                onClick={() => setPreviewProduct(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: "20px",
                background: "#f8f9fb",
                borderRadius: "12px",
                border: "1px solid #ececec",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Barcode size={24} color="#f8b400" />
                <span>Barcode Index: <strong>{previewProduct.barcode}</strong></span>
              </div>
              <p><strong>Item Name:</strong> {previewProduct.name}</p>
              <p><strong>Category:</strong> {previewProduct.category}</p>
              <p><strong>Unit Replacement Cost:</strong> <span style={{ color: "#059669", fontWeight: "800" }}>{previewProduct.unitCost}</span></p>
              <p><strong>Warehouse Location:</strong> {previewProduct.location}</p>
              <p><strong>Reorder Threshold:</strong> {previewProduct.reorderPoint} Units</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                className="inv-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setPreviewProduct(null)}
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
