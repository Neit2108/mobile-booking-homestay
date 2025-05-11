import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

/**
 * Action Button Component - For wallet actions like Send, Request, etc.
 */
const ActionButton = ({ icon, label, onPress, color = COLORS.primary }) => {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding.small,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
});

export default ActionButton;