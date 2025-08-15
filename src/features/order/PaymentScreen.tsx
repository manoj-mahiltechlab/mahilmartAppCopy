import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useCartStore} from '@state/CartStore';
import {useAuthStore} from '@state/authStore';
import {createOrder, updateOrderStatus} from '@service/orderService';

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
    userId,
    liveLocation = {},
  } = route.params || {};

  const handlePlaceOrder = async () => {
    let hasMissingPrice = false;
    cartData.forEach(item => {
      if (item.price === undefined) {
        console.warn(
          '⚠ Missing price for product',
          item.product || item.productId,
        );
        hasMissingPrice = true;
      }
    });

    if (hasMissingPrice) {
      Alert.alert(
        'Missing Price',
        'One or more products have no price information. Please update your cart and try again.',
      );
      return;
    }

    try {
      // Create order with paymentStatus already set
      const order = await createOrder(
        cartData,
        totalAmount,
        {
          address: deliveryAddress,
          latitude: liveLocation.latitude || 0,
          longitude: liveLocation.longitude || 0,
        },
        userId,
        addressType === 'primary' ? 'Primary' : 'Secondary',
        'Paid', // ✅ Pass payment status
      );

      if (!order || !order._id) throw new Error('Order creation failed.');

      setCurrentOrder(order);
      clearCart();

      // Navigate to tracking
      navigation.navigate('LiveTracking', {
        order: {
          id: createdOrder.id,
          items: createdOrder.items,
          totalPrice: createdOrder.totalPrice,
          customerName: createdOrder.customer?.name,
          address: createdOrder.deliveryLocation?.address,
          status: createdOrder.status,
        },
      });
    } catch (error) {
      console.log('❌ Order Error:', error);
      Alert.alert('Error', 'Failed to place the order. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Proceed to pay ₹{totalAmount}</Text>
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
