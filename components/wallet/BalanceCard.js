import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { formatPrice } from '../../utils/formatPrice';

/**
 * Balance Card Component - Displays wallet balance with currency
 */
const BalanceCard = ({ balance, currency = 'VND', onAddMoneyPress }) => {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceCurrency}>{currency}</Text>
      </View>
      <Text style={styles.balanceAmount}>{formatPrice(balance)} VND</Text>
      <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
      
      <TouchableOpacity style={styles.addMoneyButton} onPress={onAddMoneyPress}>
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.addMoneyText}>Nạp tiền</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.large,
    padding: SIZES.padding.large,
    marginHorizontal: SIZES.padding.large,
    marginTop: SIZES.padding.large,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  balanceHeader: {
    alignSelf: 'center',
    marginBottom: SIZES.padding.small,
  },
  balanceCurrency: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginVertical: SIZES.padding.small,
  },
  addMoneyButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginTop: SIZES.padding.medium,
    alignItems: 'center',
  },
  addMoneyText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default BalanceCard;