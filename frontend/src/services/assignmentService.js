import axios from 'axios';

const API_BASE = '/api/assignments';

export const fetchAssignments = async (role, status) => {
  const token = localStorage.getItem('eps_access_token');
  const params = { role };
  if (status) params.status = status;
  const response = await axios.get(API_BASE, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const updateAssignmentStatus = async (id, newStatus) => {
  const token = localStorage.getItem('eps_access_token');
  await axios.put(`${API_BASE}/${id}/status`, null, {
    headers: { Authorization: `Bearer ${token}` },
    params: { newStatus },
  });
};
