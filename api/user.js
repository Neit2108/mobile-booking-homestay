import axios from 'axios';
import { API_URL } from '../constants/config';
import { setAuthToken } from './auth';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get user profile
 * @returns {Promise} - Response data
 */
export const getProfile = async () => {
  try {
    const response = await apiClient.get('/user/profile');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} - Response data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/user/update-profile', profileData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Upload profile image
 * @param {FormData} formData - Form data with image file
 * @returns {Promise} - Response data with avatar URL
 */
export const uploadImage = async (formData) => {
  try {
    const response = await apiClient.post('/uploads/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update profile image
 * @param {FormData} formData - Form data with image file
 * @returns {Promise} - Response data with updated avatar URL
 */
export const updateImage = async (formData) => {
  try {
    const response = await apiClient.put('/uploads/update-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete profile image
 * @returns {Promise} - Response data with success message
 */
export const deleteImage = async () => {
  try {
    const response = await apiClient.delete('/uploads/delete-image');
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
export const setUserAuthToken = (token) => {
  setAuthToken(token);
};

export default {
  getProfile,
  updateProfile,
  uploadImage,
  updateImage,
  deleteImage,
};