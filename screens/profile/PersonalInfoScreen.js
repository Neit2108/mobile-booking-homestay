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
import CustomDatePicker from '../../components/utils/CustomDatePicker'; // Using our custom component
import GenderSelector from '../../components/utils/GenderSelector';

// API and Context
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, uploadImage, updateImage, deleteImage, setUserAuthToken } from '../../api/user';

// Constants
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const PersonalInfoScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user, token, updateUserData } = useAuth();
  
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
  
  // Set auth token for API calls when component mounts
  useEffect(() => {
    if (token) {
      setUserAuthToken(token);
    }
  }, [token]);
  
  // Fetch user profile on mount to ensure latest data
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoadingProfile(false);
      console.error('No authentication token available');
      Alert.alert('Authentication Error', 'Please login again to update your profile');
    }
  }, [token]);
  
  // Function to fetch the latest user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      // Pass token explicitly to ensure it's used
      const response = await getProfile(token);
      
      if (response && response.data) {
        // Update form data with the latest profile information
        const userData = response.data;
        
        // Handle gender value from API - it could be:
        // 1. A string like "Nam", "Nữ", "Khác"
        // 2. A number like 0, 1, 2 (enum values)
        // 3. Possibly null or undefined
        let userGender = userData.gender;
        
        // Log the raw gender value from API
        console.log('Raw gender from API:', userGender);
        
        // If gender is a number, convert to the Vietnamese string
        if (userGender !== undefined && userGender !== null) {
          if (!isNaN(userGender)) {
            const genderIndex = parseInt(userGender, 10);
            if (genderIndex === 0) userGender = 'Nam';
            else if (genderIndex === 1) userGender = 'Nữ';
            else if (genderIndex === 2) userGender = 'Khác';
          }
        } else {
          // Default to "Nam" if no gender is provided
          userGender = 'Nam';
        }
        
        const updatedFormData = {
          fullName: userData.name || '',
          identityCard: userData.identityCard || '',
          gender: userGender, // Use the processed gender value
          birthDate: userData.birthday ? new Date(userData.birthday) : null,
          email: userData.email || '',
          phoneNumber: userData.phone || '',
          homeAddress: userData.add || '',
        };
        
        // Log the final gender being set in the form
        console.log('Setting gender in form to:', userGender);
        
        setFormData(updatedFormData);
        
        // Set avatar URL
        setAvatar(userData.avatar || null);
        
        // Update initial form data to detect changes
        setInitialFormData({...updatedFormData});
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Handle errors...
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
        gender: formData.gender, // This should already be in the correct format (Nam, Nữ, Khác)
        birthDate: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : null,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        homeAddress: formData.homeAddress,
      };
      
      // Log the gender being sent to the API for debugging
      console.log('Sending gender to API:', profileData.gender);
      
      // Call API to update profile
      const response = await updateProfile(profileData);
      
      // ... rest of your code
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
        
        // Create a new user object with the updated avatar URL
        const updatedUserData = {
          ...user,
          avatarUrl: response.avatarUrl
        };
        
        // Update user data in context using the updateUserData function
        if (updateUserData) {
          await updateUserData(updatedUserData);
          Alert.alert('Success', 'Profile photo updated successfully');
        } else {
          console.error('updateUserData function is not available in the Auth Context');
          Alert.alert('Warning', 'Photo updated but may require restart to show in all screens');
        }
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
        
        // Create a new user object with null avatarUrl
        const updatedUserData = {
          ...user,
          avatarUrl: null
        };
        
        // Update user data in context using the updateUserData function
        if (updateUserData) {
          await updateUserData(updatedUserData);
          Alert.alert('Success', 'Profile photo deleted successfully');
        } else {
          console.error('updateUserData function is not available in the Auth Context');
          Alert.alert('Warning', 'Photo deleted but may require restart to show in all screens');
        }
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
              
              <CustomDatePicker
                label="Birth Date"
                value={formData.birthDate}
                onChange={(date) => handleInputChange('birthDate', date)}
                placeholder="Select your birth date"
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