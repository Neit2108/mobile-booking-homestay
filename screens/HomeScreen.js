import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar,
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
import { getTopRatedPlaces, getAllPlaces } from '../api/places';

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
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Homestay', 'Địa điểm', 'Đi lại'];

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        // Load top rated places for the Popular section
        const topRated = await getTopRatedPlaces(5);
        setPopularPlaces(topRated);
        
        // Load all places for other sections
        const allPlaces = await getAllPlaces();
        setPlaces(allPlaces);
        
        // Sort differently for recommended places (could be based on user preferences in a real app)
        const recommended = [...allPlaces].sort((a, b) => b.numOfRating - a.numOfRating);
        setRecommendedPlaces(recommended);
        
        // For BestToday, pick places with special offers or best ratings
        const bestToday = [...allPlaces]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);
        setBestTodayPlaces(bestToday);
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

  // Navigate to AllPlaces screen with the appropriate data
  const handleSeeAllPopular = () => {
    console.log('See All Popular clicked');
    navigation.navigate('AllPlaces', { 
      title: 'Most Popular', 
      data: places,
      sourceType: 'popular'
    });
  };

  const handleSeeAllRecommended = () => {
    console.log('See All Recommended clicked');
    navigation.navigate('AllPlaces', { 
      title: 'Recommended For You', 
      data: places,
      sourceType: 'recommended'
    });
  };

  const handleSeeAllBestToday = () => {
    console.log('See All Best Today clicked');
    navigation.navigate('AllPlaces', { 
      title: 'Best Today', 
      data: places,
      sourceType: 'bestToday'
    });
  };
  
  const handlePlacePress = (place) => {
    navigation.navigate('PlaceDetails', { id: place.id });
  };

  // Navigate to search screen
  const navigateToSearch = () => {
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