import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useCartStore} from '@state/CartStore';
import {useAuthStore} from '@state/authStore';
import {createOrder} from '@service/orderService';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {setCurrentOrder} = useAuthStore();
  const {clearCart} = useCartStore();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const {
    cartData = [],
    totalAmount = 0,
    deliveryAddress = '',
    addressType = 'primary',
    liveLocation = {},
    branchId,
  } = route.params || {};

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return; // 👈 Prevent double tap
    setIsPlacingOrder(true);

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

      console.log('✅ Order created successfully:', order);

      setCurrentOrder(order);
      clearCart();

      navigation.navigate('OrderSuccess', {
        orderId: order._id,
        deliveryAddress,
        addressType,
        name: order.customer?.name || '',
        phone: order.customer?.secondaryContact?.phone,
      });
    } catch (error: any) {
      Alert.alert('Order Failed', error.message || 'Please try again later.');
      console.error('❌ Order creation error:', error.response?.data || error);
    } finally {
      setIsPlacingOrder(false); // ✅ Re-enable after response
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Total: ₹{totalAmount}</Text>
      <TouchableOpacity
        style={[styles.payButton, isPlacingOrder && {opacity: 0.6}]}
        onPress={handlePlaceOrder}
        disabled={isPlacingOrder}>
        {isPlacingOrder ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Place Order</Text>
        )}
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
