import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

// Create an axios instance for wallet API calls
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add authentication token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch user's wallet balance
export const getWalletBalance = async () => {
  try {
    const response = await apiClient.get('/wallet/balance');
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error.response?.data || new Error('Failed to fetch wallet balance');
  }
};

// Process wallet payment with PIN
export const payWithWallet = async (payWithPinRequest) => {
  try {
    const response = await apiClient.post('/bookings/pay-with-wallet', payWithPinRequest);
    return response.data;
  } catch (error) {
    console.error('Error processing wallet payment:', error);
    throw error.response?.data || new Error('Failed to process wallet payment');
  }
};