import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { COLORS } from '../constants/theme';

export const NotificationDropdown = ({ visible, onClose, onViewAll }) => {
  const { notifications, loading, error, refresh } = useNotifications();
  const recentNotifications = notifications.slice(0, 5);

  useEffect(() => {
    if (visible) {
      refresh();
    }
  }, [visible, refresh]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.container, { backgroundColor: COLORS.background.primary }]}
          pointerEvents="box-none"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: COLORS.primary }]}>Thông báo gần đây</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: COLORS.primary, fontSize: 22, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text style={{ color: COLORS.error }}>{error}</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 8 }}>
                {recentNotifications.length === 0 ? (
                  <View style={styles.centered}>
                    <Text style={{ color: COLORS.text.secondary }}>
                      Chưa có thông báo nào
                    </Text>
                  </View>
                ) : (
                  recentNotifications.map((notification, index) => (
                    <View key={`${notification.createdAt}-${index}`} style={styles.notificationCard}>
                      <NotificationItem notification={notification} />
                    </View>
                  ))
                )}
              </ScrollView>
              <TouchableOpacity
                style={[styles.viewAllButton, { backgroundColor: COLORS.primary }]}
                onPress={onViewAll}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  container: {
    width: '92%',
    maxHeight: 420,
    borderRadius: 16,
    padding: 0,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: COLORS.background.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border || '#e0e0e0',
    marginHorizontal: 0,
  },
  scrollArea: {
    maxHeight: 260,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  centered: {
    padding: 20,
    alignItems: 'center',
  },
  viewAllButton: {
    marginTop: 0,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  viewAllText: {
    color: COLORS.background.primary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
}); 