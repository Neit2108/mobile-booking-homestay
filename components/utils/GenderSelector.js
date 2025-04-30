import React, { useEffect } from 'react';
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
 * Gender selector component with radio button style selection that handles
 * both Vietnamese and English gender values
 * 
 * @param {string} label - Input label
 * @param {string} value - Current selected gender ('Nam'/'Male', 'Nữ'/'Female', or 'Khác'/'Other')
 * @param {function} onChange - Function called with new gender value when selection changes
 * @param {string} error - Error message
 * @param {object} style - Additional container style
 */
const GenderSelector = ({
  label,
  value,
  onChange,
  error,
  style = {},
}) => {
  // Define options with both display text and backend values
  const options = [
    { displayValue: 'Nam', backendValue: 'Nam', icon: 'male-outline' },
    { displayValue: 'Nữ', backendValue: 'Nữ', icon: 'female-outline' },
    { displayValue: 'Khác', backendValue: 'Khác', icon: 'person-outline' },
  ];

  // Map between English and Vietnamese values
  const genderMapping = {
    Male: 'Nam',
    Female: 'Nữ',
    Other: 'Khác',
    Nam: 'Male',
    Nữ: 'Female',
    Khác: 'Other'
  };

  // Normalize the gender value for display
  const getNormalizedGender = (genderValue) => {
    if (!genderValue) return null;
    
    // Convert to string in case it's a number (enum index)
    const genderString = String(genderValue);
    
    // Check if it's one of our known Vietnamese values
    if (['Nam', 'Nữ', 'Khác'].includes(genderString)) {
      return genderString;
    }
    
    // Check if it's a number that might represent enum index
    if (!isNaN(genderString)) {
      const index = parseInt(genderString, 10);
      if (index === 0) return 'Nam';
      if (index === 1) return 'Nữ';
      if (index === 2) return 'Khác';
    }
    
    // Check if it's an English value we can map
    if (['Male', 'Female', 'Other'].includes(genderString)) {
      return genderMapping[genderString];
    }
    
    // Default fallback
    return 'Nam';
  };

  // Log the initial gender value for debugging
  useEffect(() => {
    console.log('Original gender value:', value);
    console.log('Normalized gender value:', getNormalizedGender(value));
  }, [value]);

  const handleSelect = (option) => {
    // Pass the backend value to the parent component
    onChange(option.backendValue);
  };

  // Normalize the current value for comparison
  const normalizedValue = getNormalizedGender(value);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          // Check if this option matches the current normalized value
          const isSelected = normalizedValue === option.backendValue;
          
          return (
            <TouchableOpacity
              key={option.backendValue}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.7}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>
              
              <Ionicons
                name={option.icon}
                size={18}
                color={
                  isSelected ? COLORS.primary : COLORS.text.secondary
                }
                style={styles.optionIcon}
              />
              
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.displayValue}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    height: 50,
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