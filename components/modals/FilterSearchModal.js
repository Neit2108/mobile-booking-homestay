import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';

import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { formatPrice } from '../../utils/formatPrice';

const { width, height } = Dimensions.get('window');

/**
 * Location button component for selecting locations
 */
const LocationButton = ({ location, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.locationButton,
      isSelected && styles.locationButtonSelected
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text 
      style={[
        styles.locationButtonText,
        isSelected && styles.locationButtonTextSelected
      ]}
    >
      {location}
    </Text>
  </TouchableOpacity>
);

/**
 * Rating button component for selecting ratings
 */
const RatingButton = ({ rating, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.ratingButton,
      isSelected && styles.ratingButtonSelected
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons name="star" size={16} color={isSelected ? 'white' : "#FFD700"} />
    <Text 
      style={[
        styles.ratingButtonText,
        isSelected && styles.ratingButtonTextSelected
      ]}
    >
      {rating}
    </Text>
  </TouchableOpacity>
);

/**
 * Facility checkbox component for selecting facilities
 */
const FacilityCheckbox = ({ name, isChecked, onToggle, icon }) => (
  <TouchableOpacity 
    style={styles.facilityItem}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <View style={styles.facilityInfo}>
      {icon && <Ionicons name={icon} size={18} color={COLORS.primary} style={styles.facilityIcon} />}
      <Text style={styles.facilityName}>{name}</Text>
    </View>
    <View
      style={[
        styles.checkbox,
        isChecked && styles.checkboxChecked
      ]}
    >
      {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
    </View>
  </TouchableOpacity>
);

/**
 * Sort option component for selecting sort criteria
 */
const SortOption = ({ title, icon, isSelected, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.sortOption,
      isSelected && styles.sortOptionSelected
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.sortOptionContent}>
      <Ionicons 
        name={icon} 
        size={18} 
        color={isSelected ? 'white' : COLORS.primary} 
        style={styles.sortOptionIcon}
      />
      <Text style={[
        styles.sortOptionText,
        isSelected && styles.sortOptionTextSelected
      ]}>
        {title}
      </Text>
    </View>
    {isSelected && (
      <Ionicons name="checkmark" size={18} color="white" />
    )}
  </TouchableOpacity>
);

/**
 * Main FilterSearchModal component
 */
const FilterSearchModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
  // Define filter state with default values
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000000,
    guests: 2,
    instantBook: false,
    location: '',
    facilities: [],
    rating: 0,
    sortBy: '',
    ...initialFilters,
  });
  
  // Animation values for modal
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Animate modal when visibility changes
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  // Update filters when initialFilters changes
  useEffect(() => {
    if (visible && initialFilters) {
      setFilters({
        priceMin: initialFilters.priceMin || 0,
        priceMax: initialFilters.priceMax || 10000000,
        guests: initialFilters.guests || 2,
        instantBook: initialFilters.instantBook || false,
        location: initialFilters.location || '',
        facilities: initialFilters.facilities || [],
        rating: initialFilters.rating || 0,
        sortBy: initialFilters.sortBy || '',
      });
    }
  }, [initialFilters, visible]);

  // Toggle instant book option
  const toggleInstantBook = () => {
    setFilters({
      ...filters,
      instantBook: !filters.instantBook,
    });
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setFilters({
      ...filters,
      location: location === filters.location ? '' : location,
    });
  };

  // Toggle facility selection
  const toggleFacility = (facility) => {
    const currentFacilities = [...filters.facilities];
    if (currentFacilities.includes(facility)) {
      setFilters({
        ...filters,
        facilities: currentFacilities.filter(f => f !== facility),
      });
    } else {
      setFilters({
        ...filters,
        facilities: [...currentFacilities, facility],
      });
    }
  };

  // Handle rating selection
  const handleRatingSelect = (rating) => {
    setFilters({
      ...filters,
      rating: rating === filters.rating ? 0 : rating,
    });
  };

  // Handle sort option selection
  const handleSortOptionChange = (option) => {
    setFilters(prev => ({
      ...prev,
      sortBy: prev.sortBy === option ? '' : option
    }));
  };

  // Handle guest count changes
  const handleGuestsChange = (increment) => {
    let newValue = filters.guests + increment;
    if (newValue < 1) newValue = 1;
    if (newValue > 10) newValue = 10; // Maximum 10 guests
    
    setFilters({
      ...filters,
      guests: newValue
    });
  };

  // Reset all filters to defaults
  const handleReset = () => {
    setFilters({
      priceMin: 0,
      priceMax: 10000000,
      guests: 2,
      instantBook: false,
      location: '',
      facilities: [],
      rating: 0,
      sortBy: '',
    });
  };

  // Apply selected filters
  const handleApply = () => {
    onApply(filters);
  };

  // Close modal with animation
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Available locations (should be fetched from API in real app)
  const locations = ['Ha Noi', 'Ho Chi Minh City', 'Da Nang', 'Nha Trang', 'Da Lat'];

  // Available facilities
  const facilities = [
    { id: 'wifi', name: 'Free Wifi', icon: 'wifi-outline' },
    { id: 'pool', name: 'Swimming Pool', icon: 'water-outline' },
    { id: 'parking', name: 'Free Parking', icon: 'car-outline' },
    { id: 'breakfast', name: 'Breakfast Included', icon: 'restaurant-outline' },
    { id: 'ac', name: 'Air Conditioning', icon: 'snow-outline' },
  ];

  // Available ratings
  const ratings = [5, 4, 3, 2, 1];

  // Sort options
  const sortOptions = [
    { id: 'highest-rating', title: 'Highest Rating', icon: 'star' },
    { id: 'most-rated', title: 'Most Reviewed', icon: 'people' },
    { id: 'price-low-high', title: 'Price: Low to High', icon: 'trending-up' },
    { id: 'price-high-low', title: 'Price: High to Low', icon: 'trending-down' },
  ];

  // Get active filters count for badge
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceMin > 0) count++;
    if (filters.priceMax < 10000000) count++;
    if (filters.location) count++;
    if (filters.facilities.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.instantBook) count++;
    if (filters.sortBy) count++;
    if (filters.guests > 2) count++; // Only count if different from default
    
    return count;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContent,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  Filter By
                  {getActiveFiltersCount() > 0 && (
                    <View style={styles.filterCountBadge}>
                      <Text style={styles.filterCountText}>
                        {getActiveFiltersCount()}
                      </Text>
                    </View>
                  )}
                </Text>
                <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Guest Count */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Guests</Text>
                  <View style={styles.guestsControl}>
                    <TouchableOpacity 
                      style={[styles.guestButton, filters.guests <= 1 && styles.guestButtonDisabled]} 
                      onPress={() => handleGuestsChange(-1)}
                      disabled={filters.guests <= 1}
                    >
                      <Ionicons name="remove" size={20} color={filters.guests <= 1 ? COLORS.text.placeholder : COLORS.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.guestCount}>{filters.guests}</Text>
                    <TouchableOpacity 
                      style={[styles.guestButton, filters.guests >= 10 && styles.guestButtonDisabled]} 
                      onPress={() => handleGuestsChange(1)}
                      disabled={filters.guests >= 10}
                    >
                      <Ionicons name="add" size={20} color={filters.guests >= 10 ? COLORS.text.placeholder : COLORS.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Price Range */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Price Range</Text>
                  <View style={styles.priceRangeContainer}>
                    <Text style={styles.priceRangeText}>
                      {formatPrice(filters.priceMin)} - {formatPrice(filters.priceMax)} VNĐ
                    </Text>
                  </View>
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={10000000}
                      step={100000}
                      value={filters.priceMin}
                      onValueChange={(value) => setFilters({...filters, priceMin: value})}
                      minimumTrackTintColor={COLORS.primary}
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor={COLORS.primary}
                    />
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={10000000}
                      step={100000}
                      value={filters.priceMax}
                      onValueChange={(value) => setFilters({...filters, priceMax: value})}
                      minimumTrackTintColor={COLORS.primary}
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor={COLORS.primary}
                    />
                  </View>
                </View>

                {/* Instant Book */}
                <View style={styles.filterSection}>
                  <View style={styles.instantBookRow}>
                    <View style={styles.instantBookInfo}>
                      <Text style={styles.filterLabel}>Instant Book</Text>
                      <Text style={styles.instantBookDescription}>Book without waiting for the host to respond</Text>
                    </View>
                    <Switch
                      value={filters.instantBook}
                      onValueChange={toggleInstantBook}
                      trackColor={{ false: COLORS.border, true: `${COLORS.primary}80` }}
                      thumbColor={filters.instantBook ? COLORS.primary : 'white'}
                      ios_backgroundColor={COLORS.border}
                    />
                  </View>
                </View>

                {/* Location */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Location</Text>
                  <View style={styles.locationButtonsContainer}>
                    {locations.map((location) => (
                      <LocationButton
                        key={location}
                        location={location}
                        isSelected={filters.location === location}
                        onPress={() => handleLocationSelect(location)}
                      />
                    ))}
                  </View>
                </View>

                {/* Facilities */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Facilities</Text>
                  <View style={styles.facilitiesContainer}>
                    {facilities.map((facility) => (
                      <FacilityCheckbox
                        key={facility.id}
                        name={facility.name}
                        icon={facility.icon}
                        isChecked={filters.facilities.includes(facility.id)}
                        onToggle={() => toggleFacility(facility.id)}
                      />
                    ))}
                  </View>
                </View>

                {/* Ratings */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Ratings</Text>
                  <View style={styles.ratingsContainer}>
                    {ratings.map((rating) => (
                      <RatingButton
                        key={rating}
                        rating={rating}
                        isSelected={filters.rating === rating}
                        onPress={() => handleRatingSelect(rating)}
                      />
                    ))}
                  </View>
                </View>

                {/* Sort Options */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Sort By</Text>
                  
                  {sortOptions.map(option => (
                    <SortOption
                      key={option.id}
                      title={option.title}
                      icon={option.icon}
                      isSelected={filters.sortBy === option.id}
                      onPress={() => handleSortOptionChange(option.id)}
                    />
                  ))}
                </View>
              </ScrollView>
              
              {/* Footer with Reset and Apply buttons */}
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={styles.resetButton} 
                  onPress={handleReset}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetButtonText}>Reset All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton} 
                  onPress={handleApply}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyButtonText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Extra padding for iOS
    maxHeight: '90%',
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    position: 'relative',
    paddingRight: 25, // Space for badge
  },
  filterCountBadge: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterSection: {
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.small,
  },
  priceRangeContainer: {
    marginBottom: SIZES.padding.small,
  },
  priceRangeText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  sliderContainer: {
    marginVertical: SIZES.padding.small,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  instantBookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instantBookInfo: {
    flex: 1,
    paddingRight: SIZES.padding.medium,
  },
  instantBookDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.padding.small,
  },
  locationButton: {
    paddingVertical: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    backgroundColor: COLORS.background.secondary,
    marginRight: SIZES.padding.small,
    marginBottom: SIZES.padding.small,
    ...SHADOWS.small,
  },
  locationButtonSelected: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  locationButtonText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  locationButtonTextSelected: {
    color: 'white',
  },
  facilitiesContainer: {
    marginTop: SIZES.padding.small,
  },
  facilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
    paddingVertical: SIZES.padding.small,
  },
  facilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  facilityIcon: {
    marginRight: SIZES.padding.small,
  },
  facilityName: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  ratingsContainer: {
    flexDirection: 'row',
    marginTop: SIZES.padding.small,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    backgroundColor: COLORS.background.secondary,
    marginRight: SIZES.padding.small,
    ...SHADOWS.small,
  },
  ratingButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  ratingButtonText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  ratingButtonTextSelected: {
    color: 'white',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.medium,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SIZES.padding.small,
    ...SHADOWS.small,
  },
  sortOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortOptionIcon: {
    marginRight: SIZES.padding.small,
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  sortOptionTextSelected: {
    color: 'white',
  },
  guestsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.padding.small,
  },
  guestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  guestButtonDisabled: {
    opacity: 0.5,
  },
  guestCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: SIZES.padding.large,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: SIZES.padding.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.medium,
  },
  resetButtonText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: SIZES.padding.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.medium,
    ...SHADOWS.small,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default FilterSearchModal;