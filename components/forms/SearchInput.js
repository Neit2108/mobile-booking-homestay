import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Constants
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

/**
 * A reusable search input component
 * 
 * @param {string} placeholder - Placeholder text for the input
 * @param {string} value - Current input value
 * @param {Function} onChangeText - Function to call when text changes
 * @param {Function} onClear - Function to call when clear button is pressed (optional)
 * @param {Function} onSubmit - Function to call when search is submitted (optional)
 * @param {Object} style - Additional styles for the container
 */
const SearchInput = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onClear,
  onSubmit,
  style
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Handle text change
  const handleChangeText = (text) => {
    if (onChangeText) {
      onChangeText(text);
    }
  };
  
  // Handle clear button press
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      handleChangeText('');
    }
    Keyboard.dismiss();
  };
  
  // Handle search submission
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(value);
    }
    Keyboard.dismiss();
  };
  
  // Handle focus change
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  return (
    <View 
      style={[
        styles.container,
        isFocused && styles.containerFocused,
        style
      ]}
    >
      {/* Search Icon */}
      <Ionicons
        name="search"
        size={20}
        color={COLORS.text.secondary}
        style={styles.searchIcon}
      />
      
      {/* Text Input */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.placeholder}
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        clearButtonMode="never" // We'll use our own clear button
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      
      {/* Clear Button - Only show when there is text */}
      {value ? (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={16} color={COLORS.text.secondary} />
        </TouchableOpacity>
      ) : null}
      
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => {}}
        activeOpacity={0.7}
      >
        <Ionicons name="options-outline" size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: 12,
    height: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  containerFocused: {
    borderColor: COLORS.primary,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    paddingVertical: 8,
    height: '100%',
  },
  clearButton: {
    padding: 6,
  },
  filterButton: {
    marginLeft: 4,
    padding: 6,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
});

export default SearchInput;