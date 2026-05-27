import api from './axios'

export const returnAPI = {
  scan: (data) => api.post('/returns/scan', data),
  list: (params) => api.get('/returns', { params }),
  getById: (id) => api.get(`/returns/${id}`),
  update: (id, data) => api.put(`/returns/${id}`, data),
  delete: (id) => api.delete(`/returns/${id}`),
  exportCsv: (params) =>
    api.get('/export/awb-csv', {
      params,
      responseType: 'blob',
    }),
}
