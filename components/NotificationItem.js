import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export const NotificationItem = ({ notification }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
  };

  const formattedDate = formatDate(notification.createdAt);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background.primary }]}>
      <Text style={[styles.title, { color: COLORS.primary }]}>
        {notification.title}
      </Text>
      <Text style={[styles.message, { color: COLORS.text.primary }]}>
        {notification.message}
      </Text>
      <Text style={[styles.date, { color: COLORS.text.secondary }]}>
        {formattedDate}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    fontStyle: 'italic',
  },
}); 