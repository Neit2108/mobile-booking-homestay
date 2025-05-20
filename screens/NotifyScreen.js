import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Text, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from '../components/NotificationItem';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Tạo component riêng cho notification item để có thể sử dụng hooks
const NotificationItemAnimated = React.memo(({ item, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index]);
  
  return (
    <Animated.View 
      style={[
        styles.notificationCard, 
        { 
          transform: [{ scale: scaleAnim }],
          backgroundColor: item.read ? COLORS.background.primary : COLORS.background.highlight,
        }
      ]}
    >
      <NotificationItem notification={item} />
      {!item.read && <View style={styles.unreadIndicator} />}
    </Animated.View>
  );
});

export const NotifyScreen = () => {
  const { notifications, loading, error, refresh } = useNotifications();
  const [filterActive, setFilterActive] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    refresh();
    
    // Tạo hiệu ứng fade in khi màn hình được load
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [refresh]);

  // Lọc thông báo theo trạng thái
  const filteredNotifications = notifications.filter(item => {
    if (filterActive === 'all') return true;
    if (filterActive === 'unread') return !item.read;
    return true;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filterActive === 'all' && styles.filterButtonActive]} 
          onPress={() => setFilterActive('all')}
        >
          <Text style={[styles.filterText, filterActive === 'all' && styles.filterTextActive]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filterActive === 'unread' && styles.filterButtonActive]} 
          onPress={() => setFilterActive('unread')}
        >
          <Text style={[styles.filterText, filterActive === 'unread' && styles.filterTextActive]}>Chưa đọc</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#FFF" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
      <Text style={styles.emptyText}>Các thông báo mới sẽ xuất hiện tại đây</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
        <Text style={styles.refreshButtonText}>Làm mới</Text>
        <Ionicons name="refresh-outline" size={16} color="#FFF" style={styles.refreshIcon} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderError = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={[styles.emptyIconContainer, { backgroundColor: COLORS.error }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#FFF" />
      </View>
      <Text style={styles.emptyTitle}>Có lỗi xảy ra</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={[styles.refreshButton, { backgroundColor: COLORS.error }]} onPress={refresh}>
        <Text style={styles.refreshButtonText}>Thử lại</Text>
        <Ionicons name="refresh-outline" size={16} color="#FFF" style={styles.refreshIcon} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderItem = ({ item, index }) => (
    <NotificationItemAnimated item={item} index={index} />
  );

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
        {renderHeader()}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      {renderHeader()}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item, index) => `${item.createdAt}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContainer,
          filteredNotifications.length === 0 && styles.emptyList
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={error ? renderError : renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  headerContainer: {
    backgroundColor: COLORS.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 5,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  notificationCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.text.secondary,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.text.secondary,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  refreshIcon: {
    marginLeft: 4,
  }
});