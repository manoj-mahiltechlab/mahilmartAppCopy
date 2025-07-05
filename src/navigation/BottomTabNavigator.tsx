import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ProductDashboard from '@features/dashboard/ProductDashboard';
import CartScreen from '../screens/CartScreen';
import Profile from '@features/profile/profile';
import CustomerStack from './CustomerStack';
import DeliveryDashboard from '@features/delivery/DeliveryDashboard';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName = 'home';
          if (route.name === 'Home')
            iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Cart')
            iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Account')
            iconName = focused ? 'account' : 'account-outline';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Home" component={CustomerStack} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Account" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
