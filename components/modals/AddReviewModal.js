import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

// API
import { postPlaceReview } from '../../api/places';

//context
import {useAuth} from '../../context/AuthContext'

const { width } = Dimensions.get('window');

const AddReviewModal = ({ visible, onClose, placeId, rating: initialRating }) => {
  const [reviewText, setReviewText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(initialRating);
  const {user} = useAuth();
  
  // Reset form when modal becomes visible
  useEffect(() => {
    if (visible) {
      setRating(initialRating);
    }
  }, [visible, initialRating]);
  
  const handleAddPhoto = async () => {
    try {
      // Request permission to access photos
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to add photos.');
        return;
      }
      
      // Open image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      
      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        // Limit number of images to 5
        if (selectedImages.length >= 5) {
          Alert.alert('Limit Reached', 'You can only add up to 5 images per review.');
          return;
        }
        
        // Add selected image to the array
        setSelectedImages([...selectedImages, pickerResult.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  const handleRemoveImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };
  
  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Review Required', 'Please enter your review before submitting.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create form data for API request
      const formData = new FormData();
      formData.append('content', reviewText);
      formData.append('rating', rating);
      formData.append('senderId', user.id);
      formData.append('placeId', placeId);
      
      // Add images to form data
      selectedImages.forEach((uri, index) => {
        const imageName = uri.split('/').pop();
        const imageType = 'image/' + (imageName.split('.').pop() === 'png' ? 'png' : 'jpeg');
        
        formData.append('commentImages', {
          uri,
          name: imageName,
          type: imageType,
        });
      });
      
      // Call API to submit review
      await postPlaceReview(formData);
      
      // Show success message
      Alert.alert(
        'Review Submitted', 
        'Your review has been submitted successfully.',
        [{ text: 'OK', onPress: () => {
          // Reset form and close modal
          resetForm();
          onClose(true); // Pass true to indicate successful submission
        }}]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };
  
  // Reset the form state
  const resetForm = () => {
    setReviewText('');
    setSelectedImages([]);
    setRating(initialRating);
  };
  
  // Handle modal close
  const handleClose = () => {
    // Reset form when closing without submitting
    resetForm();
    onClose(false); // Pass false to indicate no submission
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Write a Review</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Editable Rating Stars */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={`star-${value}`}
                  style={styles.starButton}
                  onPress={() => handleRatingChange(value)}
                >
                  <Ionicons
                    name="star"
                    size={36}
                    color={value <= rating ? '#FFD700' : '#E0E0E0'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>{rating} Star Rating</Text>
            
            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesPreviewContainer}
              >
                {selectedImages.map((uri, index) => (
                  <View key={`image-${index}`} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            
            {/* Review Text Input */}
            <TextInput
              style={styles.textInput}
              placeholder="Write your review here..."
              placeholderTextColor={COLORS.text.placeholder}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            
            {/* Add Photo Button */}
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}
              disabled={loading}
            >
              <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </ScrollView>
          
          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmitReview}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: SIZES.padding.large + (Platform.OS === 'ios' ? 20 : 0), // Extra padding for iOS
    maxHeight: '90%',
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SIZES.padding.small,
  },
  scrollContent: {
    padding: SIZES.padding.large,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.padding.medium,
  },
  starButton: {
    padding: 5, // Larger touch area
  },
  ratingText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: SIZES.padding.medium,
  },
  imagesPreviewContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.padding.medium,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: SIZES.padding.medium,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: SIZES.borderRadius.small,
    backgroundColor: COLORS.background.secondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  textInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: SIZES.borderRadius.medium,
    padding: SIZES.padding.medium,
    fontSize: 16,
    color: COLORS.text.primary,
    minHeight: 150,
    marginBottom: SIZES.padding.medium,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding.medium,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.medium,
    alignSelf: 'flex-start',
  },
  addPhotoText: {
    marginLeft: SIZES.padding.small,
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding.medium,
    borderRadius: SIZES.borderRadius.medium,
    margin: SIZES.padding.large,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddReviewModal;