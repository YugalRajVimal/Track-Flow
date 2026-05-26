import api from './axios'

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id, data) => api.patch(`/users/${id}/status`, data),
}

export const channelPartnersAPI = {
  list: (params) => api.get('/channel-partners', { params }),
  create: (data) => api.post('/channel-partners', data),
  update: (id, data) => api.put(`/channel-partners/${id}`, data),
  delete: (id) => api.delete(`/channel-partners/${id}`),
}

export const brandsAPI = {
  list: (params) => api.get('/brands', { params }),
  listByPartner: (channelPartnerId) =>
    api.get(`/brands/channel-partner/${channelPartnerId}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
}

export const auditLogsAPI = {
  list: (params) => api.get('/audit-logs', { params }),
}
