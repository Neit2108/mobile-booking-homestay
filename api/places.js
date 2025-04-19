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
 * Get top rated places
 * @param {number} limit - Number of places to fetch
 * @returns {Promise} - Response data
 */
export const getTopRatedPlaces = async (limit = 5) => {
  try {
    const response = await apiClient.get(`/places/top-rating?limit=${limit}`);
    
    // Add placeholder image URLs if missing
    const places = response.data.map(place => {
      if (!place.images || place.images.length === 0) {
        place.images = [{ imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${place.id}` }];
      }
      return place;
    });
    
    return places;
  } catch (error) {
    console.error('Error fetching top rated places:', error);
    
    // For development/fallback, return mock data
    if (process.env.NODE_ENV !== 'production') {
      return getMockPlaces(limit);
    }
    
    throw handleApiError(error);
  }
};

/**
 * Get all places
 * @param {Object} params - Query parameters
 * @returns {Promise} - Response data
 */
export const getAllPlaces = async (params = {}) => {
  try {
    const response = await apiClient.get('/places/get-all', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all places:', error);
    
    // For development/fallback, return mock data
    if (process.env.NODE_ENV !== 'production') {
      return getMockPlaces(10);
    }
    
    throw handleApiError(error);
  }
};

/**
 * Get place details by ID
 * @param {number} id - Place ID
 * @returns {Promise} - Response data
 */
export const getPlaceById = async (id) => {
  try {
    const response = await apiClient.get(`/places/place-details/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching place with ID ${id}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Search places by name or location
 * @param {string} query - Search query
 * @returns {Promise} - Response data
 */
export const searchPlaces = async (query) => {
  try {
    const response = await apiClient.get(`/places/search?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching places:', error);
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

/**
 * Generate mock place data for development
 * @param {number} count - Number of mock places to generate
 * @returns {Array} - Mock places data
 */
const getMockPlaces = (count = 5) => {
  const locations = [
    { city: 'San Diego', state: 'CA' },
    { city: 'Los Angeles', state: 'CA' },
    { city: 'Honolulu', state: 'HI' },
    { city: 'New York', state: 'NY' },
    { city: 'Miami', state: 'FL' },
    { city: 'Santa Monica', state: 'CA' },
  ];
  
  const placeNames = [
    'The Horizon Retreat',
    'Opal Grove Inn',
    'Serenity Sands',
    'Elysian Suites',
    'Tranquil Shores',
    'Azure Bay Resort',
    'Majestic Heights',
    'Golden Vista Lodge',
    'Harbor Cove Inn',
    'Sunset Palms Resort',
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const location = locations[Math.floor(Math.random() * locations.length)];
    const name = placeNames[Math.floor(Math.random() * placeNames.length)];
    const price = Math.floor(Math.random() * 400) + 100; // Random price between 100-500
    const rating = (Math.random() * 2 + 3).toFixed(1); // Random rating between 3.0-5.0
    
    return {
      id: i + 1,
      name: `${name} ${i + 1}`,
      address: `${location.city}, ${location.state}`,
      location: `${location.city}, ${location.state}`,
      category: Math.random() > 0.5 ? 'Hotel' : 'Villa',
      price: price,
      rating: parseFloat(rating),
      numOfRating: Math.floor(Math.random() * 500) + 50,
      images: [
        {
          id: i + 1,
          imageUrl: `https://source.unsplash.com/random/300x200/?hotel,${i+1}`,
        },
      ],
      maxGuests: Math.floor(Math.random() * 5) + 2,
      description: 'A beautiful place to stay with amazing views and excellent amenities.',
    };
  });
};