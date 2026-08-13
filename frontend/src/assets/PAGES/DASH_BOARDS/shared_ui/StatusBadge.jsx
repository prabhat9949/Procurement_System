import React from "react";

const StatusBadge = ({ status, text }) => {
  const statusClass = status ? status.toLowerCase() : "active";

  return (
    <span className={`sadmin-badge ${statusClass}`}>
      {text || status}
    </span>
  );
};

export default StatusBadge;
