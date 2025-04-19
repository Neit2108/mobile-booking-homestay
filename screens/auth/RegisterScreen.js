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
      errors.fullName = 'Full Name is required';
    }
    
    if (!userData.identityCard.trim()) {
      errors.identityCard = 'Identity Card number is required';
    } else if (userData.identityCard.length !== 12) {
      errors.identityCard = 'Identity Card must be 12 characters';
    }
    
    if (!userData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Email format is invalid';
    }
    
    if (!userData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone Number is required';
    } else if (!/^\d{10,15}$/.test(userData.phoneNumber.replace(/[^\d]/g, ''))) {
      errors.phoneNumber = 'Phone number format is invalid';
    }
    
    if (!userData.homeAddress.trim()) {
      errors.homeAddress = 'Home Address is required';
    }
    
    if (!userData.username.trim()) {
      errors.username = 'Username is required';
    } else if (userData.username.length < 4) {
      errors.username = 'Username must be at least 4 characters';
    }
    
    if (!userData.password) {
      errors.password = 'Password is required';
    } else if (userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      await register(userData);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Registration with ${provider}`);
    // Implement social registration here
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Lorem ipsum dolor sit amet, consectetur</Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              label="Full Name"
              placeholder="Enter your name"
              value={userData.fullName}
              onChangeText={(text) => updateUserData('fullName', text)}
              error={validationErrors.fullName}
              autoCapitalize="words"
            />
            
            <CustomInput
              label="Identity Card"
              placeholder="Enter your identity card number"
              value={userData.identityCard}
              onChangeText={(text) => updateUserData('identityCard', text)}
              error={validationErrors.identityCard}
              keyboardType="number-pad"
            />
            
            <CustomInput
              label="E-mail"
              placeholder="Enter your email"
              value={userData.email}
              onChangeText={(text) => updateUserData('email', text)}
              error={validationErrors.email}
              keyboardType="email-address"
            />
            
            <CustomInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={userData.phoneNumber}
              onChangeText={(text) => updateUserData('phoneNumber', text)}
              error={validationErrors.phoneNumber}
              keyboardType="phone-pad"
            />
            
            <CustomInput
              label="Home Address"
              placeholder="Enter your home address"
              value={userData.homeAddress}
              onChangeText={(text) => updateUserData('homeAddress', text)}
              error={validationErrors.homeAddress}
              multiline
              numberOfLines={2}
            />
            
            <CustomInput
              label="Username"
              placeholder="Choose a username"
              value={userData.username}
              onChangeText={(text) => updateUserData('username', text)}
              error={validationErrors.username}
            />
            
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              value={userData.password}
              onChangeText={(text) => updateUserData('password', text)}
              secureTextEntry
              error={validationErrors.password}
            />
            
            {/* Display API error message if any */}
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            {/* Create Account Button */}
            <CustomButton
              title="Create An Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.createAccountButton}
            />
            
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