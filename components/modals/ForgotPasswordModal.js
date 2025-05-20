import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import CustomInput from '../forms/CustomInput';
import CustomButton from '../buttons/CustomButton';

const ForgotPasswordModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = () => {
    // Validate email
    if (!email.trim()) {
      setValidationError('Email không được để trống');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Email không hợp lệ');
      return;
    }

    setValidationError('');
    onSubmit(email);
  };

  const handleClose = () => {
    setEmail('');
    setValidationError('');
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quên mật khẩu</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalSubtitle}>
              Vui lòng nhập email của bạn để nhận mật khẩu mới
            </Text>

            <CustomInput
              label="Email"
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setValidationError('');
              }}
              keyboardType="email-address"
              error={validationError || error}
              editable={!loading}
            />

            <CustomButton
              title={loading ? "Đang xử lý..." : "Gửi yêu cầu"}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
              disabled={loading}
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
    width: '90%',
    maxWidth: 400,
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
    fontSize: FONTS.sizes.heading,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  modalBody: {
    padding: SIZES.padding.large,
  },
  modalSubtitle: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding.large,
  },
  submitButton: {
    marginTop: SIZES.padding.medium,
  },
});

export default ForgotPasswordModal; 