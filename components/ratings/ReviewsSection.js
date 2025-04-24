import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

// API
import { getPlaceReviews } from '../../api/places';

const DEFAULT_AVATAR = 'https://i.pravatar.cc/100';

const ReviewItem = ({ review }) => {
  const createdDate = new Date(review.createdAt);
  const formattedDate = `${createdDate.toLocaleDateString()}`;
  
  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Image 
            source={{ uri: review.senderAvatar || DEFAULT_AVATAR }} 
            style={styles.reviewerAvatar} 
          />
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>{review.senderName || 'Anonymous'}</Text>
            <Text style={styles.reviewDate}>{formattedDate}</Text>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{review.rating}</Text>
        </View>
      </View>
      
      <Text style={styles.reviewContent}>{review.content}</Text>
      
      {review.images && review.images.length > 0 && (
        <FlatList
          horizontal
          data={review.images}
          keyExtractor={(item, index) => `review-image-${index}`}
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
    </View>
  );
};

const ReviewsSection = ({ placeId, reviews = [] }) => {
  const [loading, setLoading] = useState(false);
  const [localReviews, setLocalReviews] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      // Use reviews provided by the parent component
      setLocalReviews(reviews);
    } else {
      // If no reviews provided, fetch them
      fetchReviews();
    }
  }, [reviews, placeId]);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const reviewsData = await getPlaceReviews(placeId);
      setLocalReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReviews}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (localReviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Hãy trở thành người đầu tiên đánh giá!</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={localReviews}
        keyExtractor={(item, index) => `review-${item.id || index}`}
        renderItem={({ item }) => <ReviewItem review={item} />}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false} // Disable scrolling as parent ScrollView will handle it
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.padding.medium,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.padding.small,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.medium,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SIZES.padding.small,
  },
  retryButton: {
    paddingVertical: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.medium,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.small,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.text.secondary,
  },
  listContent: {
    paddingBottom: SIZES.padding.medium,
  },
  reviewItem: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.medium,
    marginBottom: SIZES.padding.medium,
    ...SHADOWS.small,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding.small,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.padding.small,
  },
  reviewerDetails: {
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.small,
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  reviewContent: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    marginBottom: SIZES.padding.small,
  },
  reviewImagesContainer: {
    marginTop: SIZES.padding.small,
  },
  reviewImage: {
    width: 100,
    height: 80,
    borderRadius: SIZES.borderRadius.small,
    marginRight: SIZES.padding.small,
  },
});

export default ReviewsSection;