import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
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

  // Only show first 2 items on home screen
  const displayData = data.slice(0, 2);

  return (
    <View style={styles.container}>
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
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.padding.small,
  },
  listContent: {
    paddingHorizontal: SIZES.padding.large,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecommendedSection;