import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Constants and Utils
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { formatPrice } from '../../utils/formatPrice';

/**
 * A card component that displays booking information
 * 
 * @param {Object} booking - The booking object containing all booking details
 * @param {Function} onPress - Function to call when card is pressed
 * @param {Object} style - Additional styles for the container
 */
const BookingCard = ({ booking, onPress, style }) => {
  // Format dates for display
  // Format dates for display
  const formatDateRange = (startDate, endDate) => {
    try {
      if (!startDate || !endDate) {
        console.warn('Missing date information in booking', booking.Id);
        return 'Dates not specified';
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Invalid date format in booking', booking.Id || 'unknown');
        return 'Invalid dates';
      }
      
      const formatDate = (date) => {
        try {
          const day = date.getDate();
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          return `${day} ${month} ${year}`;
        } catch (e) {
          console.error('Error formatting date:', e);
          return 'Invalid date';
        }
      };
      
      return `${formatDate(start)} - ${formatDate(end)}`;
    } catch (error) {
      console.error('Error in formatDateRange:', error);
      return 'Date error';
    }
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
    if (booking.ImageUrl) return booking.ImageUrl;
    return `https://source.unsplash.com/random/300x200/?hotel`;
  };
  
  // Calculate the number of nights
  // Calculate the number of nights
  const calculateNights = () => {
    try {
      if (!booking.StartDate || !booking.EndDate) {
        console.warn('Missing date information in booking', booking.Id);
        return 1; // Default to 1 night if dates are missing
      }
      
      const start = new Date(booking.StartDate);
      const end = new Date(booking.EndDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Invalid date format in booking', booking.Id);
        return 1; // Default to 1 night if dates are invalid
      }
      
      const nightCount = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return nightCount > 0 ? nightCount : 1; // Ensure at least 1 night
    } catch (error) {
      console.error('Error calculating nights:', error);
      return 1; // Default to 1 night on error
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Hotel/Place Image */}
      <Image
        source={{ uri: getImageUrl() }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Hotel/Place Name and Rating */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {booking.PlaceName || booking.placeName || 'Unknown Place'}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>
              {((booking.Rating || booking.rating || 4.5).toFixed(1))}
            </Text>
          </View>
        </View>
        
        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
          <Text style={styles.location} numberOfLines={1}>
            {booking.PlaceAddress || booking.placeAddress || booking.address || 'Location not specified'}
          </Text>
        </View>
        
        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${formatPrice((booking.TotalPrice || booking.totalPrice || 0) / calculateNights())}
          </Text>
          <Text style={styles.priceUnit}>/night</Text>
        </View>
        
        {/* Dates and Guests Info */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {formatDateRange(
                booking.StartDate || booking.startDate, 
                booking.EndDate || booking.endDate
              )}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={14} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {booking.NumberOfGuests || booking.numberOfGuests || booking.guests || 1} {(booking.NumberOfGuests || booking.numberOfGuests || booking.guests || 1) === 1 ? 'Guest' : 'Guests'} ({calculateNights()} {calculateNights() === 1 ? 'Room' : 'Rooms'})
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SIZES.padding.medium,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: SIZES.borderRadius.medium,
    borderTopRightRadius: SIZES.borderRadius.medium,
  },
  content: {
    padding: SIZES.padding.medium,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: SIZES.borderRadius.small,
  },
  rating: {
    marginLeft: 2,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 2,
  },
  detailsRow: {
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});

export default BookingCard;