import React from "react";
import UnavailableState from "../../shared_ui/UnavailableState";
export default function ManagerInvoices() { return <UnavailableState title="Procurement invoice access is not configured" message="Invoice records are finance-controlled in the verified backend. This view no longer uses browser-stored invoice data." requirement="Provide a procurement-scoped, read-only invoice endpoint if this role needs visibility." />; }
