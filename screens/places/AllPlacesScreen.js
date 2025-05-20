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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Components
import PlaceCard from '../../components/cards/PlaceCard';
import FilterModal from '../../components/modals/FilterModal';

// API
import { getAllPlaces, getTopRatedPlaces } from '../../api/places';

// Theme
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const AllPlacesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { title = 'All Places', data: initialData = [], sourceType = '' } = route.params || {};

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

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch places based on the source type if no initial data
  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      fetchPlacesByType();
    } else {
      setFilteredPlaces(initialData);
      // Tính tổng số trang khi có dữ liệu ban đầu
      setTotalPages(Math.ceil(initialData.length / itemsPerPage));
    }
  }, [initialData, sourceType]);

  // Fetch different types of place data based on source type
  const fetchPlacesByType = async () => {
    try {
      setLoading(true);
      let data = [];
      
      switch (sourceType) {
        case 'popular':
          data = await getTopRatedPlaces(10);
          break;
        case 'recommended':
          // Get all places and sort by number of ratings (more realistic would be based on user preferences)
          data = await getAllPlaces();
          data.sort((a, b) => b.numOfRating - a.numOfRating);
          break;
        case 'bestToday':
          // Get all places and sort by rating
          data = await getAllPlaces();
          data.sort((a, b) => b.rating - a.rating);
          break;
        default:
          data = await getAllPlaces();
      }
      
      setPlaces(data);
      setFilteredPlaces(data);
      
      // Tính tổng số trang
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // If search is cleared, reset to all places (with current filters applied)
      applyFilters(places, filters);
      return;
    }
    
    // Filter locally based on name or location
    const filtered = places.filter(
      place => 
        (place.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (place.location?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (place.address?.toLowerCase() || '').includes(query.toLowerCase())
    );
    
    setFilteredPlaces(filtered);
    // Reset về trang 1 và tính lại tổng số trang
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  // Apply price and rating filters
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
    
    // Apply sorting if specified
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
    // Reset về trang 1 và tính lại tổng số trang
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  // Handle filter application
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    
    // First filter by search query if any
    let searchResults = places;
    if (searchQuery) {
      searchResults = places.filter(
        place => 
          (place.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (place.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (place.address?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    
    // Then apply other filters
    applyFilters(searchResults, newFilters);
    
    setFilterModalVisible(false);
  };

  // Lấy dữ liệu theo trang hiện tại
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPlaces.slice(startIndex, endIndex);
  };

  // Điều hướng trang
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


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} style={styles.searchIcon} />
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
        >
          <Ionicons name="options-outline" size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Results counter */}
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCount}>
          {filteredPlaces.length} kết quả được tìm thấy
        </Text>
      </View>
      
      {/* Results */}
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={50} color={COLORS.text.secondary} />
                <Text style={styles.emptyText}>No places found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
              </View>
            }
          />
          
          {/* Pagination Controls */}
          {filteredPlaces.length > 0 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity 
                style={[
                  styles.paginationButton, 
                  currentPage === 1 && styles.paginationButtonDisabled
                ]} 
                onPress={goToPrevPage}
                disabled={currentPage === 1}
              >
                <Ionicons 
                  name="chevron-back" 
                  size={24} 
                  color={currentPage === 1 ? COLORS.text.placeholder : COLORS.primary} 
                />
              </TouchableOpacity>
              
              <Text style={styles.paginationText}>
                Trang {currentPage}
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.paginationButton, 
                  currentPage === totalPages && styles.paginationButtonDisabled
                ]} 
                onPress={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={currentPage === totalPages ? COLORS.text.placeholder : COLORS.primary} 
                />
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
  },
  backButton: {
    padding: SIZES.padding.small,
    marginLeft: -SIZES.padding.small,
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
  resultsCountContainer: {
    paddingHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  listContent: {
    paddingHorizontal: SIZES.padding.large,
    paddingBottom: SIZES.padding.large,
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
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SIZES.padding.medium,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: SIZES.padding.small,
    textAlign: 'center',
  },
  // Pagination styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
});

export default AllPlacesScreen;