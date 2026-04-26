import api from '../utils/axiosInstance';

export const loginAPI = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const registerAPI = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};