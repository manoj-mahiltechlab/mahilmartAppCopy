import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import CustomText from '@components/ui/CustomText';
import CustomButton from '@components/ui/CustomButton';
import {Fonts, Colors} from '@utils/Constants';
import {useAuthStore} from '@state/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {mmkvStorage} from '@state/storage';
import {sendCustomerOtp, verifyCustomerOtp} from '@service/authService';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const {params} = useRoute<any>();
  const navigation = useNavigation();
  const setUser = useAuthStore(state => state.setUser);
  const setToken = useAuthStore(state => state.setToken);

  const phone = params?.phoneNumber;

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];

    // Backspace handling
    if (text === '') {
      newOtp[index] = '';
      setOtp(newOtp);

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
      return;
    }

    // Normal input
    newOtp[index] = text;
    setOtp(newOtp);

    // Move focus forward
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const otpToken = await AsyncStorage.getItem('otpToken');
      if (!otpToken) {
        Alert.alert('Session Expired', 'Please request a new OTP.');
        setLoading(false);
        return;
      }

      const response = await verifyCustomerOtp(phone, enteredOtp, otpToken);

      if (response?.success) {
        setToken(response.accessToken);
        setUser(response.customer);
        mmkvStorage.setItem('authToken', response.accessToken);
        await AsyncStorage.removeItem('otpToken');

        Alert.alert('Success', 'OTP verified successfully!', [
          {
            text: 'OK',
            onPress: () =>
              navigation.reset({index: 0, routes: [{name: 'BottomTabs'}]}),
          },
        ]);
      } else {
        Alert.alert(
          'OTP Verification Failed',
          response?.error?.message || 'Invalid OTP',
        );
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Verification failed',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await sendCustomerOtp(phone);
      if (response?.otpToken)
        await AsyncStorage.setItem('otpToken', response.otpToken);
      setOtp(['', '', '', '', '', '']);
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
      Alert.alert('OTP Sent', `A new OTP has been sent to ${phone}`);
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <CustomText style={styles.title}>Verify OTP</CustomText>
      <CustomText style={styles.subtitle}>
        Enter the 6-digit code sent to {phone}
      </CustomText>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              activeIndex === index && styles.activeOtpInput,
              digit !== '' && styles.filledOtpInput,
            ]}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onFocus={() => handleFocus(index)}
            onKeyPress={({nativeEvent}) => {
              if (nativeEvent.key === 'Backspace') {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
                if (index > 0) {
                  inputRefs.current[index - 1]?.focus();
                  setActiveIndex(index - 1);
                }
              }
            }}
          />
        ))}
      </View>

      <CustomButton
        title="Verify OTP"
        onPress={handleVerify}
        loading={loading}
        disabled={loading}
      />

      <TouchableOpacity onPress={handleResend} disabled={loading}>
        <CustomText style={styles.resendText}>Resend OTP</CustomText>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {fontSize: 22, fontFamily: Fonts.Bold, marginBottom: 10},
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    width: 50,
    height: 55,
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 5,
    backgroundColor: '#f8f8f8',
    color: '#000',
  },
  activeOtpInput: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
  },
  filledOtpInput: {
    backgroundColor: '#e6f0ff',
  },
  resendText: {
    marginTop: 20,
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerifyOtp;
