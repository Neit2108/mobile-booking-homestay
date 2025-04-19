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

// Context
import { useAuth } from '../../context/AuthContext';

// Constants
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import images from '../../constants/images';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, loading, error } = useAuth();
  
  const [credentials, setCredentials] = useState({
    emailorUsername: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const updateCredentials = (field, value) => {
    setCredentials({ ...credentials, [field]: value });
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: null });
    }
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!credentials.emailorUsername.trim()) {
      errors.emailorUsername = 'Email or username is required';
    }
    
    if (!credentials.password) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      await login(credentials);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // Implement social login here
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateBack = () => {
    // If you have a screen to go back to
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
            <Text style={styles.title}>Let's Sign you in</Text>
            <Text style={styles.subtitle}>Lorem ipsum dolor sit amet, consectetur</Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              label="Email Address"
              placeholder="Enter your email address"
              value={credentials.emailorUsername}
              onChangeText={(text) => updateCredentials('emailorUsername', text)}
              error={validationErrors.emailorUsername}
              keyboardType="email-address"
            />
            
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              value={credentials.password}
              onChangeText={(text) => updateCredentials('password', text)}
              secureTextEntry
              error={validationErrors.password}
            />
            
            {/* Remember Me & Forgot Password */}
            <View style={styles.forgotPasswordRow}>
              <TouchableOpacity style={styles.rememberMeContainer} onPress={toggleRememberMe}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password</Text>
              </TouchableOpacity>
            </View>
            
            {/* Display API error message if any */}
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            {/* Sign In Button */}
            <CustomButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.signInButton}
            />
            
            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            
            {/* Or Sign In with */}
            <View style={styles.dividerContainer}>
              <Text style={styles.dividerText}>Or Sign In with</Text>
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
                By signing up you agree to our{' '}
                <Text style={styles.termsLink}>Terms</Text> and{' '}
                <Text style={styles.termsLink}>Conditions of Use</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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