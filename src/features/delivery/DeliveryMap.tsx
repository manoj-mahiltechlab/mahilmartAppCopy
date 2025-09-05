import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useAuthStore} from '@state/authStore';
import {
  acceptOrder,
  getOrderById,
  sendLiveOrderUpdates,
} from '@service/orderService';
import {Colors, Fonts} from '@utils/Constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import LiveHeader from '@features/map/LiveHeader';
import LiveMap from '@features/map/LiveMap';
import DeliveryDetails from '@features/map/DeliveryDetails';
import OrderSummary from '@features/map/OrderSummary';
import {useNavigation, useRoute} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import CustomButton from '@components/ui/CustomButton';
import {hocStyles} from '@styles/GlobleStyles';
import {PermissionsAndroid, Platform} from 'react-native';

// ---------- TYPES ----------
type OrderStatus =
  | 'pending'
  | 'available'
  | 'processing'
  | 'confirmed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

interface Order {
  _id: string;
  status: OrderStatus;
  deliveryPartner?: {
    _id: string;
    name: string;
  };
  deliveryLocation: {
    address: string;
    lat?: number;
    lng?: number;
  };
  deliveryPersonLocation?: {
    lat: number;
    lng: number;
  };
  pickupLocation?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  customer: {
    name: string;
    phone: string;
    secondaryContact?: {
      phone: string;
    };
  };
  items: Array<{
    product: {name: string};
    quantity: number;
  }>;
  createdAt: string;
}

// ---------- STATUS MAPPINGS ----------
const backendToFrontend: Record<string, OrderStatus> = {
  Pending: 'available',
  Confirmed: 'confirmed',
  OutForDelivery: 'out_for_delivery',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
};

const frontendToBackend: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  out_for_delivery: 'OutForDelivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// ---------- NORMALIZER ----------
// ---------- NORMALIZER ----------
const normalizeOrder = (order: any): Order => {
  const rawStatus = order.status?.toString?.().trim();

  // Normalize backend status: remove spaces & lowercase
  const cleanedStatus = rawStatus?.replace(/\s+/g, '').toLowerCase();

  let frontendStatus: OrderStatus;

  switch (cleanedStatus) {
    case 'pending':
      frontendStatus = 'available'; // ✅ backend Pending → available
      break;
    case 'confirmed':
      frontendStatus = 'confirmed';
      break;
    case 'outfordelivery':
      frontendStatus = 'out_for_delivery';
      break;
    case 'delivered':
      frontendStatus = 'delivered';
      break;
    case 'cancelled':
      frontendStatus = 'cancelled';
      break;
    default:
      frontendStatus = 'pending'; // fallback instead of "unknown"
      break;
  }

  return {
    ...order,
    status: frontendStatus,
  };
};

