import React from "react";
import UnavailableState from "../../shared_ui/UnavailableState";
export default function AuditorBudgetAllocation() { return <UnavailableState title="Budget allocation is not available" message="Auditors are read-only and no BudgetController or allocation API exists. This page no longer maintains browser-only budget allocations." requirement="Add a backend budget-allocation domain and authorized read-only auditor endpoint." />; }
