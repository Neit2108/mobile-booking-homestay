import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Components
import CustomInput from '../../components/forms/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';

// API and Context
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, uploadImage, updateImage, deleteImage } from '../../api/user';

// Constants
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

/**
 * Custom Date Picker Component
 */
const DatePicker = ({ label, value, onChange, error }) => {
  const formatDate = (date) => {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handlePress = () => {
    // In a real app, show a date picker
    // For this example, just show alert
    Alert.alert('Date Picker', 'In a real app, a date picker would open here.');
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.datePickerButton, error && styles.inputError]}
        onPress={handlePress}
      >
        <Text style={value ? styles.dateText : styles.placeholderText}>
          {value ? formatDate(value) : 'Select a date'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

/**
 * Custom Gender Selector Component
 */
const GenderSelector = ({ label, value, onChange, error }) => {
  const options = ['Male', 'Female', 'Other'];

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.genderOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.genderOption,
              value === option && styles.genderOptionSelected,
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                styles.genderOptionText,
                value === option && styles.genderOptionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const PersonalInfoScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user, updateUserData } = useAuth();
  
  // Get user data from route params if available
  const initialUserData = route?.params?.userData || user;
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: initialUserData?.fullName || '',
    identityCard: initialUserData?.identityCard || '',
    gender: initialUserData?.gender || 'Male',
    birthDate: initialUserData?.birthDate ? new Date(initialUserData.birthDate) : null,
    email: initialUserData?.email || '',
    phoneNumber: initialUserData?.phoneNumber || '',
    homeAddress: initialUserData?.homeAddress || '',
  });
  
  // Track if form has changed
  const [hasChanges, setHasChanges] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Avatar state
  const [avatar, setAvatar] = useState(initialUserData?.avatarUrl || null);
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Track initial form data to detect changes
  const [initialFormData, setInitialFormData] = useState({});
  
  // Fetch user profile on mount to ensure latest data
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  // Function to fetch the latest user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await getProfile();
      
      if (response && response.data) {
        // Update form data with the latest profile information
        const userData = response.data;
        setFormData({
          fullName: userData.name || '',
          identityCard: userData.identityCard || '',
          gender: userData.gender || 'Male',
          birthDate: userData.birthday ? new Date(userData.birthday) : null,
          email: userData.email || '',
          phoneNumber: userData.phone || '',
          homeAddress: userData.add || '',
        });
        
        // Set avatar URL
        setAvatar(userData.avatar || null);
        
        // Update initial form data to detect changes
        setInitialFormData({
          fullName: userData.name || '',
          identityCard: userData.identityCard || '',
          gender: userData.gender || 'Male',
          birthDate: userData.birthday ? new Date(userData.birthday) : null,
          email: userData.email || '',
          phoneNumber: userData.phone || '',
          homeAddress: userData.add || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile information');
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  // Check for form changes
  useEffect(() => {
    if (Object.keys(initialFormData).length === 0) return;
    
    let changed = false;
    Object.keys(formData).forEach(key => {
      // Special handling for dates
      if (key === 'birthDate') {
        const initialDate = initialFormData[key] ? initialFormData[key].toISOString() : null;
        const currentDate = formData[key] ? formData[key].toISOString() : null;
        if (initialDate !== currentDate) {
          changed = true;
        }
      } else if (formData[key] !== initialFormData[key]) {
        changed = true;
      }
    });
    setHasChanges(changed);
  }, [formData, initialFormData]);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if exists
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    
    if (!formData.identityCard.trim()) {
      newErrors.identityCard = 'Identity Card is required';
    } else if (formData.identityCard.length !== 12) {
      newErrors.identityCard = 'Identity Card must be 12 characters';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender selection is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    
    if (formData.phoneNumber && !/^\+?\d{8,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Phone Number format is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveChanges = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // Create the profile data object in the format expected by the API
      const profileData = {
        fullName: formData.fullName,
        identityCard: formData.identityCard,
        gender: formData.gender,
        birthDate: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : null,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        homeAddress: formData.homeAddress,
      };
      
      // Call API to update profile
      const response = await updateProfile(profileData);
      
      if (response && response.data) {
        // Update user data in context
        updateUserData({
          ...user,
          fullName: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phone,
          homeAddress: response.data.add,
          birthDate: response.data.birthday,
          gender: response.data.gender,
          identityCard: response.data.identityCard,
          avatarUrl: response.data.avatar,
        });
        
        // Update initial form data to reflect saved state
        setInitialFormData({...formData});
        setHasChanges(false);
        
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAvatarPress = async () => {
    const options = [
      {
        text: 'View Photo',
        onPress: () => {
          if (avatar) {
            // In a real app, navigate to image viewer
            Alert.alert('Profile Photo', '', [{ text: 'Close' }], { 
              cancelable: true 
            });
          } else {
            Alert.alert('No Photo', 'You haven\'t set a profile photo yet');
          }
        },
      },
      {
        text: 'Change Photo',
        onPress: selectImage,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ];
    
    // Add delete option only if user has an avatar
    if (avatar) {
      options.splice(2, 0, {
        text: 'Delete Photo',
        style: 'destructive',
        onPress: deleteProfileImage,
      });
    }
    
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      options,
      { cancelable: true }
    );
  };
  
  const selectImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to change your profile photo.');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };
  
  const uploadProfileImage = async (imageAsset) => {
    try {
      setIsImageLoading(true);
      
      // Create form data for image upload
      const formData = new FormData();
      
      // Get file extension
      const uriParts = imageAsset.uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1];
      
      // Create file object
      formData.append('file', {
        uri: imageAsset.uri,
        type: `image/${fileExtension}`,
        name: `profile-${Date.now()}.${fileExtension}`,
      });
      
      // Determine if we need to update or upload a new image
      let response;
      if (avatar) {
        // Update existing avatar
        response = await updateImage(formData);
      } else {
        // Upload new avatar
        response = await uploadImage(formData);
      }
      
      if (response && response.avatarUrl) {
        setAvatar(response.avatarUrl);
        
        // Update user data in context
        updateUserData({
          ...user,
          avatarUrl: response.avatarUrl
        });
        
        Alert.alert('Success', 'Profile photo updated successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setIsImageLoading(false);
    }
  };
  
  const deleteProfileImage = async () => {
    try {
      setIsImageLoading(true);
      
      // Call API to delete the profile image
      const response = await deleteImage();
      
      if (response && response.message) {
        setAvatar(null);
        
        // Update user data in context
        updateUserData({
          ...user,
          avatarUrl: null
        });
        
        Alert.alert('Success', 'Profile photo deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', error.message || 'Failed to delete image');
    } finally {
      setIsImageLoading(false);
    }
  };
  
  const handleGoBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          {
            text: 'Stay',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Info</Text>
          <View style={styles.placeholderRight} />
        </View>
        
        {isLoadingProfile ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar */}
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleAvatarPress}
              disabled={isImageLoading}
            >
              {isImageLoading ? (
                <View style={styles.avatar}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <>
                  {avatar ? (
                    <Image 
                      source={{ uri: avatar }} 
                      style={styles.avatar} 
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={40} color={COLORS.text.secondary} />
                    </View>
                  )}
                  <View style={styles.editAvatarButton}>
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                </>
              )}
            </TouchableOpacity>
            
            {/* Form */}
            <View style={styles.formContainer}>
              <CustomInput
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(text) => handleInputChange('fullName', text)}
                error={errors.fullName}
                autoCapitalize="words"
              />
              
              <CustomInput
                label="Identity Card"
                placeholder="Enter your identity card number"
                value={formData.identityCard}
                onChangeText={(text) => handleInputChange('identityCard', text)}
                error={errors.identityCard}
                keyboardType="number-pad"
              />
              
              <GenderSelector
                label="Gender"
                value={formData.gender}
                onChange={(gender) => handleInputChange('gender', gender)}
                error={errors.gender}
              />
              
              <DatePicker
                label="Birth Date"
                value={formData.birthDate}
                onChange={(date) => handleInputChange('birthDate', date)}
                error={errors.birthDate}
              />
              
              <CustomInput
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <CustomInput
                label="Phone"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text)}
                error={errors.phoneNumber}
                keyboardType="phone-pad"
              />
              
              <CustomInput
                label="Address"
                placeholder="Enter your address"
                value={formData.homeAddress}
                onChangeText={(text) => handleInputChange('homeAddress', text)}
                error={errors.homeAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.addressInput}
              />
              
              {/* Save Button */}
              <CustomButton
                title="Save Changes"
                onPress={handleSaveChanges}
                disabled={!hasChanges || isLoading}
                loading={isLoading}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding.large,
    paddingVertical: SIZES.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SIZES.padding.small,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholderRight: {
    width: 40,
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: SIZES.padding.large * 1.5,
    marginBottom: SIZES.padding.large * 1.5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  formContainer: {
    paddingHorizontal: SIZES.padding.large,
  },
  inputContainer: {
    marginBottom: SIZES.padding.medium,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  datePickerButton: {
    height: 50,
    borderRadius: SIZES.borderRadius.medium,
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SIZES.padding.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    marginHorizontal: 4,
    borderRadius: SIZES.borderRadius.medium,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  genderOptionText: {
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: 'white',
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.text.placeholder,
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  addressInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  saveButton: {
    marginTop: SIZES.padding.large * 2,
    marginBottom: SIZES.padding.large,
  },
});

export default PersonalInfoScreen;