import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Constants and Utils
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { formatPrice } from '../../utils/formatPrice';

// API
import { getUserBookings, cancelBooking } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext'; 

const BookingDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId } = route.params || {};
  const {user} = useAuth();
  
  // State
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch booking details
  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);
  
  const fetchBookingDetails = async () => {
    if (!bookingId) {
      setError('Booking ID not provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get user ID if available
      const userId = user?.id || user?.userId || user?._id;
      
      // Fetch all user bookings and find the one we want
      const bookings = await getUserBookings(userId);
      const foundBooking = bookings.find(b => b.Id === bookingId);
      
      if (foundBooking) {
        setBooking(foundBooking);
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format dates for display
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date) => {
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };
  
  // Calculate the number of nights
  const calculateNights = () => {
    if (!booking) return 0;
    
    const start = new Date(booking.StartDate);
    const end = new Date(booking.EndDate);
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };
  
  // Handle cancel booking
  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: confirmCancelBooking }
      ]
    );
  };
  
  const confirmCancelBooking = async () => {
    try {
      setCancelling(true);
      await cancelBooking(bookingId);
      
      Alert.alert(
        'Booking Cancelled',
        'Your booking has been successfully cancelled.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Error cancelling booking:', err);
      Alert.alert('Error', 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };
  
  // Handle back button press
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // Get the booking status style (color)
  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return COLORS.success;
      case 'Pending':
        return COLORS.secondary;
      case 'Cancelled':
        return COLORS.error;
      case 'Completed':
        return COLORS.primary;
      default:
        return COLORS.text.secondary;
    }
  };
  
  // Generate a placeholder image URL if there's no image
  const getImageUrl = () => {
    if (booking?.ImageUrl) return booking.ImageUrl;
    return `https://source.unsplash.com/random/800x600/?hotel`;
  };
  
  // Check if booking is cancellable (Pending or Confirmed, not in the past)
  const isCancellable = () => {
    if (!booking) return false;
    
    const now = new Date();
    const startDate = new Date(booking.StartDate);
    
    return (
      (booking.Status === 'Pending' || booking.Status === 'Confirmed') &&
      startDate > now
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </SafeAreaView>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchBookingDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // Render booking details
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Booking Details</Text>
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Main Content */}
        {booking ? (
          <View style={styles.content}>
            {/* Place Image */}
            <Image
              source={{ uri: getImageUrl() }}
              style={styles.placeImage}
              resizeMode="cover"
            />
            
            {/* Booking Status */}
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(booking.Status)}20` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(booking.Status) }
              ]}>
                {booking.Status}
              </Text>
            </View>
            
            {/* Place Info */}
            <View style={styles.placeInfo}>
              <View style={styles.placeTitleRow}>
                <Text style={styles.placeName}>{booking.PlaceName}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>
                    {(booking.Rating || 4.5).toFixed(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
                <Text style={styles.locationText}>{booking.PlaceAddress}</Text>
              </View>
            </View>
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Booking Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Information</Text>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Check-in and Check-out</Text>
                  <Text style={styles.detailValue}>
                    {formatDateRange(booking.StartDate, booking.EndDate)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>
                    {calculateNights()} {calculateNights() === 1 ? 'Night' : 'Nights'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="people-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Guests</Text>
                  <Text style={styles.detailValue}>
                    {booking.NumberOfGuests} {booking.NumberOfGuests === 1 ? 'Guest' : 'Guests'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Payment Status</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: booking.PaymentStatus === 'Paid' ? COLORS.success : COLORS.error }
                  ]}>
                    {booking.PaymentStatus || 'Unpaid'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Price Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Details</Text>
              
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>
                  ${formatPrice(booking.TotalPrice / calculateNights())} x {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                </Text>
                <Text style={styles.priceValue}>
                  ${formatPrice(booking.TotalPrice)}
                </Text>
              </View>
              
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${formatPrice(booking.TotalPrice)}
                </Text>
              </View>
            </View>
            
            {/* Actions */}
            {isCancellable() && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelBooking}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            
            {/* Bottom spacing */}
            <View style={{ height: 40 }} />
          </View>
        ) : null}
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.large,
    backgroundColor: COLORS.background.primary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.error,
    marginVertical: SIZES.padding.small,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.large,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SIZES.padding.medium,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    paddingVertical: SIZES.padding.small,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
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
  content: {
    paddingHorizontal: SIZES.padding.large,
  },
  placeImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SIZES.padding.medium,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.borderRadius.small,
    marginBottom: SIZES.padding.medium,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  placeInfo: {
    marginBottom: SIZES.padding.large,
  },
  placeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.small,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.text.secondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.padding.large,
  },
  section: {
    marginBottom: SIZES.padding.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.medium,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: SIZES.padding.medium,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding.medium,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding.small,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SIZES.padding.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SIZES.padding.small,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionsContainer: {
    marginTop: SIZES.padding.medium,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingDetailsScreen;