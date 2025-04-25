import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Profile Screens
import ProfileSettingsScreen from '../screens/profile/ProfileSettingsScreen';
// Import other profile-related screens as needed

const Stack = createStackNavigator();

/**
 * Profile Tab Navigator
 * Handles navigation between profile-related screens
 */
const ProfileTabNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileSettings"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      {/* Add other profile-related screens here */}
      {/* Example:
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      */}
    </Stack.Navigator>
  );
};

export default ProfileTabNavigator;