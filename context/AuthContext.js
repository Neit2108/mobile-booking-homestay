import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authAPI from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const loadStoredToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          console.log('Found stored auth token and user data');
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Set auth header for API calls
          authAPI.setAuthToken(storedToken);
        } else {
          console.log('No stored auth token found, user needs to login');
        }
      } catch (e) {
        console.error('Failed to load auth data from storage', e);
      } finally {
        setLoading(false);
      }
    };

    loadStoredToken();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      const { token, fullName, avatarUrl } = response;
      
      const userData = { fullName, avatarUrl };
      
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Set auth header for future API calls
      authAPI.setAuthToken(token);
      
      setToken(token);
      setUser(userData);
      return true;
    } catch (e) {
      setError(e.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      return true;
    } catch (e) {
      setError(e.message || 'An error occurred during registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      // Clear auth header
      authAPI.setAuthToken(null);
      
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Error during logout', e);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to update user data
  const updateUserData = async (updatedUserData) => {
    try {
      // Update local state
      setUser(updatedUserData);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
      
      return true;
    } catch (e) {
      console.error('Error updating user data', e);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUserData, // Add the new function to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};