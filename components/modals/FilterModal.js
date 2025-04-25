import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';

import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { formatPrice } from '../../utils/formatPrice';

const FilterModal = ({ visible, onClose, onApply, initialFilters }) => {
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 1000,
    rating: 0,
    ...initialFilters,
  });

  useEffect(() => {
    if (initialFilters) {
      setFilters({
        priceMin: initialFilters.priceMin || 0,
        priceMax: initialFilters.priceMax || 1000,
        rating: initialFilters.rating || 0,
      });
    }
  }, [initialFilters]);

  const handleReset = () => {
    setFilters({
      priceMin: 0,
      priceMax: 1000,
      rating: 0,
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  const renderStars = (count) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => setFilters({ ...filters, rating: index + 1 })}
          style={styles.starButton}
        >
          <Ionicons
            name={index < count ? 'star' : 'star-outline'}
            size={24}
            color={index < count ? '#FFD700' : COLORS.text.secondary}
          />
        </TouchableOpacity>
      ));
  };

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
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Filters</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.content}>
                {/* Price Range */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Price Range</Text>
                  <View style={styles.priceLabels}>
                    <Text style={styles.priceLabel}>{formatPrice(filters.priceMin)} VNĐ</Text>
                    <Text style={styles.priceLabel}>{formatPrice(filters.priceMax)} VNĐ</Text>
                  </View>
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={1000}
                      step={10}
                      value={filters.priceMin}
                      onValueChange={(value) => setFilters({ ...filters, priceMin: value })}
                      minimumTrackTintColor={COLORS.primary}
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor={COLORS.primary}
                    />
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={1000}
                      step={10}
                      value={filters.priceMax}
                      onValueChange={(value) => setFilters({ ...filters, priceMax: value })}
                      minimumTrackTintColor={COLORS.primary}
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor={COLORS.primary}
                    />
                  </View>
                </View>
                
                {/* Rating */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Rating</Text>
                  <View style={styles.starsContainer}>
                    {renderStars(filters.rating)}
                  </View>
                  <Text style={styles.ratingLabel}>
                    {filters.rating > 0 ? `${filters.rating} stars & up` : 'Any rating'}
                  </Text>
                </View>
              </ScrollView>
              
              <View style={styles.footer}>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
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
  container: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30, // Safe area for bottom
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SIZES.padding.small,
  },
  content: {
    paddingHorizontal: SIZES.padding.large,
    maxHeight: 400,
  },
  section: {
    marginVertical: SIZES.padding.medium,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.medium,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding.small,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  sliderContainer: {
    marginBottom: SIZES.padding.small,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding.small,
  },
  starButton: {
    marginRight: SIZES.padding.small,
  },
  ratingLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: SIZES.padding.small,
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
  },
  applyButton: {
    flex: 1,
    paddingVertical: SIZES.padding.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.medium,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default FilterModal;