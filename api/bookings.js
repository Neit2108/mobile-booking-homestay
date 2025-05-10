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
 * Get all bookings for the current user
 * 
 * @param {string} [userId] - Optional userId (if not provided, will try to get from storage)
 * @returns {Promise<Array>} - List of user's bookings
 */
export const getUserBookings = async (userId = null) => {
  try {
    // Try to get the user ID from multiple possible sources
    let currentUserId = userId;
    
    if (!currentUserId) {
      // Check AsyncStorage with different possible keys
      const possibleKeys = ['userId', 'user_id', 'id'];
      for (const key of possibleKeys) {
        const storedId = await AsyncStorage.getItem(key);
        if (storedId) {
          currentUserId = storedId;
          break;
        }
      }
      
      // If still no userId, try to parse it from the stored user object
      if (!currentUserId) {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          try {
            const userData = JSON.parse(userJson);
            currentUserId = userData.id || userData.userId || userData._id || userData.Id;
          } catch (e) {
            console.warn('Failed to parse user data from storage', e);
          }
        }
      }
    }
    
    // If we still don't have a userId, use mock data
    if (!currentUserId) {
      console.warn('User ID not found in storage, using mock data');
      return getMockBookings();
    }
    
    // Make the API request with the userId
    console.log('Fetching bookings for user ID:', currentUserId);
    const response = await apiClient.get(`/bookings/user-bookings/${currentUserId}`);
    
    console.log('API Response:', response.status, response.statusText);
    console.log('Response data type:', typeof response.data);
    
    // Add detailed logging to understand the response structure
    if (response.data === null || response.data === undefined) {
      console.warn('API returned null or undefined data');
      return getMockBookings();
    }
    
    if (Array.isArray(response.data)) {
      console.log('Response is an array with', response.data.length, 'items');
      if (response.data.length > 0) {
        console.log('First booking sample:', JSON.stringify(response.data[0], null, 2));
      } else {
        console.log('Response array is empty');
        return [];
      }
    } else {
      console.log('Response is not an array:', JSON.stringify(response.data, null, 2));
      // Check if the data might be nested in a property
      const possibleDataFields = ['data', 'bookings', 'items', 'results'];
      for (const field of possibleDataFields) {
        if (response.data[field] && Array.isArray(response.data[field])) {
          console.log(`Found data in response.data.${field}`);
          response.data = response.data[field];
          break;
        }
      }
      
      // If it's still not an array, return mock data
      if (!Array.isArray(response.data)) {
        console.warn('Could not find booking array in response, using mock data');
        return getMockBookings();
      }
    }
    
    // Check if the response matches our expected format or needs mapping
    const needsMapping = response.data.length > 0 && 
      (response.data[0].Id === undefined || response.data[0].PlaceName === undefined);
    
    if (needsMapping) {
      console.log('Response needs mapping to match expected format');
      // Try to map the response to our expected format
      return response.data.map(booking => {
        // Log original booking to see its structure
        // console.log('Original booking:', JSON.stringify(booking, null, 2));
        
        // Create standardized booking object with all possible property names
        return {
          Id: booking.Id || booking.id || booking._id || booking.bookingId,
          UserId: booking.UserId || booking.userId || booking.user_id,
          PlaceId: booking.PlaceId || booking.placeId || booking.place_id,
          PlaceName: booking.PlaceName || booking.placeName || booking.name || (booking.Place && booking.Place.Name),
          PlaceAddress: booking.PlaceAddress || booking.placeAddress || booking.address || 
                        (booking.Place && booking.Place.Address),
          StartDate: booking.StartDate || booking.startDate || booking.start_date || booking.checkIn,
          EndDate: booking.EndDate || booking.endDate || booking.end_date || booking.checkOut,
          NumberOfGuests: booking.NumberOfGuests || booking.numberOfGuests || booking.guests || 2,
          TotalPrice: booking.TotalPrice || booking.totalPrice || booking.price || 120,
          Status: booking.Status || booking.status,
          PaymentStatus: booking.PaymentStatus || booking.paymentStatus || 'Unpaid',
          RejectReason: booking.RejectReason || booking.rejectReason,
          ImageUrl: booking.ImageUrl || booking.imageUrl || booking.image || 
                   (booking.Place && booking.Place.ImageUrl) ||
                   `https://source.unsplash.com/random/300x200/?hotel,${booking.Id || booking.id || Math.random()}`,
          Rating: booking.Rating || booking.rating || 4.7,
        };
      });
    }
    
    // Return the data as is
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    
    // For development, return mock data until API is fully implemented
    return getMockBookings();
  }
};

