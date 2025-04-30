import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { getUserData } from '../../utils/UserStorageUtils'; // Import the utility function

/**
 * Reusable Profile Header component with user info and edit button
 * 
 * @param {object} user - User object with fullName, username, and avatarUrl
 * @param {function} onEditPress - Function to call when edit button is pressed
 * @param {object} style - Additional container style (optional)
 */
const ProfileHeader = ({ user, onEditPress, style }) => {
  // Add state to store the latest user data
  const [currentUser, setCurrentUser] = useState(user);
  
  // Check for updated user data when component mounts or becomes visible
  useEffect(() => {
    const checkForUpdatedUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData) {
          // Only update if there's a difference to prevent unnecessary re-renders
          if (JSON.stringify(userData) !== JSON.stringify(currentUser)) {
            setCurrentUser(userData);
          }
        }
      } catch (error) {
        console.error('Error checking for updated user data', error);
      }
    };
    
    checkForUpdatedUserData();
    
    // Optional: Add a listener to check for updates more frequently
    const intervalId = setInterval(checkForUpdatedUserData, 5000); // Check every 5 seconds
    
    return () => {
      clearInterval(intervalId); // Clean up on unmount
    };
  }, []);
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.profileInfo}>
        <Image
          source={
            currentUser?.avatarUrl
              ? { uri: currentUser.avatarUrl }
              : require('../../assets/images/default-avatar.jpg')
          }
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{currentUser?.fullName || 'Guest User'}</Text>
          <Text style={styles.username}>@{currentUser?.username || 'guest'}</Text>
        </View>
      </View>
      
      <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
        <Ionicons name="pencil-outline" size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding.medium,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background.secondary,
  },
  textContainer: {
    marginLeft: SIZES.padding.medium,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileHeader;