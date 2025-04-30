import axios from 'axios';
import { API_URL } from '../constants/config';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check if a voucher is valid and get its details
 * @param {string} code - Voucher code
 * @returns {Promise} - Response with voucher details or null if invalid
 */
export const checkVoucher = async (code) => {
  try {
    const response = await apiClient.post('/utils/voucher/validate', { code });
    return response.data;
  } catch (error) {
    console.error('Error checking voucher:', error);
    throw handleApiError(error);
  }
};

/**
 * Apply voucher to calculate the discounted price
 * @param {string} code - Voucher code
 * @param {number} price - Original price
 * @returns {Promise} - Discounted price
 */
export const applyVoucher = async (code, price) => {
  try {
    const response = await apiClient.post('/utils/voucher/apply', { 
      code, 
      price 
    });
    return response.data;
  } catch (error) {
    console.error('Error applying voucher:', error);
    throw handleApiError(error);
  }
};

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @returns {Error} - Processed error
 */
const handleApiError = (error) => {
  let message = 'Something went wrong';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.status === 400) {
      // Specific handling for invalid voucher
      return null;
    }
    
    if (error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else {
      message = `Error ${error.response.status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    message = 'No response from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    message = error.message;
  }
  
  const customError = new Error(message);
  customError.originalError = error;
  return customError;
};

export default {
  checkVoucher,
  applyVoucher
};