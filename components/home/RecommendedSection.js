import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import PlaceCard from '../cards/PlaceCard';

const RecommendedSection = ({ data = [], loading = false, onSeeAll, onPlacePress }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Only show first 2 items on home screen for a preview
  const displayData = data.slice(0, 2);

  return (
    <View style={styles.container}>
      {/* Add header with title and "See All" button */}
      <View style={styles.header}>
        <Text style={styles.title}>Gợi ý cho bạn</Text>
        <TouchableOpacity onPress={onSeeAll} testID="see-all-recommended">
          <Text style={styles.seeAll}>Tất cả</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={displayData}
        keyExtractor={(item) => `recommended-${item.id}`}
        renderItem={({ item }) => (
          <PlaceCard
            item={item}
            variant="horizontal"
            onPress={() => onPlacePress && onPlacePress(item)}
            onFavoritePress={() => {}}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có gợi ý nào</Text>
          </View>
        }
        scrollEnabled={false}
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
});

export default RecommendedSection;