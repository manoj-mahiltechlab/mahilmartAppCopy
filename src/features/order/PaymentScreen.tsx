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
  const [paymentMethod, setPaymentMethod] = useState<
    'COD' | 'UPI' | 'CARD' | 'WALLET'
  >('COD'); // default COD

  const {
    cartData = [],
    totalAmount = 0,
    deliveryCharge = 0,
    deliveryAddress = '',
    addressType = 'primary',
    liveLocation = {},
    branchId,
  } = route.params || {};

  const subTotal = totalAmount - deliveryCharge;

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    try {
      if (paymentMethod !== 'COD') {
        Alert.alert('Coming Soon', `${paymentMethod} payment not enabled yet.`);
        setIsPlacingOrder(false);
        return;
      }

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
        paymentMethod,
      );

      const order = res?.order;
      if (!order?._id) throw new Error('Order creation failed.');

      setCurrentOrder(order);
      clearCart();

      navigation.navigate('OrderSuccess', {
        orderId: order._id,
        deliveryAddress,
        addressType,
        name: order.customer?.name || '',
        customerPhone: order.customer?.phone,
        receiverPhone: order.customer?.secondaryContact?.phone,
      });
    } catch (error: any) {
      Alert.alert('Order Failed', error.message || 'Please try again later.');
      console.error('❌ Order creation error:', error.response?.data || error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ Bill Breakdown */}
      <View style={styles.billBox}>
        <Text style={styles.label}>Subtotal: </Text>
        <Text style={styles.value}>₹{subTotal}</Text>
      </View>
      <View style={styles.billBox}>
        <Text style={styles.label}>Delivery Charge: </Text>
        <Text
          style={[
            styles.value,
            {color: deliveryCharge === 0 ? 'green' : 'red'},
          ]}>
          {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
        </Text>
      </View>
      <View style={[styles.billBox, styles.totalBox]}>
        <Text style={styles.totalText}>Grand Total: </Text>
        <Text style={styles.totalText}>₹{totalAmount}</Text>
      </View>

      {/* ✅ Payment Method Selector */}
      <Text style={[styles.label, {marginTop: 20}]}>Select Payment Method</Text>
      {['COD', 'UPI', 'CARD', 'WALLET'].map(method => (
        <TouchableOpacity
          key={method}
          style={[
            styles.methodButton,
            paymentMethod === method && styles.methodSelected,
          ]}
          onPress={() => setPaymentMethod(method as any)}>
          <Text
            style={[
              styles.methodText,
              paymentMethod === method && styles.methodTextSelected,
            ]}>
            {method === 'COD'
              ? 'Cash on Delivery'
              : method === 'UPI'
              ? 'UPI / Wallet'
              : method === 'CARD'
              ? 'Credit / Debit Card'
              : 'Wallet Balance'}
          </Text>
        </TouchableOpacity>
      ))}

      {/* ✅ Place Order button */}
      <TouchableOpacity
        style={[styles.payButton, isPlacingOrder && {opacity: 0.6}]}
        onPress={handlePlaceOrder}
        disabled={isPlacingOrder}>
        {isPlacingOrder ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {paymentMethod === 'COD' ? 'Place COD Order' : 'Proceed to Pay'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
  },
  billBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 6,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  methodButton: {
    padding: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  methodSelected: {
    borderColor: '#0f9d58',
    backgroundColor: '#e8f5e9',
  },
  methodText: {
    fontSize: 15,
    color: '#333',
  },
  methodTextSelected: {
    color: '#0f9d58',
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#0f9d58',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
