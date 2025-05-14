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

/**
 * Fetch user's wallet balance
 * @returns {Promise<Object>} - Response with balance information
 */
export const getWalletBalance = async () => {
  try {
    const response = await apiClient.get('/wallet/balance');
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error.response?.data || { message: 'Failed to fetch wallet balance' };
  }
};

/**
 * Process wallet payment with PIN
 * @param {Object} payWithPinRequest - Payment request with PIN
 * @returns {Promise<Object>} - Response with payment result
 */
export const payWithWallet = async (payWithPinRequest) => {
  try {
    const response = await apiClient.post('/bookings/pay-with-wallet', payWithPinRequest);
    return response.data;
  } catch (error) {
    console.error('Error processing wallet payment:', error);
    throw error.response?.data || { message: 'Failed to process wallet payment' };
  }
};

/**
 * Set PIN for wallet
 * @param {string} pin - PIN to set (4-6 digits)
 * @returns {Promise<Object>} - Response with status
 */
export const setWalletPin = async (pin) => {
  try {
    const response = await apiClient.post('/wallet/set-pin', { pin });
    return response.data;
  } catch (error) {
    console.error('Error setting wallet PIN:', error);
    throw error.response?.data || { message: 'Failed to set wallet PIN' };
  }
};

/**
 * Check if user has set a PIN
 * @returns {Promise<Object>} - Response with hasPin status
 */
export const hasWalletPin = async () => {
  try {
    const response = await apiClient.get('/wallet/has-pin');
    return response.data;
  } catch (error) {
    console.error('Error checking PIN status:', error);
    throw error.response?.data || { message: 'Failed to check PIN status' };
  }
};

/**
 * Get wallet transaction history
 * @param {number} page - Page number for pagination
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<Array>} - List of transactions
 */
export const getWalletTransactions = async (page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get('/wallet/transactions', {
      params: { page, pageSize }
    });
    
    // If the response is already an array, return it
    if (Array.isArray(response)) {
      return response;
    } 
    // If response has data property and it's an array, return that
    else if (response && Array.isArray(response.data)) {
      return response.data;
    }
    // Otherwise, return the response as is
    else {
      return response;
    }
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    throw error;
  }
};

/**
 * Process deposit to wallet
 * @param {Object} depositRequest - Deposit request details
 * @returns {Promise<Object>} - Response with payment URL or QR code
 */
export const depositToWallet = async (depositRequest) => {
  try {
    const response = await apiClient.post('/wallet/deposit', depositRequest);
    return response.data;
  } catch (error) {
    console.error('Error creating wallet deposit:', error);
    throw error.response?.data || { message: 'Failed to process deposit request' };
  }
};

/**
 * Process withdrawal from wallet
 * @param {Object} withdrawalRequest - Withdrawal request details
 * @returns {Promise<Object>} - Response with withdrawal status
 */
export const withdrawFromWallet = async (withdrawalRequest) => {
  try {
    const response = await apiClient.post('/wallet/withdraw', withdrawalRequest);
    return response.data;
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    throw error.response?.data || { message: 'Failed to process withdrawal request' };
  }
};

export default {
  getWalletBalance,
  payWithWallet,
  setWalletPin,
  hasWalletPin,
  getWalletTransactions,
  depositToWallet,
  withdrawFromWallet
};