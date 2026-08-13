import React from "react";
import UnavailableState from "../../shared_ui/UnavailableState";
export default function VendorInvoices() { return <UnavailableState title="Vendor invoice access is not configured" message="The verified invoice API is restricted to Finance, Admin, and Super Admin. This vendor page does not expose or filter organization-wide invoices." requirement="Provide a vendor-scoped invoice endpoint with backend authorization and isolation." />; }
