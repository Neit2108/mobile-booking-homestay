// Updated BottomTabBar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const BottomTabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  const tabs = [
    {
      name: 'Home',
      icon: 'home',
      screen: 'Home',
    },
    {
      name: 'My Booking',
      icon: 'calendar',
      screen: 'Bookings',
    },
    {
      name: 'Message',
      icon: 'chatbubble-ellipses',
      screen: 'Messages',
    },
    {
      name: 'Profile',
      icon: 'person',
      screen: 'Profile',
    },
  ];
  
  const handleTabPress = (screenName) => {
    navigation.navigate(screenName);
  };
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 5 }]}>
      {tabs.map((tab) => {
        const isActive = route.name === tab.screen;
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab.screen)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline`}
              size={20} // Reduced from 24
              color={isActive ? COLORS.primary : COLORS.text.secondary}
            />
            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 55, // Reduced from 60
    backgroundColor: COLORS.background.primary,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
    zIndex: 1000, // Ensure it stays on top
    elevation: 8, // For Android
    shadowOpacity: 0.2, // More subtle shadow
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5, // Reduced padding
  },
  tabText: {
    fontSize: 10,
    marginTop: 2,
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default BottomTabBar;