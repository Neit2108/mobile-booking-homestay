import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// API
import { getPlaceReviews } from '../../api/places';

// Theme
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const RatingBar = ({ rating, count, index, totalCount }) => {
  // Calculate percentage width for the bar
  const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
  
  return (
    <View style={styles.ratingBar}>
      <Text style={styles.ratingNumber}>{index}</Text>
      <View style={styles.ratingBarBackground}>
        <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.ratingCount}>{count}</Text>
    </View>
  );
};

const ReviewItem = ({ review }) => {
  // Format date
  const formattedDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '';
  
  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image 
          source={{ uri: review.senderAvatar || 'https://via.placeholder.com/100' }} 
          style={styles.reviewerAvatar} 
        />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{review.senderName || 'Anonymous'}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.reviewRating}>{review.rating?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.reviewContent}>{review.content}</Text>
      
      {review.images && review.images.length > 0 && (
        <FlatList
          horizontal
          data={review.images}
          keyExtractor={(item, index) => `img-${index}`}
          renderItem={({ item }) => (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.reviewImage}
              resizeMode="cover"
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reviewImagesContainer}
        />
      )}
      
      <Text style={styles.reviewDate}>{formattedDate}</Text>
    </View>
  );
};

const AllReviewsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { placeId, placeName, reviews: initialReviews, rating, reviewCount } = route.params || {};
  
  const [reviews, setReviews] = useState(initialReviews || []);
  const [loading, setLoading] = useState(!initialReviews || initialReviews.length === 0);
  const [error, setError] = useState(null);
  
  // Calculate rating distribution
  const [ratingDistribution, setRatingDistribution] = useState({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });
  
  useEffect(() => {
    if (!initialReviews || initialReviews.length === 0) {
      fetchReviews();
    } else {
      calculateRatingDistribution(initialReviews);
    }
  }, [initialReviews, placeId]);
  
  const fetchReviews = async () => {
    if (!placeId) return;
    
    try {
      setLoading(true);
      const data = await getPlaceReviews(placeId);
      setReviews(data);
      calculateRatingDistribution(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
      // Use empty reviews array to show empty state
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateRatingDistribution = (reviewsData) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviewsData.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
    
    setRatingDistribution(distribution);
  };
  
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  const handleFilterPress = () => {
    // Implement filter functionality here
    console.log('Filter reviews');
  };

  // Calculate total reviews for display
  const totalReviews = reviewCount || reviews.length || 0;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <TouchableOpacity onPress={handleFilterPress} style={styles.filterButton}>
          <Ionicons name="filter" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReviews}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item, index) => `review-${item.id || index}`}
          ListHeaderComponent={() => (
            <View style={styles.ratingOverview}>
              <View style={styles.ratingColumn}>
                <Text style={styles.ratingValue}>{rating?.toFixed(1) || '0.0'}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={`star-${star}`}
                      name="star"
                      size={16}
                      color={star <= Math.round(rating) ? "#FFD700" : "#DDDDDD"}
                      style={styles.starIcon}
                    />
                  ))}
                </View>
                <Text style={styles.reviewCountText}>
                  Based on {totalReviews} reviews
                </Text>
              </View>
              
              <View style={styles.ratingsBarContainer}>
                {[5, 4, 3, 2, 1].map((index) => (
                  <RatingBar
                    key={`bar-${index}`}
                    rating={rating}
                    count={ratingDistribution[index] || 0}
                    index={index}
                    totalCount={totalReviews}
                  />
                ))}
              </View>
            </View>
          )}
          renderItem={({ item }) => <ReviewItem review={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Be the first to write a review!
              </Text>
            </View>
          )}
        />
      )}
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
  backButton: {
    padding: SIZES.padding.small,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  filterButton: {
    padding: SIZES.padding.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    padding: SIZES.padding.large,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding.large * 2,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  ratingOverview: {
    flexDirection: 'row',
    padding: SIZES.padding.large,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SIZES.padding.large,
    ...SHADOWS.small,
  },
  ratingColumn: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingRight: SIZES.padding.medium,
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 5,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  reviewCountText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  ratingsBarContainer: {
    flex: 2,
    paddingLeft: SIZES.padding.medium,
    justifyContent: 'space-between',
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  ratingNumber: {
    width: 15,
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.text.secondary,
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  ratingCount: {
    width: 20,
    fontSize: 12,
    textAlign: 'right',
    color: COLORS.text.secondary,
  },
  reviewItem: {
    marginBottom: SIZES.padding.large,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.medium,
    ...SHADOWS.small,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.padding.medium,
  },
  reviewerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SIZES.padding.medium,
  },
  reviewerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  reviewContent: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    marginBottom: SIZES.padding.medium,
  },
  reviewImagesContainer: {
    marginBottom: SIZES.padding.medium,
  },
  reviewImage: {
    width: 120,
    height: 80,
    borderRadius: SIZES.borderRadius.small,
    marginRight: SIZES.padding.small,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
  }
});

export default AllReviewsScreen;