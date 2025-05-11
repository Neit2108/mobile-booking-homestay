import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import TransactionItem from './TransactionItem';

/**
 * Transaction List Component - For displaying transaction history
 */
const TransactionList = ({ transactions, onItemPress, loading, onRefresh }) => {
  return (
    <View style={styles.transactionListContainer}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionHeaderTitle}>Lịch sử giao dịch</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.transactionLoading}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyTransaction}>
          <Ionicons name="document-text-outline" size={50} color={COLORS.text.secondary} />
          <Text style={styles.emptyTransactionText}>Không có giao dịch nào</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={() => onItemPress(item)}
            />
          )}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          listKey="wallet-transactions"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  transactionListContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: SIZES.borderRadius.large,
    borderTopRightRadius: SIZES.borderRadius.large,
    marginTop: SIZES.padding.large,
    paddingTop: SIZES.padding.large,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  transactionHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  transactionLoading: {
    padding: SIZES.padding.large * 2,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.padding.small,
    color: COLORS.text.secondary,
  },
  emptyTransaction: {
    padding: SIZES.padding.large * 2,
    alignItems: 'center',
  },
  emptyTransactionText: {
    marginTop: SIZES.padding.medium,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default TransactionList;