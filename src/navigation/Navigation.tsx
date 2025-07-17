import React, {FC} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from '@utils/NavigationUtils';

// Screens
import SplashScreen from '@features/auth/SplashScreen';
import DeliveryLogin from '@features/auth/DeliveryLogin';
import CustomerLogin from '@features/auth/CustomerLogin';
import DeliveryDashboard from '@features/delivery/DeliveryDashboard';
import BottomTabNavigator from './BottomTabNavigator';
import LogoutScreen from '@features/auth/LogoutScreen';
import DeliveryMap from '@features/delivery/DeliveryMap';
import PaymentScreen from '@features/order/PaymentScreen';
import VerifyOtp from '../screens/VerifyOtp';

export type RootStackParamList = {
  SplashScreen: undefined;
  BottomTabs: undefined;
  DeliveryDashboard: undefined;
  DeliveryLogin: undefined;
  CustomerLogin: undefined;
  VerifyOtp: {phoneNumber: string};
  DeliveryMap: any;
  PaymentScreen: {
    totalAmount: number;
    orderId: string;
    deliveryAddress: string;
    addressType: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="CustomerLogin" component={CustomerLogin} />
        <Stack.Screen name="VerifyOtp" component={VerifyOtp} />
        <Stack.Screen name="DeliveryLogin" component={DeliveryLogin} />
        <Stack.Screen name="Logout" component={LogoutScreen} />
        <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboard} />
        <Stack.Screen name="DeliveryMap" component={DeliveryMap} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
