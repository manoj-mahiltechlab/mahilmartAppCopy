import React, {FC} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from '@utils/NavigationUtils';

import SplashScreen from '@features/auth/SplashScreen';
import DeliveryLogin from '@features/auth/DeliveryLogin';
import CustomerLogin from '@features/auth/CustomerLogin';
import ProductDashboard from '@features/dashboard/ProductDashboard';
import DeliveryDashboard from '@features/delivery/DeliveryDashboard';
import ProductCategories from '@features/category/ProductCategories';
import ProductOrder from '@features/order/ProductOrder';
import OrderSuccess from '@features/order/OrderSuccess';
import LiveTracking from '@features/map/LiveTracking';
import profile from '@features/profile/profile';
import DeliveryMap from '@features/delivery/DeliveryMap';
import CategoryOrSubcategory from '@components/dashboard/CategoryOrSubcategory';
import ProductDetails from '@features/category/ProductDetails';
import ProductSubDetails from '@features/category/ProductSubDetails';

export type RootStackParamList = {
  SplashScreen: undefined;
  ProductDashboard: undefined;
  DeliveryDashboard: undefined;
  DeliveryLogin: undefined;
  CustomerLogin: undefined;

  ProductOrder: undefined;
  OrderSuccess: undefined;
  LiveTracking: undefined;
  DeliveryMap: undefined;
  Profile: undefined;
  ProductCategories: {category?: string} | undefined;
  CategoryOrSubcategory: {
    categoryId: string;
    subcategories: any[] | null;
    categoryName?: string;
  };
  ProductDetails: {product: any};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="ProductDashboard" component={ProductDashboard} />
        <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboard} />
        <Stack.Screen name="ProductOrder" component={ProductOrder} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
        <Stack.Screen name="LiveTracking" component={LiveTracking} />
        <Stack.Screen name="DeliveryMap" component={DeliveryMap} />
        <Stack.Screen name="Profile" component={profile} />
        <Stack.Screen name="ProductCategories" component={ProductCategories} />
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="ProductSubDetails" component={ProductSubDetails} />

        <Stack.Screen
          name="CategoryOrSubcategory"
          component={CategoryOrSubcategory}
        />

        <Stack.Screen
          options={{animation: 'default'}}
          name="DeliveryLogin"
          component={DeliveryLogin}
        />
        <Stack.Screen
          options={{animation: 'fade'}}
          name="CustomerLogin"
          component={CustomerLogin}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
