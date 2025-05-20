import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { COLORS } from '../constants/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BookingsScreen from '../screens/booking/BookingsScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ProfileTabNavigator from './ProfileTabNavigator';

// Custom Tab Bar Component
import CustomBottomTab from '../components/navigation/CustomBottomTab';
import SavedPlaceScreen from '../screens/places/SavedPlacesScreen';

const Tab = createBottomTabNavigator();

/**
 * Main Tab Navigator component
 * Handles bottom tab navigation between main app sections
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 80 : 60,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Trang chủ',
        }}
      />
      
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Đơn đặt',
        }}
      />
      
      <Tab.Screen 
        name="Saved" 
        component={SavedPlaceScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-circle-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Đã lưu',
        }}
      />
      
      <Tab.Screen 
        name="Settings" 
        component={ProfileTabNavigator} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Cài đặt',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;