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
import NotificationModal from '../../components/modals/NotificationModal';

// API and Context
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, uploadImage, updateImage, deleteImage, setUserAuthToken } from '../../api/user';

// Constants
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { formatPrice } from '../../utils/formatPrice';

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
    birthDate: (initialUserData?.birthDate) ? new Date(initialUserData.birthDate) : null,
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
  
  // Add notification modal state
  const [notificationModal, setNotificationModal] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    actionButtonText: '',
  });
  
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
        const userData = response.data;
        
        let userGender = userData.gender;
        
        if (userGender !== undefined && userGender !== null) {
          if (!isNaN(userGender)) {
            const genderIndex = parseInt(userGender, 10);
            if (genderIndex === 0) userGender = 'Nam';
            else if (genderIndex === 1) userGender = 'Nữ';
            else if (genderIndex === 2) userGender = 'Khác';
          }
        } else {
          userGender = 'Nam';
        }
        
        const updatedFormData = {
          fullName: userData.name || '',
          identityCard: userData.identityCard || '',
          gender: userGender, 
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
      
      // Format the date to YYYY-MM-DD without timezone issues
      const formatDateForAPI = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const profileData = {
        fullName: formData.fullName,
        identityCard: formData.identityCard,
        gender: formData.gender,
        birthDate: formatDateForAPI(formData.birthDate),
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.homeAddress,
      };
      
      console.log('Sending gender to API:', profileData.gender);
      console.log('Sending profileData to API:', profileData);
      
      const response = await updateProfile(profileData);
      
      // Show success notification
      setNotificationModal({
        visible: true,
        type: 'success',
        title: 'Cập nhật thành công!',
        message: 'Thông tin cá nhân của bạn đã được cập nhật thành công.',
        actionButtonText: 'Tải lại trang',
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error notification
      setNotificationModal({
        visible: true,
        type: 'error',
        title: 'Cập nhật thất bại',
        message: error.message || 'Không thể cập nhật thông tin cá nhân. Vui lòng thử lại.',
        actionButtonText: 'Đóng',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleModalAction = () => {
    setNotificationModal({ ...notificationModal, visible: false });
    if (notificationModal.type === 'success') {
      fetchUserProfile(); // Reload the profile data
    }
  };
  
  const handleAvatarPress = async () => {
    const options = [
      {
        text: 'Xem ảnh',
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
        text: 'Đổi ảnh',
        onPress: selectImage,
      },
      {
        text: 'Hủy',
        style: 'cancel',
      },
    ];
    
    // Add delete option only if user has an avatar
    if (avatar) {
      options.splice(2, 0, {
        text: 'Xóa ảnh',
        style: 'destructive',
        onPress: deleteProfileImage,
      });
    }
    
    Alert.alert(
      'Ảnh đại diện',
      'Tùy chọn',
      options,
      { cancelable: true }
    );
  };
  
  const selectImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Cần cấp quyền', 'Bạn cần cấp quyền truy cập vào thư mục ảnh của bạn');
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
        
        if (updateUserData) {
          await updateUserData(updatedUserData);
          Alert.alert('Thành công', 'Ảnh đại diện đã được thay đổi');
        } else {
          console.error('updateUserData function is not available in the Auth Context');
          Alert.alert('Cảnh báo', 'Ảnh đại diện đã được thay đổi nhưng có thể cần khởi động lại ứng dụng để hiển thị trong tất cả các màn hình');
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải lên ảnh');
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
          Alert.alert('Thành công', 'Ảnh đại diện đã được xóa');
        } else {
          console.error('updateUserData function is not available in the Auth Context');
          Alert.alert('Cảnh báo', 'Ảnh đại diện đã được xóa nhưng có thể cần khởi động lại ứng dụng để hiển thị trong tất cả các màn hình');
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Lỗi', error.message || 'Không thể xóa ảnh');
    } finally {
      setIsImageLoading(false);
    }
  };
  
  const handleGoBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Thông tin chưa được lưu',
        'Bạn có thông tin chưa được lưu. Bạn có muốn quay lại không?',
        [
          {
            text: 'Ở lại',
            style: 'cancel',
          },
          {
            text: 'Bỏ qua',
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
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={styles.placeholderRight} />
        </View>
        
        {isLoadingProfile ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chờ...</Text>
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
                  {/* <View style={styles.editAvatarButton}>
                    <Ionicons name="camera" size={16} color="white" />
                  </View> */}
                </>
              )}
            </TouchableOpacity>
            
            {/* Form */}
            <View style={styles.formContainer}>
              <CustomInput
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChangeText={(text) => handleInputChange('fullName', text)}
                error={errors.fullName}
                autoCapitalize="words"
              />
              
              <CustomInput
                label="Căn cước công dân"
                placeholder="Enter your identity card number"
                value={formData.identityCard}
                onChangeText={(text) => handleInputChange('identityCard', text)}
                error={errors.identityCard}
                keyboardType="number-pad"
              />
              
              <GenderSelector
                label="Giới tính"
                value={formData.gender}
                onChange={(gender) => handleInputChange('gender', gender)}
                error={errors.gender}
              />
              
              <CustomDatePicker
                label="Ngày sinh"
                value={formData.birthDate}
                onChange={(date) => handleInputChange('birthDate', date)}
                placeholder="Chọn..."
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
                label="Số điện thoại"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text)}
                error={errors.phoneNumber}
                keyboardType="phone-pad"
              />
              
              <CustomInput
                label="Địa chỉ"
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
                title="Lưu thông tin"
                onPress={handleSaveChanges}
                disabled={!hasChanges || isLoading}
                loading={isLoading}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>
        )}
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