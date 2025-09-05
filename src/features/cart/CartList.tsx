import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useCartStore} from '@state/CartStore';
import OrderItem from '@features/order/OrderItem';
import CustomHeader from '@components/ui/CustomHeader';
import {RootStackParamList} from '@navigation/Navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CartList'>;

const CartList = () => {
  const navigation = useNavigation<NavigationProp>();
  const cartItems = useCartStore(state => state.cart);
  const totalItems = cartItems?.reduce((acc, item) => acc + item.count, 0) || 0;
  const totalPrice = cartItems?.reduce(
    (acc, item) => acc + item.price * item.count,
    0,
  );
  const hasItems = cartItems && cartItems.length > 0;

  const renderItem = ({item}: any) => <OrderItem key={item._id} item={item} />;

  return (
    <SafeAreaView style={styles.pageContainer}>
      <CustomHeader
        title={`My Cart (${totalItems} Item${totalItems !== 1 ? 's' : ''})`}
      />

      {hasItems ? (
        <>
          {/* Cart Items */}
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.cartContainer}
          />

          {/* Footer with Price + Checkout */}
          <View style={styles.footer}>
            <View style={styles.priceBox}>
              <Text style={styles.priceTitle}>Price Details</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total Items</Text>
                <Text style={styles.priceValue}>{totalItems}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, {fontWeight: '700'}]}>
                  Grand Total
                </Text>
                <Text style={[styles.priceValue, {fontWeight: '700'}]}>
                  ₹{totalPrice}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('ProductOrder')}>
              <Text style={styles.checkoutText}>
                Proceed to Checkout ({totalItems} items)
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              navigation.navigate('BottomTabs', {
                screen: 'Home',
                params: {screen: 'ProductDashboard'},
              });
            }}>
            <Text style={styles.emptyButtonText}>
              Start adding items to your cart!
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  cartContainer: {
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  emptyButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  priceBox: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#555',
  },
  priceValue: {
    fontSize: 14,
    color: '#111',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  checkoutButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartList;
