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
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

/**
 * Booking date picker component that can be used for check-in and check-out dates
 * 
 * @param {string} label - Label for the date picker (e.g., "Check-in" or "Check-out")
 * @param {Date} date - Currently selected date
 * @param {function} onDateChange - Function to call when date changes
 * @param {Date} minDate - Minimum selectable date
 * @param {Date} maxDate - Maximum selectable date
 * @param {object} style - Additional container style
 */
const BookingDatePicker = ({
  label,
  date,
  onDateChange,
  minDate,
  maxDate,
  style,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(date || new Date());

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Handle date change from the picker
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate) {
        onDateChange(selectedDate);
      }
    } else {
      setTempDate(selectedDate || tempDate);
    }
  };

  // Confirm date selection for iOS
  const confirmIOSDate = () => {
    setShowPicker(false);
    onDateChange(tempDate);
  };

  // Cancel date selection for iOS
  const cancelIOSDate = () => {
    setShowPicker(false);
  };

  // Open the date picker
  const openDatePicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={openDatePicker}
        activeOpacity={0.7}
      >
        <View style={styles.pickerContent}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.text.primary} />
          <View style={styles.pickerTextContainer}>
            <Text style={styles.pickerLabel}>{label}</Text>
            <Text style={styles.pickerValue}>{formatDate(date)}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Date Picker for Android - shown when showPicker is true */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}

      {/* Modal Date Picker for iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={cancelIOSDate}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={confirmIOSDate}>
                  <Text style={[styles.modalButton, styles.modalConfirmButton]}>Confirm</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minDate}
                maximumDate={maxDate}
                style={styles.iosDatePicker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding.medium,
  },
  pickerButton: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.medium,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerTextContainer: {
    marginLeft: SIZES.padding.small,
  },
  pickerLabel: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  pickerValue: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  // Modal styles for iOS
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: SIZES.borderRadius.large,
    borderTopRightRadius: SIZES.borderRadius.large,
    paddingBottom: SIZES.padding.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  modalButton: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  modalConfirmButton: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  iosDatePicker: {
    height: 200,
  },
});

export default BookingDatePicker;