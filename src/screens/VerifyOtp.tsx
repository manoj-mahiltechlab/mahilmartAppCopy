import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {sendCustomerOtp, verifyCustomerOtp} from '@service/authService';
import CustomText from '@components/ui/CustomText';
import CustomButton from '@components/ui/CustomButton';
import {Fonts} from '@utils/Constants';
import {navigationRef} from '@utils/NavigationUtils';
import {mmkvStorage} from '@state/storage';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const {params} = useRoute();
  const navigation = useNavigation();
  const phoneNumber = params?.phoneNumber;
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullOtp = updatedOtp.join('');
    if (fullOtp.length === 6) {
      Keyboard.dismiss();
      handleVerify(fullOtp);
    }
  };

  const handleBackspace = (key: string, index: number) => {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const response = await sendCustomerOtp(phoneNumber);
      console.log('🔁 Resent OTP:', response);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your number.');
      setCanResend(false);
      setResendTimer(60);
    } catch (err) {
      console.log('❌ Resend OTP Error:', err?.response?.data || err.message);
      Alert.alert('Failed to resend OTP', 'Please try again later.');
    }
  };

  const handleVerify = async (fullOtpParam?: string) => {
    const fullOtp = fullOtpParam || otp.join('');
    if (fullOtp.length !== 6) {
      Alert.alert('Invalid OTP', 'Enter a 6-digit OTP');
      return;
    }

    try {
      console.log('📲 Phone:', phoneNumber, '🔢 OTP:', fullOtp);
      setLoading(true);

      const otpToken = await AsyncStorage.getItem('otpToken');
      if (!otpToken) {
        Alert.alert('Session expired', 'Please request a new OTP.');
        navigation.goBack();
        return;
      }

      console.log('🛡️ OTP Token:', otpToken);

      const result = await verifyCustomerOtp(phoneNumber, fullOtp, otpToken);

      if (result.success) {
        mmkvStorage.setItem('accessToken', result.accessToken);
        mmkvStorage.setItem('refreshToken', result.refreshToken);
        mmkvStorage.setItem('customer', JSON.stringify(result.customer));

        navigationRef.current?.reset({
          index: 0,
          routes: [{name: 'BottomTabs'}],
        });
      } else {
        Alert.alert('Verification Failed', 'Incorrect OTP');
      }
    } catch (err) {
      console.log('❌ Verify Error:', err?.response?.data || err.message);
      Alert.alert('Verification Failed', 'Check your OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss}>
            <CustomText
              variant="h3"
              fontFamily={Fonts.Bold}
              style={styles.title}>
              OTP Verification
            </CustomText>

            <CustomText style={styles.subtitle}>
              Enter the verification code sent to your number for{' '}
              <CustomText style={styles.appName}>MahilMartApp</CustomText>
            </CustomText>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputRefs.current[index] = ref)}
                  style={styles.otpBox}
                  value={digit}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={({nativeEvent}) =>
                    handleBackspace(nativeEvent.key, index)
                  }
                />
              ))}
            </View>

            <CustomButton
              title="Verify"
              onPress={() => handleVerify()}
              loading={loading}
              style={styles.verifyBtn}
            />

            {canResend ? (
              <>
                <CustomText style={styles.infoText}>
                  Didn’t receive the code?
                </CustomText>

                <TouchableOpacity
                  style={styles.resendWrapper}
                  onPress={handleResend}>
                  <CustomText style={styles.resendText}>Resend</CustomText>
                </TouchableOpacity>
              </>
            ) : (
              <CustomText style={styles.resendTimerText}>
                Resend in 00:{resendTimer < 10 ? '0' : ''}
                {resendTimer}
              </CustomText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 24,
    color: '#333',
  },
  appName: {
    fontWeight: 'bold',
    color: '#FF6B00',
    fontSize: 16,
    letterSpacing: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpBox: {
    width: 50,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#ffffffff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  verifyBtn: {
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 8,
  },

  resendWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    alignSelf: 'center',
  },

  resendText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },

  resendTimerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default VerifyOtp;
