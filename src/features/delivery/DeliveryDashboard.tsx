import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {Colors, Fonts} from '@utils/Constants';
import {useAuthStore} from '@state/authStore';
import DeliveryHeader from '@components/delivery/DeliveryHeader';
import TabBar from '@components/delivery/TabBar';
import Geolocation from '@react-native-community/geolocation';
import {reverseGeocode} from '@service/mapService';
import {fetchOrders} from '@service/orderService';
import DeliveryOrderItem from '@components/delivery/DeliveryOrderItem';
import CustomText from '@components/ui/CustomText';
import withLiveOrder from './withLiveOrder';
import {useNavigation} from '@react-navigation/native';

const DeliveryDashboard = () => {
  const {user, setUser} = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<
    'available' | 'accepted' | 'delivered'
  >('available');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  /** 🔹 Update user location */
  const updateUser = useCallback(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        reverseGeocode(latitude, longitude, setUser);
      },
      err => console.log('Location error:', err),
      {enableHighAccuracy: true, timeout: 5000, maximumAge: 10000},
    );
  }, [setUser]);

  useEffect(() => {
    updateUser();
  }, [updateUser]);

  /** 🔹 Handle Android back button */
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          BackHandler.exitApp();
        }
        return true;
      },
    );
    return () => backHandler.remove();
  }, [navigation]);

  /** 🔹 Fetch Orders */
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      const statusMap: Record<string, string> = {
        available: '', // fetch all → then filter packed
        accepted: 'accepted',
        delivered: 'delivered',
      };

      const backendStatus = statusMap[selectedTab] || '';

      const fetchedData = await fetchOrders(
        backendStatus,
        user?.id,
        user?.branch,
      );

      let filtered = fetchedData || [];

      // 🔹 Available tab → show only packed
      if (selectedTab === 'available') {
        filtered = filtered.filter((o: any) =>
          ['available', 'packed'].includes(o.status?.toLowerCase()),
        );
      }

      // 🔹 Remove cancelled/pending globally
      filtered = filtered.filter(
        (o: any) => !['cancelled', 'pending'].includes(o.status?.toLowerCase()),
      );

      setData(filtered);
    } catch (err) {
      console.log('Fetch Orders Error:', err);
      setData([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [selectedTab, user?.id, user?.branch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** 🔹 Render Item */
  const renderOrderItem = ({item, index}: any) => (
    <DeliveryOrderItem index={index} item={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <DeliveryHeader name={user?.name} email={user?.email} />

      <View style={styles.subContainer}>
        <TabBar selectedTab={selectedTab} onTabChange={setSelectedTab} />

        <FlatList
          data={data}
          keyExtractor={item =>
            item.orderId?.toString() || String(Math.random())
          }
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
          }
          ListEmptyComponent={() => (
            <View style={styles.center}>
              {loading ? (
                <ActivityIndicator color={Colors.secondary} size="large" />
              ) : (
                <CustomText
                  fontFamily={Fonts.SemiBold}
                  style={styles.emptyText}>
                  No Orders found yet 🚚
                </CustomText>
              )}
            </View>
          )}
          contentContainerStyle={[
            styles.flatListContainer,
            data.length === 0 && {flex: 1},
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  subContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 6,
    elevation: 3,
  },
  flatListContainer: {
    flexGrow: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default DeliveryDashboard;
// export default withLiveOrder(DeliveryDashboard);
