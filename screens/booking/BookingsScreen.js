import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// API
import { getUserBookings } from '../../api/bookings';

// Components
import BookingCard from '../../components/booking/BookingCard';
import SearchInput from '../../components/forms/SearchInput';
import BookingTabs from '../../components/booking/BookingTabs';
import EmptyState from '../../components/common/EmptyState.js';

// Constants and Utils
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const BookingsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // State
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Booked'); // 'Booked' or 'History'
  
  // Fetch bookings on component mount and when user changes
  useEffect(() => {
    fetchBookings();
  }, [user]);
  
  // Fetch bookings from API
  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass the user ID directly if available
      const userId = user?.id || user?.userId || user?._id;
      console.log('Fetching bookings with userId:', userId);
      console.log('User object:', JSON.stringify(user, null, 2));
      
      const bookingsData = await getUserBookings(userId);
      console.log('Bookings data received:', bookingsData ? bookingsData.length : 'none');
      
      if (bookingsData && Array.isArray(bookingsData)) {
        if (bookingsData.length > 0) {
          console.log('First booking sample:', JSON.stringify(bookingsData[0], null, 2));
        } else {
          console.log('No bookings found in response');
        }
        
        setBookings(bookingsData);
        filterBookings(bookingsData, searchQuery, activeTab);
      } else {
        console.error('Invalid bookings data:', bookingsData);
        setError('Received invalid booking data format');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);
  
  // Filter bookings based on search query and active tab
  const filterBookings = useCallback((bookingsData, query, tab) => {
    if (!bookingsData) return;
    
    console.log('Filtering bookings:', bookingsData.length, 'tab:', tab, 'query:', query);
    
    let filtered = [...bookingsData];
    
    // Filter by tab - handle both uppercase and lowercase status
    if (tab === 'Booked') {
      filtered = filtered.filter(booking => {
        const status = (booking.Status || booking.status || '').toLowerCase();
        return status === 'pending' || status === 'confirmed';
      });
    } else {
      filtered = filtered.filter(booking => {
        const status = (booking.Status || booking.status || '').toLowerCase();
        return status === 'completed' || status === 'cancelled';
      });
    }
    
    // Filter by search query
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      filtered = filtered.filter(booking => 
        ((booking.PlaceName || booking.placeName || '') + '').toLowerCase().includes(lowerCaseQuery) ||
        ((booking.PlaceAddress || booking.placeAddress || booking.address || '') + '').toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // Sort by start date, most recent first
    filtered.sort((a, b) => {
      const dateA = new Date(a.StartDate || a.startDate || 0);
      const dateB = new Date(b.StartDate || b.startDate || 0);
      return dateB - dateA;
    });
    
    console.log('Filtered bookings:', filtered.length);
    setFilteredBookings(filtered);
  }, []);
  
  // Handle search query change
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    filterBookings(bookings, query, activeTab);
  }, [bookings, activeTab, filterBookings]);
  
  // Handle tab change
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    filterBookings(bookings, searchQuery, tab);
  }, [bookings, searchQuery, filterBookings]);
  
  // Navigate to booking details
  const handleBookingPress = useCallback((booking) => {
    // Handle different possible ID property names
    const bookingId = booking.Id || booking.id;
    console.log('Navigate to booking details:', bookingId);
    navigation.navigate('BookingDetails', { bookingId });
  }, [navigation]);
  
  // Render booking item
  const renderBookingItem = useCallback(({ item }) => {
    console.log('Rendering booking item:', item.id || item.Id);
    return (
      <BookingCard
        booking={item}
        onPress={() => handleBookingPress(item)}
      />
    );
  }, [handleBookingPress]);
  
  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (loading) return null;
    
    console.log('Rendering empty state. Loading:', loading, 'Filtered bookings:', filteredBookings.length);
    
    return (
      <EmptyState
        icon="calendar-outline"
        title="No bookings found"
        message={
          searchQuery 
            ? "We couldn't find any bookings matching your search" 
            : activeTab === 'Booked' 
              ? "You don't have any active bookings" 
              : "You don't have any booking history yet"
        }
      />
    );
  }, [loading, searchQuery, activeTab, filteredBookings.length]);
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Booking</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Search input */}
      <SearchInput
        placeholder="Search..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />
      
      {/* Booking Tabs */}
      <BookingTabs
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        style={styles.tabs}
      />
      
      {/* Loading indicator */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Bookings list */}
      {!loading && !error && (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderBookingItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerButton: {
    padding: SIZES.padding.small,
  },
  searchInput: {
    marginHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  tabs: {
    marginHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.large,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SIZES.padding.medium,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.medium,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.small,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding.large,
    paddingBottom: 100, // Extra space for bottom tab bar
  },
});

export default BookingsScreen;