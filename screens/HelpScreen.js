import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const tips = [
  {
    icon: <Ionicons name="help-circle-outline" size={32} color={COLORS.primary} />, 
    title: 'Câu hỏi thường gặp',
    desc: 'Xem các câu hỏi thường gặp về đặt phòng, thanh toán, và tài khoản.'
  },
  {
    icon: <MaterialCommunityIcons name="email-outline" size={32} color={COLORS.primary} />, 
    title: 'Liên hệ hỗ trợ',
    desc: 'Nếu bạn cần trợ giúp, hãy gửi email tới support@bookinghomestay.vn hoặc gọi hotline.'
  },
  {
    icon: <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} />, 
    title: 'Bảo mật & Quyền riêng tư',
    desc: 'Chúng tôi cam kết bảo vệ thông tin cá nhân và giao dịch của bạn.'
  },
  {
    icon: <Ionicons name="information-circle-outline" size={32} color={COLORS.primary} />, 
    title: 'Hướng dẫn sử dụng',
    desc: 'Khám phá các tính năng và cách sử dụng ứng dụng hiệu quả.'
  },
];

const HelpScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Ionicons name="help-buoy-outline" size={48} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Trợ giúp & Hỗ trợ</Text>
          <Text style={styles.headerDesc}>Chúng tôi luôn sẵn sàng hỗ trợ bạn trong quá trình sử dụng ứng dụng.</Text>
        </View>
        {tips.map((tip, idx) => (
          <View key={idx} style={styles.tipCard}>
            <View style={styles.iconBox}>{tip.icon}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}
        <View style={styles.footerBox}>
          <Text style={styles.footerText}>© 2024 Booking Homestay. Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  container: {
    padding: 24,
    backgroundColor: COLORS.background.primary,
    flexGrow: 1,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  headerDesc: {
    color: COLORS.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  tipDesc: {
    color: COLORS.text.secondary,
    fontSize: 15,
  },
  footerBox: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HelpScreen; 