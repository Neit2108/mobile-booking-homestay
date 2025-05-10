import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

// Constants
import { COLORS, SIZES, FONTS } from '../../constants/theme';

/**
 * Booking tabs component for switching between active bookings and history
 * 
 * @param {string} activeTab - The currently active tab ('Booked' or 'History')
 * @param {Function} onChangeTab - Function to call when tab is changed
 * @param {Object} style - Additional styles for the container
 */
const BookingTabs = ({ activeTab, onChangeTab, style }) => {
  const tabs = [
    { id: 'Booked', label: 'Đã đặt' },
    { id: 'History', label: 'Lịch sử' },
  ];

  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              isActive && styles.activeTab
            ]}
            onPress={() => onChangeTab(tab.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.large,
    padding: 4,
    height: 48,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.large - 4,
    height: 40,
  },
  activeTab: {
    backgroundColor: COLORS.background.primary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
});

export default BookingTabs;