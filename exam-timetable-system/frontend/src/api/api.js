import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
});

// Attach the stored JWT (if any) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ------------------------------------------------------
export const adminLogin = (username, password) =>
  api.post('/auth/admin/login', { username, password });

export const studentLogin = (email, password) =>
  api.post('/auth/student/login', { email, password });

export const studentRegister = (payload) =>
  api.post('/auth/student/register', payload);

// --- Exams (admin) ----------------------------------------------
export const fetchAllExams = () => api.get('/exams');
export const createExam = (payload) => api.post('/exams', payload);
export const updateExam = (id, payload) => api.put(`/exams/${id}`, payload);
export const cancelExam = (id) => api.patch(`/exams/${id}/cancel`);
export const deleteExam = (id) => api.delete(`/exams/${id}`);

// --- Student -----------------------------------------------------
export const fetchMyProfile = () => api.get('/students/me');
export const fetchMyTimetable = () => api.get('/students/me/timetable');

export default api;
