// Offline API wrapper for calls to backend offline record endpoints, following the awbAPI style

import api from './axios'

// Use same pattern as awbAPI in awb.js
export const offlineAPI = {
  // List offline records with query filters
  list: (params) => api.get('/offline', { params }),

  // Get single offline record by ID
  getById: (id) => api.get(`/offline/${id}`),

  // Create a new offline record
  create: (payload) => api.post('/offline', payload),

  // Edit/update an offline record by ID
  update: (id, updates) => api.put(`/offline/${id}`, updates),

  // Delete an offline record by ID
  delete: (id) => api.delete(`/offline/${id}`),

  // Export all offline records (can include filters)
  exportAll: (params) =>
    api.get('/offline/export', {
      params,
      responseType: 'blob', // Common for exports; adjust if not needed
    }),
}