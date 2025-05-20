import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Components
import CustomInput from '../../components/forms/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';
import SocialButton from '../../components/buttons/SocialButton';
import TwoFAModal from '../../components/modals/TwoFAModal';
import ForgotPasswordModal from '../../components/modals/ForgotPasswordModal';

// Context
import { useAuth } from '../../context/AuthContext';

// API
import * as authAPI from '../../api/auth';

// Constants
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import images from '../../constants/images';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, loading, error, login2FA } = useAuth();
  
  // State management
  const [credentials, setCredentials] = useState({
    emailorUsername: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // 2FA states with refs for tracking
  const [show2FAModal, setShow2FAModal] = useState(false);
  const show2FAModalRef = useRef(false);
  const [twoFAUserId, setTwoFAUserId] = useState(null);
  const [twoFAMessage, setTwoFAMessage] = useState('');
  const [twoFAError, setTwoFAError] = useState('');

  // Forgot Password states
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');

  // Component mount tracking
  const isMounted = useRef(true);
  const mountCount = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      setShow2FAModal(false);
      setTwoFAError('');
    };
  }, []);

  // Track modal state changes
  useEffect(() => {
    if (isMounted.current) {
      console.log('Modal state changed:', show2FAModal);
      show2FAModalRef.current = show2FAModal;
    }
  }, [show2FAModal]);

  // Track component mounts
  useEffect(() => {
    mountCount.current += 1;
    console.log('LoginScreen mounted, count:', mountCount.current);
  }, []);

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, resetting 2FA state');
      setShow2FAModal(false);
      setTwoFAError('');
      return () => {
        console.log('Screen unfocused');
      };
    }, [])
  );

  const updateCredentials = useCallback((field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [validationErrors]);

  const toggleRememberMe = useCallback(() => {
    setRememberMe(prev => !prev);
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!credentials.emailorUsername.trim()) {
      errors.emailorUsername = 'Vui lòng nhập email hoặc tên đăng nhập';
    }
    
    if (!credentials.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (credentials.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [credentials]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    try {
      console.log('Starting login process...');
      const response = await login(credentials);
      console.log('Login response:', response);
      
      if (!isMounted.current) return;

      if (response?.requiresTwoFactor) {
        console.log('2FA required, updating state...');
        // Batch state updates
        setTwoFAUserId(response.userId);
        setTwoFAMessage(response.message || 'Vui lòng nhập mã xác thực từ ứng dụng xác thực của bạn');
        setTwoFAError('');
        setShow2FAModal(true);
        console.log('2FA modal state update requested');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (isMounted.current) {
        setError(error.message || 'Đăng nhập không thành công');
      }
    }
  }, [credentials, login, validateForm]);

  const handle2FASubmit = useCallback(async (otp) => {
    if (!otp) {
      setTwoFAError('Vui lòng nhập mã xác thực.');
      return;
    }

    try {
      console.log('Submitting 2FA code...');
      const response = await login2FA({
        userId: twoFAUserId,
        otp: otp,
      });
      console.log('2FA response:', response);

      if (!isMounted.current) return;

      if (response?.token) {
        setShow2FAModal(false);
      } else {
        setTwoFAError('Mã xác thực không đúng hoặc hết hạn.');
      }
    } catch (error) {
      console.error('2FA error:', error);
      if (isMounted.current) {
        setTwoFAError(error.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
      }
    }
  }, [twoFAUserId, login2FA]);

  const handle2FAClose = useCallback(() => {
    setShow2FAModal(false);
    setTwoFAError('');
  }, []);

  const handleForgotPassword = useCallback(async (email) => {
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    
    try {
      const response = await authAPI.forgotPassword(email);
      if (!isMounted.current) return;

      Alert.alert(
        'Thành công',
        response.message || 'Mật khẩu mới đã được gửi đến email của bạn',
        [{ text: 'OK', onPress: () => setShowForgotPasswordModal(false) }]
      );
    } catch (error) {
      if (isMounted.current) {
        setForgotPasswordError(error.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
      }
    } finally {
      if (isMounted.current) {
        setForgotPasswordLoading(false);
      }
    }
  }, []);

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // Implement social login here
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
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
          <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.subtitle}>Đặt phòng cùng Homies Stay</Text>
          </View>
          
          <View style={styles.form}>
            <CustomInput
              label="Email hoặc Tên đăng nhập"
              placeholder="Nhập email hoặc tên đăng nhập"
              value={credentials.emailorUsername}
              onChangeText={(text) => updateCredentials('emailorUsername', text)}
              error={validationErrors.emailorUsername}
              keyboardType="email-address"
            />
            
            <CustomInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={credentials.password}
              onChangeText={(text) => updateCredentials('password', text)}
              secureTextEntry
              error={validationErrors.password}
            />
            
            <View style={styles.forgotPasswordRow}>
              <TouchableOpacity style={styles.rememberMeContainer} onPress={toggleRememberMe}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.rememberMeText}>Nhớ mật khẩu</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setShowForgotPasswordModal(true)}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu</Text>
              </TouchableOpacity>
            </View>
            
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <CustomButton
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              style={styles.signInButton}
            />

            
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.signUpLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dividerContainer}>
              <Text style={styles.dividerText}>Hoặc</Text>
            </View>
            
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

      <TwoFAModal
        visible={show2FAModal}
        onClose={handle2FAClose}
        onSubmit={handle2FASubmit}
        loading={loading}
        message={twoFAMessage}
        error={twoFAError}
      />

      <ForgotPasswordModal
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSubmit={handleForgotPassword}
        loading={forgotPasswordLoading}
        error={forgotPasswordError}
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
    marginBottom: SIZES.padding.large * 2,
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
  forgotPasswordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding.large,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.base,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberMeText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.secondary,
  },
  forgotPasswordText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.error,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SIZES.padding.medium,
    fontSize: FONTS.sizes.medium,
  },
  signInButton: {
    marginBottom: SIZES.padding.large,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SIZES.padding.large,
  },
  signUpText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text.secondary,
  },
  signUpLink: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.primary,
    fontWeight: 'bold',
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

export default LoginScreen;