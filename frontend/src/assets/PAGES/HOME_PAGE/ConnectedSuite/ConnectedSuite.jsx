import React from "react";
import "./ConnectedSuite.css";

const ConnectedSuite = () => {
  return (
    <section className="connected-suite">
      <div className="cs-container">
        {/* Left content */}
        <div className="cs-left">
          <h1>
            One Solution for All Your
            <br />
            Procurement Operations
          </h1>

          <p>
            AI-powered procurement automation for your business — simplifying
            global supplier management, purchase requisitions, orders, and invoice matching.
          </p>

          <div className="cs-cards">
            <div className="cs-card cs-card-green">
              <div className="cs-card-title">
                Purchase Orders <span className="cs-arrow">→</span>
              </div>
              <div className="cs-card-body">
                <span className="cs-icon cs-icon-green">💲</span>
                <p>End-to-end tracking and seamless purchase order lifecycle management</p>
              </div>
            </div>

            <div className="cs-card cs-card-purple">
              <div className="cs-card-title">
                Supplier Management <span className="cs-arrow">→</span>
              </div>
              <div className="cs-card-body">
                <span className="cs-icon cs-icon-purple">🌐</span>
                <p>Simplified supplier onboarding with built-in compliance and approval controls</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right visual */}
        <div className="cs-right">
          <div className="cs-grid-bg"></div>

          {/* Payment method dropdown */}
          <div className="cs-float cs-payment-method">
            <div className="cs-pm-header">Select purchase category</div>
            <ul>
              <li>
                <span className="cs-pm-icon">🏢</span> IT Hardware & Equipment
              </li>
              <li>
                <span className="cs-pm-icon">💻</span> Software & Licenses
              </li>
              <li>
                <span className="cs-pm-icon">💼</span> Office Supplies
              </li>
              <li>
                <span className="cs-pm-icon">🔧</span> Maintenance & Services
              </li>
            </ul>
          </div>

          {/* Invoices donut */}
          <div className="cs-float cs-invoices">
            <div className="cs-donut"></div>
            <div className="cs-donut-value">$91,250</div>
            <ul className="cs-legend">
              <li><span className="dot dot-yellow"></span> Invoices</li>
              <li><span className="dot dot-gray"></span> POs</li>
              <li><span className="dot dot-lightgray"></span> PRs</li>
            </ul>
          </div>

          {/* Procurement / Accounting / Management list */}
          <div className="cs-float cs-status-list">
            <div className="cs-status-row">
              <div className="cs-avatar" />
              <div>
                <div className="cs-status-title">Procurement</div>
                <div className="cs-status-sub">PO created</div>
              </div>
              <span className="cs-check cs-check-done">✓</span>
            </div>
            <div className="cs-status-row">
              <div className="cs-avatar" />
              <div>
                <div className="cs-status-title">Accounting</div>
                <div className="cs-status-sub">Invoice matched</div>
              </div>
              <span className="cs-check cs-check-pending">⏱</span>
            </div>
            <div className="cs-status-row">
              <div className="cs-avatar" />
              <div>
                <div className="cs-status-title">Management</div>
                <div className="cs-status-sub">Approval pending</div>
              </div>
              <span className="cs-check cs-check-pending">⏱</span>
            </div>
          </div>

          {/* Funds */}
          <div className="cs-float cs-funds">
            <div className="cs-funds-label">Saved</div>
            <div className="cs-funds-value">+$12,174</div>
          </div>

          {/* Purchases bar chart */}
          <div className="cs-float cs-purchases">
            <div className="cs-purchases-label">Purchases</div>
            <div className="cs-bars">
              <span style={{ height: "30%" }}></span>
              <span style={{ height: "45%" }}></span>
              <span style={{ height: "60%" }}></span>
              <span style={{ height: "90%" }} className="cs-bar-active"></span>
              <span style={{ height: "40%" }}></span>
              <span style={{ height: "55%" }}></span>
            </div>
          </div>

          {/* Payments */}
          <div className="cs-float cs-payments">
            <div className="cs-payments-label">Spend Limit</div>
            <div className="cs-payments-value">
              $8,500 <span>USD</span>
            </div>
            <div className="cs-progress">
              <div className="cs-progress-fill"></div>
              <span className="cs-progress-goal">$10,000</span>
            </div>
          </div>

          {/* Eleanor Pena payment card */}
          <div className="cs-float cs-payee">
            <div className="cs-payee-header">
              <div className="cs-avatar cs-avatar-large" />
              <div className="cs-payee-name">Eleanor Pena</div>
            </div>
            <div className="cs-payee-details">
              <div>
                <div className="cs-payee-label">Amount</div>
                <div className="cs-payee-amount">$480.15</div>
              </div>
              <div>
                <div className="cs-payee-label">Request Type</div>
                <div className="cs-payee-method">Purchase Order</div>
              </div>
            </div>
            <button className="cs-pay-now">Approve PO</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectedSuite;