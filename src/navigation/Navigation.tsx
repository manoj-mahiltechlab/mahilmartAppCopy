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

// Fake auth state — ✅ Replace this with Zustand or Context later
const isLoggedIn = true;
const userRole = 'Customer'; // or 'DeliveryPartner'

export type RootStackParamList = {
  SplashScreen: undefined;
  BottomTabs: undefined;
  DeliveryDashboard: undefined;
  DeliveryLogin: undefined;
  CustomerLogin: undefined;
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
        {/* Always registered — needed for navigation.reset() to work */}
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="CustomerLogin" component={CustomerLogin} />
        <Stack.Screen name="DeliveryLogin" component={DeliveryLogin} />
        <Stack.Screen name="Logout" component={LogoutScreen} />
        <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboard} />
        <Stack.Screen name="DeliveryMap" component={DeliveryMap} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />

        {isLoggedIn ? (
          userRole === 'Customer' ? (
            <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
          ) : (
            <Stack.Screen
              name="DeliveryDashboard"
              component={DeliveryDashboard}
            />
          )
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
