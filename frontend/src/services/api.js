import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('courier_user');
      localStorage.removeItem('courier_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
