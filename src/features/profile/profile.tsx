import {View, StyleSheet, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useAuthStore} from '@state/authStore';
import {useCartStore} from '@state/CartStore';
import {fetchCustomerOrders} from '@service/orderService';
import CustomHeader from '@components/ui/CustomHeader';
import ProfileOrderItem from './ProfileOrderItem';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import ActionButton from './ActionButton';
import {storage, tokenStorage} from '@state/storage';
import WalletSection from './WalletSection';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {useOrderStore} from '@state/orderStore';

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const {logout, user} = useAuthStore();
  const {clearCart} = useCartStore();
  const navigation = useNavigation();
  const {setPastOrders} = useOrderStore();

  const fetchOrders = async () => {
    try {
      const data = await fetchCustomerOrders(user?._id);
      setOrders(data || []);
      setPastOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchOrders();
    }
  }, [user?._id]);

  const handleLogout = () => {
    clearCart();
    logout();
    tokenStorage.clearAll();
    storage.clearAll();

    // Reset navigation to remove tab bar and show login
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'CustomerLogin'}],
      }),
    );
  };

  const renderHeader = () => (
    <View>
      <CustomText variant="h3" fontFamily={Fonts.SemiBold}>
        Your account
      </CustomText>
      <CustomText variant="h7" fontFamily={Fonts.Medium}>
        {user?.phone}
      </CustomText>
      <WalletSection />

      <CustomText variant="h8" style={styles.informativeText}>
        YOUR INFORMATION
      </CustomText>

      <ActionButton icon="book-outline" label="Address book" />
      <ActionButton icon="information-outline" label="About us" />
      <ActionButton icon="logout" label="Logout" onPress={handleLogout} />
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Profile" />
      <FlatList
        data={orders}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item, index) =>
          item?.orderId?.toString() || index.toString()
        }
        contentContainerStyle={styles.scrollViewContent}
        ListEmptyComponent={
          <CustomText style={{textAlign: 'center', marginTop: 20}}>
            No past orders found.
          </CustomText>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    padding: 10,
    paddingTop: 20,
    paddingBottom: 100,
  },
  informativeText: {
    opacity: 0.7,
    marginBottom: 20,
  },
  pastText: {
    marginVertical: 20,
    opacity: 0.7,
  },
});

export default Profile;
