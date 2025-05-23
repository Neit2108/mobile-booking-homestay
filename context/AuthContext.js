import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authAPI from '../api/auth';
import { getProfile } from '../api/user';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken) {
          setToken(storedToken);
          authAPI.setAuthToken(storedToken);
          
          // If we have stored user data, use it initially
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          
          // Then fetch the latest profile data
          await fetchUserProfile();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Function to fetch the user's profile
  const fetchUserProfile = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (!storedToken) return;
      
      const response = await getProfile(storedToken);
      if (response && response.data) {
        const profileData = response.data;
        
        // Map API response fields to our user object structure
        const userData = {
          id: profileData.id,
          fullName: profileData.name,
          email: profileData.email,
          phoneNumber: profileData.phone,
          homeAddress: profileData.add,
          birthDate: profileData.birthday,
          gender: profileData.gender,
          avatarUrl: profileData.avatar,
          bio: profileData.bio,
          identityCard: profileData.identityCard,
          role: profileData.role,
          passwordChangeAt: profileData.passwordChangeAt,
          twoFactor: profileData.twoFactor,
          createAt: profileData.createAt,
        };
        
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      console.log('AuthContext: Attempting login...');
      const response = await authAPI.login(credentials);
      console.log('AuthContext: Login response:', response);
      
      if (response.requiresTwoFactor) {
        console.log('AuthContext: 2FA required, returning response');
        return response; 
      }
      
      const { token, fullName, avatarUrl } = response;
      if (token) {
        console.log('AuthContext: Login successful, setting token and user data');
        await AsyncStorage.setItem('authToken', token);
        setToken(token);
        authAPI.setAuthToken(token);
        
        const initialUserData = {
          fullName,
          avatarUrl,
        };
        setUser(initialUserData);
        await AsyncStorage.setItem('user', JSON.stringify(initialUserData));
        
        await fetchUserProfile();
      }
      
      return response;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setError(error.message || 'Đăng nhập không thành công');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login2FA = async (twoFAData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('AuthContext: Attempting 2FA login...', twoFAData);
      const response = await authAPI.login2FA(twoFAData);
      console.log('AuthContext: 2FA login response:', response);
      
      const { token, fullName, avatarUrl } = response;
      if (token) {
        console.log('AuthContext: 2FA successful, setting token and user data');
        await AsyncStorage.setItem('authToken', token);
        setToken(token);
        authAPI.setAuthToken(token);
        
        const initialUserData = {
          fullName,
          avatarUrl,
        };
        setUser(initialUserData);
        await AsyncStorage.setItem('user', JSON.stringify(initialUserData));
        
        // Fetch complete user profile after successful login
        await fetchUserProfile();
      }
      
      return response;
    } catch (error) {
      console.error('AuthContext: 2FA error:', error);
      setError(error.message || 'Mã xác thực không đúng hoặc đã hết hạn');
      throw error;
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
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
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
      
      setToken(null);
      setUser(null);
      authAPI.setAuthToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user has admin role
  const isAdmin = () => user?.role?.includes('Admin');
  
  // Check if user has landlord role
  const isLandlord = () => user?.role?.includes('Landlord');
  
  // Check if user has a specific role
  const hasRole = (role) => user?.role === role;
  
  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => roles?.some(role => user?.role?.includes(role));

  // User profile update
  const updateUserData = async (updatedUserData) => {
    try {
      // Update local state
      setUser(updatedUserData);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
      
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    login2FA,
    register,
    logout,
    updateUserData,
    fetchUserProfile,
    isAdmin,
    isLandlord,
    hasRole,
    hasAnyRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default { AuthProvider, useAuth };