import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Payment details components
import {
  BankTransferDetails,
  CardPaymentDetails,
  CounterPaymentDetails
} from '../payment/PaymentDetails';

// Constants
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

/**
 * Payment details modal component
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {Function} onClose - Function to close the modal
 * @param {string} paymentMethod - Selected payment method (bank_transfer, card, counter)
 * @param {Object} paymentData - Payment details data
 * @param {Object} place - Place details (for counter payment)
 * @param {boolean} loading - Whether the payment data is loading
 */
const PaymentModal = ({
  visible,
  onClose,
  paymentMethod,
  paymentData,
  place,
  loading = false
}) => {
  // Render content based on payment method
  const renderPaymentDetails = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chờ...</Text>
        </View>
      );
    }

    switch (paymentMethod) {
      case 'bank_transfer':
        return <BankTransferDetails paymentInfo={paymentData} onClose={onClose} />;
      case 'card':
        return <CardPaymentDetails paymentInfo={paymentData} onClose={onClose} />;
      case 'counter':
        return <CounterPaymentDetails place={place} onClose={onClose} />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={50} color={COLORS.error} />
            <Text style={styles.errorText}>Bạn chưa chọn phương thức thanh toán</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

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
              {renderPaymentDetails()}
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
    padding: SIZES.padding.large,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: COLORS.background.primary,
    borderRadius: SIZES.borderRadius.large,
    ...SHADOWS.large,
  },
  loadingContainer: {
    padding: SIZES.padding.large * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SIZES.padding.medium,
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    padding: SIZES.padding.large * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginVertical: SIZES.padding.medium,
    fontSize: 16,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: SIZES.padding.medium,
    paddingVertical: SIZES.padding.small,
    paddingHorizontal: SIZES.padding.medium,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.small,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default PaymentModal;