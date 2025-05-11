import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Components
import {
  BalanceCard,
  ActionButton,
  TransactionList,
  DepositModal,
  QRCodeModal,
  PINModal,
} from '../components/wallet';

import {
  getWalletBalance,
  payWithWallet,
  setWalletPin,
  hasWalletPin,
  getWalletTransactions,
  depositToWallet,
  withdrawFromWallet
} from '../api/wallets';

// Services and Utils
import WalletService from '../services/WalletService';
import { COLORS, SIZES } from '../constants/theme';

const WalletScreen = () => {
  const navigation = useNavigation();

  // State
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isPinUpdate, setIsPinUpdate] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [hasSetPin, setHasSetPin] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
    checkPinStatus();
  }, []);

  // Fetch wallet balance
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const walletBalance = await getWalletBalance();
      setBalance(walletBalance);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin ví');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      setIsTransactionsLoading(true);
      const transactionHistory = await getWalletTransactions();
      setTransactions(transactionHistory);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử giao dịch');
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  // Check if user has set a PIN
  const checkPinStatus = async () => {
    try {
      const pinStatus = await hasWalletPin();
      setHasSetPin(pinStatus);
    } catch (error) {
      console.error('Error checking PIN status:', error);
    }
  };

  // Handle deposit action
  const handleDeposit = async (amount, paymentMethod) => {
    try {
      const response = await depositToWallet(amount, paymentMethod);
      
      if (paymentMethod === 'bank_transfer') {
        // Show QR code for bank transfer
        setPaymentData(response);
        setShowDepositModal(false);
        setShowQRModal(true);
      } else if (paymentMethod === 'card') {
        // Redirect to payment URL for card payment
        setShowDepositModal(false);
        if (response.paymentUrl) {
          Linking.openURL(response.paymentUrl);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể xử lý yêu cầu nạp tiền');
    }
  };

  // Handle PIN submission
  const handlePinSubmit = async ({ pin, oldPin }) => {
    try {
      let response;
      
      if (isPinUpdate) {
        response = await setWalletPin(pin);
      } else {
        response = await setWalletPin(pin);
      }
      
      if (response.success) {
        Alert.alert('Thành công', response.message || 'Đã thiết lập mã PIN thành công');
        setShowPinModal(false);
        await checkPinStatus(); // Refresh pin status
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể thiết lập mã PIN');
    }
  };

  // Handle actions
  const handleAddMoney = () => {
    setShowDepositModal(true);
  };

  const handleBookings = () => {
    navigation.navigate('AllPlaces');
  };

  const handleSecurity = () => {
    setIsPinUpdate(hasSetPin);
    setShowPinModal(true);
  };

  const handleTransactionPress = (transaction) => {
    // Could show transaction details in the future
    Alert.alert(
      'Chi tiết giao dịch',
      `Mã giao dịch: ${transaction.id}\nSố tiền: ${transaction.amount.toLocaleString()} VNĐ\nLoại: ${transaction.type}\nNgày: ${new Date(transaction.createdAt).toLocaleDateString('vi-VN')}`
    );
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví Homies</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Balance Card */}
        <BalanceCard
          balance={balance}
          currency="VND"
          onAddMoneyPress={handleAddMoney}
        />
        
        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <ActionButton
            icon="arrow-down"
            label="Nạp tiền"
            color="#10B981"
            onPress={handleAddMoney}
          />
          <ActionButton
            icon="document-text"
            label="Đặt phòng"
            color="#2563EB"
            onPress={handleBookings}
          />
          <ActionButton
            icon="shield-checkmark"
            label="Bảo mật"
            color="#F59E0B"
            onPress={handleSecurity}
          />
        </View>
        
        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          loading={isTransactionsLoading}
          onItemPress={handleTransactionPress}
          onRefresh={fetchTransactions}
        />
      </ScrollView>
      
      {/* Deposit Modal */}
      <DepositModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
      />
      
      {/* QR Code Modal */}
      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        paymentData={paymentData}
      />
      
      {/* PIN Modal */}
      <PINModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSubmit={handlePinSubmit}
        isUpdate={isPinUpdate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  backButton: {
    padding: SIZES.padding.small,
  },
  placeholderRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: SIZES.padding.large * 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    marginTop: SIZES.padding.large,
  },
});

export default WalletScreen;