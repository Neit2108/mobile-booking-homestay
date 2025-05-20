import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

// Components
import PaymentMethodSelector from "../../components/payment/PaymentMethodSelector";
import PaymentModal from "../../components/modals/PaymentModal";
import PaymentStatusBadge from "../../components/booking/PaymentStatusBadge";

// Constants and Utils
import { COLORS, SIZES, FONTS } from "../../constants/theme";
import { formatPrice } from "../../utils/formatPrice";

// API
import { getUserBookings, cancelBooking } from "../../api/bookings";
import { createPayment, getPaymentsByBookingId } from "../../api/payments";
import { useAuth } from "../../context/AuthContext";
import { getWalletBalance, payWithWallet } from "../../api/wallets";

const BookingDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId } = route.params || {};
  const { user } = useAuth();

  // State
  const [booking, setBooking] = useState(null);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("bank_transfer");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchBookingDetails(), fetchWalletBalance()]);
    } catch (err) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async () => {
    if (!bookingId) {
      throw new Error("Booking ID not provided");
    }

    const userId = user?.id || user?.userId || user?._id;
    const bookings = await getUserBookings(userId);
    const foundBooking = bookings.find((b) => b.Id === bookingId);

    if (!foundBooking) {
      throw new Error("Booking not found");
    }

    setBooking(foundBooking);
    setPlace({
      id: foundBooking.PlaceId,
      name: foundBooking.PlaceName,
      address: foundBooking.PlaceAddress,
      price: foundBooking.TotalPrice,
    });
  };

  const fetchWalletBalance = async () => {
  try {
    const response = await getWalletBalance();
    setWalletBalance(response.balance);
  } catch (err) {
    console.error('Error fetching wallet balance:', err);
    setWalletBalance(0);
  }
};

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const format = (date) =>
      date.toLocaleDateString("vi-en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    return `${format(start)} - ${format(end)}`;
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const start = new Date(booking.StartDate);
    const end = new Date(booking.EndDate);
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Hủy đơn đặt",
      "Bạn có chắc chắn muốn hủy đơn đặt này?",
      [
        { text: "Không", style: "cancel" },
        { text: "Có", style: "destructive", onPress: confirmCancelBooking },
      ]
    );
  };

  const confirmCancelBooking = async () => {
    setCancelling(true);
    try {
      await cancelBooking(bookingId);
      Alert.alert("Thành công", "Đơn đặt đã được hủy", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể hủy đơn đặt. Vui lòng thử lại.");
    } finally {
      setCancelling(false);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentError(null);
  };

  const handleProceedToPayment = async () => {
    if (!booking) return;

    if (selectedPaymentMethod === "wallet") {
      if (walletBalance < booking.TotalPrice) {
        Alert.alert(
          "Số dư không đủ",
          "Số dư ví của bạn không đủ."
        );
        return;
      }
      setShowPinModal(true);
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const paymentRequest = {
        bookingId: booking.Id,
        returnUrl: "homiesstay://payment-result",
        orderInfo: `Thanh toán cho đơn đặt #${booking.Id}`,
      };

      switch (selectedPaymentMethod) {
        case "bank_transfer":
          paymentRequest.bankCode = "VNPAYQR";
          break;
        case "card":
          paymentRequest.bankCode = "NCB";
          break;
        case "counter":
          setPaymentData({
            bookingId: booking.Id,
            amount: booking.TotalPrice,
            method: "counter",
          });
          setShowPaymentModal(true);
          setPaymentLoading(false);
          return;
      }

      const response = await createPayment(paymentRequest);
      if (!response) {
        throw new Error("Empty response from payment service");
      }

      setPaymentData({
        ...response,
        bookingId: booking.Id,
        amount: booking.TotalPrice,
        reference: `BOOKING-${booking.Id}`,
      });
      setShowPaymentModal(true);
      setBooking({ ...booking, PaymentStatus: "Processing" });
    } catch (err) {
      setPaymentError(err.message || "Payment processing failed");
      Alert.alert("Lỗi thanh toán", err.message || "Không thể thanh toán.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setPinError("Mã PIN phải chính xác 6 chữ số");
      return;
    }

    setPaymentLoading(true);
    setPinError(null);

    try {
      const payWithPinRequest = {
        bookingId: booking.Id,
        pin,
      };
      await payWithWallet(payWithPinRequest);
      setBooking({ ...booking, PaymentStatus: "Paid" });
      setShowPinModal(false);
      setPin("");
      Alert.alert("Thành công", "Thanh toán đã được xử lý", [
        { text: "OK", onPress: fetchData },
      ]);
    } catch (err) {
      setPinError(err.message || "Mã PIN không hợp lệ hoặc lỗi thanh toán");
    } finally {
      setPaymentLoading(false);
    }
  };

  const isCancellable = () => {
    if (!booking) return false;
    const now = new Date();
    const startDate = new Date(booking.StartDate);
    return (
      (booking.Status === "Pending" || booking.Status === "Confirmed") &&
      startDate > now
    );
  };

  const isPayable = () => {
    if (!booking) return false;
    return booking.Status === "Confirmed" && booking.PaymentStatus !== "Paid";
  };

  const getStatusColor = (status) => {
    const colors = {
      Confirmed: COLORS.success,
      Pending: COLORS.secondary,
      Cancelled: COLORS.error,
      Completed: COLORS.primary,
    };
    return colors[status] || COLORS.text.secondary;
  };

  const getImageUrl = () => {
    return (
      booking?.ImageUrl || "https://source.unsplash.com/random/800x600/?hotel"
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chờ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={SIZES.large}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn đặt</Text>
          <View style={styles.headerButton} />
        </View>

        {booking && (
          <View style={styles.content}>
            <Image
              source={{ uri: getImageUrl() }}
              style={styles.placeImage}
              resizeMode="cover"
            />

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(booking.Status)}20` },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(booking.Status) },
                ]}
              >
                {booking.Status === "Pending"
                  ? "Chờ xác nhận"
                  : booking.Status === "Cancelled"
                  ? "Đã hủy"
                  : booking.Status === "Confirmed"
                  ? "Đã xác nhận"
                  : booking.Status === "Completed"
                  ? "Hoàn thành"
                  : booking.Status}
              </Text>
            </View>

            <View style={styles.placeInfo}>
              <View style={styles.placeTitleRow}>
                <Text style={styles.placeName}>{booking.PlaceName}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={SIZES.small} color="#FFD700" />
                  <Text style={styles.rating}>
                    {(booking.Rating || 4.5).toFixed(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={SIZES.small}
                  color={COLORS.text.secondary}
                />
                <Text style={styles.locationText}>{booking.PlaceAddress}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin</Text>
              {[
                {
                  icon: "calendar-outline",
                  label: "Ngày đến - Ngày đi",
                  value: formatDateRange(booking.StartDate, booking.EndDate),
                },
                {
                  icon: "time-outline",
                  label: "Số ngày",
                  value: `${calculateNights()} ngày`,
                },
                {
                  icon: "people-outline",
                  label: "Số khách",
                  value: `${booking.NumberOfGuests} khách`,
                },
                {
                  icon: "cash-outline",
                  label: "Trạng thái thanh toán",
                  value: (
                    <PaymentStatusBadge
                      status={booking.PaymentStatus || "Unpaid"}
                      style={{ marginTop: SIZES.padding.small }}
                    />
                  ),
                },
              ].map((item, index) => (
                <View key={index} style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons
                      name={item.icon}
                      size={SIZES.medium}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    {typeof item.value === "string" ? (
                      <Text style={styles.detailValue}>{item.value}</Text>
                    ) : (
                      item.value
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chi tiết giá</Text>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>
                  {formatPrice(booking.TotalPrice / calculateNights())}VND x{" "}
                  {calculateNights()} ngày
                </Text>
                <Text style={styles.priceValue}>
                  {formatPrice(booking.TotalPrice)}VND
                </Text>
              </View>
              {selectedPaymentMethod === "wallet" && (
                <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>
                  Giảm giá khi dùng ví Homies
                </Text>
                <Text style={styles.priceValue}>
                  -{formatPrice(booking.TotalPrice * 0.1)}VND
                </Text>
              </View>
              )}
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Tổng</Text>
                <Text style={styles.totalValue}>
                  {selectedPaymentMethod === "wallet" ? formatPrice(booking.TotalPrice * 0.9) : formatPrice(booking.TotalPrice)}VND
                </Text>
              </View>
            </View>

            {isPayable() && (
              <>
                <View style={styles.divider} />
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                  <PaymentMethodSelector
                    selectedMethod={selectedPaymentMethod}
                    onSelectMethod={handlePaymentMethodChange}
                  />
                  {selectedPaymentMethod === "wallet" &&
                    walletBalance !== null && (
                      <View style={styles.walletBalanceContainer}>
                        <Text style={styles.walletBalanceText}>
                          Ví Homies: {formatPrice(walletBalance)}VND
                        </Text>
                        
                        {walletBalance < booking.TotalPrice && (
                          <Text style={styles.insufficientBalanceText}>
                            Số dư không đủ.
                          </Text>
                        )}
                      </View>
                    )}
                  {paymentError && (
                    <Text style={styles.paymentErrorText}>{paymentError}</Text>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.payButton,
                      selectedPaymentMethod === "wallet" &&
                        walletBalance < booking.TotalPrice &&
                        styles.payButtonDisabled,
                    ]}
                    onPress={handleProceedToPayment}
                    disabled={
                      paymentLoading ||
                      (selectedPaymentMethod === "wallet" &&
                        walletBalance < booking.TotalPrice)
                    }
                  >
                    {paymentLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.payButtonText}>
                        Thanh toán
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {isCancellable() && (
              <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.cancelBookingButton,
                  cancelling && { opacity: 0.7 },
                ]}
                onPress={handleCancelBooking}
                disabled={cancelling}
                activeOpacity={0.8}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.cancelButtonText}>Hủy đơn đặt</Text>
                )}
              </TouchableOpacity>
            </View>
            
            )}

            <View style={{ height: SIZES.extraLarge }} />
          </View>
        )}
      </ScrollView>

      <PaymentModal
        visible={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          fetchData();
        }}
        paymentMethod={selectedPaymentMethod}
        paymentData={paymentData}
        place={place}
        loading={paymentLoading}
      />

      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập mã PIN</Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={(text) => {
                setPin(text);
                setPinError(null);
              }}
              placeholder="Mã PIN"
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
            />
            {pinError && <Text style={styles.pinErrorText}>{pinError}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPinModal(false);
                  setPin("");
                  setPinError(null);
                }}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleWalletPayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalButtonText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.padding.medium,
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.large,
  },
  errorText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.primary,
    textAlign: "center",
    marginVertical: SIZES.padding.medium,
  },
  dangerText: {
    color: "#E53935", // màu đỏ tươi, hoặc COLORS.error nếu có
    fontSize: 15,     // tuỳ, chỉnh cho đẹp
    fontWeight: "bold",
  },
  
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  retryButtonText: {
    color: "white",
    fontSize: FONTS.sizes.medium,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding.medium,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONTS.sizes.heading,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  content: {
    padding: SIZES.padding.medium,
  },
  placeImage: {
    width: "100%",
    height: 200,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SIZES.padding.medium,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: SIZES.padding.small / 2,
    paddingHorizontal: SIZES.padding.small,
    borderRadius: SIZES.borderRadius.small,
    marginBottom: SIZES.padding.medium,
  },
  statusText: {
    fontSize: FONTS.sizes.small,
    fontWeight: "bold",
  },
  placeInfo: {
    marginBottom: SIZES.padding.large,
  },
  placeTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding.small,
  },
  placeName: {
    fontSize: FONTS.sizes.heading,
    fontWeight: "bold",
    color: COLORS.text.primary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    padding: SIZES.padding.small / 2,
    borderRadius: SIZES.borderRadius.small,
  },
  rating: {
    marginLeft: SIZES.padding.small / 2,
    fontSize: FONTS.sizes.small,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: SIZES.padding.small / 2,
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.padding.medium,
  },
  section: {
    marginBottom: SIZES.padding.large,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.heading,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.medium,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: SIZES.padding.medium,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.padding.medium,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding.small / 2,
  },
  detailValue: {
    fontSize: FONTS.sizes.medium,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.padding.small,
  },
  priceLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: FONTS.sizes.small,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: SIZES.padding.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: FONTS.sizes.medium,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: FONTS.sizes.medium,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  actionsContainer: {
    marginTop: SIZES.padding.medium,
  },
  cancelBookingButton: {
    backgroundColor: "#FFA600", // Cam tươi, nổi bật (có thể chỉnh màu brand nếu muốn)
    width: "100%",
    borderRadius: 8, // Có thể để 0 nếu muốn vuông hoàn toàn như ảnh
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14, // Nút dày, dễ bấm
    marginTop: 20,
    alignSelf: "stretch"
    },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textTransform: "none", // Nếu thích có thể cho uppercase
  },
  actionsContainer: {
    marginTop: 10,
    marginBottom: 30,
    width: "100%",
    paddingHorizontal: 0,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: "center",
    marginTop: SIZES.padding.medium,
  },
  payButtonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
  payButtonText: {
    color: "white",
    fontSize: FONTS.sizes.medium,
    fontWeight: "bold",
  },
  paymentErrorText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.small,
    marginVertical: SIZES.padding.small,
    textAlign: "center",
  },
  walletBalanceContainer: {
    padding: SIZES.padding.medium,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    marginVertical: SIZES.padding.medium,
  },
  walletBalanceText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  insufficientBalanceText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.error,
    marginTop: SIZES.padding.small,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    padding: SIZES.padding.large,
    borderRadius: SIZES.borderRadius.medium,
    width: "80%",
  },
  modalTitle: {
    fontSize: FONTS.sizes.heading,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.medium,
    textAlign: "center",
  },
  pinInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.medium,
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.medium,
    textAlign: "center",
  },
  pinErrorText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.small,
    marginBottom: SIZES.padding.medium,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: "center",
    marginHorizontal: SIZES.padding.small / 2,
  },
  cancelButton: {
    backgroundColor: COLORS.secondary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: "white",
    fontSize: FONTS.sizes.medium,
    fontWeight: "bold",
  },
});

export default BookingDetailsScreen;
