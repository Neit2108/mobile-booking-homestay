import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

/**
 * Reusable Profile Header component with user info and edit button
 * 
 * @param {object} user - User object with fullName, username, and avatarUrl
 * @param {function} onEditPress - Function to call when edit button is pressed
 * @param {object} style - Additional container style (optional)
 */
const ProfileHeader = ({ user, onEditPress, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.profileInfo}>
        <Image
          source={
            user?.avatarUrl
              ? { uri: user.avatarUrl }
              : require('../../assets/images/default-avatar.jpg')
          }
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{user?.fullName || 'Guest User'}</Text>
          <Text style={styles.username}>@{user?.username || 'guest'}</Text>
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