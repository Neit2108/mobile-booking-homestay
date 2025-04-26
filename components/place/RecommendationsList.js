import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

/**
 * Recommendation item component
 * 
 * @param {Object} item - The place data to display
 * @param {Function} onPress - Function to call when the item is pressed
 */
const RecommendationItem = ({ item, onPress }) => {
  // Calculate discounted price (20% higher than actual price for display purposes)
  const originalPrice = Math.round(item.price * 1.2);
  
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={() => onPress(item.id)} activeOpacity={0.9}>
      <Image
        source={{ uri: item.images?.[0]?.imageUrl || 'https://via.placeholder.com/150x100' }}
        style={styles.itemImage}
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemLocation} numberOfLines={1}>
          {item.address?.split(',')[0] || 'Location'}
        </Text>
        <View style={styles.itemBottom}>
          <View style={styles.itemRating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.itemRatingText}>
            {typeof item.rating === 'number' ? item.rating.toFixed(1) : 'Chưa có đánh giá'} ({item.numOfRating || 0})
            </Text>
          </View>
          <View style={styles.itemPrice}>
            <Text style={styles.oldPrice}>${originalPrice}</Text>
            <Text style={styles.newPrice}>${item.price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Recommendations list component
 * 
 * @param {Array} recommendations - Array of place objects to display as recommendations
 * @param {Function} onSeeAll - Function to call when "See All" is pressed
 * @param {Function} onItemPress - Function to call when a recommendation item is pressed
 * @param {number} maxItems - Maximum number of items to display (default: 5)
 * @param {Object} style - Additional styles for the container
 */
const RecommendationsList = ({ 
  recommendations = [], 
  onSeeAll, 
  onItemPress, 
  maxItems = 5, 
  style 
}) => {
  // If no recommendations, show empty message
  if (recommendations.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Text style={styles.title}>Recommendation</Text>
        </View>
        <Text style={styles.noRecommendationsText}>No recommendations available</Text>
      </View>
    );
  }

  // Limit to maxItems
  const displayItems = recommendations.slice(0, maxItems);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Recommendation</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={displayItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `recommendation-${item.id}`}
        renderItem={({ item }) => (
          <RecommendationItem item={item} onPress={onItemPress} />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.padding.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  noRecommendationsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingVertical: SIZES.padding.medium,
  },
  listContainer: {
    paddingBottom: SIZES.padding.small,
  },
  itemContainer: {
    width: width * 0.7,
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    marginRight: SIZES.padding.medium,
    overflow: 'hidden',
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemContent: {
    flex: 1,
    padding: SIZES.padding.medium,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  itemLocation: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRatingText: {
    fontSize: 12,
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldPrice: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  newPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default RecommendationsList;