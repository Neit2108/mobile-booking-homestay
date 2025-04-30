import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

/**
 * Guest counter component with decrement and increment buttons
 * 
 * @param {number} value - Current number of guests
 * @param {function} onIncrement - Function to call when incrementing
 * @param {function} onDecrement - Function to call when decrementing
 * @param {number} min - Minimum number of guests (default: 1)
 * @param {number} max - Maximum number of guests (default: 10)
 * @param {object} style - Additional styles for the container
 */
const GuestCounter = ({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 10,
  style = {}
}) => {
  const isDecrementDisabled = value <= min;
  const isIncrementDisabled = value >= max;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          isDecrementDisabled && styles.buttonDisabled
        ]}
        onPress={onDecrement}
        disabled={isDecrementDisabled}
        activeOpacity={0.7}
      >
        <Ionicons
          name="remove"
          size={20}
          color={isDecrementDisabled ? COLORS.text.placeholder : COLORS.text.primary}
        />
      </TouchableOpacity>
      
      <Text style={styles.valueText}>{value}</Text>
      
      <TouchableOpacity
        style={[
          styles.button,
          isIncrementDisabled && styles.buttonDisabled
        ]}
        onPress={onIncrement}
        disabled={isIncrementDisabled}
        activeOpacity={0.7}
      >
        <Ionicons
          name="add"
          size={20}
          color={isIncrementDisabled ? COLORS.text.placeholder : COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    paddingHorizontal: 20,
  },
});

export default GuestCounter;