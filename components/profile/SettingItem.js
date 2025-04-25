import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

/**
 * Reusable Setting Item component for profile and settings screens
 * 
 * @param {string} icon - Ionicons icon name
 * @param {string} title - Setting item title
 * @param {function} onPress - Function to call when item is pressed
 * @param {string} iconColor - Custom icon color (optional)
 * @param {object} iconContainerStyle - Custom icon container style (optional)
 * @param {boolean} showChevron - Whether to show right chevron (optional)
 * @param {component} rightComponent - Custom right component instead of chevron (optional)
 * @param {object} style - Additional container style (optional)
 */
const SettingItem = ({
  icon,
  title,
  onPress,
  iconColor = COLORS.text.primary,
  iconContainerStyle,
  showChevron = true,
  rightComponent,
  style,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, iconContainerStyle]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      
      {/* Title */}
      <Text style={styles.title}>{title}</Text>
      
      {/* Right element (chevron or custom component) */}
      {rightComponent ? (
        rightComponent
      ) : (
        showChevron && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
        )
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding.medium,
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
});

export default SettingItem;