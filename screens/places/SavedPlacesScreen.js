import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { getFavouritesByUser } from '../../api/favourites';
import { COLORS, SIZES } from '../../constants/theme';
import SearchInput from '../../components/forms/SearchInput';
import EmptyState from '../../components/common/EmptyState';

const SavedPlaceScreen = () => {
  const navigation = useNavigation();
  const [favourites, setFavourites] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFavouritesByUser();
      setFavourites(data);
      filterResults(data, searchQuery);
    } catch (err) {
      console.error('Failed to load favourites:', err);
      setError('Không thể tải danh sách đã lưu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavourites();
  }, []);

  const filterResults = (data, query) => {
    const lower = query.toLowerCase();
    const filteredList = data.filter(item =>
      item.name.toLowerCase().includes(lower) ||
      item.address.toLowerCase().includes(lower)
    );
    setFiltered(filteredList);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterResults(favourites, query);
  };

  const handlePress = (item) => {
    navigation.navigate('PlaceDetails', { id: item.id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.images || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đã lưu</Text>
        <Ionicons name="heart" size={24} color={COLORS.primary} />
      </View>

      <SearchInput
        placeholder="Tìm kiếm địa điểm..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.search}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              icon="heart-dislike-outline"
              title="Không có địa điểm"
              message="Bạn chưa lưu địa điểm nào"
            />
          }
          contentContainerStyle={{ paddingHorizontal: SIZES.padding.large, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
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
    padding: SIZES.padding.large,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  search: {
    marginHorizontal: SIZES.padding.large,
    marginBottom: SIZES.padding.medium,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    marginBottom: SIZES.padding.medium,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 80,
  },
  info: {
    flex: 1,
    padding: SIZES.padding.small,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  address: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default SavedPlaceScreen;
