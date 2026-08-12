import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  ClipboardCheck,
  PackageSearch,
  FileSignature,
  Truck,
  ReceiptText,
  CreditCard,
  Users,
  UserCheck,
  ShoppingBag,
  Boxes,
  Landmark,
  Store,
  BarChart3,
  Bell,
  Lock,
  FileSearch,
  Workflow,
  Wallet,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import "./home.css";

const LIFECYCLE_STEPS = [
  { icon: FileCheck2, title: "Request", desc: "Employees raise purchase requests from any department" },
  { icon: ClipboardCheck, title: "Approval", desc: "Rule-driven approvals with escalation and audit" },
  { icon: PackageSearch, title: "Sourcing", desc: "RFQ, quotations and transparent vendor comparison" },
  { icon: FileSignature, title: "PO", desc: "Approved purchase orders issued to verified vendors" },
  { icon: Truck, title: "Delivery", desc: "Shipment tracking, GRN and inventory receipt" },
  { icon: ReceiptText, title: "Invoice", desc: "Vendor invoices with 3-way matching" },
  { icon: CreditCard, title: "Payment", desc: "Controlled payments with full reconciliation" },
];

const FEATURES = [
  { icon: Workflow, title: "Procurement Automation", desc: "Digitise the entire source-to-pay cycle — request, approval, sourcing, order, receipt, invoice and payment — in one governed platform." },
  { icon: ClipboardCheck, title: "Approval Workflow", desc: "Configurable, rule-based approval chains by amount, department, cost centre and priority, with escalation and self-approval prevention." },
  { icon: Store, title: "Vendor Management", desc: "Vendor onboarding with GST/PAN validation, KYC document verification, blacklist controls and an isolated supplier portal." },
  { icon: Boxes, title: "Inventory Visibility", desc: "Live stock, reserved and incoming quantities with reorder alerts and complete inventory movement history." },
  { icon: Landmark, title: "Finance & 3-Way Match", desc: "PO–GRN–invoice matching with tax checks, budget utilisation in ₹ and payment controls that prevent duplicate payouts." },
  { icon: BarChart3, title: "Reporting & Analytics", desc: "Department-wise spend, vendor performance, budget utilisation and cycle-time reports generated from real transaction data." },
  { icon: Bell, title: "Notifications", desc: "Automated alerts for approvals, RFQ invitations, deliveries, invoice mismatches, payments and budget warnings." },
  { icon: Lock, title: "Audit Governance", desc: "Immutable audit trails for every state change, JWT-based authentication and role-based access on every endpoint." },
];

const ROLE_CARDS = [
  { icon: UserCheck, title: "Employee", desc: "Create and track purchase requests with live status timelines." },
  { icon: ClipboardCheck, title: "Manager", desc: "Approve only assigned requests with comments and history." },
  { icon: ShoppingBag, title: "Procurement", desc: "Source, run RFQs, compare quotations and manage POs." },
  { icon: Boxes, title: "Warehouse", desc: "Receive goods, create GRNs and keep inventory accurate." },
  { icon: Landmark, title: "Finance", desc: "Verify budgets, match invoices and control payments." },
  { icon: Store, title: "Vendor", desc: "Respond to RFQs, accept POs, update shipments and invoice." },
  { icon: Users, title: "HR", desc: "Maintain employee records and organisational structure." },
  { icon: ShieldCheck, title: "Admin", desc: "Govern users, roles, master data, budgets and approval rules." },
];

const SECURITY_POINTS = [
  "JWT authentication with server-side role checks on every API",
  "Role-based access — vendors can only see their own records",
  "Immutable audit logs for every approval and state change",
  "Data isolation across departments, cost centres and entities",
];

const FOOTER_COLS = [
  {
    heading: "Platform",
    links: ["Purchase Requests", "Approvals", "RFQ & Quotations", "Purchase Orders", "Inventory & GRN", "Invoices & Payments"],
  },
  {
    heading: "Solutions",
    links: ["For Procurement", "For Finance", "For Warehouse", "For Vendors", "For HR & Admin"],
  },
  {
    heading: "Company",
    links: ["About EPS", "Contact Sales", "Support", "Security & Compliance"],
  },
];

