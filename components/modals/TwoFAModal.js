import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
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
  const [otp, setOtp] = useState('');

  const handleSubmit = () => {
    onSubmit(otp);
  };

  const handleClose = () => {
    setOtp('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Xác thực hai yếu tố</Text>
          <Text style={styles.modalSubtitle}>
            {message || 'Vui lòng nhập mã xác thực từ ứng dụng xác thực của bạn'}
          </Text>
          
          <CustomInput
            label="Mã xác thực"
            placeholder="Nhập mã xác thực"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            error={error}
          />

          <View style={styles.modalButtons}>
            <CustomButton
              title="Hủy"
              onPress={handleClose}
              style={styles.modalButton}
              variant="secondary"
            />
            <CustomButton
              title="Xác nhận"
              onPress={handleSubmit}
              loading={loading}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
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