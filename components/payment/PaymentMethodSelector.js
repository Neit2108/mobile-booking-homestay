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
 * Payment method selection component
 * 
 * @param {string} selectedMethod - Current selected payment method
 * @param {Function} onSelectMethod - Function to call when a payment method is selected
 * @param {Object} style - Additional style for container
 */
const PaymentMethodSelector = ({ selectedMethod, onSelectMethod, style }) => {
  // Available payment methods
  const paymentMethods = [
    {
      id: 'wallet',
      name: 'Ví Homies',
      icon: 'wallet-outline',
      description: 'Thanh toán bằng ví Homies để được giảm trực tiếp 10% giá trị đơn.'
    },
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản',
      icon: 'qr-code-outline',
      description: 'Chuyển khoản thuận tiện'
    },
    {
      id: 'card',
      name: 'Thẻ ngân hàng',
      icon: 'card-outline',
      description: 'Thẻ ngân hàng của bạn'
    },
    {
      id: 'counter',
      name: 'Tại quầy',
      icon: 'home-outline',
      description: 'Thanh toán tại quầy lễ tân'
    }
  ];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.methodsContainer}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodItem,
              selectedMethod === method.id && styles.methodItemSelected
            ]}
            onPress={() => onSelectMethod(method.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.methodIconContainer,
              selectedMethod === method.id && styles.methodIconContainerSelected
            ]}>
              <Ionicons 
                name={method.icon} 
                size={24} 
                color={selectedMethod === method.id ? 'white' : COLORS.primary} 
              />
            </View>
            
            <View style={styles.methodTextContainer}>
              <Text style={[
                styles.methodName,
                selectedMethod === method.id && styles.methodNameSelected
              ]}>
                {method.name}
              </Text>
              
              <Text style={styles.methodDescription}>
                {method.description}
              </Text>
            </View>
            
            <View style={styles.radioContainer}>
              <View style={[
                styles.radioOuter,
                selectedMethod === method.id && styles.radioOuterSelected
              ]}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding.large,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.medium,
  },
  methodsContainer: {
    borderRadius: SIZES.borderRadius.medium,
    overflow: 'hidden',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    marginBottom: 1, // Create separation between items
  },
  methodItemSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding.medium,
  },
  methodIconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  methodTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  methodName: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  methodNameSelected: {
    color: COLORS.primary,
  },
  methodDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 5,
  },
  radioContainer: {
    marginLeft: SIZES.padding.medium,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
});

export default PaymentMethodSelector;