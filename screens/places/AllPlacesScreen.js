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
import { getAllPlaces, searchPlaces } from '../../api/places';

// Theme
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const AllPlacesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { title, data: initialData } = route.params || { title: 'All Places', data: [] };

  const [places, setPlaces] = useState(initialData || []);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(!initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 1000,
    rating: 0,
  });

  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      fetchPlaces();
    } else {
      setFilteredPlaces(initialData);
    }
  }, [initialData]);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const data = await getAllPlaces();
      setPlaces(data);
      setFilteredPlaces(data);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // If search is cleared, reset to all places (with current filters applied)
      applyFilters(places, filters);
      return;
    }
    
    // Filter locally based on name or location
    const filtered = places.filter(
      place => 
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        (place.location && place.location.toLowerCase().includes(query.toLowerCase())) ||
        (place.address && place.address.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredPlaces(filtered);
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
    
    setFilteredPlaces(filtered);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    applyFilters(places, newFilters);
    setFilterModalVisible(false);
  };

  const handlePlacePress = (place) => {
    navigation.navigate('PlaceDetails', { id: place.id });
  };

  const handleBackPress = () => {
    navigation.goBack();
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
            placeholder="Search places"
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
      
      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PlaceCard
              item={item}
              variant="horizontal"
              onPress={() => handlePlacePress(item)}
              style={styles.placeCard}
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
  },
});

export default AllPlacesScreen;