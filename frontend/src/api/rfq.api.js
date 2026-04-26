import api from '../utils/axiosInstance';

export const getMyRFQsAPI = async () => {
  const response = await api.get('/rfq');
  return response.data;
};

export const getRFQDetailsAPI = async (rfqId) => {
  const response = await api.get(`/rfq/${rfqId}`);
  return response.data;
};

export const createRFQAPI = async (rfqData) => {
  const response = await api.post('/rfq/create', rfqData);
  return response.data;
};

export const submitBidAPI = async (bidData) => {
  const response = await api.post('/rfq/bid', bidData);
  return response.data;
};