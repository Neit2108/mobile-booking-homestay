import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Components
import FilterSearchModal from "../../components/modals/FilterSearchModal";

// API
import { searchPlaces, getAllPlaces } from "../../api/places";

// Constants and Utils
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { formatPrice } from "../../utils/formatPrice";

const RecentSearchItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.recentSearchItem} onPress={onPress}>
    <View style={styles.recentSearchIconContainer}>
      <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
    </View>
    <View style={styles.recentSearchContent}>
      <Text style={styles.recentSearchText}>{item.name}</Text>
      <Text style={styles.recentSearchLocation}>{item.location}</Text>
    </View>
  </TouchableOpacity>
);

const RecentlyViewedItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.recentlyViewedItem} onPress={onPress}>
    <Image 
      source={{ uri: item.imageUrl || item.images?.[0]?.imageUrl || "https://source.unsplash.com/random/300x200/?hotel" }} 
      style={styles.recentlyViewedImage} 
    />
    <View style={styles.recentlyViewedContent}>
      <View style={styles.recentlyViewedHeader}>
        <Text style={styles.recentlyViewedName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating?.toFixed(1) || "0.0"}</Text>
        </View>
      </View>
      <Text style={styles.recentlyViewedLocation}>{item.location || item.address}</Text>
      <Text style={styles.recentlyViewedPrice}>
        <Text style={styles.priceValue}>{formatPrice(item.price)}</Text> VND/ngày
      </Text>
    </View>
  </TouchableOpacity>
);

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState({});

  // Load recent items on mount
  useEffect(() => {
    loadRecentItems();
  }, []);

  const loadRecentItems = async () => {
    try {
      setLoading(true);
      const topPlaces = await getAllPlaces({ limit: 5 });
      setRecentlyViewed(topPlaces.slice(0, 3));
      
      // Load recent searches from AsyncStorage in a real app
      const savedRecentSearches = [
        { id: "1", name: "Homestay Sương Thu", location: "Đà Nẵng" },
        { id: "2", name: "Homestay", location: "Hà Nội" },
        { id: "3", name: "Home", location: "Phú Quốc" },
      ];
      setRecentSearches(savedRecentSearches);
    } catch (error) {
      console.error("Error loading recent items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Save search to recent searches
      const newSearch = {
        id: Date.now().toString(),
        name: searchQuery,
        location: "",
      };

      // Check if already exists
      const existingIndex = recentSearches.findIndex(
        (item) => item.name.toLowerCase() === searchQuery.toLowerCase()
      );

      if (existingIndex === -1) {
        setRecentSearches((prev) => [newSearch, ...prev.slice(0, 4)]);
      }

      navigation.navigate("SearchResults", { 
        query: searchQuery,
        filters: filtersApplied
      });
    }
  };

  const handleClearAll = () => {
    setRecentSearches([]);
  };

  const handleRecentItemPress = (item) => {
    setSearchQuery(item.name);
    navigation.navigate("SearchResults", {
      query: item.name,
      location: item.location,
      filters: filtersApplied
    });
  };

  const handleViewedItemPress = (item) => {
    navigation.navigate("PlaceDetails", { id: item.id });
  };

  const handleSeeAll = () => {
    navigation.navigate("RecentlyViewed");
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleApplyFilters = (filters) => {
    setFiltersApplied(filters);
    setFilterModalVisible(false);
    
    // If there's a search query, navigate to results with both query and filters
    if (searchQuery.trim()) {
      navigation.navigate("SearchResults", { 
        query: searchQuery,
        filters: filters
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background.primary}
      />


      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <Ionicons
          name="search"
          size={20}
          color={COLORS.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={COLORS.text.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <View>
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
                    <TouchableOpacity onPress={handleClearAll}>
                      <Text style={styles.clearAllText}>Xóa tất cả</Text>
                    </TouchableOpacity>
                  </View>

                  {recentSearches.map(item => (
                    <RecentSearchItem
                      key={item.id}
                      item={item}
                      onPress={() => handleRecentItemPress(item)}
                    />
                  ))}
                </View>
              )}

              {recentlyViewed.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Đã xem gần đây</Text>
                    <TouchableOpacity onPress={handleSeeAll}>
                      <Text style={styles.seeAllText}>Xem tất cả</Text>
                    </TouchableOpacity>
                  </View>

                  {recentlyViewed.map(item => (
                    <RecentlyViewedItem
                      key={item.id.toString()}
                      item={item}
                      onPress={() => handleViewedItemPress(item)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
          
          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Filter Modal */}
      <FilterSearchModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filtersApplied}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
  },
  backButton: {
    padding: SIZES.padding.small,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  bookmarkButton: {
    padding: SIZES.padding.small,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SIZES.padding.large,
    marginVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.medium,
    height: 50,
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SIZES.padding.small,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: COLORS.text.primary,
  },
  filterButton: {
    padding: SIZES.padding.small,
  },
  section: {
    marginBottom: SIZES.padding.large,
    paddingHorizontal: SIZES.padding.large,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding.medium,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  clearAllText: {
    fontSize: 14,
    color: "#FF6B8B",
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recentSearchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.padding.medium,
  },
  recentSearchContent: {
    flex: 1,
  },
  recentSearchText: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  recentSearchLocation: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  recentlyViewedItem: {
    flexDirection: "row",
    backgroundColor: COLORS.background.primary,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SIZES.padding.medium,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  recentlyViewedImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.background.secondary,
  },
  recentlyViewedContent: {
    flex: 1,
    padding: SIZES.padding.medium,
    justifyContent: "space-between",
  },
  recentlyViewedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentlyViewedName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text.primary,
    maxWidth: "70%",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  recentlyViewedLocation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginVertical: 4,
  },
  recentlyViewedPrice: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  bottomSpace: {
    height: 50,
  },
});

export default SearchScreen;