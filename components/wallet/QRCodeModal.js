import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import CustomButton from '../buttons/CustomButton';
import { formatPrice } from '../../utils/formatPrice';

/**
 * QR Code Payment Modal Component - For displaying QR code for payment
 */
const QRCodeModal = ({ visible, onClose, paymentData }) => {
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
            <Text style={styles.modalTitle}>Thanh toán QR</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.qrCodeContainer}>
            {paymentData?.qrCodeUrl ? (
              <Image
                source={{ uri: paymentData.qrCodeUrl }}
                style={styles.qrCode}
                resizeMode="contain"
              />
            ) : (
              <ActivityIndicator size="large" color={COLORS.primary} />
            )}
            <Text style={styles.qrCodeText}>Quét mã QR để thanh toán</Text>
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Số tiền:</Text>
              <Text style={styles.paymentDetailValue}>{formatPrice(paymentData?.amount || 0)} VNĐ</Text>
            </View>
            
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Ngân hàng:</Text>
              <Text style={styles.paymentDetailValue}>VietcomBank</Text>
            </View>
            
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Chủ tài khoản:</Text>
              <Text style={styles.paymentDetailValue}>HomiesStay JSC</Text>
            </View>
            
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Nội dung CK:</Text>
              <Text style={styles.paymentDetailValue}>{paymentData?.reference || 'NẠP TIỀN VÍ HOMIES'}</Text>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <CustomButton
              title="Đóng"
              onPress={onClose}
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
  qrCodeContainer: {
    alignItems: 'center',
    padding: SIZES.padding.large,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: SIZES.padding.medium,
  },
  qrCodeText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  paymentDetails: {
    backgroundColor: COLORS.background.secondary,
    margin: SIZES.padding.large,
    padding: SIZES.padding.large,
    borderRadius: SIZES.borderRadius.medium,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding.small,
  },
  paymentDetailLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  paymentDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  modalFooter: {
    padding: SIZES.padding.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default QRCodeModal;