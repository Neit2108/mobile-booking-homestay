import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Tab Navigator
import TabNavigator from './TabNavigator';

// Stack Screens
import AllPlacesScreen from '../screens/places/AllPlacesScreen';
import PlaceDetailsScreen from '../screens/places/PlaceDetailsScreen';

// Search screens
import SearchScreen from '../screens/search/SearchScreen';
import SearchResultsScreen from '../screens/search/SearchResultsScreen';
import RecentlyViewedScreen from '../screens/search/RecentlyViewedScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="AllPlaces" component={AllPlacesScreen} />
      <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
      
      {/* Search-related screens */}
      <Stack.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          animationEnabled: true,
          presentation: 'modal', // Use modal presentation for better UX
          cardStyle: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } // Fix missing corner issue
        }}
      />
      <Stack.Screen 
        name="SearchResults" 
        component={SearchResultsScreen}
        options={{
          animationEnabled: true,
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="RecentlyViewed" 
        component={RecentlyViewedScreen}
        options={{
          animationEnabled: true,
          presentation: 'card'
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    // You could return a loading screen here
    return null;
  }

  return token ? <AppStack /> : <AuthStack />;
};

export default AppNavigator;