// ---------- COMPONENT ----------
const DeliveryMap = () => {
  const user = useAuthStore(state => state.user);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [myLocation, setMyLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();
  const {setCurrentOrder} = useAuthStore();
  const orderDetails = route.params as {_id: string};
  const navigation = useNavigation();

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };
  const OrderActionButtons = () => {
    const navigation = useNavigation();

    const handleOrderPickup = () => {
      navigation.navigate('CategoryContainer'); // example
    };

    return <CustomButton title="Pick Up Order" onPress={handleOrderPickup} />;
  };

  // ---------- FETCH ORDER ----------
  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getOrderById(orderDetails._id);
      const normalized = normalizeOrder(data);

      setOrderData(prev => {
        // 🔑 Prevent UI flicker from old backend status
        if (!prev) return normalized;

        // If we already moved forward, don’t go backwards
        const priority: Record<OrderStatus, number> = {
          pending: 0,
          available: 1,
          confirmed: 2,
          out_for_delivery: 3,
          delivered: 4,
          cancelled: 5,
        };

        return priority[normalized.status] < priority[prev.status]
          ? prev
          : normalized;
      });
    } catch (error) {
      console.error('Failed to fetch order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

    const watchId = Geolocation.watchPosition(
      pos =>
        setMyLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      error => {
        console.error('Geolocation error:', error);
        Alert.alert('Location Error', 'Please enable location services');
      },
      {enableHighAccuracy: true, distanceFilter: 10},
    );

    return () => Geolocation.clearWatch(watchId);
  }, []);

  // ---------- ORDER ACTIONS ----------
  const handleAcceptOrder = async () => {
    if (!user?._id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // 🔥 Optimistic update: show "Pick Up Order" instantly
    setOrderData(prev => (prev ? {...prev, status: 'confirmed'} : prev));

    setIsProcessing(true);
    try {
      const updatedOrder = await acceptOrder(orderDetails._id, user._id);
      let normalized = normalizeOrder(updatedOrder);

      if (['available', 'pending'].includes(normalized.status)) {
        normalized.status = 'confirmed';
      }

      if (!normalized.deliveryPartner) {
        normalized.deliveryPartner = {_id: user._id, name: user.name || 'You'};
      }

      setOrderData(prev => ({...prev, ...normalized}));
      setCurrentOrder(normalized);

      Alert.alert('Success', 'Order accepted successfully!');
    } catch (error: any) {
      console.error('Accept order error:', error);
      Alert.alert('Error', error.message || 'Failed to accept order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOrderPickup = async () => {
    if (!myLocation) {
      Alert.alert('Error', 'Cannot determine your current location');
      return;
    }

    setIsProcessing(true);
    try {
      const updatedOrder = await sendLiveOrderUpdates(
        orderDetails._id,
        myLocation,
        frontendToBackend['out_for_delivery'],
      );

      let normalized = normalizeOrder(updatedOrder);

      // ✅ Force pickup instantly
      if (normalized.status !== 'out_for_delivery') {
        normalized.status = 'out_for_delivery';
      }

      setOrderData(prev => ({...prev, ...normalized}));
      setCurrentOrder(normalized);

      Alert.alert('Success', "Let's deliver it as soon as possible!");
    } catch (error: any) {
      console.error('Pickup error:', error?.message || error);
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOrderDelivery = async () => {
    if (!myLocation) {
      Alert.alert('Error', 'Cannot determine your current location');
      return;
    }

    setIsProcessing(true);
    try {
      const updatedOrder = await sendLiveOrderUpdates(
        orderDetails._id,
        myLocation,
        frontendToBackend['delivered'],
      );

      let normalized = normalizeOrder(updatedOrder);
      normalized.status = 'delivered'; // ✅ Force instant delivery

      setOrderData(prev => ({...prev, ...normalized}));
      setCurrentOrder(null);

      Alert.alert('✅ Success', 'Order delivered successfully! 🎉', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Delivery error:', error);
      Alert.alert('Error', 'Failed to mark order as delivered');
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
            frontendToBackend[orderData.status] || orderData.status,
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
      case 'available':
        return 'Available for delivery';
      case 'confirmed':
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

  const renderActionButton = () => {
    if (!orderData) return null;

    if (['delivered', 'cancelled'].includes(orderData.status)) return null;

    switch (orderData.status) {
      case 'pending':
      case 'available':
        return (
          <CustomButton
            title="Accept Delivery"
            onPress={handleAcceptOrder}
            loading={isProcessing || isLoading}
            disabled={isProcessing || isLoading}
          />
        );

      case 'confirmed':
        if (!myLocation) {
          return (
            <CustomButton
              title="Please wait...some seconds"
              onPress={() => {}}
              disabled={true}
              loading={false}
            />
          );
        }
        return (
          <CustomButton
            title="Pick Up Order"
            onPress={handleOrderPickup}
            loading={isProcessing || isLoading}
            disabled={isProcessing || isLoading}
          />
        );

      case 'out_for_delivery':
        return (
          <CustomButton
            title="Mark as Delivered"
            onPress={handleOrderDelivery}
            loading={isProcessing || isLoading}
            disabled={isProcessing || isLoading}
          />
        );

      default:
        return null;
    }
  };

  // ---------- RENDER ---------
  if (!orderData) {
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
        <LiveMap
          deliveryPersonLocation={
            myLocation || orderData.deliveryPersonLocation
          }
          deliveryLocation={orderData.deliveryLocation}
          hasAccepted={orderData.status === 'confirmed'}
          hasPickedUp={orderData.status === 'out_for_delivery'}
          pickupLocation={orderData.pickupLocation}
        />
        <DeliveryDetails
          details={{
            address: orderData?.deliveryLocation?.address ?? 'No address',
            name: orderData?.customer?.name ?? 'Unknown Customer',
            customerPhone: orderData?.customer?.phone ?? 'N/A',
            receiverPhone:
              orderData?.customer?.secondaryContact?.phone ?? 'N/A',
          }}
        />
        <OrderSummary order={orderData} />
        <View style={styles.feedbackContainer}>
          <View style={styles.iconContainer}>
            <Icon
              name="cards-heart-outline"
              color={Colors.disabled}
              size={RFValue(20)}
            />
          </View>
          <View style={styles.feedbackText}>
            <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
              Do you like our app?
            </CustomText>
            <CustomText variant="h9" fontFamily={Fonts.Medium}>
              Rate your delivery experience!
            </CustomText>
          </View>
        </View>
      </ScrollView>
      <View style={[hocStyles.cartContainer, styles.btnContainer]}>
        {renderActionButton()}
      </View>
    </View>
  );
};

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.secondary},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  scrollContent: {
    paddingBottom: 150,
    backgroundColor: Colors.backgroundSecondary,
    padding: 5,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 10,
    width: '100%',
    borderRadius: 15,
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 0.7,
    borderColor: Colors.border,
  },
  feedbackText: {width: '80%'},
  iconContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 100,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer: {padding: 35},
  waitingText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    paddingVertical: 12,
  },
});

export default DeliveryMap;
