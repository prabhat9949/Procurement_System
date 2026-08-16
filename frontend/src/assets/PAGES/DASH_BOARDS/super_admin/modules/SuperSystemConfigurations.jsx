import React from "react";
import { Settings, Server } from "lucide-react";

const SuperSystemConfigurations = () => {
  return (
    <div className="sadmin-sys-config-container">
      {/* Header */}
      <div className="sadmin-page-header">
        <div>
          <h1 className="sadmin-page-title">
            <Settings color="#f8b400" /> Root System Configurations & Cloud Gateway Settings
          </h1>
          <p className="sadmin-page-subtitle">
            Configure microservices routing, SMTP gateways, Azure Sentinel connectors, and database sync frequencies.
          </p>
        </div>
      </div>

      <div className="sadmin-card">
        <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "800" }}>System Configurations Active</h3>
        <p style={{ fontSize: "14px", color: "#555555", marginTop: "4px" }}>Microservices gateway operating at 99.98% SLA.</p>
      </div>
    </div>
  );
};

export default SuperSystemConfigurations;
