export const withQuery = (path, values = {}) => {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
};

export const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.content || payload?.items || payload?.data || [];
};
