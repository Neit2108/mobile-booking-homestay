import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';
import LogoutModal from '../../components/modals/LogoutModal';
import SettingItem from '../../components/profile/SettingItem';
import ProfileHeader from '../../components/profile/ProfileHeader';

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleEditProfile = () => {
    // Navigate to the PersonalInfoScreen
    navigation.navigate('PersonalInfo', { userData: user });
  };

  const handleSettingPress = (setting) => {
    console.log(`Navigate to ${setting} settings`);
    // Navigate to the appropriate settings screen
    if (setting === 'wallet') {
      navigation.navigate('Wallet');
    }
    else if (setting === 'notification') {
      navigation.navigate('Notify');
    }
    else if (setting === 'security') {
      navigation.navigate('Security');
    }
    else if (setting === 'help') {
      navigation.navigate('Help');
    }
    else {
      Alert.alert('Coming Soon', 'This feature is not implemented yet.');
    }
  };


  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cài đặt</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileCard}>
          <ProfileHeader 
            user={user} 
            onEditPress={handleEditProfile} 
          />
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          
          <SettingItem
            icon="person-outline"
            title="Thông tin cá nhân"
            onPress={handleEditProfile}
          />
          
          <SettingItem
            icon="wallet-outline"
            title="Ví Homies"
            onPress={() => handleSettingPress('wallet')}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            title="Bảo mật"
            onPress={() => handleSettingPress('security')}
          />
          
          <SettingItem
            icon="notifications-outline"
            title="Thông báo"
            onPress={() => handleSettingPress('notification')}
          />
          
          {/* <SettingItem
            icon="globe-outline"
            title="Ngôn ngữ"
            onPress={() => handleSettingPress('languages')}
          /> */}
          
          <SettingItem
            icon="information-circle-outline"
            title="Trợ giúp"
            onPress={() => handleSettingPress('help')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  profileCard: {
    marginHorizontal: SIZES.padding.large,
    marginVertical: SIZES.padding.medium,
  },
  settingsSection: {
    marginTop: SIZES.padding.large,
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.large,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: SIZES.padding.large,
    marginTop: SIZES.padding.large,
    marginBottom: SIZES.padding.large * 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30', // iOS-style red for destructive actions
  },
});

export default ProfileSettingsScreen;