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
import { COLORS, SIZES } from '../../constants/theme';

/**
 * Date picker component that handles both Android and iOS date selection
 * 
 * @param {string} label - The label to display above the date
 * @param {Date} date - The selected date
 * @param {function} onChange - Function to call when date changes
 * @param {Date} minimumDate - Minimum selectable date (optional)
 * @param {Date} maximumDate - Maximum selectable date (optional)
 * @param {object} style - Additional styles for the container
 */
const DatePicker = ({ 
  label,
  date, 
  onChange, 
  minimumDate,
  maximumDate,
  style = {}
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(date);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Handle date change from picker
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      
      if (event.type === 'set' && selectedDate) {
        setTempDate(selectedDate);
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };
  
  // Confirm date selection (iOS)
  const handleConfirm = () => {
    setShowPicker(false);
    onChange(tempDate);
  };
  
  // Cancel date selection (iOS)
  const handleCancel = () => {
    setShowPicker(false);
    setTempDate(date); // Reset to the original date
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} style={styles.icon} />
        <Text style={styles.dateText}>{formatDate(date)}</Text>
      </TouchableOpacity>
      
      {/* Date Picker Modal for iOS */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={tempDate || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.dateTimePicker}
              />
            </View>
          </View>
        </Modal>
      )}
      
      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: SIZES.padding.small,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.small,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SIZES.padding.medium,
    paddingVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  icon: {
    marginRight: SIZES.padding.small,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
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
  dateTimePicker: {
    backgroundColor: 'white',
  },
});

export default DatePicker;