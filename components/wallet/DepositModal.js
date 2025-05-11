import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import CustomButton from '../buttons/CustomButton';

/**
 * Deposit Modal Component - For adding money to wallet
 */
const DepositModal = ({ visible, onClose, onDeposit }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 10000) {
      Alert.alert('Lỗi', 'Số tiền nạp phải từ 10,000 VNĐ trở lên');
      return;
    }

    setIsProcessing(true);
    try {
      await onDeposit(parseFloat(amount), paymentMethod);
      setAmount('');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể xử lý yêu cầu nạp tiền');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nạp tiền vào ví</Text>
            <TouchableOpacity onPress={onClose} disabled={isProcessing}>
              <Ionicons name="close" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Số tiền</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Nhập số tiền"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              editable={!isProcessing}
            />
            
            <Text style={styles.minAmountNote}>*Số tiền tối thiểu: 10,000 VNĐ</Text>

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Phương thức thanh toán</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'bank_transfer' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('bank_transfer')}
              disabled={isProcessing}
            >
              <Ionicons name="qr-code-outline" size={24} color={paymentMethod === 'bank_transfer' ? COLORS.primary : COLORS.text.secondary} />
              <Text style={[
                styles.paymentOptionText,
                paymentMethod === 'bank_transfer' && styles.paymentOptionTextSelected
              ]}>
                Chuyển khoản
              </Text>
              <View style={styles.radioButton}>
                {paymentMethod === 'bank_transfer' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('card')}
              disabled={isProcessing}
            >
              <Ionicons name="card-outline" size={24} color={paymentMethod === 'card' ? COLORS.primary : COLORS.text.secondary} />
              <Text style={[
                styles.paymentOptionText,
                paymentMethod === 'card' && styles.paymentOptionTextSelected
              ]}>
                Thẻ ngân hàng
              </Text>
              <View style={styles.radioButton}>
                {paymentMethod === 'card' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.modalFooter}>
            <CustomButton
              title={isProcessing ? "Đang xử lý..." : "Xác nhận"}
              onPress={handleDeposit}
              disabled={!amount || parseFloat(amount) < 10000 || isProcessing}
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding.small,
  },
  amountInput: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SIZES.padding.medium,
    fontSize: 16,
  },
  minAmountNote: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.medium,
    marginTop: SIZES.padding.small,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  paymentOptionText: {
    flex: 1,
    marginLeft: SIZES.padding.medium,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  paymentOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  modalFooter: {
    padding: SIZES.padding.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default DepositModal;