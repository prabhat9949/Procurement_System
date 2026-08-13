import React from "react";
import { CircleOff, RefreshCw } from "lucide-react";

export default function UnavailableState({ title = "This capability is not configured", message, requirement }) {
  return <div style={{ padding: 20 }}><div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, padding: 32, maxWidth: 760 }}><CircleOff size={34} color="#d97706" /><h1 style={{ fontSize: 21, margin: "14px 0 8px", color: "#111" }}>{title}</h1><p style={{ color: "#596575", lineHeight: 1.65, margin: 0 }}>{message}</p>{requirement && <p style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#fff8e6", color: "#8a5a00", fontSize: 13.5 }}><strong>Backend requirement:</strong> {requirement}</p>}<button onClick={() => window.location.reload()} style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid #d9dee6", background: "#fff", borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontWeight: 700 }}><RefreshCw size={14} /> Refresh</button></div></div>;
}
