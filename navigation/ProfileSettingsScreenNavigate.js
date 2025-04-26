import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * Navigation function to navigate to the PersonalInfoScreen
 * 
 * @param {Object} userData - Optional user data to pass to the screen
 */
export const navigateToPersonalInfo = (navigation, userData = null) => {
  navigation.navigate('PersonalInfo', { userData });
};

/**
 * EditProfileButton component that can be used in headers
 * 
 * @param {Object} user - User data to pass to the PersonalInfoScreen
 * @param {Object} style - Additional style for the button
 */
export const EditProfileButton = ({ user, style }) => {
  const navigation = useNavigation();
  
  const handlePress = () => {
    navigateToPersonalInfo(navigation, user);
  };
  
  return (
    <TouchableOpacity onPress={handlePress} style={style}>
      <Ionicons name="create-outline" size={24} color="#000" />
    </TouchableOpacity>
  );
};

export default {
  navigateToPersonalInfo,
  EditProfileButton,
};