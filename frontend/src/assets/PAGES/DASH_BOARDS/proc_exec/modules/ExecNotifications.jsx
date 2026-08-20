import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCircle2,
  Send,
  ShoppingBag,
  FileCheck2,
  Loader2,
  WifiOff,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatDateIN } from "../../../../../utils/format";

const typeIcon = (t) => {
  if (t === "RFQ" || t === "QUOTATION" || t === "VENDOR") return <Send size={20} />;
  if (t === "PO" || t === "DELIVERY" || t === "WAREHOUSE") return <ShoppingBag size={20} />;
  if (t === "APPROVAL" || t === "WORKFLOW" || t === "AUDIT") return <FileCheck2 size={20} />;
  return <Bell size={20} />;
};

const ExecNotifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/notifications/my?page=0&size=100");
      setNotifs(page?.content || (Array.isArray(page) ? page : []));
    } catch (err) {
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const markRead = async (n) => {
    try {
      await apiPost(`/api/notifications/${n.notificationId}/mark-read`);
      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    } catch (err) {
      setError(err.message || "Unable to update notification.");
    }
  };

  const markAllRead = async () => {
    const unread = notifs.filter((n) => !n.read);
    for (const n of unread) {
      try {
        await apiPost(`/api/notifications/${n.notificationId}/mark-read`);
      } catch { /* continue */ }
    }
    setNotifs((prev) => prev.map((x) => ({ ...x, read: true })));
    triggerToast(`Marked ${unread.length} notification(s) as read.`);
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="pe-notifications-container" style={{ padding: "20px" }}>
      {toastMsg && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", fontWeight: 600, border: "1px solid #a7f3d0" }}>
          {toastMsg}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      <div className="pe-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="pe-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "800", color: "#111111" }}>
            <Bell color="#f8b400" size={28} /> Procurement Notifications
          </h1>
          <p className="pe-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Assignments, RFQ, quotation, PO and delivery events routed to you by the workflow engine.
          </p>
        </div>
        <button className="pe-btn-primary-sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCircle2 size={15} /> Mark All Read {unreadCount > 0 ? `(${unreadCount})` : ""}
        </button>
      </div>

      <div className="pe-card" style={{ background: "#fff", borderRadius: "12px", border: "1px solid #ececec" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#666666" }}>
            <Loader2 size={20} className="login-spin" /> Loading notifications…
          </div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#666666" }}>
            <Bell size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
            <p style={{ fontWeight: 600 }}>No notifications.</p>
            <p style={{ fontSize: "13px" }}>No notifications have been routed to you yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px" }}>
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "16px",
                  borderRadius: "12px",
                  cursor: n.read ? "default" : "pointer",
                  background: n.read ? "#f8f9fb" : "rgba(248, 180, 0, 0.08)",
                  border: n.read ? "1px solid #ececec" : "1px solid #f8b400",
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff", border: "1px solid #d9d9d9", display: "flex", alignItems: "center", justifyContent: "center", color: "#f8b400", flexShrink: 0 }}>
                  {typeIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                    <h4 style={{ fontSize: "15px", color: "#111111", fontWeight: "700" }}>{n.title}</h4>
                    <span style={{ fontSize: "12px", color: "#666666" }}>{formatDateIN(n.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#555555", lineHeight: "1.4" }}>{n.message}</p>
                  {n.referenceType && (
                    <span style={{ fontSize: "11px", color: "#d97706", fontWeight: 700 }}>
                      {n.referenceType}: {n.referenceId}
                    </span>
                  )}
                </div>
                {!n.read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f8b400", marginTop: 6, flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecNotifications;
