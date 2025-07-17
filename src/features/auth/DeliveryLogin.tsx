import React, {FC, useState} from 'react';
import {
  View,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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

const DeliveryLogin: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<DeliveryNavProp>();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || password.length < 8) {
      Alert.alert('Invalid Input', 'Please enter valid email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await deliveryLogin(email, password);
      console.log('Login Response:', res); // <-- Add this

      if (res?.success) {
        navigation.reset({
          index: 0,
          routes: [{name: 'DeliveryDashboard'}],
        });
      } else {
        Alert.alert('Login Failed', 'Invalid credentials.');
      }
    } catch (error) {
      console.error('Login error:', error); // <-- Add this
      Alert.alert('Login Failed', 'Email or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <CustomSafeAreaView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{flex: 1}}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <View style={styles.container}>
              <View style={styles.lottieContainer}>
                <LottieView
                  autoPlay
                  loop
                  style={styles.lottie}
                  source={require('@assets/animations/delivery_man.json')}
                  hardwareAccelerationAndroid
                />
              </View>

              <CustomText variant="h3" fontFamily={Fonts.Bold}>
                Delivery Partner Portal
              </CustomText>
              <CustomText
                variant="h6"
                style={styles.text}
                fontFamily={Fonts.SemiBold}>
                Faster than Flash⚡
              </CustomText>

              <CustomInput
                onChangeText={setEmail}
                value={email}
                placeholder="Email"
                inputMode="email"
                left={
                  <Icon
                    name="mail"
                    color="#F8890E"
                    style={{marginLeft: 10}}
                    size={RFValue(18)}
                  />
                }
              />

              <CustomInput
                onChangeText={setPassword}
                value={password}
                placeholder="Password"
                secureTextEntry={!showPassword}
                left={
                  <Icon
                    name="key-sharp"
                    color="#F8890E"
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
                      color="#F8890E"
                    />
                  </TouchableOpacity>
                }
              />

              <CustomButton
                title="Login"
                onPress={handleLogin}
                loading={loading}
                disabled={!email || password.length < 8}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </CustomSafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  lottie: {
    height: '100%',
    width: '100%',
  },
  lottieContainer: {
    height: screenHeight * 0.12,
    width: '100%',
  },
  text: {
    marginTop: 2,
    marginBottom: 25,
    opacity: 0.8,
  },
});

export default DeliveryLogin;
