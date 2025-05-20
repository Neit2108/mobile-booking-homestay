import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import CustomButton from '../buttons/CustomButton';

/**
 * PIN Modal Component - For setting or changing wallet PIN
 */
const PINModal = ({ visible, onClose, onSubmit, isUpdate = false }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN phải có 6 số');
      return;
    }
    if (pin !== confirmPin) {
      setError('Xác nhận PIN không khớp');
      return;
    }

    if (isUpdate && (!oldPin || oldPin.length < 4 || oldPin.length > 6 || !/^\d+$/.test(oldPin))) {
      setError('PIN cũ không hợp lệ');
      return;
    }

    setIsProcessing(true);
    try {
      await onSubmit({ pin, oldPin });
      resetForm();
    } catch (error) {
      setError(error.message || 'Không thể thiết lập PIN');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPin('');
    setConfirmPin('');
    setOldPin('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isUpdate ? 'Thay đổi mã PIN' : 'Thiết lập mã PIN'}</Text>
            <TouchableOpacity onPress={handleClose} disabled={isProcessing}>
              <Ionicons name="close" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {isUpdate && (
              <View style={styles.pinInputContainer}>
                <Text style={styles.inputLabel}>Mã PIN hiện tại</Text>
                <TextInput
                  style={styles.pinInput}
                  placeholder="Nhập PIN hiện tại"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={6}
                  value={oldPin}
                  onChangeText={setOldPin}
                  editable={!isProcessing}
                />
              </View>
            )}
            
            <View style={styles.pinInputContainer}>
              <Text style={styles.inputLabel}>Mã PIN mới</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="Nhập PIN mới (6 số)"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                value={pin}
                onChangeText={setPin}
                editable={!isProcessing}
              />
            </View>
            
            <View style={styles.pinInputContainer}>
              <Text style={styles.inputLabel}>Xác nhận mã PIN</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="Nhập lại PIN mới"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                value={confirmPin}
                onChangeText={setConfirmPin}
                editable={!isProcessing}
              />
            </View>
            
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <Text style={styles.pinInfoText}>
              * Mã PIN được sử dụng để xác thực các giao dịch trong ví Homies
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <CustomButton
              title={isProcessing ? "Đang xử lý..." : "Xác nhận"}
              onPress={handleSubmit}
              disabled={isProcessing}
              loading={isProcessing}
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
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.background.primary,
    borderRadius: SIZES.borderRadius.large,
    overflow: 'hidden',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  modalContent: {
    padding: SIZES.padding.large,
  },
  pinInputContainer: {
    marginBottom: SIZES.padding.medium,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.small,
  },
  pinInput: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SIZES.padding.medium,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SIZES.padding.medium,
  },
  pinInfoText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: SIZES.padding.small,
  },
  modalFooter: {
    padding: SIZES.padding.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default PINModal;