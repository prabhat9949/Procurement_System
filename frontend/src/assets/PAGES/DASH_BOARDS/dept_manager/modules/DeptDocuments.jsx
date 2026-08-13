import React from "react";
import UnavailableState from "../../shared_ui/UnavailableState";
export default function DeptDocuments() { return <UnavailableState title="Department documents are not configured" message="The backend has no generic department document listing or upload contract. Browser-stored invoice records have been removed from this view." requirement="Provide a department-scoped document API or authorize entity attachment endpoints." />; }
