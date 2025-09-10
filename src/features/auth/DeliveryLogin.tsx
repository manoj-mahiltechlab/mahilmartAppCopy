import React, {FC, useState} from 'react';
import {
  View,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import CustomSafeAreaView from '@components/global/CustomSafeAreaView';
import CustomText from '@components/ui/CustomText';
import CustomInput from '@components/ui/CustomInput';
import CustomButton from '@components/ui/CustomButton';
import {screenHeight} from '@utils/Scaling';
import {Fonts} from '@utils/Constants';
import {deliveryLogin} from '@service/authService';
import {RootStackParamList} from '@navigation/Navigation';

type DeliveryNavProp = StackNavigationProp<RootStackParamList, 'DeliveryLogin'>;

const brandStyle: 'flipkart' | 'amazon' | 'alibaba' = 'flipkart'; // change to test

const brandThemes = {
  flipkart: {
    primary: '#2874F0',
    accent: '#FF9F00',
    buttonBg: '#2874F0',
    buttonText: '#fff',
    radius: 12,
    elevation: 4,
  },
  amazon: {
    primary: '#232F3E',
    accent: '#FF9900',
    buttonBg: '#FF9900',
    buttonText: '#111',
    radius: 4,
    elevation: 6,
  },
  alibaba: {
    primary: '#FF6A00',
    accent: '#FF9F00',
    buttonBg: '#FF6A00',
    buttonText: '#fff',
    radius: 20,
    elevation: 3,
  },
};

const DeliveryLogin: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<DeliveryNavProp>();
  const [showPassword, setShowPassword] = useState(false);

  const theme = brandThemes[brandStyle];

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || trimmedPassword.length < 8) {
      Alert.alert('Invalid Input', 'Please enter valid email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await deliveryLogin(trimmedEmail, trimmedPassword);

      if (res?.success) {
        navigation.reset({
          index: 0,
          routes: [{name: 'DeliveryDashboard'}],
        });
      } else {
        Alert.alert('Login Failed', res.message || 'Invalid credentials.');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Email or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: theme.primary}}>
      <CustomSafeAreaView>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <View
              style={[
                styles.card,
                {
                  backgroundColor: '#fff',
                  borderRadius: theme.radius,
                  elevation: theme.elevation,
                  shadowColor: theme.primary,
                },
              ]}>
              <View style={styles.lottieContainer}>
                <LottieView
                  autoPlay
                  loop
                  style={styles.lottie}
                  source={require('@assets/animations/delivery_man.json')}
                  hardwareAccelerationAndroid
                />
              </View>

              <CustomText
                variant="h3"
                fontFamily={Fonts.Bold}
                style={{color: theme.primary, marginBottom: 6}}>
                Delivery Partner Portal
              </CustomText>
              <CustomText
                variant="h6"
                style={[styles.text, {color: theme.accent}]}
                fontFamily={Fonts.SemiBold}>
                Faster than Flash⚡
              </CustomText>

              {/* Email */}
              <View style={styles.inputContainer}>
                <CustomInput
                  onChangeText={setEmail}
                  value={email}
                  placeholder="Email"
                  inputMode="email"
                  containerStyle={{
                    borderColor: theme.accent,
                    borderWidth: 1,
                    borderRadius: 8,
                  }}
                  left={
                    <Icon
                      name="mail"
                      color={theme.accent}
                      style={{marginLeft: 10}}
                      size={RFValue(18)}
                    />
                  }
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <CustomInput
                  onChangeText={setPassword}
                  value={password}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  containerStyle={{
                    borderColor: theme.accent,
                    borderWidth: 1,
                    borderRadius: 8,
                  }}
                  left={
                    <Icon
                      name="key-sharp"
                      color={theme.accent}
                      style={{marginLeft: 10}}
                      size={RFValue(18)}
                    />
                  }
                  right={
                    <TouchableOpacity
                      onPress={() => setShowPassword(prev => !prev)}>
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={RFValue(18)}
                        color={theme.accent}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              {/* Button with Press Effect */}
              <View style={styles.buttonContainer}>
                <Pressable
                  style={({pressed}) => [
                    {
                      transform: [{scale: pressed ? 0.96 : 1}],
                    },
                  ]}>
                  <CustomButton
                    title="Login"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={!email || password.length < 8}
                    style={{
                      backgroundColor: theme.buttonBg,
                      borderRadius: theme.radius,
                    }}
                    textStyle={{color: theme.buttonText}}
                  />
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </CustomSafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
    alignItems: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  lottieContainer: {
    height: screenHeight * 0.18,
    width: '100%',
    marginBottom: 20,
  },
  lottie: {
    height: '100%',
    width: '100%',
  },
  text: {
    marginBottom: 25,
    opacity: 0.9,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 15,
  },
});

export default DeliveryLogin;
