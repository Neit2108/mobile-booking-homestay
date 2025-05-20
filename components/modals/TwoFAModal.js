import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import CustomInput from '../forms/CustomInput';
import CustomButton from '../buttons/CustomButton';

const TwoFAModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
  message,
  error,
}) => {
  const modalRef = useRef(null);

  // Log modal visibility changes
  useEffect(() => {
    console.log('TwoFAModal visibility changed:', visible);
  }, [visible]);

  const handleSubmit = () => {
    if (modalRef.current) {
      onSubmit(modalRef.current.value);
    }
  };

  const handleClose = () => {
    if (modalRef.current) {
      modalRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Xác thực hai yếu tố</Text>
              <Text style={styles.modalSubtitle}>
                {message || 'Vui lòng nhập mã xác thực từ ứng dụng xác thực của bạn'}
              </Text>
              
              <CustomInput
                ref={modalRef}
                label="Mã xác thực"
                placeholder="Nhập mã xác thực"
                keyboardType="number-pad"
                maxLength={6}
                error={error}
                editable={!loading}
              />

              <View style={styles.modalButtons}>
                <CustomButton
                  title="Hủy"
                  onPress={handleClose}
                  style={styles.modalButton}
                  variant="secondary"
                  disabled={loading}
                />
                <CustomButton
                  title="Xác nhận"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.modalButton}
                  disabled={loading}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    borderRadius: SIZES.borderRadius.large,
    padding: SIZES.padding.large,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONTS.sizes.heading,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding.large,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.padding.large,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SIZES.base,
  },
});

export default TwoFAModal; 