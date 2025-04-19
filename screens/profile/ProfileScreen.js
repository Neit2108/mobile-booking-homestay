import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { images } from '../../assets/index';

const ProfileOption = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.optionContainer} onPress={onPress}>
      <View style={styles.optionIconContainer}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.optionTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
    </TouchableOpacity>
  );
};

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  
  const handleEditProfile = () => {
    // Navigate to edit profile screen
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Image 
              source={user?.avatarUrl ? { uri: user.avatarUrl } : images.defaultAvatar} 
              style={styles.avatar} 
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.fullName || 'Guest User'}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
                <Text style={styles.location}>{user?.location || 'San Diego, CA'}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          <ProfileOption 
            icon="person-outline" 
            title="Personal Information" 
            onPress={() => {}} 
          />
          <ProfileOption 
            icon="card-outline" 
            title="Payment Method" 
            onPress={() => {}} 
          />
          <ProfileOption 
            icon="notifications-outline" 
            title="Notifications" 
            onPress={() => {}} 
          />
          <ProfileOption 
            icon="shield-checkmark-outline" 
            title="Security" 
            onPress={() => {}} 
          />
          <ProfileOption 
            icon="help-circle-outline" 
            title="Help & Support" 
            onPress={() => {}} 
          />
          <ProfileOption 
            icon="settings-outline" 
            title="Settings" 
            onPress={() => {}} 
          />
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: SIZES.padding.medium,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.borderRadius.medium,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  optionsContainer: {
    padding: SIZES.padding.large,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding.medium,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.padding.large,
    marginBottom: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
  },
  logoutText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '500',
    marginLeft: SIZES.padding.small,
  },
});

export default ProfileScreen;
