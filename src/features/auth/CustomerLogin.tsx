import React, {useState, useRef, useCallback} from 'react';
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
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import CustomSafeAreaView from '@components/global/CustomSafeAreaView';
import ProductSlider from '@components/login/ProductSlider';
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';
//import {resetAndNavigate} from '@utils/NavigationUtils';
import Animated, {
  useSharedValue,
  withTiming,
  useDerivedValue,
  useAnimatedStyle,
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
//import {resetAndNavigate} from '@utils/NavigationUtils';

const bottomColors = [...lightColors].reverse();

const CustomerLogin = () => {
  // Removed duplicate navigation definition, keeping the correct one
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'CustomerLogin'>>();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const keyboardOffsetHeight = useKeyboardOffsetHeight();
  const animatedValue = useSharedValue(0);
  const gestureSequenceRef = useRef<string[]>([]);

  useDerivedValue(() => {
    animatedValue.value = withTiming(
      keyboardOffsetHeight === 0 ? 0 : -keyboardOffsetHeight * 0.84,
      {duration: 300},
    );
  }, [keyboardOffsetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: animatedValue.value}],
  }));

  const handleGesture = useCallback(
    ({nativeEvent}: any) => {
      if (nativeEvent.state === State.END) {
        const {translationX, translationY} = nativeEvent;
        const direction =
          Math.abs(translationX) > Math.abs(translationY)
            ? translationX > 0
              ? 'right'
              : 'left'
            : translationY > 0
            ? 'down'
            : 'up';

        gestureSequenceRef.current = [
          ...gestureSequenceRef.current,
          direction,
        ].slice(-5);

        if (gestureSequenceRef.current.join(' ') === 'up up down left right') {
          gestureSequenceRef.current = [];
          navigation.navigate('DeliveryLogin');
        }
      }
    },
    [navigation],
  );

  const handleAuth = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      await customerLogin(phoneNumber);
      navigation.navigate('ProductDashboard');
    } catch (error) {
      Alert.alert('Login Failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <CustomSafeAreaView>
          <ProductSlider />

          <PanGestureHandler onHandlerStateChange={handleGesture}>
            <Animated.ScrollView
              bounces={false}
              style={animatedStyle}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.subContainer}>
              <LinearGradient colors={bottomColors} style={styles.gradient} />
              <View style={styles.content}>
                <Image
                  source={require('@assets/images/logo.jpeg')}
                  style={styles.logo}
                  accessibilityLabel="App Logo"
                />
                <CustomText variant="h2" fontFamily={Fonts.Bold}>
                  Grocery Delivery App
                </CustomText>
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
                  disabled={phoneNumber.length !== 10}
                  onPress={handleAuth}
                  loading={loading}
                  title="Continue"
                />
              </View>
            </Animated.ScrollView>
          </PanGestureHandler>
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
    opacity: 0.8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  logo: {
    height: 50,
    width: 50,
    borderRadius: 20,
    marginVertical: 10,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  subContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    position: 'absolute', // Fix the footer to the bottom
    bottom: 0,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
  },
  gradient: {
    paddingTop: 90,
    width: '100%',
  },
  termsText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default CustomerLogin;
