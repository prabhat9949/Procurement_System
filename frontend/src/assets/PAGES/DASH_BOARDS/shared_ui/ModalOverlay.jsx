import React from "react";
import { X } from "lucide-react";

const ModalOverlay = ({ isOpen, onClose, title, children, maxWidth = "600px" }) => {
  if (!isOpen) return null;

  return (
    <div className="sadmin-modal-overlay">
      <div className="sadmin-modal" style={{ maxWidth }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            borderBottom: "1px solid #ececec",
            paddingBottom: "12px",
          }}
        >
          <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#666666",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ marginTop: "12px" }}>{children}</div>
      </div>
    </div>
  );
};

export default ModalOverlay;
