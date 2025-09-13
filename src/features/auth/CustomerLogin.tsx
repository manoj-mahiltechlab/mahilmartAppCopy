import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useDerivedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {RFValue} from 'react-native-responsive-fontsize';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CustomSafeAreaView from '@components/global/CustomSafeAreaView';
import ProductSlider from '@components/login/ProductSlider';
import CustomText from '@components/ui/CustomText';
import CustomInput from '@components/ui/CustomInput';
import CustomButton from '@components/ui/CustomButton';
import {Fonts, lightColors} from '@utils/Constants';
import {RootStackParamList} from '@navigation/Navigation';
import useKeyboardOffsetHeight from '@utils/useKeyboardOffsetHeight';
import {sendCustomerOtp} from '@service/authService';
import {mmkvStorage} from '@state/storage';
import {useAuthStore} from '@state/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bottomColors = [...lightColors].reverse();

const CustomerLogin = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'CustomerLogin'>>();
  const setUser = useAuthStore(state => state.setUser);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoginTriggered, setAutoLoginTriggered] = useState(false);

  const keyboardOffsetHeight = useKeyboardOffsetHeight();

  const floating = useSharedValue(0);
  const animatedValue = useSharedValue(0);
  const rotate = useSharedValue(0);

  const isPhoneValid = /^\d{10}$/.test(phoneNumber);

  useEffect(() => {
    if (/^\d{10}$/.test(phoneNumber) && !autoLoginTriggered) {
      setAutoLoginTriggered(true); // prevent repeated triggers
      sendOtp(); // call the sendOtp function
    }
  }, [phoneNumber]);

  // ✅ Persistent login: Skip OTP if auth token exists
  useEffect(() => {
    const checkToken = async () => {
      const token = mmkvStorage.getItem('authToken'); // <-- use getItem
      if (token) {
        navigation.replace('BottomTabs'); // token exists → auto-login
      }
    };
    checkToken();
  }, []);

  // 🚀 Animations
  useEffect(() => {
    floating.value = withRepeat(
      withSequence(
        withTiming(-10, {duration: 1000}),
        withTiming(0, {duration: 1000}),
      ),
      -1,
      true,
    );

    rotate.value = withRepeat(
      withSequence(
        withTiming(-2, {duration: 1000}),
        withTiming(2, {duration: 1000}),
      ),
      -1,
      true,
    );
  }, []);

  useDerivedValue(() => {
    animatedValue.value = withTiming(
      keyboardOffsetHeight === 0 ? 0 : -keyboardOffsetHeight * 0.9,
      {duration: 200},
    );
  }, [keyboardOffsetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: animatedValue.value}],
  }));

  const floatingLogoStyle = useAnimatedStyle(() => {
    const scale = 1.05 + Math.sin(Date.now() / 1000) * 0.05;
    return {
      transform: [
        {translateY: floating.value},
        {scale},
        {rotate: `${rotate.value}deg`},
      ],
      opacity: withTiming(0.95 + Math.sin(Date.now() / 500) * 0.05),
    };
  });

  // 📲 Send OTP
  const sendOtp = async () => {
    if (!isPhoneValid) {
      Alert.alert('Invalid Input', 'Enter a valid 10-digit number.');
      return;
    }
    setLoading(true);
    try {
      const response = await sendCustomerOtp(phoneNumber);
      if (response?.success && response.otpToken) {
        await AsyncStorage.setItem('otpToken', response.otpToken);
        navigation.navigate('VerifyOtp', {phoneNumber});
      } else {
        Alert.alert('OTP Failed', response?.message || 'Please try again.');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message || err?.message || 'Something went wrong';
      if (status === 429) {
        Alert.alert(
          'Info',
          'OTP already sent. Please use the code you received.',
        );
        navigation.navigate('VerifyOtp', {phoneNumber});
      } else {
        Alert.alert('OTP Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = () => sendOtp();

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        <CustomSafeAreaView>
          <ProductSlider />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{flex: 1}}>
            <Animated.ScrollView
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

                <CustomText variant="h2" fontFamily={Fonts.Bold}>
                  MahilMart Shop
                </CustomText>
                <CustomText
                  variant="h5"
                  fontFamily={Fonts.SemiBold}
                  style={styles.text}>
                  Log in or sign up
                </CustomText>

                <CustomInput
                  onChangeText={text => {
                    const trimmed = text.slice(0, 10);
                    setPhoneNumber(trimmed);
                    if (!/^\d{10}$/.test(trimmed)) setAutoLoginTriggered(false);
                  }}
                  onClear={() => {
                    setPhoneNumber('');
                    setAutoLoginTriggered(false);
                  }}
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
          </KeyboardAvoidingView>
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
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  phoneText: {marginLeft: 15},
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
    height: 125,
    width: 125,
    borderRadius: 100,
    marginVertical: 10,
    alignSelf: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 12,
  },
  logoImage: {width: '100%', height: '100%', borderRadius: 100},
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
  gradient: {paddingTop: '0%', width: '100%'},
  termsText: {textAlign: 'center', opacity: 0.6},
});

export default CustomerLogin;
