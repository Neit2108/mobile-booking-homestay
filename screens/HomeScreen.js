import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

// Components
import Header from "../components/home/Header";
import LocationBanner from "../components/home/LocationBanner";
import PopularSection from "../components/home/PopularSection";
import CategoryTabs from "../components/home/CategoryTabs";
import RecommendedSection from "../components/home/RecommendedSection";
import BestTodaySection from "../components/home/BestTodaySection";
import { NotificationDropdown } from "../components/NotificationDropdown";

// API
import { getTopRatedPlaces, getAllPlaces } from "../api/places";

// Theme
import { COLORS, SIZES } from "../constants/theme";

// Context
import { useAuth } from "../context/AuthContext";

const HomeScreen = () => {
  console.log("Rendering HomeScreen"); // Debug log

  const navigation = useNavigation();
  const { user } = useAuth();
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [bestTodayPlaces, setBestTodayPlaces] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const categories = ["Tất cả", "Homestay", "Địa điểm", "Đi lại"];

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaces(); // Gọi lại API
  };

  const updatePlaceFavourite = (placeId, isFav) => {
    const updateList = (list) =>
      list.map((p) => (p.id === placeId ? { ...p, isFavourite: isFav } : p));

    setPlaces((prev) => updateList(prev));
    setPopularPlaces((prev) => updateList(prev));
    setRecommendedPlaces((prev) => updateList(prev));
    setBestTodayPlaces((prev) => updateList(prev));
  };

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      // Load top rated places for the Popular section
      const topRated = await getTopRatedPlaces(5);
      setPopularPlaces(topRated);

      // Load all places for other sections
      const allPlaces = await getAllPlaces();
      setPlaces(allPlaces);

      const recommended = [...allPlaces].sort(
        (a, b) => b.numOfRating - a.numOfRating
      );
      setRecommendedPlaces(recommended);

      const bestToday = [...allPlaces]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      setBestTodayPlaces(bestToday);
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleSeeAll = () => {
    console.log("See All ");
    navigation.navigate("AllPlaces", {
      title: "Tất cả",
      data: places,
      sourceType: "all",
    });
  };

  const handleSeeAllPopular = () => {
    console.log("See All Popular clicked");
    navigation.navigate("AllPlaces", {
      title: "Nổi tiếng",
      data: places,
      sourceType: "popular",
    });
  };

  const handleSeeAllRecommended = () => {
    console.log("See All Recommended clicked");
    navigation.navigate("AllPlaces", {
      title: "Gợi ý cho bạn",
      data: places,
      sourceType: "recommended",
    });
  };

  const handleSeeAllBestToday = () => {
    console.log("See All Best Today clicked");
    navigation.navigate("AllPlaces", {
      title: "Lựa chọn hôm nay",
      data: places,
      sourceType: "bestToday",
    });
  };

  const handleFavouriteChange = (placeId, newFav) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, isFavourite: newFav } : p))
    );
  };

  const handlePlacePress = (place) => {
    navigation.navigate("PlaceDetails", {
      id: place.id,
      onToggleFavourite: handleFavouriteChange,
    });
  };

  // Navigate to search screen
  const navigateToSearch = () => {
    navigation.navigate("Search");
  };

  // Navigate to notifications
  const navigateToNotifications = () => {
    setShowNotifications(true);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigation.navigate('Notify');
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background.primary}
      />

      <Header
        name={user?.fullName || "Guest"}
        location={user?.homeAddress || "San Diego, CA"}
        avatar={user?.avatarUrl}
        onSearchPress={navigateToSearch}
        onNotificationPress={navigateToNotifications}
      />

      <NotificationDropdown
        visible={showNotifications}
        onClose={handleCloseNotifications}
        onViewAll={handleViewAllNotifications}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        <LocationBanner onPress={handleSeeAll} />

        <PopularSection
          data={popularPlaces}
          loading={loading}
          onSeeAll={handleSeeAllPopular}
          onPlacePress={handlePlacePress}
          updatePlaceFavourite={updatePlaceFavourite}
        />

        <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>

        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        <RecommendedSection
          data={recommendedPlaces}
          loading={loading}
          onSeeAll={handleSeeAllRecommended}
          onPlacePress={handlePlacePress}
          updatePlaceFavourite={updatePlaceFavourite}
        />

        <BestTodaySection
          data={bestTodayPlaces}
          loading={loading}
          onSeeAll={handleSeeAllBestToday}
          onPlacePress={handlePlacePress}
          updatePlaceFavourite={updatePlaceFavourite}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: SIZES.padding.large,
    marginTop: SIZES.padding.large,
    marginBottom: SIZES.padding.small,
  },
});

export default HomeScreen;
