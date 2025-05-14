import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const LocationBanner = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Ionicons name="location" size={22} color={COLORS.primary} style={styles.icon} />
        <Text style={styles.text}>
          Bạn có thể đổi địa chỉ để thấy các homestay ở gần bạn.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={COLORS.text.secondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EDF3FA', // Light blue background
    marginHorizontal: SIZES.padding.large,
    marginVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.medium,
    ...SHADOWS.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: SIZES.padding.small,
  },
  text: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 1,
  },
});

export default LocationBanner;