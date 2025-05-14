import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

/**
 * Reusable logout confirmation modal
 * 
 * @param {boolean} visible - Controls modal visibility
 * @param {function} onCancel - Function to call when canceling logout
 * @param {function} onConfirm - Function to call when confirming logout
 * @param {string} title - Custom title text (optional)
 * @param {string} message - Custom message text (optional)
 * @param {string} confirmText - Custom confirm button text (optional)
 * @param {string} cancelText - Custom cancel button text (optional)
 */
const LogoutModal = ({
  visible,
  onCancel,
  onConfirm,
  title = 'Đăng xuất?',
  message = 'Bạn có muốn đăng xuất không?',
  confirmText = 'Đăng xuất',
  cancelText = 'Hủy',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="help" size={40} color="#FF3B30" />
              </View>
              
              {/* Content */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              
              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: COLORS.background.primary,
    borderRadius: SIZES.borderRadius.large,
    padding: SIZES.padding.large,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // Light red background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.small,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding.large,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: SIZES.padding.small,
    backgroundColor: '#2563EB', // Use primary blue from theme
  },
  confirmButton: {
    marginLeft: SIZES.padding.small,
    borderWidth: 1,
    borderColor: '#FF3B30', // iOS-style red
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FF3B30', // iOS-style red
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LogoutModal;