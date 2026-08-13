import React from "react";
import UnavailableState from "../../shared_ui/UnavailableState";
export default function DocumentsModule() { return <UnavailableState title="Document centre is not configured" message="No generic document API is available for employee documents. This page does not use browser-stored invoices or fabricated files." requirement="Provide a scoped document endpoint, or expose the supported entity-specific attachment APIs to this role." />; }