const AUDIT_SAMPLE = [
  { actor: "Amit Sharma", action: "Approved PO-2026-0142", role: "Procurement Manager", time: "10:42 AM" },
  { actor: "Priya Verma", action: "Submitted PR-2026-1189", role: "Employee · IT", time: "10:15 AM" },
  { actor: "Neha Singh", action: "Verified Vendor KYC · TechNova India", role: "Admin", time: "09:58 AM" },
  { actor: "Rahul Mehta", action: "Matched Invoice INV-2026-031", role: "Finance", time: "09:31 AM" },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="eps-home">
      {/* ============ HERO ============ */}
      <section className="eps-hero">
        <div className="eps-hero-grid">
          <div className="eps-hero-copy">
            <span className="eps-eyebrow">
              <ShieldCheck size={14} />
              Enterprise Procurement System — India
            </span>
            <h1 className="eps-hero-title">
              Digitise, control and automate your complete <span>procurement lifecycle</span>
            </h1>
            <p className="eps-hero-sub">
              From purchase request to approval, sourcing, vendor delivery, GRN, invoice
              verification and payment — EPS connects every step to one governed platform
              with full auditability. Rupee-denominated budgets, GST-compliant invoicing and
              role-based access for every stakeholder.
            </p>
            <div className="eps-hero-actions">
              <button className="eps-btn eps-btn-primary" onClick={() => navigate("/login")}>
                Sign In to EPS
                <ArrowRight size={17} />
              </button>
              <button
                className="eps-btn eps-btn-ghost"
                onClick={() => document.getElementById("eps-features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore the Platform
              </button>
            </div>
            <ul className="eps-hero-trust">
              <li><CheckCircle2 size={15} /> Role-based dashboards</li>
              <li><CheckCircle2 size={15} /> Real data, no mockups</li>
              <li><CheckCircle2 size={15} /> Fully auditable</li>
            </ul>
          </div>

          {/* Lifecycle visual card */}
          <div className="eps-hero-visual">
            <div className="eps-visual-card">
              <div className="eps-visual-head">
                <div className="eps-visual-logo">EPS</div>
                <div>
                  <strong>Source-to-Pay</strong>
                  <span>Live procurement flow</span>
                </div>
              </div>
              <div className="eps-visual-steps">
                {LIFECYCLE_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div className="eps-visual-step" key={step.title}>
                      <div className="eps-visual-step-icon">
                        <Icon size={17} />
                      </div>
                      <div className="eps-visual-step-body">
                        <strong>{step.title}</strong>
                        <span>{step.desc}</span>
                      </div>
                      {i < LIFECYCLE_STEPS.length - 1 && <div className="eps-visual-step-line" />}
                    </div>
                  );
                })}
              </div>
              <div className="eps-visual-foot">
                <Wallet size={15} />
                Budgets tracked in <b>₹</b> with GST &amp; PAN verification
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LIFECYCLE STRIP ============ */}
      <section className="eps-strip">
        <div className="eps-container">
          <h2 className="eps-section-title">One connected procurement lifecycle</h2>
          <p className="eps-section-sub">Every step below is a real workflow stage with approvals, history and audit.</p>
          <div className="eps-strip-steps">
            {LIFECYCLE_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div className="eps-strip-step" key={step.title}>
                  <div className="eps-strip-icon"><Icon size={20} /></div>
                  <strong>{step.title}</strong>
                  {i < LIFECYCLE_STEPS.length - 1 && <ArrowRight className="eps-strip-arrow" size={15} />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="eps-features" className="eps-section eps-features">
        <div className="eps-container">
          <h2 className="eps-section-title">Built for the complete procurement workflow</h2>
          <p className="eps-section-sub">One platform for requesters, approvers, procurement, warehouse, finance, vendors and administrators.</p>
          <div className="eps-feature-grid">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div className="eps-feature-card" key={f.title}>
                  <div className="eps-feature-icon"><Icon size={22} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ROLES ============ */}
      <section className="eps-section eps-roles">
        <div className="eps-container">
          <h2 className="eps-section-title">A dashboard for every role</h2>
          <p className="eps-section-sub">Sign in once — EPS routes you to the dashboard built for your responsibilities.</p>
          <div className="eps-role-grid">
            {ROLE_CARDS.map((r) => {
              const Icon = r.icon;
              return (
                <div className="eps-role-card" key={r.title}>
                  <div className="eps-role-icon"><Icon size={20} /></div>
                  <strong>{r.title}</strong>
                  <span>{r.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ SECURITY ============ */}
      <section className="eps-section eps-security">
        <div className="eps-container eps-security-grid">
          <div className="eps-security-copy">
            <span className="eps-eyebrow"><Lock size={14} /> Governance by default</span>
            <h2 className="eps-section-title">Enterprise-grade security &amp; audit</h2>
            <p className="eps-section-sub">
              EPS is architected as one role-based application. The backend enforces
              authorisation on every endpoint — hiding menus in the UI is never treated as security.
            </p>
            <ul className="eps-security-list">
              {SECURITY_POINTS.map((s) => (
                <li key={s}><CheckCircle2 size={16} /> {s}</li>
              ))}
            </ul>
          </div>
          <div className="eps-security-visual">
            <div className="eps-security-card">
              <div className="eps-security-card-head">
                <FileSearch size={18} />
                <strong>Audit Trail</strong>
                <span className="eps-security-live">Example activity</span>
              </div>
              {AUDIT_SAMPLE.map((row) => (
                <div className="eps-audit-row" key={row.time + row.action}>
                  <div className="eps-audit-avatar">
                    {row.actor.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="eps-audit-body">
                    <strong>{row.actor} · {row.role}</strong>
                    <span>{row.action}</span>
                  </div>
                  <span className="eps-audit-time">{row.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="eps-cta">
        <div className="eps-cta-card">
          <h2>Ready to run procurement the right way?</h2>
          <p>
            Sign in with your organisation credentials. Your dashboard is generated from your
            role and permissions — everything is live, real and changeable.
          </p>
          <div className="eps-hero-actions" style={{ justifyContent: "center" }}>
            <button className="eps-btn eps-btn-primary" onClick={() => navigate("/login")}>
              <IndianRupee size={16} />
              Sign In to EPS
            </button>
            <button className="eps-btn eps-btn-light" onClick={() => navigate("/login")}>
              Supplier Portal
            </button>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="eps-footer">
        <div className="eps-container eps-footer-grid">
          <div className="eps-footer-brand">
            <div className="eps-visual-logo">EPS</div>
            <p>
              The Enterprise Procurement System digitises request-to-pay procurement for
              Indian enterprises — with real data, real workflows and complete auditability.
            </p>
            <span className="eps-footer-legal">
              Built for Indian enterprises · ₹ INR · GST &amp; PAN compliance
            </span>
          </div>
          {FOOTER_COLS.map((col) => (
            <div className="eps-footer-col" key={col.heading}>
              <h4>{col.heading}</h4>
              {col.links.map((l) => (
                <a key={l} href="/#">{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="eps-footer-bottom">
          <span>© 2026 Enterprise Procurement System. All rights reserved.</span>
          <span>Secure login · JWT protected · Audited</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
