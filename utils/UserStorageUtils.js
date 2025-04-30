import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility functions for managing user data in AsyncStorage
 */

/**
 * Save user data to AsyncStorage
 * @param {Object} userData - The user data to save
 * @returns {Promise<boolean>} - Success status
 */
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data', error);
    return false;
  }
};

/**
 * Get user data from AsyncStorage
 * @returns {Promise<Object|null>} - The user data or null if not found
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user data', error);
    return null;
  }
};

/**
 * Update specific fields in user data
 * @param {Object} updatedFields - The fields to update
 * @returns {Promise<Object|null>} - The updated user data or null if failed
 */
export const updateUserFields = async (updatedFields) => {
  try {
    // Get current user data
    const userData = await getUserData();
    
    if (!userData) {
      return null;
    }
    
    // Update fields
    const updatedUserData = {
      ...userData,
      ...updatedFields
    };
    
    // Save updated user data
    await saveUserData(updatedUserData);
    
    return updatedUserData;
  } catch (error) {
    console.error('Error updating user fields', error);
    return null;
  }
};

export default {
  saveUserData,
  getUserData,
  updateUserFields
};