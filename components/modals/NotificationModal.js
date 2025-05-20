import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const NotificationModal = ({
  visible,
  onClose,
  type = 'success', // 'success' or 'error'
  title,
  message,
  actionButtonText,
  onActionPress,
}) => {
  const isSuccess = type === 'success';
  const iconName = isSuccess ? 'checkmark-circle' : 'alert-circle';
  const iconColor = isSuccess ? '#4CAF50' : COLORS.error;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons name={iconName} size={40} color={iconColor} />
              </View>
              
              {/* Content */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              
              {/* Action Button */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: iconColor }]}
                onPress={onActionPress}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>{actionButtonText}</Text>
              </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
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
  actionButton: {
    width: '100%',
    paddingVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NotificationModal; 