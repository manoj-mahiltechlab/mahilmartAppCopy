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

const brandStyle: 'flipkart' | 'amazon' | 'alibaba' = 'flipkart'; // change this to test styles

const brandThemes = {
  flipkart: {
    primary: '#2874F0',
    accent: '#FF9F00',
    buttonBg: '#2874F0',
    buttonText: '#fff',
  },
  amazon: {
    primary: '#232F3E',
    accent: '#FF9900',
    buttonBg: '#FF9900',
    buttonText: '#111',
  },
  alibaba: {
    primary: '#FF6A00',
    accent: '#FF9F00',
    buttonBg: '#FF6A00',
    buttonText: '#fff',
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
    if (!email || password.length < 8) {
      Alert.alert('Invalid Input', 'Please enter valid email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await deliveryLogin(email, password);

      if (res?.success) {
        navigation.reset({
          index: 0,
          routes: [{name: 'DeliveryDashboard'}],
        });
      } else {
        Alert.alert('Login Failed', 'Invalid credentials.');
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust offset for header height
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <View style={[styles.card, {backgroundColor: '#fff'}]}>
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
                style={{color: theme.primary}}>
                Delivery Partner Portal
              </CustomText>
              <CustomText
                variant="h6"
                style={[styles.text, {color: theme.accent}]}
                fontFamily={Fonts.SemiBold}>
                Faster than Flash⚡
              </CustomText>

              <View style={styles.inputContainer}>
                <CustomInput
                  onChangeText={setEmail}
                  value={email}
                  placeholder="Email"
                  inputMode="email"
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

              <View style={styles.inputContainer}>
                <CustomInput
                  onChangeText={setPassword}
                  value={password}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
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

              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Login"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={!email || password.length < 8}
                  style={{backgroundColor: theme.buttonBg}}
                  textStyle={{color: theme.buttonText}}
                />
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
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
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
    marginTop: 4,
    marginBottom: 30,
    opacity: 0.8,
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
