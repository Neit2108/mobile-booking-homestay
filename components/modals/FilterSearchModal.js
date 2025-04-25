import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  ScrollView,
} from 'react-native';

import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const LocationButton = ({ location, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.locationButton,
      isSelected && styles.locationButtonSelected
    ]}
    onPress={onPress}
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

const RatingButton = ({ rating, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.ratingButton,
      isSelected && styles.ratingButtonSelected
    ]}
    onPress={onPress}
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

const FacilityCheckbox = ({ name, isChecked, onToggle, icon }) => (
  <View style={styles.facilityItem}>
    <Text style={styles.facilityName}>{name}</Text>
    <TouchableOpacity
      style={[
        styles.checkbox,
        isChecked && styles.checkboxChecked
      ]}
      onPress={onToggle}
    >
      {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
    </TouchableOpacity>
  </View>
);

const FilterSearchModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 500,
    guests: 2,
    instantBook: false,
    location: '',
    facilities: [],
    rating: 0,
    ...initialFilters,
  });

  useEffect(() => {
    if (initialFilters) {
      setFilters({
        priceMin: initialFilters.priceMin || 0,
        priceMax: initialFilters.priceMax || 500,
        guests: initialFilters.guests || 2,
        instantBook: initialFilters.instantBook || false,
        location: initialFilters.location || '',
        facilities: initialFilters.facilities || [],
        rating: initialFilters.rating || 0,
        ...initialFilters,
      });
    }
  }, [initialFilters, visible]);

  const handlePriceChange = (values) => {
    setFilters({
      ...filters,
      priceMin: values[0],
      priceMax: values[1],
    });
  };

  const toggleInstantBook = () => {
    setFilters({
      ...filters,
      instantBook: !filters.instantBook,
    });
  };

  const handleLocationSelect = (location) => {
    setFilters({
      ...filters,
      location: location === filters.location ? '' : location,
    });
  };

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

  const handleRatingSelect = (rating) => {
    setFilters({
      ...filters,
      rating: rating === filters.rating ? 0 : rating,
    });
  };

  const handleReset = () => {
    setFilters({
      priceMin: 0,
      priceMax: 500,
      guests: 2,
      instantBook: false,
      location: '',
      facilities: [],
      rating: 0,
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  // Available locations
  const locations = ['San Diego', 'New York', 'Amsterdam'];

  // Available facilities
  const facilities = [
    { id: 'wifi', name: 'Free Wifi', icon: 'wifi' },
    { id: 'pool', name: 'Swimming Pool', icon: 'water' },
    { id: 'tv', name: 'TV', icon: 'tv' },
    { id: 'laundry', name: 'Laundry', icon: 'shirt' },
  ];

  // Available ratings
  const ratings = [5, 4, 3, 2, 1];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Filter By</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Placeholder</Text>
                  <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                      {filters.guests} Guest ({Math.ceil(filters.guests/2)} Adult, {Math.floor(filters.guests/2)} Children)
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.text.primary} />
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Price</Text>
                  <View style={styles.priceRangeContainer}>
                    <Text style={styles.priceRangeText}>${filters.priceMin} - ${filters.priceMax}</Text>
                  </View>
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={500}
                      step={10}
                      value={filters.priceMin}
                      onValueChange={(value) => setFilters({...filters, priceMin: value})}
                      minimumTrackTintColor={COLORS.primary}
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor={COLORS.primary}
                    />
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={500}
                      step={10}
                      value={filters.priceMax}
                      onValueChange={(value) => setFilters({...filters, priceMax: value})}
                      minimumTrackTintColor={COLORS.primary}
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor={COLORS.primary}
                    />
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <View style={styles.instantBookRow}>
                    <View>
                      <Text style={styles.filterLabel}>Instant Book</Text>
                      <Text style={styles.instantBookDescription}>Book without waiting for the host to respond</Text>
                    </View>
                    <Switch
                      value={filters.instantBook}
                      onValueChange={toggleInstantBook}
                      trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      thumbColor="white"
                    />
                  </View>
                </View>

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

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Facilities</Text>
                  <View style={styles.facilitiesContainer}>
                    {facilities.map((facility) => (
                      <FacilityCheckbox
                        key={facility.id}
                        name={facility.name}
                        isChecked={filters.facilities.includes(facility.id)}
                        onToggle={() => toggleFacility(facility.id)}
                        icon={facility.icon}
                      />
                    ))}
                  </View>
                </View>

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
              </ScrollView>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
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
    paddingBottom: 20,
    maxHeight: '90%',
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
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.text.primary,
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
  },
  locationButtonSelected: {
    backgroundColor: COLORS.primary,
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
  },
  facilityName: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
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
  applyButton: {
    margin: SIZES.padding.large,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default FilterSearchModal;