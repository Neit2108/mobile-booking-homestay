import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Components
import PlaceCard from '../../components/cards/PlaceCard';
import FilterModal from '../../components/modals/FilterModal';

// API
import { getAllPlaces, getTopRatedPlaces } from '../../api/places';

// Theme
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const AllPlacesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { title = 'Tất cả địa điểm', data: initialData = [], sourceType = '' } = route.params || {};

  const [places, setPlaces] = useState(initialData || []);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(!initialData || initialData.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000000,
    rating: 0,
  });

  // Animation for button press feedback
  const scaleAnim = new Animated.Value(1);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      fetchPlacesByType();
    } else {
      setFilteredPlaces(initialData);
      setTotalPages(Math.ceil(initialData.length / itemsPerPage));
    }
  }, [initialData, sourceType]);

  const fetchPlacesByType = async () => {
    try {
      setLoading(true);
      let data = [];
      
      switch (sourceType) {
        case 'popular':
          data = await getTopRatedPlaces(10);
          break;
        case 'recommended':
          data = await getAllPlaces();
          data.sort((a, b) => b.numOfRating - a.numOfRating);
          break;
        case 'bestToday':
          data = await getAllPlaces();
          data.sort((a, b) => b.rating - a.rating);
          break;
        default:
          data = await getAllPlaces();
      }
      
      setPlaces(data);
      setFilteredPlaces(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      applyFilters(places, filters);
      return;
    }
    const filtered = places.filter(
      place => 
        (place.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (place.location?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (place.address?.toLowerCase() || '').includes(query.toLowerCase())
    );
    setFilteredPlaces(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const applyFilters = (placesToFilter, filterSettings) => {
    const filtered = placesToFilter.filter(place => {
      const price = place.price || 0;
      const rating = place.rating || 0;
      return (
        price >= filterSettings.priceMin &&
        price <= filterSettings.priceMax &&
        rating >= filterSettings.rating
      );
    });
    
    if (filterSettings.sortBy) {
      filtered.sort((a, b) => {
        switch (filterSettings.sortBy) {
          case 'price-low-high':
            return (a.price || 0) - (b.price || 0);
          case 'price-high-low':
            return (b.price || 0) - (a.price || 0);
          case 'highest-rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'most-rated':
            return (b.numOfRating || 0) - (a.numOfRating || 0);
          default:
            return 0;
        }
      });
    }
    
    setFilteredPlaces(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    let searchResults = places;
    if (searchQuery) {
      searchResults = places.filter(
        place => 
          (place.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (place.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (place.address?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    applyFilters(searchResults, newFilters);
    setFilterModalVisible(false);
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPlaces.slice(startIndex, endIndex);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePlacePress = (place) => {
    navigation.navigate('PlaceDetails', { id: place.id });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const updatePlaceFavourite = (placeId, isFav) => {
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, isFavourite: isFav } : p
      )
    );
  };

  const handleButtonPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons name="arrow-back" size={SIZES.large} color={COLORS.text.primary} />
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={SIZES.medium} color={COLORS.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm địa điểm..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={COLORS.text.placeholder}
          />
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons name="options-outline" size={SIZES.medium} color={COLORS.text.primary} />
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCount}>
          {filteredPlaces.length} kết quả được tìm thấy
        </Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          <FlatList
            data={getCurrentPageData()}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePlacePress(item)}
                style={styles.placeCardWrapper}
              >
                <PlaceCard
                  key={item.id + "-" + item.isFavourite}
                  item={item}
                  variant="horizontal"
                  style={styles.placeCard}
                  updatePlaceFavourite={updatePlaceFavourite}
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={SIZES.extraLarge * 2} color={COLORS.text.secondary} />
                <Text style={styles.emptyText}>Không tìm thấy địa điểm</Text>
                <Text style={styles.emptySubtext}>Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn</Text>
              </View>
            }
          />
          
          {/* Pagination Controls */}
          {filteredPlaces.length > 0 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage === 1 && styles.paginationButtonDisabled,
                ]}
                onPress={goToPrevPage}
                disabled={currentPage === 1}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Ionicons
                    name="chevron-back"
                    size={SIZES.large}
                    color={currentPage === 1 ? COLORS.text.placeholder : COLORS.primary}
                  />
                </Animated.View>
              </TouchableOpacity>
              
              <Text style={styles.paginationText}>
                Trang {currentPage} / {totalPages}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage === totalPages && styles.paginationButtonDisabled,
                ]}
                onPress={goToNextPage}
                disabled={currentPage === totalPages}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Ionicons
                    name="chevron-forward"
                    size={SIZES.large}
                    color={currentPage === totalPages ? COLORS.text.placeholder : COLORS.primary}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      
      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
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
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: SIZES.borderRadius.large,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  headerTitle: {
    fontSize: FONTS.sizes.title,
    ...FONTS.bold,
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  placeholderRight: {
    width: 48,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: SIZES.input.height,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.large,
    paddingHorizontal: SIZES.padding.medium,
    marginRight: SIZES.padding.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SIZES.padding.small,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.medium,
    ...FONTS.regular,
    color: COLORS.text.primary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: SIZES.borderRadius.large,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  resultsCountContainer: {
    paddingHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  resultsCount: {
    fontSize: FONTS.sizes.medium,
    ...FONTS.medium,
    color: COLORS.text.secondary,
  },
  listContent: {
    paddingHorizontal: SIZES.padding.large,
    paddingBottom: SIZES.padding.extraLarge,
  },
  placeCardWrapper: {
    marginBottom: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.large,
    backgroundColor: COLORS.background.primary,
    ...SHADOWS.medium,
  },
  placeCard: {
    borderRadius: SIZES.borderRadius.large,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  emptyContainer: {
    flex: 1,
    marginTop: SIZES.padding.extraLarge * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding.large,
  },
  emptyText: {
    fontSize: FONTS.sizes.large,
    ...FONTS.bold,
    color: COLORS.text.primary,
    marginTop: SIZES.padding.medium,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONTS.sizes.medium,
    ...FONTS.regular,
    color: COLORS.text.secondary,
    marginTop: SIZES.padding.small,
    textAlign: 'center',
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  paginationButton: {
    width: 48,
    height: 48,
    borderRadius: SIZES.borderRadius.large,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  paginationButtonDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.background.secondary,
  },
  paginationText: {
    fontSize: FONTS.sizes.medium,
    ...FONTS.medium,
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
});

export default AllPlacesScreen;