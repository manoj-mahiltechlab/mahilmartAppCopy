import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Feature Screens
import ProductDashboard from '@features/dashboard/ProductDashboard';
import ProductCategories from '@features/category/ProductCategories';
import ProductDetails from '@features/category/ProductDetails';
import ProductSubDetails from '@features/category/ProductSubDetails';
import ProductOrder from '@features/order/ProductOrder';
import OrderSuccess from '@features/order/OrderSuccess';
import EditAddressScreen from '@features/order/EditAddressScreen';
import LiveTracking from '@features/map/LiveTracking';
import Profile from '@features/profile/profile';
import CategoryOrSubcategory from '@components/dashboard/CategoryOrSubcategory';
import PaymentScreen from '@features/order/PaymentScreen';

const Stack = createNativeStackNavigator();

const CustomerStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProductDashboard" component={ProductDashboard} />
      <Stack.Screen name="ProductCategories" component={ProductCategories} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="ProductSubDetails" component={ProductSubDetails} />
      <Stack.Screen
        name="CategoryOrSubcategory"
        component={CategoryOrSubcategory}
      />
      <Stack.Screen name="ProductOrder" component={ProductOrder} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
      <Stack.Screen name="EditAddressScreen" component={EditAddressScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTracking} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

export default CustomerStack;
