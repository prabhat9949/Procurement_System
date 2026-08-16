import React from "react";

const KpiCard = ({
  label,
  value,
  changeText,
  changeType = "positive",
  icon: Icon,
  iconColor = "#f8b400",
  onClick,
}) => {
  return (
    <div
      className="sadmin-kpi-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="sadmin-kpi-info">
        <span className="sadmin-kpi-label">{label}</span>
        <span className="sadmin-kpi-value">{value}</span>
        {changeText && (
          <span className={`sadmin-kpi-change ${changeType}`}>
            {changeText}
          </span>
        )}
      </div>
      {Icon && (
        <div className="sadmin-kpi-icon-wrapper" style={{ color: iconColor }}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default KpiCard;
