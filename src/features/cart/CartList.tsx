import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useCartStore} from '@state/CartStore';
import OrderItem from '@features/order/OrderItem';
import CustomHeader from '@components/ui/CustomHeader';
import {CustomerStackParamList} from '@navigation/CustomerStack';

type NavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'CartList'
>;

const CartList = () => {
  const navigation = useNavigation<NavigationProp>();
  const cartItems = useCartStore(state => state.cart);
  const totalItems = cartItems?.reduce((acc, item) => acc + item.count, 0);
  const hasItems = cartItems && cartItems.length > 0;

  return (
    <View style={styles.pageContainer}>
      <CustomHeader
        title={`My Cart (${totalItems} Item${totalItems !== 1 ? 's' : ''})`}
      />

      <ScrollView contentContainerStyle={styles.cartContainer}>
        {hasItems ? (
          cartItems.map(item => <OrderItem key={item._id} item={item} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
            <Text style={styles.subText}>Start adding items to your cart!</Text>
          </View>
        )}
      </ScrollView>

      {hasItems && (
        <View style={styles.footer}>
          <View style={styles.totalContainer} />
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('ProductOrder')}>
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  cartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 12,
    padding: 10,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    paddingBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
  },
  subText: {
    marginTop: 6,
    fontSize: 14,
    color: '#aaa',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    elevation: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  checkoutButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartList;
