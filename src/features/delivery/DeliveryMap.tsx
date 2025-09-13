import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Modal,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import {useAuthStore} from '@state/authStore';
import {
  getOrderById,
  sendLiveOrderUpdates,
  acceptOrder,
  normalizeOrder,
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
import {sendDeliveryOtp, verifyDeliveryOtp} from '@service/orderService';

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

  // OTP modal state - single source of truth
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');

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

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getOrderById(orderDetails._id);
      const normalized = normalizeOrder(data);
      setOrderData(normalized);
    } catch (error: any) {
      console.error('❌ Fetch order failed:', error);
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

  // ✅ Init continuous watch
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

  // Send OTP to customer and open modal
  const handleOrderDelivery = async () => {
    try {
      if (!orderData?.customer?.phone)
        return Alert.alert('Error', 'Customer phone missing');

      setIsProcessing(true);
      const res = await sendDeliveryOtp(
        orderData._id,
        orderData.customer.phone,
      );
      // sendDeliveryOtp returns response.data from backend
      if (res?.success) {
        Alert.alert('OTP Sent', `OTP sent to ${orderData.customer.phone}`);
        setOtp('');
        setShowOtpModal(true);
      } else {
        console.error('Send OTP returned not-success:', res);
        Alert.alert('Error', res?.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setIsProcessing(false);
    }
  };

  // submit OTP -> call backend verifyDeliveryOtp and mark delivered on success
  const submitOtp = async () => {
    if (!otp) return Alert.alert('Enter OTP', 'Please enter the customer OTP');
    if (!myLocation) return Alert.alert('Error', 'Location unavailable');
    if (!orderData) return Alert.alert('Error', 'Order not loaded');

    setIsProcessing(true);
    try {
      const locationPayload = {
        lat: myLocation.latitude,
        lng: myLocation.longitude,
      };

      // verifyDeliveryOtp(orderId, otp, location) — this should match your service signature
      const updatedOrder = await verifyDeliveryOtp(
        orderData._id,
        otp,
        locationPayload,
      );

      // if backend returns order object directly (as in your server), it will be updatedOrder
      // otherwise adapt to res.data as needed
      if (updatedOrder && (updatedOrder.status || updatedOrder.order)) {
        // normalize different possible shapes:
        const normalized = normalizeOrder(updatedOrder?.order ?? updatedOrder);
        setOrderData(normalized);
      }

      setCurrentOrder(null);
      setShowOtpModal(false);

      Alert.alert('✅ Delivered', 'Order delivered successfully 🎉', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      console.error('Submit OTP Error:', error);
      Alert.alert(
        '❌ OTP Error',
        error?.response?.data?.message || 'Invalid OTP',
      );
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
      case 'packed':
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
            disabled={isProcessing || isLoading || !myLocation}
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

      <Modal
        visible={showOtpModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowOtpModal(false);
          setOtp('');
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText style={{fontSize: 18, marginBottom: 10}}>
              Enter Customer OTP
            </CustomText>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
              placeholder="Enter OTP"
            />
            <TouchableOpacity
              style={[styles.otpButton, isProcessing && {opacity: 0.7}]}
              onPress={submitOtp}
              disabled={isProcessing}>
              <Text style={{color: '#fff', fontSize: 16}}>
                Confirm Delivery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowOtpModal(false);
                setOtp('');
              }}>
              <Text style={{marginTop: 10, color: 'red'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 10,
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 15,
  },
  otpButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

export default DeliveryMap;
