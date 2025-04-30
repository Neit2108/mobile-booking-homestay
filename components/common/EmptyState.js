import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Constants
import { COLORS, SIZES, FONTS } from '../../constants/theme';

/**
 * A reusable empty state component to display when there's no data
 * 
 * @param {string} icon - Ionicons name for the icon to display
 * @param {string} title - Title text to display
 * @param {string} message - Message text to display
 * @param {React.ReactNode} action - Optional action component (button, etc.)
 * @param {Object} style - Additional styles for the container
 */
const EmptyState = ({
  icon = 'information-circle-outline',
  title = 'No data found',
  message = 'There is no data to display at the moment.',
  action,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name={icon}
        size={64}
        color={COLORS.text.secondary}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {/* Optional action component */}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding.large * 2,
    paddingHorizontal: SIZES.padding.large,
  },
  icon: {
    marginBottom: SIZES.padding.medium,
    opacity: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.small,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: SIZES.padding.large,
  },
});

export default EmptyState;