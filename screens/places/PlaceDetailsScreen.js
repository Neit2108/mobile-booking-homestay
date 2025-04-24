import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// API
import { getPlaceById, getPlaceReviews } from '../../api/places';

// Theme
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

// Components
import CustomButton from '../../components/buttons/CustomButton';
import RatingSection from '../../components/ratings/RatingSection';
import ReviewsSection from '../../components/ratings/ReviewsSection';
import { formatPrice } from '../../utils/formatPrice';

const { width } = Dimensions.get('window');

const PlaceDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  
  const flatListRef = useRef(null);
  
  useEffect(() => {
    fetchPlaceDetails();
    fetchReviews();
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
  
  const fetchReviews = async () => {
    try {
      const reviewsData = await getPlaceReviews(id);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Don't set error state here to keep the UI usable even if reviews fail to load
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
  
  const handleReviewAdded = () => {
    // Refresh place details and reviews
    fetchPlaceDetails();
    fetchReviews();
  };

  const renderImageItem = ({ item, index }) => (
    <Image
      source={{ uri: item.imageUrl }}
      style={styles.carouselImage}
      resizeMode="cover"
    />
  );
  
  const onImageScrollEnd = (e) => {
    const contentOffset = e.nativeEvent.contentOffset;
    const viewSize = e.nativeEvent.layoutMeasurement;
    
    // Calculate current index
    const newIndex = Math.floor(contentOffset.x / viewSize.width);
    setCurrentImageIndex(newIndex);
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

  // Ensure place.images is an array, or create a default array with one image
  const images = Array.isArray(place.images) && place.images.length > 0 
    ? place.images 
    : [{ id: 'default', imageUrl: place.images?.[0]?.imageUrl || 'https://via.placeholder.com/400x300' }];
    
  // If there are no images, add a placeholder
  if (images.length === 0) {
    images.push({ id: 'default', imageUrl: 'https://via.placeholder.com/400x300' });
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Image Carousel */}
      <View style={styles.imageCarouselContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          keyExtractor={(item, index) => `image-${item.id || index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onImageScrollEnd}
          renderItem={renderImageItem}
        />
        
        {/* Image indicators */}
        {images.length > 1 && (
          <View style={styles.paginationContainer}>
            {images.map((_, index) => (
              <View 
                key={`dot-${index}`} 
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive
                ]} 
              />
            ))}
          </View>
        )}
        
        {/* Header buttons */}
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
              <Text style={styles.priceValue}>{formatPrice(place.price) || 0} VNĐ</Text>
              <Text style={styles.priceNight}> / ngày</Text>
            </Text>
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{place.description || 'No description available.'}</Text>
          </View>
          
          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
                <Text style={styles.detailText}>Tối đa {place.maxGuests || 2} khách</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="bed-outline" size={24} color={COLORS.primary} />
                <Text style={styles.detailText}>{Math.ceil((place.maxGuests || 2) / 2)} phòng ngủ</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="water-outline" size={24} color={COLORS.primary} />
                <Text style={styles.detailText}>{Math.ceil((place.maxGuests || 2) / 2)} phòng tắm</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="wifi-outline" size={24} color={COLORS.primary} />
                <Text style={styles.detailText}>Wifi</Text>
              </View>
            </View>
          </View>
          
          {/* Ratings & Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <RatingSection 
              rating={place.rating || 0} 
              numOfRating={place.numOfRating || 0} 
              placeId={place.id}
              onReviewAdded={handleReviewAdded}
            />
            <ReviewsSection 
              placeId={place.id}
              reviews={reviews}
            />
          </View>
          
          {/* Placeholder for more sections like amenities, reviews, etc. */}
          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>
      
      {/* Book Now Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Đặt ngay"
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
  imageCarouselContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.background.secondary, // Add background color in case images take time to load
  },
  carouselImage: {
    width: width,
    height: 300,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerButtons: {
    position: 'absolute',
    top: 15,
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
  bottomSpace: {
    height: 30,
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