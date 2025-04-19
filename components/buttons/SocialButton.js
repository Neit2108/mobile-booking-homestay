import React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const SocialButton = ({ icon, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={icon} style={styles.icon} resizeMode="contain" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    height: 50,
    width: 50,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.padding.small,
    ...SHADOWS.small,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default SocialButton;