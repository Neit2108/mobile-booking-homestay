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
import { getPlaceById, getPlaceReviews, getSameCategoryPlaces, canCommentOnPlace } from '../../api/places';

// Theme
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

// Components
import CustomButton from '../../components/buttons/CustomButton';
import ReviewsSection from '../../components/ratings/ReviewsSection';
import AddReviewModal from '../../components/modals/AddReviewModal';
import { formatPrice } from '../../utils/formatPrice';

const { width } = Dimensions.get('window');

// Facility Item Component
const FacilityItem = ({ icon, name }) => (
  <View style={styles.facilityItem}>
    <View style={styles.facilityIconContainer}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.facilityName}>{name}</Text>
  </View>
);

// Recommendation Item Component - Style like the image
const RecommendationItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.recommendationItem} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.images?.[0]?.imageUrl || 'https://via.placeholder.com/150x100' }}
        style={styles.recommendationImage}
      />
      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.recommendationAddress} numberOfLines={1}>
          {item.address?.split(',')[0] || 'Location'}
        </Text>
        <View style={styles.recommendationBottom}>
          <Text style={styles.recommendationPrice}>
            {formatPrice(item.price || 0)} VNĐ/ ngày
          </Text>
          <View style={styles.recommendationRating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.recommendationRatingText}>
              {item.rating?.toFixed(1) || '0.0'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PlaceDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  
  const flatListRef = useRef(null);
  
  useEffect(() => {
    fetchPlaceDetails();
    fetchReviews();
    fetchRecommendations();
    checkCanReview();
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
      // We'll use empty reviews but won't show an error
      setReviews([]);
    }
  };
  
  const fetchRecommendations = async () => {
    try {
      const sameCategoryPlaces = await getSameCategoryPlaces(id);
      setRecommendations(sameCategoryPlaces.filter(p => p.id !== parseInt(id)));
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
    }
  };
  
  const checkCanReview = async () => {
    try {
      const result = await canCommentOnPlace(id);
      setCanReview(result.canComment);
    } catch (err) {
      console.error('Error checking review permission:', err);
      // For testing, we'll allow reviewing - in production you may want to set this to false
      setCanReview(true);
    }
  };
  
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  const toggleFavorite = () => {
    setFavorite(!favorite);
  };
  
  const toggleDescription = () => {
    setExpandedDescription(!expandedDescription);
  };
  
  const handleBookNow = () => {
    // Navigate to booking request screen with necessary params
    navigation.navigate('BookingRequest', { 
      placeId: id,
      startDate: new Date(), // Default to today
      endDate: new Date(new Date().setDate(new Date().getDate() + 2)), // Default to 2 days stay
    });
  };

  const handleOpenMap = () => {
    // Could navigate to a map screen or open in external map app
    console.log('Open map for location:', place?.address);
  };
  
  const handleReviewAdded = () => {
    // Refresh place details and reviews
    fetchPlaceDetails();
    fetchReviews();
    setCanReview(false); // User has now reviewed
  };

  const navigateToAllReviews = () => {
    navigation.navigate('AllReviews', { 
      placeId: id, 
      placeName: place.name,
      reviews: reviews,
      rating: place.rating || 0,
      reviewCount: place.numOfRating || 0
    });
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

  const handleRecommendationPress = (placeId) => {
    // Navigate to the details of the recommended place
    navigation.push('PlaceDetails', { id: placeId });
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

  // Create a truncated description for the collapsed state
  const shortDescription = place.description?.length > 100 
    ? `${place.description.substring(0, 100)}...` 
    : place.description;
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
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
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Detail</Text>
          </View>
          
          <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
            <Ionicons 
              name={favorite ? "heart" : "heart-outline"} 
              size={24} 
              color={favorite ? "#FF5A5F" : "white"} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.mainContent}>
            {/* Title and Rating */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{place.name}</Text>
              <View style={styles.locationRatingRow}>
                <View style={styles.locationPin}>
                  <Ionicons name="location" size={16} color={COLORS.primary} />
                  <Text style={styles.locationText}>
                    {place.address?.split(',').slice(0, 2).join(', ') || place.location}
                  </Text>
                </View>
                
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{place.rating?.toFixed(1) || '0.0'}</Text>
                </View>
              </View>
            </View>
            
            {/* Common Facilities - MOVED ABOVE DESCRIPTION */}
            <View style={styles.facilitiesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cơ sở vật chất</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>Xem thêm</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.facilitiesContainer}>
                <FacilityItem icon="snow-outline" name="AC" />
                <FacilityItem icon="restaurant-outline" name="Restaurant" />
                <FacilityItem icon="water-outline" name="Swimming Pool" />
                <FacilityItem icon="time-outline" name="24-Hours Front Desk" />
              </View>
            </View>

            {/* Description Section */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.description}>
                {expandedDescription ? place.description : shortDescription}
              </Text>
              {place.description?.length > 100 && (
                <TouchableOpacity onPress={toggleDescription}>
                  <Text style={styles.readMoreText}>
                    {expandedDescription ? 'Thu gọn' : 'Xem thêm'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Reviews */}
            <View style={styles.reviewsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Đánh giá</Text>
                <TouchableOpacity onPress={navigateToAllReviews}>
                  <Text style={styles.seeAllText}>Xem thêm</Text>
                </TouchableOpacity>
              </View>
              
              {reviews && reviews.length > 0 ? (
                <ReviewsSection 
                  placeId={place.id}
                  reviews={reviews.slice(0, 2)} 
                />
              ) : (
                <View style={styles.emptyReviewsContainer}>
                  <Text style={styles.emptyReviewsText}>
                    Hãy trở thành người đầu tiên đánh giá!
                  </Text>
                </View>
              )}

              {/* Add review button - only show if user can review */}
              {canReview && (
                <TouchableOpacity 
                  style={styles.addReviewButton}
                  onPress={() => setShowReviewModal(true)}
                >
                  <Ionicons name="star-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.addReviewText}>Đánh giá</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Recommendations */}
            <View style={styles.recommendationsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tương tự</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>Xem thêm</Text>
                </TouchableOpacity>
              </View>
              
              {/* <View style={styles.recommendationsHeader}>
                <Text style={styles.recommendationsHeaderTitle}>Gợi ý cho bạn</Text>
                <TouchableOpacity>
                  <Text style={styles.recommendationsHeaderSeeAll}>Tất cả</Text>
                </TouchableOpacity>
              </View> */}

              {recommendations && recommendations.length > 0 ? (
                <FlatList
                  data={recommendations}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `recommendation-${item.id}`}
                  renderItem={({ item }) => (
                    <RecommendationItem 
                      item={item}
                      onPress={() => handleRecommendationPress(item.id)}
                    />
                  )}
                  contentContainerStyle={styles.recommendationsContainer}
                />
              ) : (
                <View style={styles.emptyRecommendationsContainer}>
                  <Text style={styles.emptyRecommendationsText}>
                    Không có gợi ý nào
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom spacing to account for fixed bottom bar */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </View>
      
      {/* Fixed Bottom Bar - Price and Book Now */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Giá</Text>
          <Text style={styles.priceValue}>
            {formatPrice(place.price || 0)} VND
          </Text>
        </View>
        
        <CustomButton
          title="Booking Now"
          onPress={handleBookNow}
          style={styles.bookButton}
        />
      </View>

      {/* Review Modal */}
      <AddReviewModal
        visible={showReviewModal}
        onClose={(reviewSubmitted) => {
          setShowReviewModal(false);
          if (reviewSubmitted) handleReviewAdded();
        }}
        placeId={place.id}
        rating={0} // Default rating
      />
    </View>
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
  contentContainer: {
    flex: 1,
  },
  imageCarouselContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: 250,
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
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    padding: SIZES.padding.large,
  },
  titleContainer: {
    marginBottom: SIZES.padding.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.small,
  },
  locationRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationPin: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.borderRadius.small,
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  descriptionSection: {
    marginBottom: SIZES.padding.large,
  },
  facilitiesSection: {
    marginBottom: SIZES.padding.large,
  },
  reviewsSection: {
    marginBottom: SIZES.padding.large,
  },
  recommendationsSection: {
    marginBottom: SIZES.padding.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  readMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 8,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  facilityItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
  },
  facilityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 12,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  emptyReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding.large,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
  },
  emptyReviewsText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    marginTop: SIZES.padding.medium,
  },
  addReviewText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding.small,
  },
  recommendationsHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  recommendationsHeaderSeeAll: {
    fontSize: 14,
    color: COLORS.primary,
  },
  recommendationsContainer: {
    paddingRight: SIZES.padding.large,
  },
  recommendationItem: {
    width: width * 0.8,
    backgroundColor: COLORS.background.primary,
    borderRadius: SIZES.borderRadius.medium,
    marginRight: SIZES.padding.medium,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  recommendationImage: {
    width: '100%',
    height: 150,
  },
  recommendationContent: {
    padding: SIZES.padding.medium,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  recommendationAddress: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  recommendationBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recommendationRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  emptyRecommendationsContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
  },
  emptyRecommendationsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  // Fixed bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    zIndex: 999, // Ensure it stays on top
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  bookButton: {
    width: '60%',
  },
});

export default PlaceDetailsScreen;