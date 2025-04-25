import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { COLORS } from './constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // Clear auth token on initial load for development purposes
  // Remove this in production
  useEffect(() => {
    const clearAuthForDevelopment = async () => {
      // You can comment this out to persist login sessions during development
      // await AsyncStorage.removeItem('authToken');
      // await AsyncStorage.removeItem('user');
      console.log('App initialized');
    };
    
    clearAuthForDevelopment();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={COLORS.background.primary} />
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}