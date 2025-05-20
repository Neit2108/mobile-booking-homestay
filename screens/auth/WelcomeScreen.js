import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../constants/theme';
const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonsSlideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsSlideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = () => navigation.navigate('Login');
  const handleRegister = () => navigation.navigate('Register');
  const handleExplore = () => navigation.navigate('Explore');

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Background image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1080&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay: phủ nhẹ toàn màn để tăng contrast, có thể chỉnh lại màu nếu muốn */}
        <View style={styles.fullScreenOverlay} />

        {/* Header bar */}
        <View style={styles.headerBar}>
          <Ionicons name="menu" size={26} color="white" />
          <Ionicons name="help-circle-outline" size={26} color="white" />
        </View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo + Tiêu đề */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + 'DD']}
                style={styles.logoBackground}
              >
                <Ionicons name="home" size={54} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.titleBox}>
              <Text style={styles.title}>Homies Stay</Text>
              <Text style={styles.subtitle}>Tìm kiếm nơi ở hoàn hảo cho chuyến đi của bạn</Text>
            </View>
          </View>

          {/* Features highlights */}
          <View style={styles.featuresBox}>
            <View style={styles.featureItem}>
              <Ionicons name="search" size={22} color={COLORS.primary} />
              <Text style={styles.featureText}>Tìm kiếm dễ dàng</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={22} color={COLORS.primary} />
              <Text style={styles.featureText}>Đánh giá chất lượng</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
              <Text style={styles.featureText}>Đảm bảo an toàn</Text>
            </View>
          </View>
        </Animated.View>

        {/* Button container */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: buttonsSlideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.exploreLinkContainer} onPress={handleLogin}>
            <Text style={styles.exploreLink}>Khám phá ngay</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={60} tint="dark" style={styles.buttonsBlurView}>
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
                  <Text style={[styles.buttonText, styles.registerButtonText]}>Đăng ký</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          ) : (
            <View style={styles.buttonsAndroid}>
              {/* <View style={styles.buttonsRow}>
                <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
                  <Text style={[styles.buttonText, styles.registerButtonText]}>Đăng ký</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          )}
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Overlay toàn màn
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)', // Đủ tối nhưng không làm mất chi tiết ảnh
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 60 : 38,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 5,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoContainer: {
    marginBottom: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Box đen cho title, subtitle
  titleBox: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    width: width * 0.88,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    opacity: 1,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  // Feature list box đen đậm cho dễ đọc
  featuresBox: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderRadius: 18,
    padding: 16,
    width: width * 0.85,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  featureText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 24 : 12,
    zIndex: 10,
  },
  exploreLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 14,
  },
  exploreLink: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 7,
    letterSpacing: 0.1,
  },
  buttonsBlurView: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.7)',
    marginTop: 3,
  },
  buttonsAndroid: {
    backgroundColor: 'rgba(0,0,0,0.84)',
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 3,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.23,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  registerButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  registerButtonText: {
    color: 'white',
  },
});

export default WelcomeScreen;
