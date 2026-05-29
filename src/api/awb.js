import api from './axios'

export const awbAPI = {
  scan: (data) => api.post('/awb/scan', data),
  cancel: (awbId, data) => api.put(`/awb/cancel/${awbId}`, data),
  list: (params) => api.get('/awb', { params }),
  getById: (id) => api.get(`/awb/${id}`),
  update: (id, data) => api.put(`/awb/${id}`, data),
  delete: (id) => api.delete(`/awb/${id}`),
  verifyPasscode: (passcode) => api.post('/awb/verify-passcode', { passcode }),
  exportCsv: (params) =>
    api.get('/export/awb-csv', {
      params,
      responseType: 'blob',
    }),
  // ─── Missing AWB Feature ──────────────────────────────
  previewMissing: (formData) =>
    api.post('/awb/missing/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  saveMissing: (rows) =>
    api.post('/awb/missing/save', { rows }),
}