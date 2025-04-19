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
 * @returns {Promise} - Response data
 */
// src/api/auth.js
export const login = async (credentials) => {
  try {
    console.log("Attempting to log in with:", credentials);
    console.log("API URL:", `${API_URL}/account/auth/login`);
    
    const response = await apiClient.post('/account/auth/login', credentials);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    console.error("Request details:", {
      url: `${API_URL}/account/auth/login`,
      data: credentials
    });
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
 * Handle API errors
 * @param {Error} error - Error object
 * @returns {Error} - Processed error
 */
const handleApiError = (error) => {
  let message = 'Something went wrong';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
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

// Set token for authenticated requests
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};