import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useCartStore} from '@state/CartStore';
import {useAuthStore} from '@state/authStore';
import {createOrder} from '@service/orderService';
import {navigate} from '@utils/NavigationUtils';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {setCurrentOrder} = useAuthStore();
  const {clearCart} = useCartStore();

  const {
    cartData = [],
    totalAmount = 0,
    deliveryAddress = '',
    addressType = 'primary',
    liveLocation = {},
    branchId,
  } = route.params || {};

  const handlePlaceOrder = async () => {
    try {
      const res = await createOrder(
        cartData,
        totalAmount,
        {
          address: deliveryAddress,
          lat: liveLocation.latitude || 0,
          lng: liveLocation.longitude || 0,
        },
        branchId,
        addressType,
      );

      const order = res?.order;

      if (!order?._id) {
        throw new Error('Order creation failed.');
      }

      console.log('Order created successfully:', order);

      setCurrentOrder(order);
      clearCart();

      navigation.navigate('OrderSuccess', {
        orderId: order._id,
        deliveryAddress,
        addressType,
        name: order.customer?.name || '',
        phone: order.customer?.phone || '',
      });
    } catch (error: any) {
      Alert.alert('Order Failed', error.message || 'Please try again later.');
      console.error('❌ Order creation error:', error.response?.data || error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Total: ₹{totalAmount}</Text>
      <TouchableOpacity style={styles.payButton} onPress={handlePlaceOrder}>
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#0f9d58',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
