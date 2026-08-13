import React from "react";
import UnavailableState from "../../shared_ui/UnavailableState";
export default function ManagerUserApprovals() { return <UnavailableState title="User-account approval is not configured" message="The backend provides user administration, but no manager user-approval workflow. This page no longer changes browser-stored user records." requirement="Add an assigned manager user-approval endpoint and workflow state." />; }
