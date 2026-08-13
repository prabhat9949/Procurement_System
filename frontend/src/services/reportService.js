import { apiGet } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getReport = (name, filters = {}) => apiGet(withQuery(`/api/reports/${name}`, filters));
