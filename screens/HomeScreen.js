import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Components
import Header from '../components/home/Header';
import LocationBanner from '../components/home/LocationBanner';
import PopularSection from '../components/home/PopularSection';
import CategoryTabs from '../components/home/CategoryTabs';
import RecommendedSection from '../components/home/RecommendedSection';
import BestTodaySection from '../components/home/BestTodaySection';

// API
import { getTopRatedPlaces } from '../api/places';

// Theme
import { COLORS, SIZES } from '../constants/theme';

// Context
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  console.log('Rendering HomeScreen'); // Debug log
  
  const navigation = useNavigation();
  const { user } = useAuth();
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [bestTodayPlaces, setBestTodayPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Homestay', 'Địa điểm', 'Đi lại'];

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const topRated = await getTopRatedPlaces(5);
        
        // For now, we'll use the same data for all sections
        // In a real app, you'd call different endpoints
        setPopularPlaces(topRated);
        setRecommendedPlaces(topRated.slice().reverse());
        setBestTodayPlaces(topRated.slice(0, 5));
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleSeeAllPopular = () => {
    navigation.navigate('AllPlaces', { title: 'Most Popular', data: popularPlaces });
  };

  const handleSeeAllRecommended = () => {
    navigation.navigate('AllPlaces', { title: 'Recommended For You', data: recommendedPlaces });
  };

  const handleSeeAllBestToday = () => {
    navigation.navigate('AllPlaces', { title: 'Best Today', data: bestTodayPlaces });
  };
  
  const handlePlacePress = (place) => {
    navigation.navigate('PlaceDetails', { id: place.id });
  };

  // Navigate to search screen
  const navigateToSearch = () => {
    console.log('Navigating to Search screen from HomeScreen');
    
    // List available routes for debugging
    const routes = navigation.getState()?.routes;
    console.log('Available routes:', routes.map(route => route.name));
    
    navigation.navigate('Search');
  };

  // Navigate to notifications
  const navigateToNotifications = () => {
    console.log('Navigate to notifications (not implemented)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      
      <Header 
        name={user?.fullName || 'Guest'}
        location={user?.location || 'San Diego, CA'}
        avatar={user?.avatarUrl}
        onSearchPress={navigateToSearch}
        onNotificationPress={navigateToNotifications}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LocationBanner />
        
        <PopularSection
          data={popularPlaces}
          loading={loading}
          onSeeAll={handleSeeAllPopular}
          onPlacePress={handlePlacePress}
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
        />
        
        <BestTodaySection
          data={bestTodayPlaces}
          loading={loading}
          onSeeAll={handleSeeAllBestToday}
          onPlacePress={handlePlacePress}
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
    fontWeight: 'bold',
    marginHorizontal: SIZES.padding.large,
    marginTop: SIZES.padding.large,
    marginBottom: SIZES.padding.small,
  },
});

export default HomeScreen;