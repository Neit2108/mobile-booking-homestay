import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Constants
import { COLORS, SIZES, FONTS } from '../../constants/theme';

/**
 * Gender selector component with radio button style selection
 * 
 * @param {string} label - Input label
 * @param {string} value - Current selected gender ('Male' or 'Female' or 'Other')
 * @param {function} onChange - Function called with new gender value when selection changes
 * @param {string} error - Error message
 * @param {object} style - Additional container style
 */
const GenderSelector = ({
  label,
  value = 'Male',
  onChange,
  error,
  style = {},
}) => {
  const options = [
    { value: 'Male', icon: 'male-outline' },
    { value: 'Female', icon: 'female-outline' },
    { value: 'Other', icon: 'person-outline' },
  ];

  const handleSelect = (option) => {
    onChange(option);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonSelected,
            ]}
            onPress={() => handleSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioOuter,
                  value === option.value && styles.radioOuterSelected,
                ]}
              >
                {value === option.value && <View style={styles.radioInner} />}
              </View>
            </View>
            
            <Ionicons
              name={option.icon}
              size={18}
              color={
                value === option.value ? COLORS.primary : COLORS.text.secondary
              }
              style={styles.optionIcon}
            />
            
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.optionTextSelected,
              ]}
            >
              {option.value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding.medium,
    width: '100%',
  },
  label: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SIZES.base,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderRadius: SIZES.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`, // 10% opacity primary color
  },
  radioContainer: {
    marginRight: 6,
  },
  radioOuter: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  optionIcon: {
    marginRight: 4,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.small,
    marginTop: SIZES.base,
  },
});

export default GenderSelector;