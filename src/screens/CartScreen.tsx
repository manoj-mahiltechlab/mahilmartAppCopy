import React, {useEffect, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useOrderStore} from '@state/orderStore';
import ProfileOrderItem from '@features/profile/ProfileOrderItem';
import {useAuthStore} from '@state/authStore';
import {fetchCustomerOrders} from '@service/orderService';
import CustomText from '@components/ui/CustomText';

const PastOrdersScreen = () => {
  const {user} = useAuthStore();
  const {pastOrders, setPastOrders} = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCustomerOrders(user?._id);
        console.log('✅ Fetched orders:', data);
        const validOrders = Array.isArray(data) ? data : data?.orders || [];
        setPastOrders(validOrders);
      } catch (err) {
        console.error('❌ Failed to load orders:', err);
        setError('Failed to fetch past orders. Please try again.');
        setPastOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      loadOrders();
    }
  }, [user?._id]);

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="large"
          color="#0f9d58"
          style={{marginTop: 40}}
        />
      );
    } else {
      <CustomText variant="h8" style={styles.pastText}>
        PAST ORDERS
      </CustomText>;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (Array.isArray(pastOrders) && pastOrders.length > 0) {
      return (
        <FlatList
          data={pastOrders}
          keyExtractor={(item, index) =>
            item?._id?.toString() || `order-${index}`
          }
          renderItem={({item, index}) => (
            <ProfileOrderItem item={item} index={index} />
          )}
          contentContainerStyle={{padding: 10, flexGrow: 1}}
        />
      );
    }

    return <Text style={styles.emptyText}>No past orders yet.</Text>;
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pastText: {
    marginVertical: 20,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

export default PastOrdersScreen;
