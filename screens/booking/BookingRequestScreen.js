import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Components
import CustomButton from '../../components/buttons/CustomButton';
import CustomInput from '../../components/forms/CustomInput';
import BookingDatePicker from '../../components/booking/BookingDatePicker';

// Constants and Utils
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { formatPrice } from '../../utils/formatPrice';

// API and Context
import { useAuth } from '../../context/AuthContext';
import { getPlaceById } from '../../api/places';
import * as bookingAPI from '../../api/bookings';

/**
 * BookingRequestScreen - Allows users to make a booking request with date selection,
 * guest count, and voucher application
 */
const BookingRequestScreen = () => {
  // Hooks
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  
  // Route params
  const { placeId, startDate: initialStartDate, endDate: initialEndDate } = route.params || {};
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [place, setPlace] = useState(null);
  const [startDate, setStartDate] = useState(initialStartDate || new Date());
  const [endDate, setEndDate] = useState(initialEndDate || new Date(new Date().setDate(new Date().getDate() + 2)));
  const [guestCount, setGuestCount] = useState(1);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState(null);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  
  // Derived state
  const maxGuests = useMemo(() => (place?.maxGuests || 0) + 2, [place]);
  
  // Fetch place details on mount
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setIsLoading(true);
        const data = await getPlaceById(placeId);
        setPlace(data);
      } catch (error) {
        console.error('Error fetching place:', error);
        Alert.alert(
          'Error',
          'Unable to load place details. Please try again later.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    if (placeId) {
      fetchPlace();
    } else {
      Alert.alert(
        'Error',
        'No place selected for booking.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [placeId, navigation]);
  
  // Calculate price details
  const priceDetails = useMemo(() => {
    if (!place) return {
      nightlyRate: 0,
      totalNights: 0,
      subtotal: 0,
      surcharge: 0,
      discount: 0,
      cleaningFee: 5,
      serviceFee: 5,
      total: 0
    };
    
    // Calculate number of nights
    const diffTime = Math.abs(endDate - startDate);
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) + 1;
    
    // Calculate base total (price per night * nights)
    const nightlyRate = place.price || 0;
    let subtotal = nightlyRate * nights;
    
    // Apply surcharge for 3+ guests (30% extra)
    let surcharge = 0;
    if (guestCount >= 3) {
      surcharge = subtotal * 0.3;
    }
    
    // Calculate discount if voucher applied
    const discount = appliedVoucher 
      ? ((subtotal + surcharge) * (appliedVoucher.discount / 100)) 
      : 0;
    
    // Fixed fees
    const cleaningFee = 5;
    const serviceFee = 5;
    
    // Calculate total
    const total = subtotal + surcharge - discount;
    
    return {
      nightlyRate,
      totalNights: nights,
      subtotal,
      surcharge,
      discount,
      cleaningFee,
      serviceFee,
      total
    };
  }, [place, startDate, endDate, guestCount, appliedVoucher]);
  
  // Handle guest count changes
  const handleGuestChange = useCallback((increment) => {
    setGuestCount(prev => {
      const newCount = prev + increment;
      return newCount >= 1 && newCount <= maxGuests ? newCount : prev;
    });
  }, [maxGuests]);
  
  // Handle changing start date
  const handleStartDateChange = useCallback((date) => {
    setStartDate(date);
    
    // If end date is now before start date, adjust it
    if (endDate <= date) {
      // Set end date to start date + 1 day
      const newEndDate = new Date(date);
      newEndDate.setDate(newEndDate.getDate() + 1);
      setEndDate(newEndDate);
    }
  }, [endDate]);
  
  // Validate voucher
  const validateVoucher = useCallback(async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Please enter a voucher code');
      return;
    }
    
    try {
      setIsValidatingVoucher(true);
      setVoucherError(null);
      
      const response = await bookingAPI.checkVoucher(voucherCode);
      
      if (response) {
        setAppliedVoucher(response);
        setVoucherCode('');
      } else {
        setVoucherError('Invalid or expired voucher');
      }
    } catch (error) {
      console.error('Error validating voucher:', error);
      setVoucherError('Could not validate voucher');
    } finally {
      setIsValidatingVoucher(false);
    }
  }, [voucherCode]);
  
  // Remove applied voucher
  const removeVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError(null);
  }, []);
  
  // Submit booking
  const handleCheckout = useCallback(async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to book this place');
      return;
    }
    
    // Validate dates
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const bookingStartDate = new Date(startDate);
    bookingStartDate.setHours(0, 0, 0, 0);
    
    if (bookingStartDate < currentDate) {
      Alert.alert('Invalid Date', 'Check-in date cannot be in the past');
      return;
    }
    
    if (endDate <= startDate) {
      Alert.alert('Invalid Dates', 'Check-out date must be after check-in date');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const bookingData = {
        userId: user.id,
        placeId: placeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        numberOfGuests: guestCount,
        totalPrice: priceDetails.total,
        voucher: appliedVoucher?.code || null,
        status: 'Pending'
      };
      
      const response = await bookingAPI.createBooking(bookingData);
      Alert.alert(
        'Đặt phòng thành công',
        'Yêu cầu của bạn đã được gửi đi và đang chờ xác nhận.',
        [{ text: 'Xem lịch sử đặt phòng', onPress: () => navigation.navigate('Booking') }]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      
      let errorMessage = 'Đã xảy ra lỗi khi đặt phòng. Vui lòng thử lại.';
      if (error.message?.includes('not available')) {
        errorMessage = 'Địa điểm này không khả dụng trong ngày đã chọn.';
      } else if (error.message?.includes('voucher')) {
        errorMessage = 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
      }
      
      Alert.alert('Đặt phòng thất bại', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, placeId, startDate, endDate, guestCount, priceDetails.total, appliedVoucher, navigation]);
  
  // Go back
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // Format a date for display - used for debug purposes only
  const formatDate = useCallback((date) => {
    if (!date) return '';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chờ...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu thuê phòng</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngày đến - Ngày đi</Text>
          <View style={styles.dateContainer}>
            {/* Check-in Date */}
            <BookingDatePicker
              label="Ngày đến"
              date={startDate}
              onDateChange={handleStartDateChange}
              minDate={new Date()}
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
              style={styles.datePicker}
            />
            
            {/* Check-out Date */}
            <BookingDatePicker
              label="Ngày đi"
              date={endDate}
              onDateChange={setEndDate}
              minDate={new Date(startDate.getTime() + 86400000)} // startDate + 1 day
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
              style={styles.datePicker}
            />
          </View>
        </View>
        
        {/* Guest Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số khách</Text>
          <View style={styles.guestContainer}>
            <TouchableOpacity 
              style={[
                styles.guestButton, 
                guestCount <= 1 && styles.disabledButton
              ]} 
              onPress={() => handleGuestChange(-1)}
              disabled={guestCount <= 1}
            >
              <Ionicons name="remove" size={20} color={guestCount <= 1 ? COLORS.text.placeholder : COLORS.text.primary} />
            </TouchableOpacity>
            
            <Text style={styles.guestCount}>{guestCount}</Text>
            
            <TouchableOpacity 
              style={[
                styles.guestButton, 
                guestCount >= maxGuests && styles.disabledButton
              ]} 
              onPress={() => handleGuestChange(1)}
              disabled={guestCount >= maxGuests}
            >
              <Ionicons name="add" size={20} color={guestCount >= maxGuests ? COLORS.text.placeholder : COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Display maximum guests allowed */}
          {place && (
            <Text style={styles.maxGuestsInfo}>
              Tối đa {maxGuests} khách
            </Text>
          )}
          
          {/* Display surcharge notice */}
          {guestCount >= 3 && (
            <Text style={styles.surchargeNote}>
              Chúng tôi thu thêm 30% phí nếu có 3 khách trở lên.
            </Text>
          )}
        </View>
        
        {/* Voucher Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          
          {appliedVoucher ? (
            <View style={styles.appliedVoucherContainer}>
              <View style={styles.appliedVoucherInfo}>
                <Text style={styles.appliedVoucherCode}>{appliedVoucher.code}</Text>
                <Text style={styles.appliedVoucherDiscount}>
                  Bạn được giảm {appliedVoucher.discount}%
                </Text>
              </View>
              <TouchableOpacity style={styles.removeVoucherButton} onPress={removeVoucher}>
                <Text style={styles.removeVoucherText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.voucherInputContainer}>
              <CustomInput
                placeholder="Nhập mã giảm giá"
                value={voucherCode}
                onChangeText={setVoucherCode}
                error={voucherError}
                style={styles.voucherInput}
              />
              <TouchableOpacity 
                style={styles.checkButton}
                onPress={validateVoucher}
                disabled={isValidatingVoucher || !voucherCode.trim()}
              >
                {isValidatingVoucher ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.checkButtonText}>Kiểm tra</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Payment Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
          <View style={styles.paymentDetails}>
            {/* Base price */}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>
                Tổng: {priceDetails.totalNights} ngày
              </Text>
              <Text style={styles.paymentValue}>{formatPrice(priceDetails.subtotal)} VND</Text>
            </View>
            
            {/* Surcharge for 3+ guests */}
            {guestCount >= 3 && priceDetails.surcharge > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.surchargeLabel}>
                  Phụ phí (30% với {guestCount} khách)
                </Text>
                <Text style={styles.surchargeValue}>{formatPrice(priceDetails.surcharge)} VND</Text>
              </View>
            )}
            
            {/* Discount (if applied) */}
            {appliedVoucher && priceDetails.discount > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.discountLabel}>
                  Giảm giá ({appliedVoucher.discount}%)
                </Text>
                <Text style={styles.discountValue}>-{formatPrice(priceDetails.discount)} VND</Text>
              </View>
            )}
            
            {/* Fees */}
            {/* <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Cleaning Fee</Text>
              <Text style={styles.paymentValue}>${formatPrice(priceDetails.cleaningFee)}</Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Fee</Text>
              <Text style={styles.paymentValue}>${formatPrice(priceDetails.serviceFee)}</Text>
            </View> */}
            
            {/* Total */}
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng tiền:</Text>
              <Text style={styles.totalValue}>{formatPrice(priceDetails.total)} VND</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Footer with Checkout Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Xác nhận"
          onPress={handleCheckout}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SIZES.padding.large,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  
  // Section styles
  section: {
    marginTop: SIZES.padding.large,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.medium,
  },
  
  // Date section styles
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePicker: {
    width: '48%',
  },
  
  // Guest section styles
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  disabledButton: {
    opacity: 0.5,
  },
  guestCount: {
    width: 50,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  maxGuestsInfo: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  surchargeNote: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.error,
  },
  
  // Voucher section styles
  voucherInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherInput: {
    flex: 1,
    marginRight: SIZES.padding.medium,
  },
  checkButton: {
    height: 50,
    paddingHorizontal: SIZES.padding.large,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  appliedVoucherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding.medium,
    backgroundColor: `${COLORS.primary}10`,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.medium,
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
    padding: SIZES.padding.small,
    backgroundColor: `${COLORS.error}10`,
    borderRadius: SIZES.borderRadius.small,
  },
  removeVoucherText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.error,
  },
  
  // Payment details styles
  paymentDetails: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.large,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  paymentValue: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  surchargeLabel: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
  surchargeValue: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
  discountLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  
  // Footer styles
  footer: {
    padding: SIZES.padding.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default BookingRequestScreen;