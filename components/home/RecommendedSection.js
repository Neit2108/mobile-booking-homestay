import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import PlaceCard from '../cards/PlaceCard';

const { width } = Dimensions.get('window');

const RecommendedSection = ({ data = [], loading = false, onSeeAll, onPlacePress, variant = 'vertical', updatePlaceFavourite }) => {

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Only show first 2 items on home screen for a preview in vertical layout
  const displayData = variant === 'vertical' ? data.slice(0, 2) : data;

  // Determine FlatList props based on variant
  const flatListProps = {
    data: displayData,
    keyExtractor: (item) => `recommended-${item.id}`,
    renderItem: ({ item }) => (
      <PlaceCard
        key={item.id + "-" + item.isFavourite}
        item={item}
        variant={variant === 'horizontal' ? 'horizontal-slim' : 'horizontal'}
        onPress={() => onPlacePress && onPlacePress(item)}
        style={variant === 'horizontal' ? styles.horizontalCard : {}}
        updatePlaceFavourite={updatePlaceFavourite}
      />
    ),
    contentContainerStyle: variant === 'horizontal' ? styles.horizontalListContent : styles.listContent,
    scrollEnabled: variant === 'horizontal',
    horizontal: variant === 'horizontal',
    showsHorizontalScrollIndicator: false
  };

  return (
    <View style={styles.container}>
      {/* Only show header if header props provided */}
      {onSeeAll && (
        <View style={styles.header}>
          {/* <Text style={styles.title}>Gợi ý cho bạn</Text> */}
          {/* <TouchableOpacity onPress={onSeeAll} testID="see-all-recommended">
            <Text style={styles.seeAll}>Tất cả</Text>
          </TouchableOpacity> */}
        </View>
      )}
      
      <FlatList
        {...flatListProps}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có gợi ý nào</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.padding.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: SIZES.padding.large,
  },
  horizontalListContent: {
    paddingLeft: SIZES.padding.large,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.small,
    marginHorizontal: SIZES.padding.large,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  horizontalCard: {
    width: width * 0.7,
    marginRight: SIZES.padding.medium,
  }
});

export default RecommendedSection;