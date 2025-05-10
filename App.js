import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { COLORS } from './constants/theme';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import linking from './linking';

export default function App() {
  const handleDeepLink = ({ url }) => {
    if (url.startsWith('HomiesStay://payment-result')) {
      // Parse URL parameters
      const urlParams = url.split('?')[1];
      if (urlParams) {
        const params = {};
        urlParams.split('&').forEach(param => {
          const [key, value] = param.split('=');
          params[key] = decodeURIComponent(value);
        });
        
        // Navigate to payment result screen
        if (navigationRef.current) {
          navigationRef.current.navigate('PaymentResult', params);
        }
      }
    }
  };

  useEffect(() => {
    const clearAuthForDevelopment = async () => {
      console.log('App initialized');
    };
    
    clearAuthForDevelopment();

    Linking.addEventListener('url', handleDeepLink);
    
    // Check for initial deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    
    // Cleanup
    return () => {
      // Remove event listener (different syntax based on React Native version)
      if (Linking.removeEventListener) {
        Linking.removeEventListener('url', handleDeepLink);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={COLORS.background.primary} />
        <AuthProvider>
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}