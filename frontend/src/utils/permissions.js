// Read the permission codes returned by the backend login (database-driven).
// These are used ONLY to hide/show UI — the backend enforces every permission
// on the API, so a missing code here never grants access.
export const getPermissions = () => {
  try {
    const raw = localStorage.getItem("eps_permissions");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const hasPermission = (code) => getPermissions().includes(code);
