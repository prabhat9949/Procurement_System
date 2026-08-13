import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";

const NAV_GROUPS = [
  {
    label: "Platform",
    columns: [
      {
        heading: "Procurement",
        links: ["Purchase Requests", "Approvals", "RFQ & Quotations", "Purchase Orders"],
      },
      {
        heading: "Operations",
        links: ["Supplier Portal", "Inventory & GRN", "Deliveries", "Spend Limits"],
      },
      {
        heading: "Finance",
        links: ["3-Way Matching", "Invoice Processing", "Tax Compliance (GST)", "Supplier Payments"],
      },
    ],
  },
  {
    label: "Solutions",
    columns: [
      {
        heading: "By Team",
        links: ["For Employees", "For Managers", "For Procurement", "For Finance"],
      },
      {
        heading: "By Function",
        links: ["For Warehouse", "For HR", "For Vendors", "For Administrators"],
      },
    ],
  },
  {
    label: "Governance",
    columns: [
      {
        heading: "Control",
        links: ["Approval Rules", "Budget Controls", "Category Routing", "Vendor KYC"],
      },
      {
        heading: "Intelligence",
        links: ["Spend Analytics", "Reports", "Audit Trail", "Notifications"],
      },
    ],
  },
];

const PUBLIC_ROUTES = { Platform: "/platform", Solutions: "/solutions", Governance: "/governance" };

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const searchRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchText.trim() === ""
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchText]);

  if (location.pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-logo" onClick={() => navigate("/")}>
          EPS
        </div>

        {/* Navigation Links */}
        <ul className={`nav-links ${showSearch ? "move-left" : ""}`}>
          {NAV_GROUPS.map((group) => (
            <li className="nav-item" key={group.label}>
              <button type="button" className="nav-group-link" onClick={() => navigate(PUBLIC_ROUTES[group.label])}>{group.label}</button>
              <div className="dropdown-content">
                {group.columns.map((col) => (
                  <div className="dropdown-column" key={col.heading}>
                    <h4>{col.heading}</h4>
                    {col.links.map((link) => (
                      <button key={link} type="button" className="nav-dropdown-link" onClick={() => navigate(PUBLIC_ROUTES[group.label])}>
                        {link}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="navbar-right">
          <div ref={searchRef} className={`search-container ${showSearch ? "active" : ""}`}>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              className="search-btn"
              onClick={() => {
                if (showSearch && searchText.trim() === "") {
                  setShowSearch(false);
                } else {
                  setShowSearch(true);
                }
              }}
            >
              {showSearch ? <FiX size={20} /> : <FiSearch size={20} />}
            </button>
          </div>

          <button className="login-btn" onClick={() => navigate("/login")}>
            Log In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
