import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

/**
 * Facility item component that displays an icon and name
 * 
 * @param {string} icon - Ionicons name for the facility
 * @param {string} name - Name of the facility
 */
export const FacilityItem = ({ icon, name }) => (
  <View style={styles.facilityItem}>
    <View style={styles.facilityIconContainer}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.facilityName}>{name}</Text>
  </View>
);

/**
 * Common facilities component for place details screen
 * 
 * @param {Array} facilities - Array of facility objects with icon and name
 * @param {Function} onSeeAll - Function to call when "See All" is pressed
 * @param {Object} style - Additional styles for the container
 */
const CommonFacilities = ({ facilities = [], onSeeAll, style }) => {
  // Default facilities if none provided
  const defaultFacilities = [
    { id: 'ac', icon: 'snow-outline', name: 'AC' },
    { id: 'restaurant', icon: 'restaurant-outline', name: 'Restaurant' },
    { id: 'pool', icon: 'water-outline', name: 'Swimming Pool' },
    { id: 'desk', icon: 'time-outline', name: '24-Hours Front Desk' },
  ];

  // Use provided facilities or default ones
  const facilitiesToShow = facilities.length > 0 ? facilities : defaultFacilities;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Common Facilities</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.facilitiesContainer}>
        {facilitiesToShow.map((facility) => (
          <FacilityItem 
            key={facility.id}
            icon={facility.icon}
            name={facility.name}
          />
        ))}
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
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  facilityItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
  },
  facilityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 12,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
});

export default CommonFacilities;