import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CartScreen from '../screens/CartScreen';
import Profile from '@features/profile/profile';
import CustomerStack from './CustomerStack';
import CartList from '@features/cart/CartList';
import {useCartStore} from '@state/CartStore';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const cartItems = useCartStore(state => state.cart); // ✅ Moved inside
  const totalItems = cartItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
          } else if (route.name === 'CartList') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Home" component={CustomerStack} />
      <Tab.Screen name="Orders" component={CartScreen} />
      <Tab.Screen
        name="CartList"
        component={CartList}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge: totalItems > 0 ? totalItems : undefined, // ✅ Badge logic
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name={focused ? 'basket' : 'basket-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen name="Account" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
