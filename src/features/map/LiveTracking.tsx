import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
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
import {useRoute} from '@react-navigation/native';

const LiveTracking = () => {
  const route = useRoute();
  const {orderId: paramOrderId, order: paramOrder} = route.params || {};
  const {setCurrentOrder, currentOrder} = useAuthStore();

  const [orderData, setOrderData] = useState(paramOrder || null);
  const [loading, setLoading] = useState(!paramOrder); // Only load if no paramOrder

  const effectiveOrderId = paramOrderId || paramOrder?._id || currentOrder?._id;

  useEffect(() => {
    if (!orderData && effectiveOrderId) {
      setLoading(true);
      getOrderById(effectiveOrderId)
        .then(data => {
          setOrderData(data);
          setCurrentOrder(data);
        })
        .catch(err => console.error('Failed to fetch order details:', err))
        .finally(() => setLoading(false));
    }
  }, [effectiveOrderId]);

  if (!effectiveOrderId) {
    return (
      <View style={[styles.container, styles.center]}>
        <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
          Unable to load tracking — missing order ID
        </CustomText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!orderData) {
    return (
      <View style={[styles.container, styles.center]}>
        <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
          Failed to load order details
        </CustomText>
      </View>
    );
  }

  // Status message
  let msg = 'Packing your order';
  let time = 'Arriving in 10 minutes';
  if (orderData.status === 'confirmed') {
    msg = 'Arriving Soon';
    time = 'Arriving in 8 minutes';
  } else if (orderData.status === 'arriving') {
    msg = 'Order Picked Up';
    time = 'Arriving in 6 minutes';
  } else if (orderData.status === 'delivered') {
    msg = 'Order Delivered';
    time = 'Faster Delivery⚡';
  }

  return (
    <View style={styles.container}>
      <LiveHeader type="Customer" title={msg} secondTitle={time} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LiveMap
          deliveryLocation={orderData.deliveryLocation}
          pickupLocation={orderData.pickupLocation}
          deliveryPersonLocation={orderData.deliveryPersonLocation}
          hasAccepted={orderData.status === 'confirmed'}
          hasPickedUp={orderData.status === 'arriving'}
        />

        {/* Delivery partner info */}
        <View style={styles.flexRow}>
          <View style={styles.iconContainer}>
            <Icon
              name={orderData.deliveryPartner ? 'phone' : 'shopping'}
              color={Colors.primary}
              size={RFValue(20)}
            />
          </View>
          <View style={{width: '80%'}}>
            <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
              {orderData.deliveryPartner?.name ||
                'We will soon assign delivery partner'}
            </CustomText>
            {orderData.deliveryPartner?.phone && (
              <CustomText variant="h7" fontFamily={Fonts.Medium}>
                {orderData.deliveryPartner.phone}
              </CustomText>
            )}
            <CustomText variant="h9" fontFamily={Fonts.Medium}>
              {orderData.deliveryPartner
                ? 'For Delivery instructions you can contact here'
                : msg}
            </CustomText>
          </View>
        </View>

        {/* Address */}
        {orderData.addressType && (
          <CustomText
            variant="h8"
            fontFamily={Fonts.SemiBold}
            style={styles.addressTypeText}>
            {orderData.addressType === 'primary' ? 'Primary' : 'Secondary'}
          </CustomText>
        )}

        {/* Delivery details */}
        <DeliveryDetails
          details={{
            address: orderData.deliveryLocation?.address,
            name: orderData.customer?.name,
            customerPhone: orderData.customer?.phone,
            receiverPhone: orderData.customer?.secondaryContact?.phone,
          }}
        />
        <OrderSummary order={orderData} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.secondary},
  scrollContent: {
    paddingBottom: 150,
    backgroundColor: Colors.backgroundSecondary,
    padding: 15,
  },
  flexRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    borderRadius: 15,
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fff',
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
  addressTypeText: {marginTop: 20, marginBottom: 10, color: Colors.textDark},
  center: {justifyContent: 'center', alignItems: 'center'},
});

export default LiveTracking;
