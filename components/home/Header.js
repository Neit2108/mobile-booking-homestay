import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { getUserData } from '../../utils/UserStorageUtils'; // Import the utility function

const DEFAULT_AVATAR = require('../../assets/images/default-avatar.jpg');

const Header = ({ name, location, avatar, onSearchPress, onNotificationPress }) => {
  // Add state to store the latest avatar URL
  const [currentAvatar, setCurrentAvatar] = useState(avatar);
  
  // Check for updated avatar when component mounts or becomes visible
  useEffect(() => {
    const checkForUpdatedAvatar = async () => {
      try {
        const userData = await getUserData();
        if (userData && userData.avatarUrl !== currentAvatar) {
          setCurrentAvatar(userData.avatarUrl);
        }
      } catch (error) {
        console.error('Error checking for updated avatar', error);
      }
    };
    
    checkForUpdatedAvatar();
    
    // Optional: Add a listener to check for updates more frequently
    const intervalId = setInterval(checkForUpdatedAvatar, 5000); // Check every 5 seconds
    
    return () => {
      clearInterval(intervalId); // Clean up on unmount
    };
  }, []);
  
  const handleSearchPress = () => {
    console.log('Search button pressed in Header component');
    if (onSearchPress) {
      onSearchPress();
    } else {
      console.warn('onSearchPress prop is not defined');
    }
  };

  const handleNotificationPress = () => {
    console.log('Notification button pressed in Header component');
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      console.warn('onNotificationPress prop is not defined');
    }
  };

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <Image 
          source={currentAvatar ? { uri: currentAvatar } : DEFAULT_AVATAR} 
          style={styles.avatar} 
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
            <Text style={styles.location}>{location}</Text>
          </View>
        </View>
      </View>
      
      {/* Action Icons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={handleSearchPress}
        >
          <Ionicons name="search" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    backgroundColor: COLORS.background.primary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.padding.medium,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SIZES.padding.small,
    backgroundColor: COLORS.background.secondary,
  },
});

export default Header;