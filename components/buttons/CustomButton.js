import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
}) => {
  const getButtonStyles = () => {
    let baseStyle = styles.button;
    
    // Apply variant styling
    if (variant === 'secondary') {
      baseStyle = { ...baseStyle, ...styles.buttonSecondary };
    } else if (variant === 'outline') {
      baseStyle = { ...baseStyle, ...styles.buttonOutline };
    }
    
    // Apply disabled styling
    if (disabled || loading) {
      baseStyle = { ...baseStyle, ...styles.buttonDisabled };
    }
    
    return baseStyle;
  };

  const getTextStyles = () => {
    let baseStyle = styles.text;
    
    // Apply variant styling
    if (variant === 'secondary') {
      baseStyle = { ...baseStyle, ...styles.textSecondary };
    } else if (variant === 'outline') {
      baseStyle = { ...baseStyle, ...styles.textOutline };
    }
    
    // Apply disabled styling
    if (disabled || loading) {
      baseStyle = { ...baseStyle, ...styles.textDisabled };
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? COLORS.primary : 'white'} />
      ) : (
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: 'white',
    fontSize: FONTS.sizes.large,
    fontWeight: 'bold',
  },
  textSecondary: {
    color: 'white',
  },
  textOutline: {
    color: COLORS.primary,
  },
  textDisabled: {
    opacity: 0.8,
  },
});

export default CustomButton;