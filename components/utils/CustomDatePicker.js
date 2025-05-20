import React, { useState, useEffect } from 'react';
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

// Constants
import { COLORS, SIZES, FONTS } from '../../constants/theme';

/**
 * Custom Date Picker with proper date selection
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
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  
  // Update selectedDate if value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
    }
  }, [value]);

  // Format date to display
  const formatDate = (date) => {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Handle date change from the date picker
  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && date) {
        // Set time to noon to avoid timezone issues
        date.setHours(12, 0, 0, 0);
        setSelectedDate(date);
        onChange(date);
      }
    } else {
      if (date) {
        // Set time to noon to avoid timezone issues
        date.setHours(12, 0, 0, 0);
        setSelectedDate(date);
        onChange(date);
      }
    }
  };
  

  // Open the date picker
  const openDatePicker = () => {
    setShowPicker(true);
  };
  
  // Close the iOS modal and apply selected date
  const handleConfirm = () => {
    setShowPicker(false);
    // Set time to noon to avoid timezone issues
    selectedDate.setHours(12, 0, 0, 0);
    onChange(selectedDate);
  };
  
  // Cancel selection on iOS
  const handleCancel = () => {
    setShowPicker(false);
  };

  const selectEighteenYearsAgo = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    // Set time to noon to avoid timezone issues
    date.setHours(12, 0, 0, 0);
    setSelectedDate(date);
    onChange(date);
    
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
        ]}
        onPress={openDatePicker}
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

      {/* iOS date picker modal */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPicker}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.modalDoneText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  style={styles.datePicker}
                />
                
                <TouchableOpacity 
                  style={styles.quickOptionButton}
                  onPress={selectEighteenYearsAgo}
                >
                  <Text style={styles.quickOptionText}>Set to 18 Years Ago</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Android date picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
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
    height: 50,
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
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
  pickerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
  quickOptionButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  quickOptionText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default CustomDatePicker;