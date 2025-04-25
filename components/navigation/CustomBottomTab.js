import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants/theme';

/**
 * Custom Bottom Tab Bar component
 * Designed to match the UI in the provided design
 * 
 * @param {object} state - Navigation state
 * @param {object} descriptors - Screen descriptors
 * @param {object} navigation - Navigation object
 */
const CustomBottomTab = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  
  // Tab icon mapping
  const getTabIcon = (routeName, isFocused) => {
    let iconName;
    
    switch (routeName) {
      case 'Home':
        iconName = isFocused ? 'home' : 'home-outline';
        break;
      case 'Bookings':
        iconName = isFocused ? 'document-text' : 'document-text-outline';
        break;
      case 'Messages':
        iconName = isFocused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
        break;
      case 'Profile':
        iconName = isFocused ? 'person' : 'person-outline';
        break;
      default:
        iconName = 'square-outline';
    }
    
    return iconName;
  };
  
  return (
    <View style={[
      styles.container, 
      { paddingBottom: Math.max(insets.bottom, 10) }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;
        
        const iconName = getTabIcon(route.name, isFocused);
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? COLORS.primary : COLORS.text.secondary}
            />
            <Text style={[
              styles.tabLabel,
              isFocused && styles.tabLabelFocused
            ]}>
              {label}
            </Text>
            
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  tabLabelFocused: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    height: 3,
    width: '60%',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});

export default CustomBottomTab;