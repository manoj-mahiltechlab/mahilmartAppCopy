import React, {useState, useCallback} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useOrderStore} from '@state/orderStore';
import ProfileOrderItem from '@features/profile/ProfileOrderItem';
import {useAuthStore} from '@state/authStore';
import {fetchCustomerOrders} from '@service/orderService';
import CustomHeader from '@components/ui/CustomHeader';

const PastOrdersScreen = () => {
  const {user} = useAuthStore();
  const {pastOrders, setPastOrders} = useOrderStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadOrders = useCallback(
    async (isRefresh = false) => {
      if (!user?._id) return;
      try {
        if (!isRefresh) setLoading(true);
        setError('');

        const data = await fetchCustomerOrders(user._id);
        const validOrders = Array.isArray(data) ? data : data?.orders || [];

        const sortedOrders = [...validOrders].sort((a, b) => {
          const idA = parseInt(a.orderId?.replace(/\D/g, '') || '0', 10);
          const idB = parseInt(b.orderId?.replace(/\D/g, '') || '0', 10);
          return idB - idA; // big → small
        });

        setPastOrders(sortedOrders);
      } catch (err) {
        console.error('❌ Failed to load orders:', err);
        setError('Failed to fetch past orders. Please try again.');
      } finally {
        if (!isRefresh) setLoading(false);
        setRefreshing(false);
      }
    },
    [user?._id, setPastOrders],
  );

  // ✅ Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadOrders(false);
    }, [loadOrders]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(true);
  }, [loadOrders]);

  // ✅ Only show loader while first loading, not after cancel
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0f9d58" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <CustomHeader
        title="Past Orders"
        onBackPress={() => navigation.goBack()}
      />

      {pastOrders?.length > 0 ? (
        <FlatList
          data={pastOrders}
          keyExtractor={(item, index) =>
            item?._id?.toString() || `order-${index}`
          }
          renderItem={({item, index}) => (
            <ProfileOrderItem
              item={item}
              index={index}
              onOrderUpdated={loadOrders}
            />
          )}
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{paddingBottom: 20}}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.centerContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <Text style={styles.emptyText}>No past orders yet.</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FAFAFA'},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  flatList: {flex: 1, paddingHorizontal: 12},
  emptyText: {fontSize: 16, color: 'black', textAlign: 'center'},
  errorText: {color: 'red', textAlign: 'center', fontSize: 16},
});

export default PastOrdersScreen;
