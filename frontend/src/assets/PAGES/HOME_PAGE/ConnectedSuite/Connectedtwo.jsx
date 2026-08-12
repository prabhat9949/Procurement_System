import React from "react";
import "./connectedtwo.css";

const Connectedtwo = () => {
  return (
    <section className="ct-wrapper">
      {/* Top floating category cards */}
      <div className="ct-top-cards">
        <div className="ct-card ct-card-green">
          <div className="ct-card-title">Invoices</div>
          <div className="ct-card-inner">
            <div className="ct-inner-label">Invoice</div>
            <div className="ct-invoice-row">
              <span>4/1/26</span>
              <span>Highfield Movers</span>
            </div>
            <div className="ct-invoice-row">
              <span>4/1/26</span>
              <span>Zabuza LLC</span>
            </div>
            <div className="ct-invoice-row">
              <span>4/1/26</span>
              <span>Steel &amp; Wire Co</span>
            </div>
          </div>
        </div>

        <div className="ct-card ct-card-purple">
          <div className="ct-card-title">Purchase Orders</div>
          <div className="ct-card-inner">
            <div className="ct-payment-row">
              <span className="ct-icon-circle ct-icon-dark">💳</span>
              <span>PO Issued</span>
              <span className="ct-amount">$1,513</span>
            </div>
            <div className="ct-payment-row">
              <span className="ct-icon-circle ct-icon-yellow">P</span>
              <span>PO Issued</span>
              <span className="ct-amount">$497</span>
            </div>
          </div>
        </div>

        <div className="ct-card ct-card-orange">
          <div className="ct-card-title">Procurement</div>
          <div className="ct-card-inner">
            <div className="ct-proc-row">
              <span className="ct-check">✓</span>
              <div>
                <div className="ct-proc-title">Procurement</div>
                <div className="ct-proc-sub">Execution Date</div>
              </div>
            </div>
            <div className="ct-proc-row">
              <span className="ct-dot"></span>
              <div>
                <div className="ct-proc-title">IT</div>
                <div className="ct-proc-sub">Direct Filing</div>
              </div>
            </div>
            <div className="ct-proc-row">
              <span className="ct-dot"></span>
              <div>
                <div className="ct-proc-title">Legal</div>
                <div className="ct-proc-sub">Pending Approval</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ct-card ct-card-tan">
          <div className="ct-card-title">Spend Controls</div>
          <div className="ct-card-inner">
            <div className="ct-treasury-label">Total Budget</div>
            <div className="ct-treasury-row">
              <span className="ct-icon-circle ct-icon-dark">↓</span>
              <span>Approved Budget</span>
            </div>
            <div className="ct-treasury-row">
              <span className="ct-icon-circle ct-icon-dark">↑</span>
              <span>Spent Budget</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connecting line strip */}
      <div className="ct-strip">
        <div className="ct-strip-segment ct-seg-green"></div>
        <div className="ct-strip-segment ct-seg-purple"></div>
        <div className="ct-strip-segment ct-seg-orange"></div>
        <div className="ct-strip-segment ct-seg-tan"></div>
      </div>

      {/* Dark banner */}
      <div className="ct-banner">
        <div className="ct-banner-grid"></div>
        <h2>The Enterprise Procurement Suite</h2>
        <div className="ct-pills">
          <button className="ct-pill">Procurement AI</button>
          <button className="ct-pill">Supplier Network</button>
          <button className="ct-pill">Purchase Controls & Compliance</button>
        </div>
      </div>

      {/* ERP Integrations dark section */}
      <div className="ct-erp-section">
        <span className="ct-eyebrow">Integrations</span>
        <h2 className="ct-erp-title">
          Pre-Built ERP
          <br />
          Connections to Extend
          <br />
          Automated Workflows
        </h2>
        <p className="ct-erp-desc">
          Easily extend and simplify your workflows with pre-built
          integrations and powerful APIs for your ERPs, supply chain management tools,
          HRIS, SSO, Slack, purchasing cards, and more.
        </p>

        <div className="ct-logos">
          <span className="ct-logo">xero</span>
          <span className="ct-logo">Acumatica</span>
          <span className="ct-logo">Sage</span>
          <span className="ct-logo">ORACLE NetSuite</span>
          <span className="ct-logo">D</span>
          <span className="ct-logo">intuit QuickBooks</span>
        </div>

        <button className="ct-integrations-btn">See All Integrations</button>
      </div>

      {/* Customer stories */}
      <div className="ct-stories-section">
        <span className="ct-eyebrow ct-eyebrow-dark">Customer Stories</span>
        <h2 className="ct-stories-title">
          Don't just take our word for it,
          <br />
          see what our customers are saying
        </h2>

        <div className="ct-stories-cards">
          <div className="ct-story-card">
            <div className="ct-story-banner ct-banner-yellow">
              <span className="ct-story-logo">🍯 honeygain</span>
            </div>
            <div className="ct-story-body">
              <h3>Honeygain</h3>
              <p>
                Honeygain used the Enterprise Procurement System to streamline vendor onboarding and purchase requests,
                letting teams request items in-dashboard and removing manual checklists and emails.
              </p>
              <div className="ct-story-meta">
                <div>
                  <div className="ct-meta-label">Product</div>
                </div>
                <div>
                  <div className="ct-meta-label">Region</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ct-story-card">
            <div className="ct-story-banner ct-banner-green">
              <span className="ct-story-logo">ManyPets</span>
            </div>
            <div className="ct-story-body">
              <h3>ManyPets</h3>
              <p>
                Discover how ManyPets automated purchasing and procurement, enabling
                stronger spend control, faster cycle times, and scalability without
                hiring more staff.
              </p>
              <div className="ct-story-meta">
                <div>
                  <div className="ct-meta-label">Product</div>
                </div>
                <div>
                  <div className="ct-meta-label">Region</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ct-story-card">
            <div className="ct-story-banner ct-banner-blue">
              <span className="ct-story-logo">🎮 Cubic Games</span>
            </div>
            <div className="ct-story-body">
              <h3>Cubic Games</h3>
              <p>
                By adopting our procurement system, Cubic Games transformed its internal buying workflow,
                achieving faster order fulfillments and significant cost savings.
              </p>
              <div className="ct-story-meta">
                <div>
                  <div className="ct-meta-label">Product</div>
                </div>
                <div>
                  <div className="ct-meta-label">Region</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Connectedtwo;