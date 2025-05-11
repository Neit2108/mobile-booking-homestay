import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const CategoryIcon = ({ category }) => {
  let iconName;
  
  switch (category) {
    case 'Homestay':
      iconName = 'home';
      break;
    case 'Địa điểm':
      iconName = 'business';
      break;
    case 'Đi lại':
      iconName = 'train';
      break;
    default:
      iconName = 'grid';
  }
  
  return <Ionicons name={iconName} size={16} color="currentColor" />;
};

const CategoryTabs = ({ categories = [], selectedCategory, onSelectCategory }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = category === selectedCategory;
        
        return (
          
          <TouchableOpacity
            key={category}
            style={[
              styles.tab,
              isSelected && styles.selectedTab
            ]}
            onPress={() => onSelectCategory(category)}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <CategoryIcon category={category} />
              <Text
                style={[
                  styles.tabText,
                  isSelected && styles.selectedTabText
                ]}
              >
                {category}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  tab: {
    paddingVertical: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.medium,
    marginRight: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.large,
    backgroundColor: COLORS.background.secondary,
  },
  selectedTab: {
    backgroundColor: COLORS.primary,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  selectedTabText: {
    color: 'white',
  },
});

export default CategoryTabs;