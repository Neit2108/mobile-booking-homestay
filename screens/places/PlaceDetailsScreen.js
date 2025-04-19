import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// API
import { getPlaceById } from '../../api/places';

// Theme
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

// Components
import CustomButton from '../../components/buttons/CustomButton';

const PlaceDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);
  
  useEffect(() => {
    fetchPlaceDetails();
  }, [id]);
  
  const fetchPlaceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const placeDetails = await getPlaceById(id);
      setPlace(placeDetails);
    } catch (err) {
      console.error('Error fetching place details:', err);
      setError('Failed to load place details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  const toggleFavorite = () => {
    setFavorite(!favorite);
  };
  
  const handleBookNow = () => {
    // Navigate to booking screen
    navigation.navigate('Booking', { placeId: id });
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }
  
  if (error || !place) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Place not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPlaceDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: place.images?.[0]?.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
            <Ionicons 
              name={favorite ? "heart" : "heart-outline"} 
              size={24} 
              color={favorite ? "#FF5A5F" : "white"} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Rating */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{place.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{place.rating?.toFixed(1) || '0.0'}</Text>
            </View>
          </View>
          
          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.location}>{place.address || place.location}</Text>
          </View>
          
          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              <Text style={styles.priceValue}>${place.price || 0}</Text>
              <Text style={styles.priceNight}> / night</Text>
            </Text>
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{place.description || 'No description available.'}</Text>
          </View>
          
          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
                <Text style={styles.detailText}>Max {place.maxGuests || 2} guests</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="bed-outline" size={24} color={COLORS.primary} />
                <Text style={styles.detailText}>{Math.ceil((place.maxGuests || 2) / 2)} bedrooms</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="water-outline" size={24} color={COLORS.primary} />
                <Text style={styles.detailText}>{Math.ceil((place.maxGuests || 2) / 2)} bathrooms</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="wifi-outline" size={24} color={COLORS.primary} />
                <Text style={styles.detailText}>Wifi</Text>
              </View>
            </View>
          </View>
          
          {/* Placeholder for more sections like amenities, reviews, etc. */}
        </View>
      </ScrollView>
      
      {/* Book Now Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Book Now"
          onPress={handleBookNow}
          style={styles.bookButton}
        />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: SIZES.padding.large,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.padding.medium,
  },
  retryButton: {
    paddingVertical: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.medium,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.small,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.padding.large,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SIZES.padding.large,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding.small,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.borderRadius.small,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
  },
  location: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  priceContainer: {
    marginBottom: SIZES.padding.large,
  },
  price: {
    fontSize: 18,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceNight: {
    color: COLORS.text.secondary,
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
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: SIZES.padding.small,
  },
  footer: {
    padding: SIZES.padding.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background.primary,
  },
  bookButton: {
    height: 50,
  },
});

export default PlaceDetailsScreen;