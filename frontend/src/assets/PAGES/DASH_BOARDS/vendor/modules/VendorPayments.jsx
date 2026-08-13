import React from "react";
import UnavailableState from "../../shared_ui/UnavailableState";
export default function VendorPayments() { return <UnavailableState title="Vendor payment access is not configured" message="The verified payment API is restricted to Finance, Admin, and Super Admin. This page does not show fabricated payment data." requirement="Provide a vendor-scoped payment-status endpoint with backend authorization and isolation." />; }
