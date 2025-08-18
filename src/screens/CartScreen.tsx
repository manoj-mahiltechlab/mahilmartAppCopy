import React, {useEffect, useState, useCallback} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useOrderStore} from '@state/orderStore';
import ProfileOrderItem from '@features/profile/ProfileOrderItem';
import {useAuthStore} from '@state/authStore';
import {fetchCustomerOrders} from '@service/orderService';
import CustomText from '@components/ui/CustomText';

const PastOrdersScreen = () => {
  const {user} = useAuthStore();
  const {pastOrders, setPastOrders} = useOrderStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Wrap the loadOrders function in useCallback to prevent unnecessary recreations
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
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
      setRefreshing(false);
    }
  }, [user?._id, setPastOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (user?._id) {
      loadOrders();
    }
  }, [user?._id, loadOrders]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0f9d58" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomText variant="h8" style={styles.pastText}>
        PAST ORDERS
      </CustomText>

      {pastOrders?.length > 0 ? (
        <FlatList
          data={pastOrders}
          keyExtractor={(item, index) =>
            item?._id?.toString() || `order-${index}`
          }
          renderItem={({item, index}) => (
            <ProfileOrderItem item={item} index={index} />
          )}
          contentContainerStyle={styles.flatListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No past orders yet.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    padding: 10,
    flexGrow: 1,
  },
  pastText: {
    marginVertical: 10,
    opacity: 0.7,
    textAlign: 'center',
    paddingTop: 10,
  },
  emptyText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default PastOrdersScreen;
