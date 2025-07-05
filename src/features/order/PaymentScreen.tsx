import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
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

  const handleUPIPayment = async () => {
    const upiId = 'mahilsupermarket@kvb';
    const upiUrl = `upi://pay?pa=${upiId}&pn=MahilMart&tn=Order%20Payment&am=${totalAmount}&cu=INR`;

    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (!supported) {
        Alert.alert(
          'UPI App Not Found',
          'Please install a UPI-supported app like GPay, PhonePe, or Paytm.',
        );
        return;
      }

      await Linking.openURL(upiUrl);

      // Ask user to confirm payment manually
      Alert.alert(
        'Payment Completed?',
        'Did you complete the payment successfully in your UPI app?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                // Step 1: Create Order
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

                // Step 2: Mark order as paid
                await updateOrderStatus(order._id, 'paid');

                // Step 3: Save order, clear cart, and navigate
                setCurrentOrder(order);
                clearCart();
                navigation.navigate('OrderSuccess', {
                  ...order,
                  deliveryAddress,
                  addressType,
                });
              } catch (error) {
                console.error('Order Error:', error);
                Alert.alert(
                  'Order Error',
                  'Payment succeeded but order creation failed. Please contact support.',
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('UPI Launch Error:', error);
      Alert.alert(
        'Payment Failed',
        'Failed to open UPI app. Please try again or use a different method.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Proceed to pay ₹{totalAmount}</Text>
      <TouchableOpacity style={styles.payButton} onPress={handleUPIPayment}>
        <Text style={styles.buttonText}>Pay with UPI</Text>
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
