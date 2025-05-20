import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { formatPrice } from '../../utils/formatPrice';

const FilterModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000000, // 10 million VND as default max
    rating: 0,
    sortBy: '',
    ...initialFilters,
  });

  // Text input states for price range (to avoid slider issues)
  const [minPriceText, setMinPriceText] = useState(filters.priceMin.toString());
  const [maxPriceText, setMaxPriceText] = useState(filters.priceMax.toString());

  useEffect(() => {
    if (visible && initialFilters) {
      setFilters({
        priceMin: initialFilters.priceMin || 0,
        priceMax: initialFilters.priceMax || 10000000,
        rating: initialFilters.rating || 0,
        sortBy: initialFilters.sortBy || '',
      });
      
      setMinPriceText(initialFilters.priceMin?.toString() || '0');
      setMaxPriceText(initialFilters.priceMax?.toString() || '10000000');
    }
  }, [initialFilters, visible]);

  const handleReset = () => {
    setFilters({
      priceMin: 0,
      priceMax: 10000000,
      rating: 0,
      sortBy: '',
    });
    setMinPriceText('0');
    setMaxPriceText('10000000');
  };

  const handleApply = () => {
    // Ensure price values are numbers before applying
    const appliedFilters = {
      ...filters,
      priceMin: parseInt(minPriceText, 10) || 0,
      priceMax: parseInt(maxPriceText, 10) || 10000000
    };
    
    onApply(appliedFilters);
  };

  const handleSortOptionChange = (option) => {
    setFilters(prev => ({
      ...prev,
      sortBy: prev.sortBy === option ? '' : option // Toggle off if already selected
    }));
  };

  const renderStars = (count) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => setFilters({ ...filters, rating: index + 1 === filters.rating ? 0 : index + 1 })}
          style={styles.starButton}
        >
          <Ionicons
            name={index < filters.rating ? 'star' : 'star-outline'}
            size={24}
            color={index < filters.rating ? '#FFD700' : COLORS.text.secondary}
          />
        </TouchableOpacity>
      ));
  };

  // Handle price input changes
  const handlePriceInputChange = (value, isMin) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (isMin) {
      setMinPriceText(numericValue);
      setFilters(prev => ({ ...prev, priceMin: parseInt(numericValue, 10) || 0 }));
    } else {
      setMaxPriceText(numericValue);
      setFilters(prev => ({ ...prev, priceMax: parseInt(numericValue, 10) || 10000000 }));
    }
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
                <Text style={styles.title}>Lọc Homestay</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.content}>
                {/* Price Range */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Khoảng giá</Text>
                  
                  {/* Price input fields instead of sliders */}
                  <View style={styles.priceInputContainer}>
                    <View style={styles.priceInputWrapper}>
                      <Text style={styles.priceInputLabel}>Giá thấp nhất</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={minPriceText}
                        onChangeText={(text) => handlePriceInputChange(text, true)}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <Text style={styles.priceCurrency}>VNĐ</Text>
                    </View>
                    
                    <View style={styles.priceSeparator}>
                      <Text style={styles.priceSeparatorText}>đến</Text>
                    </View>
                    
                    <View style={styles.priceInputWrapper}>
                      <Text style={styles.priceInputLabel}>Giá cao nhất</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={maxPriceText}
                        onChangeText={(text) => handlePriceInputChange(text, false)}
                        keyboardType="numeric"
                        placeholder="10,000,000"
                      />
                      <Text style={styles.priceCurrency}>VNĐ</Text>
                    </View>
                  </View>
                  
                  {/* Price display */}
                  <Text style={styles.priceRangeDisplay}>
                    {formatPrice(parseInt(minPriceText, 10) || 0)} - {formatPrice(parseInt(maxPriceText, 10) || 10000000)} VNĐ
                  </Text>
                </View>
                
                {/* Rating */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Đánh giá</Text>
                  <View style={styles.starsContainer}>
                    {renderStars(filters.rating)}
                  </View>
                  <Text style={styles.ratingLabel}>
                    {filters.rating > 0 ? `${filters.rating} sao trở lên` : "Bất kỳ"}
                  </Text>
                </View>

                {/* Sort Options */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sắp xếp theo</Text>
                  
                  <TouchableOpacity 
                    style={[
                      styles.sortOption,
                      filters.sortBy === 'highest-rating' && styles.sortOptionSelected
                    ]}
                    onPress={() => handleSortOptionChange('highest-rating')}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      filters.sortBy === 'highest-rating' && styles.sortOptionTextSelected
                    ]}>
                      Đánh giá cao nhất
                    </Text>
                    {filters.sortBy === 'highest-rating' && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.sortOption,
                      filters.sortBy === 'most-rated' && styles.sortOptionSelected
                    ]}
                    onPress={() => handleSortOptionChange('most-rated')}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      filters.sortBy === 'most-rated' && styles.sortOptionTextSelected
                    ]}>
                      Đánh giá nhiều nhất
                    </Text>
                    {filters.sortBy === 'most-rated' && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.sortOption,
                      filters.sortBy === 'price-low-high' && styles.sortOptionSelected
                    ]}
                    onPress={() => handleSortOptionChange('price-low-high')}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      filters.sortBy === 'price-low-high' && styles.sortOptionTextSelected
                    ]}>
                      Giá thấp đến cao
                    </Text>
                    {filters.sortBy === 'price-low-high' && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.sortOption,
                      filters.sortBy === 'price-high-low' && styles.sortOptionSelected
                    ]}
                    onPress={() => handleSortOptionChange('price-high-low')}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      filters.sortBy === 'price-high-low' && styles.sortOptionTextSelected
                    ]}>
                      Giá cao đến thấp
                    </Text>
                    {filters.sortBy === 'price-high-low' && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              <View style={styles.footer}>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                  <Text style={styles.resetButtonText}>Đặt lại</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyButtonText}>Áp dụng</Text>
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
    maxHeight: 500,
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
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SIZES.padding.small,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  priceInput: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.small,
    paddingHorizontal: SIZES.padding.small,
    marginBottom: 4,
  },
  priceCurrency: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
  },
  priceSeparator: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceSeparatorText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  priceRangeDisplay: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: SIZES.padding.small,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding.small,
  },
  starButton: {
    marginRight: SIZES.padding.small,
    padding: 5, // Larger touch area
  },
  ratingLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: SIZES.padding.small,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.medium,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.small,
    marginBottom: SIZES.padding.small,
  },
  sortOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  sortOptionTextSelected: {
    color: 'white',
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