import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Keyboard,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  GestureHandlerRootView,
  // PanGestureHandler,  // Commented out for now
  State,
} from 'react-native-gesture-handler';
import CustomSafeAreaView from '@components/global/CustomSafeAreaView';
import ProductSlider from '@components/login/ProductSlider';
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';
import Animated, {
  useSharedValue,
  withTiming,
  useDerivedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {RootStackParamList} from '@navigation/Navigation';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts, lightColors} from '@utils/Constants';
import CustomInput from '@components/ui/CustomInput';
import useKeyboardOffsetHeight from '@utils/useKeyboardOffsetHeight';
import {customerLogin} from '@service/authService';
import CustomButton from '@components/ui/CustomButton';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const bottomColors = [...lightColors].reverse();

const CustomerLogin = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'CustomerLogin'>>();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const keyboardOffsetHeight = useKeyboardOffsetHeight();

  const floating = useSharedValue(0);
  const progress = useSharedValue(0);
  const radius = 0; // increased radius for better circle visibility
  const animationDuration = 3000;

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: animationDuration,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: animationDuration,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  }, []);

  const shopTitleStyle = useAnimatedStyle(() => {
    const theta = progress.value * 0 * Math.PI;
    const translateX = radius * Math.cos(theta);
    const translateY = radius * Math.sin(theta);
    return {
      transform: [{translateX}, {translateY}],
    };
  });

  useEffect(() => {
    floating.value = withRepeat(
      withSequence(
        withTiming(-10, {duration: 1000}),
        withTiming(0, {duration: 1000}),
      ),
      -1,
      true,
    );
  }, []);

  const floatingLogoStyle = useAnimatedStyle(() => ({
    transform: [{translateY: floating.value}],
  }));

  const animatedValue = useSharedValue(0);
  useDerivedValue(() => {
    animatedValue.value = withTiming(
      keyboardOffsetHeight === 0 ? 0 : -keyboardOffsetHeight * 0.9,
      {duration: 200},
    );
  }, [keyboardOffsetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: animatedValue.value}],
  }));

  const isPhoneValid =
    phoneNumber.trim().length === 10 && /^\d{10}$/.test(phoneNumber);

  const handleAuth = async () => {
    console.log('Continue button pressed ✅'); // Add this line

    Keyboard.dismiss();

    setTimeout(async () => {
      setLoading(true);
      try {
        await customerLogin(phoneNumber);
        navigation.navigate('ProductDashboard');
      } catch (error) {
        Alert.alert('Login Failed', 'Please try again.');
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <SafeAreaView style={{flex: 1}}>
          <CustomSafeAreaView>
            <ProductSlider />
            <Animated.ScrollView
              bounces={false}
              style={animatedStyle}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.subContainer}>
              <LinearGradient colors={bottomColors} style={styles.gradient} />
              <View style={styles.content}>
                <Animated.View style={[styles.logoWrapper, floatingLogoStyle]}>
                  <Image
                    source={require('@assets/images/logo.jpeg')}
                    style={styles.logoImage}
                    accessibilityLabel="App Logo"
                  />
                </Animated.View>
                <Animated.View style={shopTitleStyle}>
                  <CustomText variant="h2" fontFamily={Fonts.Bold}>
                    MahilMart Shop
                  </CustomText>
                </Animated.View>

                <CustomText
                  variant="h5"
                  fontFamily={Fonts.SemiBold}
                  style={styles.text}>
                  Log in or sign up
                </CustomText>

                <CustomInput
                  onChangeText={text => setPhoneNumber(text.slice(0, 10))}
                  onClear={() => setPhoneNumber('')}
                  value={phoneNumber}
                  placeholder="Enter mobile number"
                  inputMode="numeric"
                  keyboardType="phone-pad"
                  accessibilityLabel="Mobile Number Input"
                  left={
                    <CustomText
                      style={styles.phoneText}
                      variant="h6"
                      fontFamily={Fonts.SemiBold}>
                      +91
                    </CustomText>
                  }
                />

                <CustomButton
                  disabled={!isPhoneValid || loading}
                  onPress={handleAuth}
                  loading={loading}
                  title="Continue"
                />
              </View>
            </Animated.ScrollView>
          </CustomSafeAreaView>

          <View style={styles.footer}>
            <SafeAreaView />
            <CustomText fontSize={RFValue(8)} style={styles.termsText}>
              By Continuing, you agree to our Terms of Service & Privacy Policy
            </CustomText>
            <SafeAreaView />
          </View>

          <TouchableOpacity
            style={styles.absoluteSwitch}
            onPress={() => navigation.navigate('DeliveryLogin')}>
            <Icon name="bike-fast" color="#000" size={RFValue(18)} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  phoneText: {
    marginLeft: 15,
  },
  absoluteSwitch: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    height: 50,
    width: 50,
    borderRadius: 50,
    right: 10,
    zIndex: 99,
  },
  text: {
    marginTop: 2,
    marginBottom: 10,
    opacity: 0.9,
    textAlign: 'center',
    alignSelf: 'center',
  },
  logoWrapper: {
    height: 110,
    width: 110,
    borderRadius: 20,
    marginVertical: 10,
    alignSelf: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 55,
    width: '100%',
    paddingHorizontal: 10,
  },

  subContainer: {
    flexGrow: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
  },
  gradient: {
    paddingTop: '0%',
    width: '100%',
  },
  termsText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default CustomerLogin;
