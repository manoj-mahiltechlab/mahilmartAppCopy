import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useAuthStore} from '@state/authStore';
import {getOrderById} from '@service/orderService';
import {Colors, Fonts} from '@utils/Constants';
import LiveHeader from './LiveHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import OrderSummary from './OrderSummary';
import DeliveryDetails from './DeliveryDetails';
import LiveMap from './LiveMap';
import {useRoute, useNavigation} from '@react-navigation/native';

const LiveTracking = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {orderId} = route.params || {};

  const {setCurrentOrder} = useAuthStore();
  const [orderData, setOrderData] = useState(null);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      const data = await getOrderById(orderId);
      if (data?.status === 'error') {
        Alert.alert('No Orders', data.message || 'Order not found');
        return;
      }
      setOrderData(data);
      setCurrentOrder(data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (!orderId || !orderData) return null;

  let msg = 'Packing your order';
  let time = 'Arriving in 10 minutes';

  if (orderData.status === 'confirmed') {
    msg = 'Arriving Soon';
    time = 'Arriving in 8 minutes';
  } else if (
    orderData.status === 'out_for_delivery' ||
    orderData.status === 'Out For Delivery'
  ) {
    msg = 'Out for Delivery';
    time = 'Arriving in 6 minutes';
  } else if (orderData.status === 'arriving') {
    msg = 'Order Picked Up';
    time = 'Arriving in 4 minutes';
  } else if (orderData.status === 'delivered') {
    msg = 'Order Delivered';
    time = 'Faster Delivery⚡';
  }

  return (
    <View style={styles.container}>
      <LiveHeader type="Customer" title={msg} secondTitle={time} />

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <LiveMap
          deliveryLocation={orderData?.deliveryLocation}
          pickupLocation={orderData?.pickupLocation}
          deliveryPersonLocation={orderData?.deliveryPersonLocation}
          hasAccepted={orderData?.status === 'confirmed'}
          hasPickedUp={orderData?.status === 'arriving'}
        />

        <View style={styles.flexRow}>
          <View style={styles.iconContainer}>
            <Icon
              name={orderData?.deliveryPartner ? 'phone' : 'shopping'}
              color={Colors.primary}
              size={RFValue(20)}
            />
          </View>
          <View style={{width: '80%'}}>
            <CustomText
              numberOfLines={1}
              variant="h7"
              fontFamily={Fonts.SemiBold}>
              {orderData?.deliveryPartner?.name ||
                'We will soon assign delivery partner'}
            </CustomText>

            {orderData?.deliveryPartner && (
              <CustomText variant="h7" fontFamily={Fonts.Medium}>
                {orderData?.deliveryPartner?.phone}
              </CustomText>
            )}

            <CustomText variant="h6" fontFamily={Fonts.Medium}>
              {orderData?.deliveryPartner
                ? 'For delivery instructions you can contact here'
                : orderData?.status || 'Processing'}
            </CustomText>
          </View>
        </View>

        {orderData?.addressType && (
          <CustomText
            variant="h8"
            fontFamily={Fonts.SemiBold}
            style={styles.addressTypeText}>
            {orderData.addressType === 'primary' ? 'Primary' : 'Secondary'}
          </CustomText>
        )}

        <DeliveryDetails
          details={{
            address: orderData?.deliveryLocation?.address,
            name: orderData?.customer?.name,
            customerPhone: orderData?.customer?.phone,
            receiverPhone: orderData?.customer?.secondaryContact?.phone,
          }}
        />

        <OrderSummary order={orderData} />
      </ScrollView>

      {/* Buttons always visible */}
      <View style={styles.fixedButtonRow}>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: '#388E3C'}]}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'BottomTabs',
                  params: {screen: 'Home'},
                },
              ],
            })
          }>
          <CustomText
            variant="h6"
            fontFamily={Fonts.SemiBold}
            style={{color: '#fff'}}>
            Continue Shopping
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.secondary},
  flexRow: {
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
  iconContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 100,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTypeText: {
    marginTop: 20,
    marginBottom: 10,
    color: Colors.textDark,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  fixedButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 15,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 0.7,
    borderColor: Colors.border,
  },
  scrollContent: {
    paddingBottom: 20, // keep some space for buttons
    backgroundColor: Colors.backgroundSecondary,
    padding: 15,
    flexGrow: 1,
  },
});

export default LiveTracking;
