import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

/**
 * Payment status badge component
 * 
 * @param {string} status - Payment status (Paid, Unpaid, Refunded, etc.)
 * @param {Object} style - Additional style for the container
 */
const PaymentStatusBadge = ({ status, style }) => {
  // Get badge color based on status
  const getBadgeColor = () => {
    switch (status) {
      case 'Paid':
        return COLORS.success;
      case 'Unpaid':
        return COLORS.error;
      case 'Processing':
        return COLORS.secondary;
      case 'Refunded':
        return COLORS.primary;
      default:
        return COLORS.text.secondary;
    }
  };

  // Get icon based on status
  const getIcon = () => {
    switch (status) {
      case 'Paid':
        return 'checkmark-circle';
      case 'Unpaid':
        return 'close-circle';
      case 'Processing':
        return 'time';
      case 'Refunded':
        return 'refresh-circle';
      default:
        return 'help-circle';
    }
  };

  const color = getBadgeColor();
  
  return (
    <View style={[styles.container, { backgroundColor: `${color}10` }, style]}>
      <Ionicons name={getIcon()} size={16} color={color} style={styles.icon} />
      <Text style={[styles.text, { color }]}>{(status === "Paid" && "Đã thanh toán") ||
                    (status === "Unpaid" && "Chưa thanh toán") ||
                    (status === "Refunded" && "Đã hoàn tiền") ||
                    status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.borderRadius.small,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PaymentStatusBadge;