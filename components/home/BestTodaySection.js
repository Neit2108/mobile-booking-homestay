import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import PlaceCard from '../cards/PlaceCard';

const BestTodaySection = ({ data = [], loading = false, onSeeAll }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Best Today </Text>
          <Ionicons name="flame" size={18} color="#FF6B00" style={styles.fireIcon} />
        </View>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => `best-today-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          // Some items might have a discount price
          const hasDiscount = item.originalPrice && item.originalPrice > item.price;
          
          return (
            <TouchableOpacity 
              style={styles.cardContainer}
              activeOpacity={0.9}
              onPress={() => {}}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.imageUrl || item.images?.[0]?.imageUrl }} 
                  style={styles.image}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => {}}
                >
                  <Ionicons name="heart-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.locationText} numberOfLines={1}>{item.location || item.address}</Text>
                </View>
                
                <View style={styles.priceContainer}>
                  {hasDiscount && (
                    <Text style={styles.originalPrice}>${item.originalPrice}</Text>
                  )}
                  <Text style={styles.price}>${item.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No special deals today</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.padding.large,
    marginBottom: SIZES.padding.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  fireIcon: {
    marginLeft: 4,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: SIZES.padding.large,
    paddingBottom: SIZES.padding.small,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: 180,
    marginRight: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    backgroundColor: COLORS.background.primary,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: SIZES.padding.small,
  },
  placeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  emptyContainer: {
    width: 200,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default BestTodaySection;