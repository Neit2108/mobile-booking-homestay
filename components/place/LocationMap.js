import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

/**
 * Location map component for displaying an address on a map
 * 
 * @param {string} address - The full address to display
 * @param {string} mapImageUrl - Optional image URL for the map (uses placeholder if not provided)
 * @param {Function} onOpenMap - Function to call when "Open Map" is pressed
 * @param {Object} style - Additional styles for the container
 */
const LocationMap = ({ 
  address, 
  mapImageUrl,
  onOpenMap,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Location</Text>
        {onOpenMap && (
          <TouchableOpacity onPress={onOpenMap}>
            <Text style={styles.openMapText}>Open Map</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.mapContainer}>
        <Image 
          source={{ uri: mapImageUrl || 'https://via.placeholder.com/400x200/e8e8e8/909090?text=Map' }} 
          style={styles.mapImage}
          resizeMode="cover"
        />
        <View style={styles.mapMarker}>
          <Ionicons name="location" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.addressText}>{address}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.padding.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  openMapText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  mapContainer: {
    height: 180,
    borderRadius: SIZES.borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: COLORS.background.secondary,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -24,
  },
  addressText: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: SIZES.borderRadius.small,
    fontSize: 12,
    color: COLORS.text.primary,
  },
});

export default LocationMap;