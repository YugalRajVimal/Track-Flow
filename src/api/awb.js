import api from './axios'

export const awbAPI = {
  scan: (data) => api.post('/awb/scan', data),
  cancel: (awbId) => api.put(`/awb/cancel/${awbId}`),
  list: (params) => api.get('/awb', { params }),
  getById: (id) => api.get(`/awb/${id}`),
  update: (id, data) => api.put(`/awb/${id}`, data),
  delete: (id) => api.delete(`/awb/${id}`),
  exportCsv: (params) =>
    api.get('/export/awb-csv', {
      params,
      responseType: 'blob',
    }),
}
