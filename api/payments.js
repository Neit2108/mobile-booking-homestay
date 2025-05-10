import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Set up request interceptor to add authentication token
 */
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
 * Create payment for a booking
 * 
 * @param {Object} paymentData - Payment data with booking ID and payment method details
 * @returns {Promise<Object>} - Created payment details including payment URL and QR code
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/vnpay/create-payment', paymentData);
    console.log('Payment creation response:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw handleApiError(error);
  }
};

/**
 * Get payment details by ID
 * 
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Object>} - Payment details
 */
export const getPaymentById = async (paymentId) => {
  try {
    const response = await apiClient.get(`/vnpay/payment/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting payment ${paymentId}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Get all payments for a specific booking
 * 
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Array>} - List of payments for the booking
 */
export const getPaymentsByBookingId = async (bookingId) => {
  try {
    const response = await apiClient.get(`/vnpay/booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting payments for booking ${bookingId}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Get all payments for the current user
 * 
 * @returns {Promise<Array>} - List of user's payments
 */
export const getUserPayments = async () => {
  try {
    const response = await apiClient.get('/vnpay/user');
    return response.data;
  } catch (error) {
    console.error('Error getting user payments:', error);
    throw handleApiError(error);
  }
};

/**
 * Process payment callback (usually handled by the backend)
 * 
 * @param {Object} callbackData - Payment callback data from payment provider
 * @returns {Promise<Object>} - Processed payment response
 */
export const processPaymentCallback = async (callbackData) => {
  try {
    const response = await apiClient.post('/vnpay/callback', callbackData);
    return response.data;
  } catch (error) {
    console.error('Error processing payment callback:', error);
    throw handleApiError(error);
  }
};

/**
 * Format and process API errors
 * 
 * @param {Error} error - The error from Axios
 * @returns {Error} - Formatted error
 */
const handleApiError = (error) => {
  let message = 'An unexpected error occurred';
  let status = 500;
  
  if (error.response) {
    // The server responded with an error status
    status = error.response.status;
    
    if (error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else {
      message = `Server error: ${status}`;
    }
  } else if (error.request) {
    // The request was made but no response received
    message = 'No response from server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request
    message = error.message;
  }
  
  const formattedError = new Error(message);
  formattedError.status = status;
  formattedError.originalError = error;
  
  return formattedError;
};

export const CreatePaymentWithWallet = async (walletData) => {
  try {
    const response = await apiClient.post('/bookings/pay-with-wallet');
    return response.data;
  } catch (error) {
    
  }
};

export default {
  createPayment,
  getPaymentById,
  getPaymentsByBookingId,
  getUserPayments,
  processPaymentCallback
};