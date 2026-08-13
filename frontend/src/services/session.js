import { apiGet } from "./apiClient";

export const ROLE_MAP = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "org_admin",
  HR_MANAGER: "hr_manager",
  PROCUREMENT_MANAGER: "proc_manager",
  PROCUREMENT_OFFICER: "proc_executive",
  FINANCE_MANAGER: "finance_manager",
  WAREHOUSE_MANAGER: "inventory_manager",
  DEPARTMENT_MANAGER: "dept_manager",
  SENIOR_MANAGER: "senior_manager",
  HEAD: "head",
  EQUIPMENT_ASSET_TEAM: "equipment",
  IT_SOFTWARE_TEAM: "software",
  FACILITIES_TEAM: "facilities",
  EMPLOYEE: "employee",
  VENDOR: "vendor",
  AUDITOR: "auditor",
};

const SESSION_KEYS = [
  "eps_access_token",
  "eps_username",
  "eps_display_name",
  "eps_role_code",
  "eps_active_role",
  "eps_user_id",
  "eps_employee_id",
  "eps_department_id",
  "eps_cost_center_id",
];

export const clearSession = () => SESSION_KEYS.forEach((key) => localStorage.removeItem(key));

// The API profile is the source of truth for the browser session. Login
// responses are deliberately not trusted by themselves because a user can
// modify localStorage after signing in.
export const syncSessionFromProfile = (profile) => {
  const roleCode = profile?.roleCode || "";
  const activeRole = ROLE_MAP[roleCode];

  if (!activeRole) throw new Error("Your account does not have a supported EPS role.");

  localStorage.setItem("eps_username", profile.username || "");
  localStorage.setItem("eps_display_name", profile.displayName || profile.username || "User");
  localStorage.setItem("eps_role_code", roleCode);
  localStorage.setItem("eps_active_role", activeRole);
  localStorage.setItem("eps_user_id", String(profile.userId ?? ""));
  localStorage.setItem("eps_employee_id", String(profile.employeeId ?? ""));
  localStorage.setItem("eps_department_id", String(profile.departmentId ?? ""));
  localStorage.setItem("eps_cost_center_id", String(profile.costCenterId ?? ""));
  return { ...profile, activeRole };
};

export const loadVerifiedSession = async () => syncSessionFromProfile(await apiGet("/api/auth/me"));
