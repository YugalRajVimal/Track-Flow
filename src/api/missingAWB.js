/**
 * awb.api.js  — additions for the Missing AWB feature
 *
 * Add these two methods to your existing awbAPI object.
 * Example (assuming axios instance called `api`):
 *
 *   export const awbAPI = {
 *     ...existingMethods,
 *     ...missingAWBAPI,
 *   }
 */

// ── Assumes you already have an axios instance exported as `api` ──────────

export const missingAWBAPI = {
    /**
     * Phase 1 – Upload file and get a preview of missing AWBs.
     * Sends multipart/form-data.
     *
     * @param {FormData} formData  Must contain: file, channelPartnerId, startDate, endDate
     */
    previewMissing: (formData) =>
      api.post('/awb/missing/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  
    /**
     * Phase 2 – Save confirmed missing rows returned by previewMissing.
     *
     * @param {Array} rows  The `missing` array from the preview response
     */
    saveMissing: (rows) =>
      api.post('/awb/missing/save', { rows }),
  }
  
  /*
   * ─────────────────────────────────────────────────────────────────────────────
   * If your awbAPI is defined like this in awb.js:
   *
   *   import api from './axios'  // or however your axios instance is exported
   *
   *   export const awbAPI = {
   *     scan:          (data) => api.post('/awb/scan', data),
   *     cancel:        (awbId) => api.put(`/awb/cancel/${awbId}`),
   *     list:          (params) => api.get('/awb', { params }),
   *     exportCsv:     (params) => api.get('/awb/export', { params, responseType: 'blob' }),
   *     verifyPasscode:(passcode) => api.post('/awb/verify-passcode', { passcode }),
   *     delete:        (id) => api.delete(`/awb/${id}`),
   *     // ─── NEW ────────────────────────────────────────────────────────────
   *     previewMissing:(formData) => api.post('/awb/missing/preview', formData, {
   *                       headers: { 'Content-Type': 'multipart/form-data' },
   *                     }),
   *     saveMissing:   (rows) => api.post('/awb/missing/save', { rows }),
   *   }
   * ─────────────────────────────────────────────────────────────────────────────
   */