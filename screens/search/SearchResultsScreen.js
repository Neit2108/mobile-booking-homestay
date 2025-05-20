import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Components
import PlaceCard from '../../components/cards/PlaceCard';
import FilterModal from '../../components/modals/FilterModal';

// API
import { searchPlaces, getAllPlaces } from '../../api/places';

// Custom hooks
import { useHomestayFiltering } from '../../hooks/useHomestayFiltering';

// Theme
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { query = '', location = '', filters: routeFilters = {} } = route.params || {};
  
  const [localSearchQuery, setLocalSearchQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(true);
  const [allPlaces, setAllPlaces] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [localFilters, setLocalFilters] = useState(routeFilters);
  
  // Initialize filtering hook with all places
  const {
    filteredPlaces,
    setSearchTerm,
    setPriceRange,
    setRatingFilter,
    setSortOption,
    resetFilters,
    currentPage,
    setCurrentPage,
    getPaginatedResults
  } = useHomestayFiltering(allPlaces);

  // Fetch places on initial load
  useEffect(() => {
    fetchPlaces();
  }, []);

  // Apply route filters whenever they change
  useEffect(() => {
    if (query) {
      setSearchTerm(query);
    }
    
    if (routeFilters) {
      if (routeFilters.priceMin !== undefined || routeFilters.priceMax !== undefined) {
        setPriceRange({
          min: routeFilters.priceMin || 0,
          max: routeFilters.priceMax || 10000000
        });
      }
      
      if (routeFilters.rating) {
        setRatingFilter(routeFilters.rating.toString());
      }
      
      if (routeFilters.sortBy) {
        setSortOption(routeFilters.sortBy);
      }
      
      setLocalFilters(routeFilters);
    }
  }, [query, routeFilters]);

  const fetchPlaces = async () => {
    try {
      setIsLoading(true);
      
      // First, get all places so we have a complete dataset to filter locally
      const allPlacesData = await getAllPlaces();
      setAllPlaces(allPlacesData);
      
      // This ensures we have data even if the search API fails
      if (query.trim()) {
        setSearchTerm(query.trim());
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (localSearchQuery.trim() !== query) {
      // Update UI immediately
      setSearchTerm(localSearchQuery);
      
      // Navigate with new query to refresh route params
      navigation.setParams({ 
        query: localSearchQuery,
        location,
        filters: localFilters
      });
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePlacePress = (place) => {
    navigation.navigate('PlaceDetails', { id: place.id });
  };

  const handleApplyFilters = (newFilters) => {
    // Apply filters locally
    if (newFilters.priceMin !== undefined || newFilters.priceMax !== undefined) {
      setPriceRange({
        min: newFilters.priceMin,
        max: newFilters.priceMax
      });
    }
    
    if (newFilters.rating) {
      setRatingFilter(newFilters.rating.toString());
    }
    
    if (newFilters.sortBy) {
      setSortOption(newFilters.sortBy);
    }
    
    setLocalFilters(newFilters);
    
    setFilterModalVisible(false);
  };

  const handleResetAllFilters = () => {
    resetFilters();
    setLocalSearchQuery('');
    setLocalFilters({});
    navigation.setParams({ 
      query: '', 
      location: '', 
      filters: {} 
    });
  };

  const { items: paginatedPlaces, totalPages } = getPaginatedResults(10);
  
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const updatePlaceFavourite = (placeId, isFav) => {
  setPlaces((prev) =>
    prev.map((p) =>
      p.id === placeId ? { ...p, isFavourite: isFav } : p
    )
  );
};


  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={50} color={COLORS.text.secondary} />
      <Text style={styles.emptyText}>Không tìm thấy</Text>
      <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
      <TouchableOpacity style={styles.resetButton} onPress={handleResetAllFilters}>
        <Text style={styles.resetButtonText}>Reset All Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả tìm kiếm</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places"
            value={localSearchQuery}
            onChangeText={setLocalSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholderTextColor={COLORS.text.placeholder}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Search Info */}
      <View style={styles.searchInfoContainer}>
        <Text style={styles.searchInfo}>
          {query ? `Results for "${query}"` : 'All Places'}
          {location ? ` in ${location}` : ''}
        </Text>
        <Text style={styles.resultCount}>
          {filteredPlaces.length} kết quả được tìm thấy
        </Text>
      </View>
      
      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={paginatedPlaces}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PlaceCard
              key={item.id + "-" + item.isFavourite}
              item={item}
              variant="horizontal"
              onPress={() => handlePlacePress(item)}
              style={styles.placeCard}
              updatePlaceFavourite={updatePlaceFavourite}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyComponent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={localFilters}
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
  },
  backButton: {
    padding: SIZES.padding.small,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholderRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SIZES.padding.medium,
    marginRight: SIZES.padding.medium,
  },
  searchIcon: {
    marginRight: SIZES.padding.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.borderRadius.medium,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInfoContainer: {
    paddingHorizontal: SIZES.padding.large,
    paddingBottom: SIZES.padding.medium,
  },
  searchInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  resultCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: SIZES.padding.large,
    paddingBottom: SIZES.padding.large * 2,
  },
  placeCard: {
    marginBottom: SIZES.padding.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: SIZES.padding.large * 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding.large,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SIZES.padding.medium,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: SIZES.padding.small,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: SIZES.padding.large,
    paddingVertical: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.medium,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.medium,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SearchResultsScreen;