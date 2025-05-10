import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// API
import { getBookingDetails } from '../../api/bookings';

// Theme
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const PaymentResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  
  // Extract payment result params from the route
  const { status, bookingId, transactionId, message } = route.params || {};
  
  // State
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if payment was successful
  const isSuccess = status === 'success' || status === 'Success';
  
  // Fetch booking details when component mounts
  useEffect(() => {
    fetchBookingDetails();
    
    // Auto navigate after 10 seconds
    const timer = setTimeout(() => {
      if (isSuccess) {
        handleViewBooking();
      } else {
        handleGoHome();
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [bookingId, isSuccess]);
  
  // Fetch booking details from API
  const fetchBookingDetails = async () => {
    if (!bookingId) {
      setError('Booking ID not provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get booking details
      const bookingData = await getBookingDetails(bookingId);
      setBooking(bookingData);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };
  
  // Navigate to booking details
  const handleViewBooking = () => {
    navigation.navigate('BookingDetails', { bookingId });
  };
  
  // Return to home screen
  const handleGoHome = () => {
    navigation.navigate('Home');
  };
  
  // Try payment again
  const handleTryAgain = () => {
    // Navigate back to booking details screen to try payment again
    navigation.navigate('BookingDetails', { bookingId });
  };
  
  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Processing payment result...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background.primary}
      />
      
      <View style={styles.content}>
        {/* Status Icon */}
        <View style={[
          styles.statusIconContainer,
          isSuccess ? styles.successIconContainer : styles.failureIconContainer
        ]}>
          <Ionicons
            name={isSuccess ? "checkmark" : "close"}
            size={60}
            color="white"
          />
        </View>
        
        {/* Status Message */}
        <Text style={styles.statusTitle}>
          {isSuccess ? "Payment Successful" : "Payment Failed"}
        </Text>
        
        <Text style={styles.statusMessage}>
          {isSuccess 
            ? "Your booking has been successfully confirmed and paid." 
            : message || "There was an issue processing your payment. Please try again."}
        </Text>
        
        {/* Booking Details (if available) */}
        {booking && (
          <View style={styles.bookingDetails}>
            <Text style={styles.bookingId}>Booking ID: #{booking.Id || bookingId}</Text>
            
            {booking.PlaceName && (
              <Text style={styles.placeName}>{booking.PlaceName}</Text>
            )}
            
            {transactionId && (
              <Text style={styles.transactionId}>Transaction ID: {transactionId}</Text>
            )}
            
            {booking.PaymentStatus && (
              <Text style={styles.paymentStatus}>
                Payment Status: <Text style={{
                  color: booking.PaymentStatus === 'Paid' ? COLORS.success : COLORS.text.primary
                }}>{booking.PaymentStatus}</Text>
              </Text>
            )}
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {isSuccess ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleViewBooking}
              >
                <Text style={styles.primaryButtonText}>View Booking</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleGoHome}
              >
                <Text style={styles.secondaryButtonText}>Return to Home</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleTryAgain}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleGoHome}
              >
                <Text style={styles.secondaryButtonText}>Return to Home</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Note about automatic navigation */}
        <Text style={styles.noteText}>
          You will be automatically redirected in 10 seconds...
        </Text>
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding.large,
  },
  statusIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.padding.large,
    ...SHADOWS.medium,
  },
  successIconContainer: {
    backgroundColor: COLORS.success,
  },
  failureIconContainer: {
    backgroundColor: COLORS.error,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SIZES.padding.medium,
    color: COLORS.text.primary,
  },
  statusMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SIZES.padding.large * 2,
    color: COLORS.text.secondary,
  },
  bookingDetails: {
    width: '100%',
    padding: SIZES.padding.large,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SIZES.padding.large * 2,
    alignItems: 'center',
  },
  bookingId: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding.small,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.small,
    textAlign: 'center',
  },
  transactionId: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding.small,
  },
  paymentStatus: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: SIZES.padding.large,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
    ...SHADOWS.small,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  noteText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
});

export default PaymentResultScreen;