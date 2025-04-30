import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Extract user ID from the user object based on the available properties
 * @param {Object} user - User object that could have different structures
 * @returns {string|null} - User ID if found, null otherwise
 */
export const extractUserId = (user) => {
  if (!user) return null;
  
  // Check different possible properties where user ID might be stored
  return user.id || user.userId || user._id || null;
};

/**
 * Get authenticated user data from AsyncStorage
 * @returns {Promise<Object|null>} - User data if found, null otherwise
 */
export const getAuthenticatedUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error reading user data from storage:', error);
    return null;
  }
};

/**
 * Get authentication token from AsyncStorage
 * @returns {Promise<string|null>} - Token if found, null otherwise
 */
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error reading auth token from storage:', error);
    return null;
  }
};

/**
 * Check if user is authenticated and get their ID
 * @returns {Promise<Object>} - Object with isAuthenticated flag and userId if available
 */
export const checkAuthentication = async () => {
  try {
    const [token, userData] = await Promise.all([
      getAuthToken(),
      getAuthenticatedUser()
    ]);
    
    const isAuthenticated = !!token;
    const userId = userData ? extractUserId(userData) : null;
    
    return { isAuthenticated, userId, token };
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return { isAuthenticated: false, userId: null, token: null };
  }
};

export default {
  extractUserId,
  getAuthenticatedUser,
  getAuthToken,
  checkAuthentication
};