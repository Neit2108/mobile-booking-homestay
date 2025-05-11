import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { formatPrice } from '../../utils/formatPrice';

/**
 * Transaction Item Component - For displaying transaction history
 */
const TransactionItem = ({ transaction, onPress }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Determine if amount is positive or negative
  const isNegative = transaction.type === 'PAYMENT' || transaction.type === 'WITHDRAW';
  const amountColor = isNegative ? '#FF5A5F' : '#10B981';
  const amountPrefix = isNegative ? '-' : '+';
  
  // Get icon based on transaction type
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'DEPOSIT':
        return { name: 'arrow-down-circle', color: '#10B981', background: '#10B98120' };
      case 'PAYMENT':
        return { name: 'cart', color: '#FF5A5F', background: '#FF5A5F20' };
      case 'WITHDRAW':
        return { name: 'arrow-up-circle', color: '#FF5A5F', background: '#FF5A5F20' };
      case 'REFUND':
        return { name: 'refresh-circle', color: '#10B981', background: '#10B98120' };
      default:
        return { name: 'cash', color: COLORS.text.secondary, background: `${COLORS.text.secondary}20` };
    }
  };

  const icon = getTransactionIcon();

  return (
    <TouchableOpacity style={styles.transactionItem} onPress={onPress}>
      <View style={[styles.transactionIcon, { backgroundColor: icon.background }]}>
        <Ionicons name={icon.name} size={24} color={icon.color} />
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>
          {transaction.description || getTransactionTypeLabel(transaction.type)}
        </Text>
        <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
      </View>
      
      <Text style={[styles.transactionAmount, { color: amountColor }]}>
        {amountPrefix}${formatPrice(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
};

// Helper function to get human-readable transaction type
const getTransactionTypeLabel = (type) => {
  switch (type) {
    case 'DEPOSIT':
      return 'Nạp tiền';
    case 'PAYMENT':
      return 'Thanh toán';
    case 'WITHDRAW':
      return 'Rút tiền';
    case 'REFUND':
      return 'Hoàn tiền';
    default:
      return 'Giao dịch';
  }
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding.medium,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionItem;