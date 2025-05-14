import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Components
import {
  BalanceCard,
  ActionButton,
  TransactionList,
  DepositModal,
  QRCodeModal,
  PINModal,
} from "../../components/wallet";

// Import the wallet API functions
import {
  getWalletBalance,
  payWithWallet,
  setWalletPin,
  hasWalletPin,
  getWalletTransactions,
  depositToWallet,
  withdrawFromWallet,
} from "../../api/wallets";

// Constants
import { COLORS, SIZES } from "../../constants/theme";

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
      const response = await getWalletBalance();
      // Assuming the response contains a balance property
      setBalance(response.balance || 0);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin ví");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      setIsTransactionsLoading(true);
      const response = await getWalletTransactions(1, 10); // Page 1, 10 items per page
      // Assuming the response is an array of transactions
      setTransactions(response || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Lỗi", "Không thể tải lịch sử giao dịch");
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  // Check if user has set a PIN
  const checkPinStatus = async () => {
    try {
      const response = await hasWalletPin();
      // Assuming the response has a hasPin property
      setHasSetPin(response.hasPin || false);
    } catch (error) {
      console.error("Error checking PIN status:", error);
    }
  };

  // Handle deposit action
  // Updated handleDeposit function with proper returnUrl handling
  const handleDeposit = async (amount, paymentMethod) => {
    try {
      // Log what we're about to do
      console.log(`Processing deposit of ${amount} via ${paymentMethod}`);

      // Determine bank code based on payment method
      let bankCode = null;
      if (paymentMethod === "bank_transfer") {
        bankCode = "VNPAYQR";
      } else if (paymentMethod === "card") {
        bankCode = "NCB";
      }

      // Create deposit request with proper returnUrl
      // Use the scheme that's defined in your app.json or your deep linking configuration
      const returnUrl = "HomiesStay://payment-result"; // Make sure scheme matches your linking.js config

      const depositRequest = {
        amount: amount,
        returnUrl: returnUrl,
        bankCode: bankCode,
      };

      // Log the full request for debugging
      console.log(
        "Sending deposit request:",
        JSON.stringify(depositRequest, null, 2)
      );

      // Send the request
      const response = await depositToWallet(depositRequest);
      console.log(
        "Received deposit response:",
        JSON.stringify(response, null, 2)
      );

      if (paymentMethod === "bank_transfer") {
        // Show QR code for bank transfer
        setPaymentData(response);
        setShowDepositModal(false);
        setShowQRModal(true);
      } else if (paymentMethod === "card") {
        // Redirect to payment URL for card payment
        setShowDepositModal(false);
        if (response.paymentUrl) {
          console.log("Opening payment URL:", response.paymentUrl);
          // Check if the URL contains our returnUrl to confirm it was properly passed
          if (response.paymentUrl.includes(encodeURIComponent(returnUrl))) {
            console.log("returnUrl successfully included in payment URL");
          } else {
            console.warn("Warning: returnUrl not found in payment URL!");
          }
          Linking.openURL(response.paymentUrl);
        } else {
          throw new Error("Payment URL not provided in the response");
        }
      }
    } catch (error) {
      console.error("Deposit error:", error);
      Alert.alert(
        "Lỗi",
        `Không thể xử lý yêu cầu nạp tiền: ${error.message || "Unknown error"}`
      );
    }
  };

  // Handle PIN submission
  const handlePinSubmit = async ({ pin, oldPin }) => {
    try {
      // Call the appropriate API function
      const response = await setWalletPin(pin);

      if (response.success) {
        Alert.alert(
          "Thành công",
          response.message || "Đã thiết lập mã PIN thành công"
        );
        setShowPinModal(false);
        await checkPinStatus(); // Refresh pin status
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể thiết lập mã PIN");
    }
  };

  // Handle actions
  const handleAddMoney = () => {
    setShowDepositModal(true);
  };

  const handleBookings = () => {
    // Navigate to the Bookings tab
    navigation.navigate("TabNavigator", { screen: "Bookings" });
  };

  const handleSecurity = () => {
    setIsPinUpdate(hasSetPin);
    setShowPinModal(true);
  };

  const handleTransactionPress = (transaction) => {
    // Could show transaction details in the future
    Alert.alert(
      "Chi tiết giao dịch",
      `Mã giao dịch: ${
        transaction.id
      }\nSố tiền: ${transaction.amount.toLocaleString()} VNĐ\nLoại: ${
        transaction.type
      }\nNgày: ${new Date(transaction.createdAt).toLocaleDateString("vi-VN")}`
    );
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background.primary}
      />

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    marginTop: SIZES.padding.large,
  },
});

export default WalletScreen;
