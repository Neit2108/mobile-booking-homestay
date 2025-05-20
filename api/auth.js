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
 * Login user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.emailorUsername - Email or username
 * @param {string} credentials.password - Password
 * @returns {Promise} - Response data with token or 2FA requirement
 */
export const login = async (credentials) => {
  try {
    console.log("API: Attempting to log in with:", credentials);
    console.log("API: URL:", `${API_URL}/account/auth/login`);
    
    const response = await apiClient.post('/account/auth/login', credentials);
    console.log("API: Login response:", response.data);
    
    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error("API: Login error:", error);
    console.error("API: Request details:", {
      url: `${API_URL}/account/auth/login`,
      data: credentials
    });
    throw handleApiError(error);
  }
};

/**
 * Complete 2FA login
 * @param {Object} twoFAData - 2FA verification data
 * @param {string} twoFAData.userId - User ID from initial login
 * @param {string} twoFAData.otp - One-time password
 * @returns {Promise} - Response data with token
 */
export const login2FA = async (twoFAData) => {
  try {
    console.log("API: Attempting 2FA login with:", twoFAData);
    console.log("API: URL:", `${API_URL}/account/auth/login-2fa`);
    
    const response = await apiClient.post('/account/auth/login-2fa', twoFAData);
    console.log("API: 2FA login response:", response.data);
    
    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error("API: 2FA Login error:", error);
    throw handleApiError(error);
  }
};

/**
 * Register user
 * @param {Object} userData - User data
 * @returns {Promise} - Response data
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/account/auth/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Request password reset
 * @param {string} email - User's email address
 * @returns {Promise} - Response data with success message
 */
export const forgotPassword = async (email) => {
  try {
    console.log("API: Attempting to request password reset for:", email);
    console.log("API: URL:", `${API_URL}/account/auth/forgot-password`);
    
    const response = await apiClient.post('/account/auth/forgot-password', { email });
    console.log("API: Forgot password response:", response.data);
    
    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error("API: Forgot password error:", error);
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
    console.error("API Error Response:", {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    
    if (error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else {
      message = `Error ${error.response.status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error("API No Response:", error.request);
    message = 'No response from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("API Setup Error:", error.message);
    message = error.message;
  }
  
  const customError = new Error(message);
  customError.originalError = error;
  return customError;
};

// Set token for authenticated requests
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};