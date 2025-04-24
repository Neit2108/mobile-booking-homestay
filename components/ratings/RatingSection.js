import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import AddReviewModal from '../modals/AddReviewModal';

const { width } = Dimensions.get('window');

/**
 * Mock data generator for rating distribution
 * In a real app, this would come from the API
 */
const generateMockRatingDistribution = (totalRatings) => {
  if (totalRatings === 0) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  // Generate realistic distribution - weighted toward higher ratings
  const distribution = {
    5: Math.floor(totalRatings * (0.4 + Math.random() * 0.2)), // 40-60%
    4: Math.floor(totalRatings * (0.2 + Math.random() * 0.1)), // 20-30%
    3: Math.floor(totalRatings * (0.1 + Math.random() * 0.1)), // 10-20%
    2: Math.floor(totalRatings * (0.05 + Math.random() * 0.05)), // 5-10%
    1: Math.floor(totalRatings * (0.02 + Math.random() * 0.03)), // 2-5%
  };
  
  // Ensure sum matches totalRatings
  const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (sum < totalRatings) {
    distribution[5] += (totalRatings - sum);
  } else if (sum > totalRatings) {
    let diff = sum - totalRatings;
    for (let i = 1; i <= 5; i++) {
      if (distribution[i] > diff) {
        distribution[i] -= diff;
        break;
      } else {
        diff -= distribution[i];
        distribution[i] = 0;
      }
    }
  }
  
  return distribution;
};

const RatingSection = ({ rating = 0, numOfRating = 0, placeId, onReviewAdded }) => {
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  
  useEffect(() => {
    // In a real app, we would fetch this data from the API
    // For now, we'll use mock data
    setRatingDistribution(generateMockRatingDistribution(numOfRating));
  }, [numOfRating]);
  
  const handleRatingSelect = (value) => {
    setSelectedRating(value);
    setReviewModalVisible(true);
  };
  
  const handleCloseModal = (reviewSubmitted) => {
    setReviewModalVisible(false);
    setSelectedRating(0);
    
    // If a review was submitted successfully, notify parent component
    if (reviewSubmitted && onReviewAdded) {
      onReviewAdded();
    }
  };
  
  // Calculate star fill based on rating
  const getStarColor = (value) => {
    if (value <= Math.floor(rating)) {
      return '#FFD700'; // Full star
    } else if (value - 1 < rating && rating < value) {
      return '#FFD700'; // Partial star (we'll use a full star for simplicity)
    }
    return '#E0E0E0'; // Empty star
  };
  
  // Calculate bar width based on count relative to max count
  const getBarWidth = (count) => {
    const maxCount = Math.max(...Object.values(ratingDistribution), 1);
    return Math.max(count / maxCount * 100, 5); // Min 5% to always show something
  };
  
  return (
    <View style={styles.container}>
      {/* Star Rating Display - clickable to add review */}
      <View style={styles.starsContainer}>
        <View style={styles.starRatingRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={`star-${value}`}
              onPress={() => handleRatingSelect(value)}
              style={styles.starButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="star"
                size={30}
                color={getStarColor(value)}
              />
            </TouchableOpacity>
          ))}
          <Text style={styles.ratingText}>
            Bấm vào đây
          </Text>
        </View>
      </View>
      
      {/* Rating Distribution */}
      <View style={styles.distributionContainer}>
        {/* Left column: Overall rating */}
        <View style={styles.overallRating}>
          <Text style={styles.overallRatingNumber}>{rating.toFixed(1)}</Text>
          <View style={styles.smallStarsContainer}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Ionicons 
                key={`small-star-${value}`}
                name="star" 
                size={16} 
                color={value <= Math.round(rating) ? '#FFD700' : '#E0E0E0'} 
                style={{ marginHorizontal: 1 }}
              />
            ))}
          </View>
          <Text style={styles.reviewsCount}>{numOfRating} đánh giá</Text>
        </View>
        
        {/* Right column: Distribution bars */}
        <View style={styles.barChartContainer}>
          {[5, 4, 3, 2, 1].map((value) => (
            <View key={`rating-bar-${value}`} style={styles.barRow}>
              <Text style={styles.barLabel}>{value}</Text>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${getBarWidth(ratingDistribution[value] || 0)}%` }
                  ]}
                />
              </View>
              <Text style={styles.barCount}>{ratingDistribution[value] || 0}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Review Modal */}
      <AddReviewModal
        visible={reviewModalVisible}
        onClose={handleCloseModal}
        placeId={placeId}
        rating={selectedRating}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  starsContainer: {
    marginBottom: SIZES.padding.medium,
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  starButton: {
    marginRight: 5,
    padding: 5, // Larger touch target
  },
  ratingText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  distributionContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.medium,
    ...SHADOWS.small,
  },
  overallRating: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingRight: SIZES.padding.medium,
    marginRight: SIZES.padding.medium,
  },
  overallRatingNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 5,
  },
  smallStarsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  reviewsCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  barChartContainer: {
    flex: 3,
    justifyContent: 'space-between',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  barLabel: {
    width: 20,
    fontSize: 14,
    color: COLORS.text.secondary,
    marginRight: 8,
    textAlign: 'center',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  barCount: {
    width: 30,
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginLeft: 8,
  },
});

export default RatingSection;