import api from './axios'

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
}
