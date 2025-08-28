import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Feature Screens
import ProductDashboard from '@features/dashboard/ProductDashboard';
import ProductCategories from '@features/category/ProductCategories';
import ProductDetails from '@features/category/ProductDetails';

import ProductOrder from '@features/order/ProductOrder';
import OrderSuccess from '@features/order/OrderSuccess';
import EditAddressScreen from '@features/order/EditAddressScreen';
import LiveTracking from '@features/map/LiveTracking';
import Profile from '@features/profile/profile';
import CategoryOrSubcategory from '@components/dashboard/CategoryOrSubcategory';
import PaymentScreen from '@features/order/PaymentScreen';
import OrderList from '@features/order/OrderList';
import CartList from '@features/cart/CartList';
import SearchResults from '../screens/SearchResults';
import SupportScreen from '../screens/SupportScreen';
import ProductReviews from '@features/category/ProductReviews';

export type CustomerStackParamList = {
  ProductDashboard: undefined;
  ProductCategories: undefined;
  ProductDetails: undefined;
  ProductSubDetails: undefined;
  CategoryOrSubcategory: undefined;
  OrderList: undefined;
  CartList: undefined;
  ProductOrder: undefined;
  OrderSuccess: undefined;
  EditAddressScreen: undefined;
  LiveTracking: undefined;
  Profile: undefined;
  PaymentScreen: undefined;
  SearchResults: undefined;
  Support: undefined;
  ProductReviews: {productId: string}; // ✅ added
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProductDashboard" component={ProductDashboard} />
      <Stack.Screen name="ProductCategories" component={ProductCategories} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />

      <Stack.Screen
        name="CategoryOrSubcategory"
        component={CategoryOrSubcategory}
      />
      <Stack.Screen name="OrderList" component={OrderList} />
      <Stack.Screen name="CartList" component={CartList} />
      <Stack.Screen name="ProductOrder" component={ProductOrder} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
      <Stack.Screen name="EditAddressScreen" component={EditAddressScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTracking} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="SearchResults" component={SearchResults} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen
        name="ProductReviews"
        component={ProductReviews}
        options={{title: 'Product Reviews'}}
      />
    </Stack.Navigator>
  );
};

export default CustomerStack;
