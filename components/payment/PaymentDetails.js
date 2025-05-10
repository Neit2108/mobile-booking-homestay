import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Constants
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

/**
 * Bank Transfer Payment Details component
 * 
 * @param {Object} paymentInfo - Payment details including QR code
 * @param {Function} onClose - Function to close the details
 */
export const BankTransferDetails = ({ paymentInfo, onClose }) => {
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>Thông tin chuyển khoản</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-circle" size={24} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* QR Code */}
        {paymentInfo?.qrCodeUrl && (
          <View style={styles.qrContainer}>
            <Image 
              source={{ uri: paymentInfo.qrCodeUrl }}
              style={styles.qrCode}
              resizeMode="contain"
            />
            <Text style={styles.scanText}>Quét mã để thanh toán</Text>
          </View>
        )}
        
        {/* Payment Information */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chủ tài khoản:</Text>
            <Text style={styles.infoValue}>HomiesStay JSC</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngân hàng:</Text>
            <Text style={styles.infoValue}>VietcomBank</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tài khoản:</Text>
            <Text style={styles.infoValue}>1234567890</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tiền:</Text>
            <Text style={styles.infoValueHighlight}>{paymentInfo?.amount?.toLocaleString()} VND</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã thanh toán:</Text>
            <Text style={styles.infoValue}>{paymentInfo?.reference || 'Đơn đặt phòng số' + (paymentInfo?.bookingId || 'Unknown')}</Text>
          </View>
        </View>
        
        <Text style={styles.noteText}>
          * Vui lòng nhập nội dung chuyển khoản là mã thanh toán.
        </Text>
      </ScrollView>
    </View>
  );
};

/**
 * Card Payment Details component
 * 
 * @param {Object} paymentInfo - Payment details including payment URL
 * @param {Function} onClose - Function to close the details
 */
export const CardPaymentDetails = ({ paymentInfo, onClose }) => {
  const handleProceedToPayment = () => {
    if (paymentInfo?.paymentUrl) {
      Linking.openURL(paymentInfo.paymentUrl);
    }
  };

  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>Thông tin thẻ</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-circle" size={24} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardIconsContainer}>
        <Ionicons name="card-outline" size={30} color={COLORS.primary} />
        <Ionicons name="logo-paypal" size={30} color="#003087" style={styles.cardIcon} />
        <Ionicons name="card" size={30} color="#1A1A1A" style={styles.cardIcon} />
      </View>
      
      <Text style={styles.cardInfoText}>
        Bạn sẽ được chuyển hướng đến cổng thanh toán của chúng tôi để hoàn tất thanh toán.
      </Text>
      
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã đơn:</Text>
          <Text style={styles.infoValue}>{paymentInfo?.bookingId || 'Unknown'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số tiền:</Text>
          <Text style={styles.infoValueHighlight}>{paymentInfo?.amount?.toLocaleString()} VND</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.proceedButton}
        onPress={handleProceedToPayment}
      >
        <Text style={styles.proceedButtonText}>Thanh toán</Text>
      </TouchableOpacity>
      
      <Text style={styles.securityNote}>
        <Ionicons name="lock-closed" size={14} color={COLORS.text.secondary} /> Thông tin thanh toán của bạn được mã hóa và bảo mật.
      </Text>
    </View>
  );
};

/**
 * Counter Payment Details component
 * 
 * @param {Object} place - Place details including address
 * @param {Function} onClose - Function to close the details
 */
export const CounterPaymentDetails = ({ place, onClose }) => {
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>Thanh toán tại quầy</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-circle" size={24} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.counterIconContainer}>
        <Ionicons name="home" size={40} color={COLORS.primary} />
      </View>
      
      <Text style={styles.counterInfoText}>
        Vui lòng thanh toán tại quầy lễ tân ngay khi bạn tới địa chỉ : 
      </Text>
      
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Địa chỉ:</Text>
          <Text style={styles.infoValue}>{place?.address || 'Address not available'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giờ mở cửa:</Text>
          <Text style={styles.infoValue}>08:00 AM - 10:00 PM</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số tiền:</Text>
          <Text style={styles.infoValueHighlight}>{place?.price?.toLocaleString()} VND</Text>
        </View>
      </View>
      
      <View style={styles.noteContainer}>
        <Ionicons name="information-circle" size={20} color={COLORS.primary} />
        <Text style={styles.noteText}>
          Vui lòng mang theo xác nhận đặt chỗ và CCCD để xác minh.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    backgroundColor: COLORS.background.primary,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.large,
    ...SHADOWS.medium,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding.large,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 5,
  },
  
  // QR Code styles
  qrContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding.large,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: SIZES.padding.small,
  },
  scanText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  
  // Info box styles
  infoBox: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.medium,
    marginBottom: SIZES.padding.medium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  infoValueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  
  // Card payment styles
  cardIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SIZES.padding.medium,
  },
  cardIcon: {
    marginLeft: SIZES.padding.medium,
  },
  cardInfoText: {
    textAlign: 'center',
    marginBottom: SIZES.padding.large,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    marginVertical: SIZES.padding.medium,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNote: {
    textAlign: 'center',
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  
  // Counter payment styles
  counterIconContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding.medium,
  },
  counterInfoText: {
    textAlign: 'center',
    marginBottom: SIZES.padding.large,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primary}10`,
    padding: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default {
  BankTransferDetails,
  CardPaymentDetails,
  CounterPaymentDetails
};