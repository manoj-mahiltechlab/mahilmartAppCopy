// DeliveryDashboard.tsx
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '@utils/Constants';
import {useAuthStore} from '@state/authStore';
import DeliveryHeader from '@components/delivery/DeliveryHeader';
import TabBar from '../../components/delivery/TabBar';
import Geolocation from '@react-native-community/geolocation';
import {reverseGeocode} from '@service/mapService';
import {fetchOrders} from '@service/orderService';
import DeliveryOrderItem from '@components/delivery/DeliveryOrderItem';
import CustomText from '@components/ui/CustomText';
import withLiveOrder from './withLiveOrder';
import {useNavigation} from '@react-navigation/native';

const DeliveryDashboard = () => {
  const {user, setUser} = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<'available' | 'delivered'>(
    'available',
  );
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Update user location
  const updateUser = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        reverseGeocode(latitude, longitude, setUser)
          .then(() => console.log('User location updated'))
          .catch(err => console.log('Reverse geocode error:', err));
      },
      err => console.log('Geolocation error:', err),
      {enableHighAccuracy: false, timeout: 1000},
    );
  };

  useEffect(() => {
    updateUser();
  }, []);

  // Handle back press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        useAuthStore.getState().logout();
        navigation.reset({index: 0, routes: [{name: 'CustomerLogin'}]});
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  // Fetch orders
  const fetchData = async () => {
    if (!user?.id || !user?.branch) {
      console.log('User or branch not set');
      return;
    }

    setLoading(true);
    setRefreshing(true);
    setData([]);

    try {
      const status = selectedTab === 'available' ? 'Pending' : 'Delivered';
      const deliveryPartnerId = selectedTab === 'available' ? null : user.id;
      const branchId =
        typeof user.branch === 'object' ? user.branch._id : user.branch;

      console.log(
        'Fetching orders for branch:',
        branchId,
        'status:',
        status,
        'deliveryPartnerId:',
        deliveryPartnerId,
      );

      const fetchedOrders = await fetchOrders(
        status,
        branchId,
        deliveryPartnerId,
      );

      console.log('Fetched Orders:', fetchedOrders);

      // Ensure we always have an array
      if (Array.isArray(fetchedOrders)) setData(fetchedOrders);
      else setData([]);
    } catch (err) {
      console.log('Fetch orders error:', err);
      setData([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Fetch on tab change
  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  const renderOrderItem = ({item, index}: any) => (
    <DeliveryOrderItem index={index} item={item} />
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <DeliveryHeader name={user?.name} email={user?.email} />
      </SafeAreaView>

      <View style={styles.subContainer}>
        <TabBar selectedTab={selectedTab} onTabChange={setSelectedTab} />

        <FlatList
          data={data}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
          }
          ListEmptyComponent={() => {
            if (loading) {
              return (
                <View style={styles.center}>
                  <ActivityIndicator color={Colors.secondary} size="small" />
                </View>
              );
            }
            return (
              <View style={styles.center}>
                <CustomText>No Orders found yet!</CustomText>
              </View>
            );
          }}
          renderItem={renderOrderItem}
          keyExtractor={item =>
            item._id || item.orderId || Math.random().toString()
          }
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  subContainer: {
    backgroundColor: Colors.backgroundSecondary,
    flex: 1,
    padding: 6,
  },
  flatListContainer: {
    padding: 2,
  },
  center: {
    flex: 1,
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withLiveOrder(DeliveryDashboard);
