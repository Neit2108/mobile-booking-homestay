import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Constants
import { COLORS, SIZES, FONTS } from '../../constants/theme';

/**
 * Custom Date Picker Input component
 * 
 * @param {string} label - Input label
 * @param {Date} value - Selected date value
 * @param {function} onChange - Function called when date changes
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {object} style - Additional container style
 */
const DatePickerInput = ({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  error,
  style = {},
}) => {
  const [show, setShow] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Format date to display
  const formatDate = (date) => {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleChange = (event, selectedDate) => {
    const currentDate = selectedDate || value;
    
    // Close picker on iOS (handled by modal)
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    onChange(currentDate);
  };

  const showDatepicker = () => {
    if (Platform.OS === 'ios') {
      setModalVisible(true);
    } else {
      setShow(true);
    }
  };

  const handleConfirmIOS = () => {
    setModalVisible(false);
  };

  const handleCancelIOS = () => {
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
        ]}
        onPress={showDatepicker}
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

      {/* Date Picker - Android */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}

      {/* Date Picker Modal - iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCancelIOS}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancelIOS}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirmIOS}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value || new Date()}
                mode="date"
                display="spinner"
                onChange={handleChange}
                style={styles.datePickerIOS}
                maximumDate={new Date()}
              />
            </View>
          </TouchableOpacity>
        </Modal>
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
  // Modal styles for iOS
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
  datePickerIOS: {
    height: 200,
  },
});

export default DatePickerInput;