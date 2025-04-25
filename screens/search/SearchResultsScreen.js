import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Constants
import { COLORS, SIZES } from '../../constants/theme';

const SearchResultsScreen = () => {
  console.log('Rendering SearchResultsScreen'); // Debug log
  
  const navigation = useNavigation();
  const route = useRoute();
  const { query, location } = route.params || {};
  
  console.log('Route params:', { query, location }); // Debug log
  
  // Handle back button press
  const handleBackPress = () => {
    console.log('Back button pressed in SearchResultsScreen'); // Debug log
    navigation.goBack();
  };

  // Navigate to search screen
  const navigateToSearch = () => {
    console.log('Navigating to Search from SearchResultsScreen'); // Debug log
    navigation.navigate('Search');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.searchInfo}>
          {query ? `Search results for: "${query}"` : 'All places'}
          {location ? ` in ${location}` : ''}
        </Text>
        
        {/* Simple button to navigate back to search */}
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={navigateToSearch}
        >
          <Ionicons name="search" size={20} color="white" />
          <Text style={styles.searchButtonText}>New Search</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
  },
  backButton: {
    padding: SIZES.padding.small,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
    padding: SIZES.padding.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInfo: {
    fontSize: 18,
    marginBottom: SIZES.padding.large,
    textAlign: 'center',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.medium,
    paddingHorizontal: SIZES.padding.large,
    borderRadius: SIZES.borderRadius.medium,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SIZES.padding.small,
  },
});

export default SearchResultsScreen;