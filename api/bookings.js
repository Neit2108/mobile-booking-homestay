import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

/**
 * Create an Axios instance with base configuration
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
 * Check if a voucher code is valid
 * 
 * @param {string} code - The voucher code to validate
 * @returns {Promise<Object|null>} - Voucher data if valid, null if invalid
 */
export const checkVoucher = async (code) => {
  try {
    const response = await apiClient.post('/utils/voucher/validate', { code });
    return response.data;
  } catch (error) {
    console.error('Error validating voucher:', error);
    return null;
  }
};

/**
 * Create a new booking
 * 
 * @param {Object} bookingData - The booking data
 * @returns {Promise<Object>} - Created booking
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await apiClient.post('/bookings/new-booking', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw handleApiError(error);
  }
};

/**
 * Get all bookings for the current user
 * 
 * @returns {Promise<Array>} - List of user's bookings
 */
export const getUserBookings = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }
    
    const response = await apiClient.get(`/bookings/user-bookings/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw handleApiError(error);
  }
};

/**
 * Get all bookings for a specific place
 * 
 * @param {number} placeId - ID of the place
 * @returns {Promise<Array>} - List of bookings for the place
 */
export const getPlaceBookings = async (placeId) => {
  try {
    const response = await apiClient.get(`/bookings/place-bookings/${placeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching place bookings:', error);
    throw handleApiError(error);
  }
};

/**
 * Cancel a booking
 * 
 * @param {number} bookingId - ID of the booking to cancel
 * @returns {Promise<Object>} - Updated booking
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await apiClient.put(`/bookings/cancel/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error canceling booking:', error);
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

export default {
  checkVoucher,
  createBooking,
  getUserBookings,
  getPlaceBookings,
  cancelBooking
};