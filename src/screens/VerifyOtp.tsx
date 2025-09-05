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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

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
        {/* 🔥 Replaced ScrollView with KeyboardAwareScrollView */}
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          enableOnAndroid={true}
          extraScrollHeight={20}
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

            <CustomText style={styles.phoneText}>
              OTP has been sent to{' '}
              <CustomText style={styles.phoneNumber}>{phoneNumber}</CustomText>
            </CustomText>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <CustomText style={styles.changeNumber}>Change Number</CustomText>
            </TouchableOpacity>

            <View style={styles.footerNote}>
              <CustomText style={styles.safeText}>
                Your information is safe with us. We never share your number.
              </CustomText>

              <TouchableOpacity>
                <CustomText style={styles.supportLink}>
                  Need Help? Contact Support
                </CustomText>
              </TouchableOpacity>
            </View>

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
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#111',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
    marginBottom: 24,
  },
  appName: {
    fontWeight: 'bold',
    color: '#2874F0',
    fontSize: 15,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  verifyBtn: {
    backgroundColor: '#2874F0',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 6,
  },
  resendWrapper: {
    alignSelf: 'center',
  },
  resendText: {
    fontSize: 15,
    color: '#2874F0',
    fontWeight: '600',
  },
  resendTimerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  phoneText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  phoneNumber: {
    fontWeight: '700',
    color: '#000',
  },
  changeNumber: {
    textAlign: 'center',
    fontSize: 14,
    color: '#2874F0',
    marginBottom: 24,
    fontWeight: '600',
  },
  footerNote: {
    marginTop: 40,
    alignItems: 'center',
  },
  safeText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
  },
  supportLink: {
    fontSize: 14,
    color: '#2874F0',
    fontWeight: '600',
  },
});

export default VerifyOtp;
