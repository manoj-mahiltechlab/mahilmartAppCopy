import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useAuthStore} from '@state/authStore';
import {
  getOrderById,
  sendLiveOrderUpdates,
  acceptOrder,
  normalizeOrder, // ✅ use from orderService
} from '@service/orderService';
import {Colors} from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import LiveHeader from '@features/map/LiveHeader';
import LiveMap from '@features/map/LiveMap';
import DeliveryDetails from '@features/map/DeliveryDetails';
import OrderSummary from '@features/map/OrderSummary';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import CustomButton from '@components/ui/CustomButton';
import {hocStyles} from '@styles/GlobleStyles';

// ---------- TYPES ----------
type OrderStatus =
  | 'pending'
  | 'available'
  | 'processing'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

interface Order {
  _id: string;
  status: OrderStatus;
  deliveryPartner?: {_id: string; name: string};
  deliveryLocation: {address: string; lat?: number; lng?: number};
  deliveryPersonLocation?: {lat: number; lng: number};
  pickupLocation?: {address: string; lat?: number; lng?: number};
  customer: {name: string; phone: string; secondaryContact?: {phone: string}};
  items: Array<{product: {name: string}; quantity: number}>;
  createdAt: string;
}

// ---------- COMPONENT ----------
const DeliveryMap = () => {
  const user = useAuthStore(state => state.user);
  const {setCurrentOrder} = useAuthStore();
  const navigation = useNavigation();
  const route = useRoute();
  const orderDetails = route.params as {_id: string};

  const [orderData, setOrderData] = useState<Order | null>(null);
  const [myLocation, setMyLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderData) {
      console.log('Order Status:', orderData.status);
      console.log('My Location:', myLocation);
    }
  }, [orderData, myLocation]);

  // ✅ Location Permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      return (
        granted['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.ACCESS_COARSE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };

  // const fetchOrder = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await getOrderById(orderDetails._id);
  //     const normalized = normalizeOrder(data); // ✅ normalize here
  //     setOrderData(normalized);
  //   } catch (err) {
  //     console.error('Fetch order error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // ✅ Fetch Order
  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getOrderById(orderDetails._id);
      const normalized = normalizeOrder(data);
      setOrderData(normalized);

      if (__DEV__) {
        console.log('📦 Order:', {
          id: normalized._id,
          status: normalized.status,
          deliveryPartner: normalized.deliveryPartner?.name,
        });
      }
    } catch (error: any) {
      if (__DEV__) console.error('❌ Fetch order failed:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        Geolocation.getCurrentPosition(
          pos => {
            setMyLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          error => console.error('Location fetch error', error),
          {enableHighAccuracy: true},
        );

        fetchOrderDetails();
      };

      init();
    }, []),
  );

  // ✅ Init
  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      fetchOrderDetails();

      const watchId = Geolocation.watchPosition(
        pos => {
          setMyLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        error => {
          console.error('Geolocation error:', error);
          Alert.alert(
            'Location Error',
            'Please enable location services or check GPS',
          );
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          interval: 5000,
          fastestInterval: 2000,
        },
      );

      return () => Geolocation.clearWatch(watchId);
    };

    init();
  }, []);

  // ---------- ORDER ACTIONS ----------
  const handleAcceptOrder = async () => {
    if (!orderData) return Alert.alert('Cannot accept', 'Order not loaded');
    if (orderData.status !== 'pending') {
      Alert.alert('Cannot accept', 'This order is no longer available');
      fetchOrderDetails();
      return;
    }
    if (!user?._id) return Alert.alert('Error', 'User not authenticated');

    setIsProcessing(true);
    try {
      const updatedOrder = await acceptOrder(orderData._id, user._id);
      const normalized = normalizeOrder(updatedOrder);
      setOrderData(normalized);
      setCurrentOrder(normalized);
      Alert.alert('Success', 'Order accepted successfully!');
    } catch (error: any) {
      console.error('❌ Accept Order Error:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || error.message || 'Failed to accept',
      );
      fetchOrderDetails();
    } finally {
      setIsProcessing(false);
    }
  };
  const handleOrderPickup = async () => {
    if (!myLocation) return Alert.alert('Error', 'Location unavailable');
    setIsProcessing(true);
    try {
      // Mark as picked up
      await sendLiveOrderUpdates(
        orderDetails._id,
        myLocation,
        'OutForDelivery',
      );

      const fullOrder = await getOrderById(orderDetails._id);
      const normalized = normalizeOrder(fullOrder);
      setOrderData(normalized);
      setCurrentOrder(normalized);

      Alert.alert('Success', 'Order picked up. Let’s deliver!');
    } catch (error: any) {
      console.error('Pickup error:', error);
      Alert.alert('Error', 'Failed to update pickup status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOrderDelivery = async () => {
    if (!myLocation) return Alert.alert('Error', 'Location unavailable');
    setIsProcessing(true);
    try {
      const updatedOrder = await sendLiveOrderUpdates(
        orderDetails._id,
        myLocation,
        'Delivered',
      );
      const normalized = normalizeOrder(updatedOrder);
      normalized.status = 'delivered';
      setOrderData(normalized);
      setCurrentOrder(null);
      Alert.alert('✅ Delivered', 'Order delivered successfully 🎉', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Delivery error:', error);
      Alert.alert('Error', 'Failed to mark delivered');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- LIVE LOCATION UPDATES ----------
  useEffect(() => {
    if (
      orderData?.deliveryPartner?._id === user?._id &&
      !['delivered', 'cancelled'].includes(orderData?.status) &&
      myLocation
    ) {
      const interval = setInterval(async () => {
        try {
          await sendLiveOrderUpdates(
            orderDetails._id,
            myLocation,
            orderData.status,
          );
        } catch (error) {
          console.error('Live update failed:', error);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [orderData, myLocation]);

  // ---------- UI HELPERS ----------
  const getStatusMessage = () => {
    switch (orderData?.status) {
      case 'pending':
        return 'Order pending confirmation';
      case 'confirmed':
      case 'packed': // ✅ handle packed
        return 'Ready for pickup';
      case 'out_for_delivery':
        return 'Delivery in progress';
      case 'delivered':
        return 'Delivery completed';
      case 'cancelled':
        return 'Order cancelled';
      default:
        return 'Order status unknown';
    }
  };
  console.log('Rendering Action Button:', orderData?.status);
  const renderActionButton = () => {
    if (!orderData || ['delivered', 'cancelled'].includes(orderData.status))
      return null;

    switch (orderData.status) {
      case 'pending':
        return (
          <CustomButton
            title="Accept Delivery"
            onPress={handleAcceptOrder}
            loading={isProcessing || isLoading}
            disabled={isProcessing || isLoading || !myLocation}
          />
        );
      case 'available':
      case 'confirmed':
        return (
          <CustomButton
            title="Pick Up Order"
            onPress={handleOrderPickup} // handleOrderPickup will alert if location missing
            loading={isProcessing || isLoading}
            disabled={isProcessing || isLoading} // ✅ no !myLocation here
          />
        );

      case 'out_for_delivery':
        return (
          <CustomButton
            title="Mark as Delivered"
            onPress={handleOrderDelivery}
            loading={isProcessing || isLoading}
            disabled={isProcessing || isLoading || !myLocation} // still needs location for delivery
          />
        );

      default:
        return null;
    }
  };

  // ---------- RENDER ----------
  if (isLoading || !orderData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <CustomText>Loading order details...</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LiveHeader
        type="Delivery"
        title={getStatusMessage()}
        secondTitle="Delivery details"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {orderData.status === 'out_for_delivery' && !myLocation && (
          <CustomText style={{textAlign: 'center', marginVertical: 10}}>
            Fetching location...
          </CustomText>
        )}

        {orderData?.deliveryLocation && (
          <LiveMap
            deliveryPersonLocation={
              myLocation || orderData.deliveryPersonLocation || {lat: 0, lng: 0}
            }
            deliveryLocation={orderData.deliveryLocation}
            hasAccepted={orderData.status === 'confirmed'}
            hasPickedUp={orderData.status === 'out_for_delivery'}
            pickupLocation={orderData.pickupLocation}
          />
        )}

        <DeliveryDetails
          details={{
            address: orderData?.deliveryLocation?.address ?? 'No address',
            name: orderData?.customer?.name ?? 'Unknown Customer',
            customerPhone: orderData?.customer?.phone ?? 'N/A',
            receiverPhone:
              orderData?.customer?.secondaryContact?.phone ?? 'N/A',
          }}
        />
        <OrderSummary order={orderData ?? {items: [], orderId: 'N/A'}} />
      </ScrollView>
      <View style={[hocStyles.cartContainer, styles.btnContainer]}>
        {renderActionButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.backgroundSecondary},
  scrollContent: {paddingBottom: 150, paddingHorizontal: 10},
  btnContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: Colors.backgroundSecondary,
  },
});

export default DeliveryMap;
