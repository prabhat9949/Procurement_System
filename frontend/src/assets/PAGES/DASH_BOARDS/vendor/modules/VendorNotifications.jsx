import React, { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle2, Loader2, WifiOff, Send } from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatDateIN } from "../../../../../utils/format";

const VendorNotifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const size = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(`/api/notifications?page=${page}&size=${size}&sort=createdAt&direction=desc`);
      setNotifs(data?.content || []);
      setTotal(data?.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await apiPost(`/api/notifications/${id}/mark-read`);
      load();
    } catch { /* non-fatal */ }
  };

  const markAllRead = async () => {
    for (const n of notifs.filter((x) => !x.isRead && x.notificationId)) {
      await apiPost(`/api/notifications/${n.notificationId}/mark-read`).catch(() => null);
    }
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div style={{ padding: "20px" }}>
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Bell color="#f8b400" /> Notifications
          </h1>
          <p className="vnd-page-subtitle">RFQ, quotation, PO and payment events — live from the database.</p>
        </div>
        <button className="vnd-btn-primary-sm" onClick={markAllRead} disabled={!notifs.some((n) => !n.isRead)}>
          <CheckCircle2 size={14} /> Mark All Read
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={load} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading notifications...
        </div>
      ) : notifs.length === 0 ? (
        <div className="vnd-card" style={{ textAlign: "center", padding: "48px" }}>
          <Send size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Notifications</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>You are all caught up.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifs.map((n) => (
            <div
              key={n.notificationId ?? n.id}
              className="vnd-card"
              style={{ padding: "16px 20px", display: "flex", gap: "14px", alignItems: "flex-start", cursor: n.isRead ? "default" : "pointer", opacity: n.isRead ? 0.65 : 1 }}
              onClick={() => !n.isRead && markRead(n.notificationId ?? n.id)}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell size={17} color="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                  <h4 style={{ fontSize: "14.5px", fontWeight: 700, color: "#111", margin: 0 }}>{n.title || n.message || "Notification"}</h4>
                  {!n.isRead && <span style={{ fontSize: "10px", fontWeight: "800", color: "#d97706", background: "#fffbeb", padding: "2px 8px", borderRadius: "10px" }}>NEW</span>}
                </div>
                {n.message && n.message !== n.title && <p style={{ fontSize: "13px", color: "#555", margin: "4px 0 0" }}>{n.message}</p>}
                <p style={{ fontSize: "11.5px", color: "#999", margin: "6px 0 0" }}>{formatDateIN(n.createdAt || n.created)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
          <button className="vnd-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
          <span style={{ alignSelf: "center", fontSize: "13px", color: "#666", fontWeight: 600 }}>Page {page + 1} of {totalPages}</span>
          <button className="vnd-btn-primary-sm" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default VendorNotifications;
