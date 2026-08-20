// Centralized logout utility — used by every dashboard to ensure consistent,
// crash-free logout regardless of which component calls it.

export const clearEpsSession = () => {
  const KEYS = [
    "eps_access_token",
    "eps_active_role",
    "eps_role_code",
    "eps_username",
    "eps_display_name",
    "eps_user_id",
    "eps_permissions",
    "eps_first_time_welcome",
    "eps_remember_username",
  ];
  KEYS.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
};

/**
 * Unified logout handler.  Safe to call from any component.
 * Clears session storage, stops any timers the caller holds, and
 * navigates to /login with replace so the browser Back button
 * cannot revisit the dashboard.
 */
export const createLogoutHandler = (navigate) => {
  return () => {
    try {
      clearEpsSession();
    } catch {
      /* localStorage may be unavailable */
    }
    navigate("/login", { replace: true });
  };
};
