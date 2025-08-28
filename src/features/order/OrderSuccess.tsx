import {View, StyleSheet} from 'react-native';
import React, {FC, useEffect} from 'react';
import {useAuthStore} from '@state/authStore';
import {screenWidth} from '@utils/Scaling';
import LottieView from 'lottie-react-native';
import CustomText from '@components/ui/CustomText';
import {Colors, Fonts} from '@utils/Constants';
import {navigate, replace} from '@utils/NavigationUtils';
import {useRoute} from '@react-navigation/native';

const OrderSuccess: FC = () => {
  const route = useRoute();
  const {customer} = useAuthStore();

  const {
    orderId,
    deliveryAddress = 'No address information',
    addressType = 'unknown',
    name = customer?.name || 'Anonymous',
    phone = route.params?.phone || customer?.phone || 'XXXXXXXXXX', // ✅ prefer passed phone
  } = route.params || {};

  useEffect(() => {
    if (!orderId) {
      console.error('Order ID missing in OrderSuccess!');
      return;
    }

    const timeoutId = setTimeout(() => {
      navigate('LiveTracking', {
        orderId, // now guaranteed to exist
        addressType,
        deliveryAddress,
      });
    }, 2300);

    return () => clearTimeout(timeoutId);
  }, [orderId, addressType, deliveryAddress]);

  const formattedAddressType =
    addressType === 'primary'
      ? 'Primary'
      : addressType === 'secondary'
      ? 'Secondary'
      : 'Unknown';

  return (
    <View style={styles.container}>
      <LottieView
        source={require('@assets/animations/confirm.json')}
        autoPlay
        duration={2000}
        loop={false}
        speed={1}
        style={styles.lottieView}
        enableMergePathsAndroidForKitKatAndAbove
        hardwareAccelerationAndroid
      />

      <CustomText
        variant="h8"
        fontFamily={Fonts.SemiBold}
        style={styles.orderPlaceText}>
        ORDER PLACED
      </CustomText>

      <View style={styles.deliveryContainer}>
        <CustomText
          variant="h4"
          fontFamily={Fonts.SemiBold}
          style={styles.deliveryText}>
          Delivering to {formattedAddressType}
        </CustomText>
      </View>

      <CustomText
        variant="h8"
        style={styles.addressText}
        fontFamily={Fonts.Medium}>
        {deliveryAddress}
      </CustomText>

      <CustomText
        variant="h8"
        style={styles.contactText}
        fontFamily={Fonts.Medium}>
        📞 {name} ({phone})
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  lottieView: {
    width: screenWidth * 0.6,
    height: 150,
  },
  orderPlaceText: {
    opacity: 0.4,
  },
  deliveryContainer: {
    borderBottomWidth: 2,
    paddingBottom: 4,
    marginBottom: 5,
    borderColor: Colors.secondary,
  },
  deliveryText: {
    marginTop: 15,
    borderColor: Colors.secondary,
  },
  addressText: {
    opacity: 0.8,
    width: '80%',
    textAlign: 'center',
    marginTop: 10,
  },
  contactText: {
    opacity: 0.6,
    marginTop: 5,
    fontSize: 14,
  },
});

export default OrderSuccess;