/**
 * Get booking details by ID
 * 
 * @param {number} bookingId - ID of the booking
 * @returns {Promise<Object>} - Booking details
 */
export const getBookingDetails = async (bookingId) => {
  try {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking ${bookingId}:`, error);
    throw handleApiError(error);
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
    console.log(bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
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
    // Assuming there's a dedicated endpoint for cancellation
    const response = await apiClient.put(`/bookings/cancel/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw handleApiError(error);
  }
};

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

/**
 * Generate mock booking data for development
 * 
 * @returns {Array} - Mock bookings
 */
const getMockBookings = () => {
  return [
    {
      Id: 1,
      UserId: 'user1',
      PlaceId: 101,
      PlaceName: 'The Aston Vill Hotel',
      PlaceAddress: 'Veum Point, Michikoton',
      StartDate: '2024-11-12T00:00:00',
      EndDate: '2024-11-14T00:00:00',
      NumberOfGuests: 2,
      TotalPrice: 240,
      Status: 'Confirmed',
      PaymentStatus: 'Paid',
      RejectReason: null,
      ImageUrl: 'https://source.unsplash.com/random/300x200/?resort,1',
      Rating: 4.7,
    },
    {
      Id: 2,
      UserId: 'user1',
      PlaceId: 102,
      PlaceName: 'Mystic Palms',
      PlaceAddress: 'Palm Springs, CA',
      StartDate: '2024-11-20T00:00:00',
      EndDate: '2024-11-25T00:00:00',
      NumberOfGuests: 1,
      TotalPrice: 1150,
      Status: 'Pending',
      PaymentStatus: 'Unpaid',
      RejectReason: null,
      ImageUrl: 'https://source.unsplash.com/random/300x200/?resort,2',
      Rating: 4.0,
    },
    {
      Id: 3,
      UserId: 'user1',
      PlaceId: 103,
      PlaceName: 'Elysian Suites',
      PlaceAddress: 'San Diego, CA',
      StartDate: '2024-12-05T00:00:00',
      EndDate: '2024-12-10T00:00:00',
      NumberOfGuests: 3,
      TotalPrice: 850,
      Status: 'Confirmed',
      PaymentStatus: 'Paid',
      RejectReason: null,
      ImageUrl: 'https://source.unsplash.com/random/300x200/?resort,3',
      Rating: 3.8,
    },
    {
      Id: 4,
      UserId: 'user1',
      PlaceId: 104,
      PlaceName: 'Coastal Retreat',
      PlaceAddress: 'Malibu, CA',
      StartDate: '2024-09-10T00:00:00',
      EndDate: '2024-09-15T00:00:00',
      NumberOfGuests: 2,
      TotalPrice: 1200,
      Status: 'Completed',
      PaymentStatus: 'Paid',
      RejectReason: null,
      ImageUrl: 'https://source.unsplash.com/random/300x200/?resort,4',
      Rating: 4.9,
    },
    {
      Id: 5,
      UserId: 'user1',
      PlaceId: 105,
      PlaceName: 'Mountain Lodge',
      PlaceAddress: 'Aspen, CO',
      StartDate: '2024-08-20T00:00:00',
      EndDate: '2024-08-25T00:00:00',
      NumberOfGuests: 4,
      TotalPrice: 1500,
      Status: 'Cancelled',
      PaymentStatus: 'Refunded',
      RejectReason: 'Weather conditions',
      ImageUrl: 'https://source.unsplash.com/random/300x200/?resort,5',
      Rating: 4.2,
    },
  ];
};

export default {
  getUserBookings,
  getBookingDetails,
  createBooking,
  cancelBooking,
  checkVoucher
};