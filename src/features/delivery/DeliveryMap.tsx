import React, {useEffect, useState} from 'react';
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
  deliveryPartner?: {_id: string; name: string};
  deliveryLocation: {address: string; lat?: number; lng?: number};
  deliveryPersonLocation?: {lat: number; lng: number};
  pickupLocation?: {address: string; lat?: number; lng?: number};
  customer: {name: string; phone: string; secondaryContact?: {phone: string}};
  items: Array<{product: {name: string}; quantity: number}>;
  createdAt: string;
}

// ---------- NORMALIZER ----------
const normalizeOrder = (order: any): Order => {
  const cleanedStatus = order.status
    ?.toString()
    ?.trim()
    .replace(/\s+/g, '')
    .toLowerCase();

  let frontendStatus: OrderStatus;

  switch (cleanedStatus) {
    case 'pending':
    case 'packed': // ✅ map both Pending and Packed to frontend "pending"
      frontendStatus = 'pending';
      break;
    case 'confirmed':
      frontendStatus = 'confirmed';
      break;
    case 'pickedup':
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
      frontendStatus = 'pending';
      break;
  }

  return {...order, status: frontendStatus};
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

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getOrderById(orderDetails._id);

      // ✅ Convert 'available' to 'pending' for frontend display
      const frontendStatus =
        data.status === 'available' ? 'pending' : data.status;

      setOrderData(prev => ({
        ...data,
        status: frontendStatus, // now shows 'pending' instead of 'available'
      }));

      if (__DEV__) {
        console.log('📦 Fetched order details:', {
          id: data._id,
          orderId: data.orderId,
          status: frontendStatus, // updated
          totalAmount: data.totalAmount,
          deliveryPartner: data.deliveryPartner?.name,
          customer: data.customer?.name,
          deliveryAddress: data.deliveryAddress,
        });
      }
    } catch (error: any) {
      if (__DEV__) console.error('❌ Failed to fetch order:', error);
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
    if (!orderData) {
      Alert.alert('Cannot accept', 'Order details not loaded');
      return;
    }

    if (!['pending', 'packed'].includes(orderData.status)) {
      Alert.alert('Cannot accept', 'This order is no longer available');
      fetchOrderDetails();
      return;
    }

    if (!user?._id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsProcessing(true);

    try {
      const updatedOrder = await acceptOrder(orderData._id, user._id);
      setOrderData(normalizeOrder(updatedOrder));
      setCurrentOrder(normalizeOrder(updatedOrder));
      Alert.alert('Success', 'Order accepted successfully!');
    } catch (error: any) {
      console.error('❌ Accept Order Error:', error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to accept order';
      Alert.alert('Error', message);
      fetchOrderDetails();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOrderPickup = async () => {
    if (!myLocation)
      return Alert.alert('Error', 'Cannot determine your current location');
    setIsProcessing(true);
    try {
      const updatedOrder = await sendLiveOrderUpdates(
        orderDetails._id,
        myLocation,
        'OutForDelivery',
      );
      const normalized = normalizeOrder(updatedOrder);
      normalized.status = 'out_for_delivery';
      setOrderData(normalized);
      setCurrentOrder(normalized);
      Alert.alert('Success', "Let's deliver it as soon as possible!");
    } catch (error: any) {
      console.error('Pickup error:', error);
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOrderDelivery = async () => {
    if (!myLocation)
      return Alert.alert('Error', 'Cannot determine your current location');
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
    if (!orderData || ['delivered', 'cancelled'].includes(orderData.status))
      return null;
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
        return (
          <CustomButton
            title="Pick Up Order"
            onPress={handleOrderPickup}
            loading={isProcessing || isLoading}
            disabled={isProcessing || isLoading || !myLocation}
          />
        );
      case 'out_for_delivery':
        return (
          <CustomButton
            title="Mark as Delivered"
            onPress={handleOrderDelivery}
            loading={isProcessing || isLoading}
            disabled={isProcessing || isLoading || !myLocation}
          />
        );
      default:
        return null;
    }
  };

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
