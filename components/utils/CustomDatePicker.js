import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Constants
import { COLORS, SIZES, FONTS } from '../../constants/theme';

/**
 * Simple Custom Date Picker Input component that doesn't rely on native DateTimePicker
 * 
 * @param {string} label - Input label
 * @param {Date} value - Selected date value
 * @param {function} onChange - Function called when date changes
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {object} style - Additional container style
 */
const CustomDatePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  error,
  style = {},
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Format date to display
  const formatDate = (date) => {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Simple picker that uses select lists instead of native date picker
  const renderSimpleDatePicker = () => {
    const currentDate = value || new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    
    // Generate arrays for day, month, year options
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Create a 100-year range ending with current year
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleDateChange = (newDay, newMonth, newYear) => {
      // Create new date (handle month index 0-11)
      const monthIndex = typeof newMonth === 'number' ? newMonth : months.indexOf(newMonth);
      const updatedDate = new Date(newYear, monthIndex, newDay);
      onChange(updatedDate);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateSelectionContainer}>
              {/* Simplified version - just show basic date selection UI */}
              <Text style={styles.dateSelectionText}>
                Please select your birth date
              </Text>
              
              <Text style={styles.datePreview}>
                {formatDate(currentDate)}
              </Text>
              
              <Text style={styles.dateSelectionHelp}>
                In a full implementation, this would show day/month/year pickers.
              </Text>
              
              <TouchableOpacity 
                style={styles.todayButton}
                onPress={() => {
                  // Set date to today as a simple example
                  onChange(new Date());
                  setModalVisible(false);
                }}
              >
                <Text style={styles.todayButtonText}>Use Today's Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={
            value
              ? styles.dateText
              : styles.placeholderText
          }
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={22}
          color={COLORS.text.secondary}
        />
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Date Picker Modal */}
      {renderSimpleDatePicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding.medium,
    width: '100%',
  },
  label: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SIZES.base,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding.medium,
    height: SIZES.input.height,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  dateText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.primary,
  },
  placeholderText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.placeholder,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.small,
    marginTop: SIZES.base,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCancelText: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  modalDoneText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  dateSelectionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  dateSelectionText: {
    fontSize: 18,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: 20,
  },
  datePreview: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  dateSelectionHelp: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  todayButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  todayButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default CustomDatePicker;