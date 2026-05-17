import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const apiClient = axios.create({ baseURL: API });

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('filmy_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  sendOtp: (phone) => apiClient.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp) => apiClient.post('/auth/verify-otp', { phone, otp }),
  me: () => apiClient.get('/auth/me')
};

export const catalogApi = {
  events: () => apiClient.get('/events').then(r => r.data),
  plays: () => apiClient.get('/plays').then(r => r.data),
  sports: () => apiClient.get('/sports').then(r => r.data),
  cinemas: (city) => apiClient.get('/cinemas', { params: { city } }).then(r => r.data)
};

export const bookingApi = {
  bookedSeats: (movie_id, cinema_id, date, time) =>
    apiClient.get('/shows/booked-seats', { params: { movie_id, cinema_id, date, time } }).then(r => r.data),
  create: (payload) => apiClient.post('/bookings', payload).then(r => r.data),
  mine: () => apiClient.get('/bookings/me').then(r => r.data)
};
