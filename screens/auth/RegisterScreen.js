import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Components
import CustomInput from '../../components/forms/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';
import SocialButton from '../../components/buttons/SocialButton';
import NotificationModal from '../../components/modals/NotificationModal';

// Context
import { useAuth } from '../../context/AuthContext';

// Constants
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import images from '../../constants/images';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register, loading, error } = useAuth();
  
  const [userData, setUserData] = useState({
    fullName: '',
    identityCard: '',
    phoneNumber: '',
    homeAddress: '',
    username: '',
    email: '',
    password: '',
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [notificationModal, setNotificationModal] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    actionButtonText: '',
  });

  const updateUserData = (field, value) => {
    setUserData({ ...userData, [field]: value });
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!userData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên';
    }
    
    if (!userData.identityCard.trim()) {
      errors.identityCard = 'Vui lòng nhập số căn cước công dân';
    } else if (userData.identityCard.length !== 12) {
      errors.identityCard = 'Số căn cước công dân phải có 12 số';
    }
    
    if (!userData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Định dạng email không hợp lệ';
    }
    
    if (!userData.phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10,15}$/.test(userData.phoneNumber.replace(/[^\d]/g, ''))) {
      errors.phoneNumber = 'Định dạng số điện thoại không hợp lệ';
    }
    
    if (!userData.homeAddress.trim()) {
      errors.homeAddress = 'Vui lòng nhập địa chỉ';
    }
    
    if (!userData.username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (userData.username.length < 4) {
      errors.username = 'Tên đăng nhập phải có ít nhất 4 ký tự';
    }
    
    if (!userData.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (userData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      try {
        await register(userData);
        setNotificationModal({
          visible: true,
          type: 'success',
          title: 'Đăng ký thành công!',
          message: 'Tài khoản của bạn đã được tạo thành công. Vui lòng đăng nhập để tiếp tục.',
          actionButtonText: 'Đăng nhập ngay',
        });
      } catch (err) {
        setNotificationModal({
          visible: true,
          type: 'error',
          title: 'Đăng ký thất bại',
          message: error || 'Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.',
          actionButtonText: 'Đóng',
        });
      }
    }
  };

  const handleModalAction = () => {
    setNotificationModal({ ...notificationModal, visible: false });
    if (notificationModal.type === 'success') {
      navigation.navigate('Login');
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Registration with ${provider}`);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subtitle}>Đặt phòng cùng Homies Stay</Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              label="Họ và tên"
              placeholder="Nhập họ và tên của bạn"
              value={userData.fullName}
              onChangeText={(text) => updateUserData('fullName', text)}
              error={validationErrors.fullName}
              autoCapitalize="words"
            />
            
            <CustomInput
              label="Căn cước công dân"
              placeholder="Nhập số căn cước công dân"
              value={userData.identityCard}
              onChangeText={(text) => updateUserData('identityCard', text)}
              error={validationErrors.identityCard}
              keyboardType="number-pad"
            />
            
            <CustomInput
              label="E-mail"
              placeholder="Nhập email của bạn"
              value={userData.email}
              onChangeText={(text) => updateUserData('email', text)}
              error={validationErrors.email}
              keyboardType="email-address"
            />
            
            <CustomInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại của bạn"
              value={userData.phoneNumber}
              onChangeText={(text) => updateUserData('phoneNumber', text)}
              error={validationErrors.phoneNumber}
              keyboardType="phone-pad"
            />
            
            <CustomInput
              label="Địa chỉ"
              placeholder="Nhập địa chỉ của bạn"
              value={userData.homeAddress}
              onChangeText={(text) => updateUserData('homeAddress', text)}
              error={validationErrors.homeAddress}
              multiline
              numberOfLines={2}
            />
            
            <CustomInput
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập của bạn"
              value={userData.username}
              onChangeText={(text) => updateUserData('username', text)}
              error={validationErrors.username}
            />
            
            <CustomInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              value={userData.password}
              onChangeText={(text) => updateUserData('password', text)}
              secureTextEntry
              error={validationErrors.password}
            />
            
            <CustomButton
              title="Đăng ký"
              onPress={handleRegister}
              loading={loading}
              style={styles.createAccountButton}
            />
            
            {/* Or Sign In with */}
            <View style={styles.dividerContainer}>
              <Text style={styles.dividerText}>hoặc</Text>
            </View>
            
            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <SocialButton 
                icon={images.google} 
                onPress={() => handleSocialLogin('Google')} 
              />
              <SocialButton 
                icon={images.apple} 
                onPress={() => handleSocialLogin('Apple')} 
              />
              <SocialButton 
                icon={images.facebook} 
                onPress={() => handleSocialLogin('Facebook')} 
              />
            </View>
            
            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Bằng cách đăng nhập bạn đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản</Text> và{' '}
                <Text style={styles.termsLink}>Điều kiện của chúng tôi</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Notification Modal */}
      <NotificationModal
        visible={notificationModal.visible}
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
        actionButtonText={notificationModal.actionButtonText}
        onActionPress={handleModalAction}
        onClose={() => setNotificationModal({ ...notificationModal, visible: false })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.padding.large,
  },
  backButton: {
    padding: SIZES.padding.small,
    marginLeft: -SIZES.padding.small,
  },
  header: {
    marginTop: SIZES.padding.large,
    marginBottom: SIZES.padding.large,
  },
  title: {
    fontSize: FONTS.sizes.title,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.secondary,
  },
  form: {
    flex: 1,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SIZES.padding.medium,
    fontSize: FONTS.sizes.medium,
  },
  createAccountButton: {
    marginBottom: SIZES.padding.large,
  },
  dividerContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding.large,
  },
  dividerText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.secondary,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SIZES.padding.large,
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding.large,
  },
  termsText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  termsLink: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;