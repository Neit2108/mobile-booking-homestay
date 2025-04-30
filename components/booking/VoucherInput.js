import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Components
import CustomInput from '../forms/CustomInput';

// Constants and Services
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import voucherService from '../../services/VoucherService';

/**
 * Reusable VoucherInput component
 * 
 * @param {Object} appliedVoucher - Currently applied voucher
 * @param {Function} onVoucherApplied - Called when voucher is successfully applied
 * @param {Function} onVoucherRemoved - Called when voucher is removed
 * @param {Object} style - Additional container style
 */
const VoucherInput = ({
  appliedVoucher,
  onVoucherApplied,
  onVoucherRemoved,
  style,
}) => {
  const [voucher, setVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckVoucher = async () => {
    if (!voucher.trim()) {
      setError('Please enter a voucher code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await voucherService.validateVoucher(voucher);
      
      if (response && response.code) {
        onVoucherApplied(response);
        // Clear input after successful application
        setVoucher('');
      } else {
        setError('Invalid or expired voucher');
      }
    } catch (error) {
      console.error('Error checking voucher:', error);
      setError('Could not validate voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    onVoucherRemoved();
    setVoucher('');
    setError(null);
  };

  // If a voucher is applied, show the applied voucher view
  if (appliedVoucher) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.appliedVoucherContainer}>
          <View style={styles.appliedVoucherInfo}>
            <Text style={styles.appliedVoucherCode}>{appliedVoucher.code}</Text>
            <Text style={styles.appliedVoucherDiscount}>
              {appliedVoucher.discount}% discount applied
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeVoucherButton}
            onPress={handleRemoveVoucher}
          >
            <Text style={styles.removeVoucherButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If no voucher is applied, show the input form
  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <CustomInput
          placeholder="Enter voucher code"
          value={voucher}
          onChangeText={setVoucher}
          error={error}
          style={styles.input}
          inputStyle={styles.inputInner}
        />
        <TouchableOpacity
          style={styles.checkButton}
          onPress={handleCheckVoucher}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.checkButtonText}>Check</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    marginRight: SIZES.padding.medium,
  },
  inputInner: {
    height: 50,
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SIZES.padding.large,
  },
  checkButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  appliedVoucherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding.medium,
    backgroundColor: `${COLORS.primary}10`, // 10% opacity of primary color
    borderRadius: SIZES.borderRadius.medium,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  appliedVoucherInfo: {
    flex: 1,
  },
  appliedVoucherCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  appliedVoucherDiscount: {
    fontSize: 14,
    color: COLORS.primary,
  },
  removeVoucherButton: {
    paddingHorizontal: SIZES.padding.medium,
    paddingVertical: SIZES.padding.small,
    borderRadius: SIZES.borderRadius.small,
    backgroundColor: `${COLORS.error}10`, // 10% opacity of error color
  },
  removeVoucherButtonText: {
    color: COLORS.error,
    fontWeight: '500',
  },
});

export default VoucherInput;