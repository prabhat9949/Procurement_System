import React, { useState, useEffect, useCallback } from "react";
import {
  Lock,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  KeyRound,
  FolderKanban,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";

const SuperPermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const perms = await apiGet("/api/permissions/all");
      setPermissions(perms || []);
    } catch (err) {
      setError(err.message || "Failed to load permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const modules = ["All", ...Array.from(new Set(permissions.map((p) => p.moduleName || "General")))];

  const filtered = permissions.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (p.permissionCode || "").toLowerCase().includes(q) ||
      (p.permissionName || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q);
    const matchesModule = moduleFilter === "All" || (p.moduleName || "General") === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const grouped = filtered.reduce((acc, p) => {
    const mod = p.moduleName || "General";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  return (
    <div className="sadmin-perm-mgmt-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Lock color="#f8b400" size={28} /> Permission Catalog
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Every permission below is a real record from the MySQL database. Roles reference these permissions for authorization.
          </p>
        </div>
        <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={loadData} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ padding: "16px", background: "#f6faf8", border: "1px solid rgba(5,150,105,0.3)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Total Permissions</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>{permissions.length}</h3>
        </div>
        <div style={{ padding: "16px", background: "#fafafa", border: "1px solid #eee", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Modules Covered</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#111", margin: "2px 0 0" }}>{modules.length - 1}</h3>
        </div>
        <div style={{ padding: "16px", background: "#fcf8f2", border: "1px solid rgba(248,180,0,0.3)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Active Permissions</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "2px 0 0" }}>{permissions.filter((p) => p.active).length}</h3>
        </div>
        <div style={{ padding: "16px", background: "#f0f6ff", border: "1px solid rgba(37,99,235,0.25)", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Currently Shown</span>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#2563eb", margin: "2px 0 0" }}>{filtered.length}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="sadmin-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", width: "300px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search permission code, name, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Module:</span>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Permission cards grouped by module */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: "10px", color: "#666" }}>
          <Loader2 size={20} className="login-spin" /> Loading permissions from the database...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#888", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          No permissions match your search.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(grouped).map(([module, perms]) => (
            <div key={module} className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
                <FolderKanban size={18} color="#d97706" />
                <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#111", margin: 0 }}>{module}</h3>
                <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: "700", color: "#666", background: "#fff", border: "1px solid #ececec", padding: "2px 10px", borderRadius: "12px" }}>
                  {perms.length} permissions
                </span>
              </div>
              <div className="sadmin-table-container">
                <table className="sadmin-table">
                  <thead>
                    <tr>
                      <th>Permission Code</th>
                      <th>Permission Name</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perms.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: "800", color: "#2563eb", display: "flex", alignItems: "center", gap: "6px" }}>
                          <KeyRound size={13} /> {p.permissionCode}
                        </td>
                        <td style={{ fontWeight: "700", color: "#111" }}>{p.permissionName}</td>
                        <td style={{ color: "#555", fontSize: "13.5px" }}>{p.description || "—"}</td>
                        <td>
                          <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: p.active ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)", color: p.active ? "#059669" : "#dc2626" }}>
                            {p.active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperPermissionManagement;
