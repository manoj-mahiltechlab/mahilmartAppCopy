import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';

import axios from 'axios';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useCartStore} from '@state/CartStore';
import {useAuthStore} from '@state/authStore';
import {createOrder, updateOrderStatus} from '@service/orderService';
import {BASE_URL} from '@service/config';

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

  const handleRazorpayPayment = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/payment/create-order`, {
        amount: totalAmount,
      });

      const options = {
        description: 'Order Payment',
        currency: 'INR',
        key: 'rzp_test_pwLmgYrraEXLkf',
        amount: res.data.amount,
        name: 'MahilMart',
        order_id: res.data.id,
        prefill: {
          email: 'customer@example.com',
          contact: '9876543210',
          name: 'Customer Name',
        },
        theme: {color: '#0f9d58'},
      };

      RazorpayCheckout.open(options)
        .then(async paymentData => {
          // STEP 1: Verify Payment Signature
          const verifyRes = await axios.post(
            `${BASE_URL}/payment/verify-payment`,
            {
              razorpay_order_id: options.order_id,
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_signature: paymentData.razorpay_signature,
            },
          );

          console.log(`${BASE_URL}/api/payment/verify-payment`);

          if (!verifyRes.data.success) {
            Alert.alert(
              'Payment Verification Failed',
              'Something went wrong. Please contact support.',
            );
            return;
          }

          // STEP 2: Create Order
          const order = await createOrder(
            cartData,
            totalAmount,
            {
              address: deliveryAddress,
              lat: liveLocation.latitude || 0,
              lng: liveLocation.longitude || 0,
            },
            userId,
            addressType === 'primary' ? 'Primary' : 'Secondary',
          );

          if (!order || !order._id) {
            throw new Error('Order creation failed.');
          }

          // STEP 3: Mark Order as Paid
          await updateOrderStatus(order._id, 'paid');

          setCurrentOrder(order);
          clearCart();
          navigation.navigate('OrderSuccess', {
            ...order,
            deliveryAddress,
            addressType,
          });
        })
        .catch(error => {
          Alert.alert(
            'Payment Failed',
            error.description || 'Try again later.',
          );
        });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          '❌ Razorpay Error:',
          error.response?.data || error.message,
        );
      } else if (error instanceof Error) {
        console.log('❌ Unexpected Error:', error.stack);
      } else {
        console.log('❌ Unknown Error:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Proceed to pay ₹{totalAmount}</Text>
      <TouchableOpacity
        style={styles.payButton}
        onPress={handleRazorpayPayment}>
        <Text style={styles.buttonText}>Pay with Razorpay</Text>
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
