// ✅ Final Clean and Optimized Version of ProductOrder.js with Address Handling

import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import {Colors, Fonts} from '@utils/Constants';
import OrderList from './OrderList';
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BillDetails from './BillDetails';
import {useCartStore} from '@state/CartStore';
import {useAuthStore} from '@state/authStore';
import {hocStyles} from '@styles/GlobleStyles';
import ArrowButton from '@components/ui/ArrowButton';
import {createOrder} from '@service/orderService';
import {navigate} from '@utils/NavigationUtils';
import {useRoute, useNavigation} from '@react-navigation/native';
import {updateSelectedAddressType} from '@service/customerService';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ProductOrder = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {getTotalPrice, cart} = useCartStore();
  const {user, currentOrder} = useAuthStore();
  const totalItemPrice = getTotalPrice();
  const [loading, setLoading] = useState(false);
  const [activeAddressType, setActiveAddressType] = useState('primary');
  const [hasTriggeredOrder, setHasTriggeredOrder] = useState(false);
  const {params} = route;
  const newAddress = params?.newAddress;
  const addressType = params?.addressType;
  const name = params?.name;
  const phone = params?.phone;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.newAddress) {
        navigation.setParams({
          ...route.params,
          newAddress: null,
        });
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  const selectedAddress =
    newAddress ||
    (activeAddressType === 'primary'
      ? user?.PrimaryAddress
      : user?.SecondaryAddress);

  const handlePlaceOrder = async () => {
    const secondaryAddress = user?.SecondaryAddress;

    Alert.alert(
      'Confirm Address',
      selectedAddress
        ? `Current selected address:\n\n${selectedAddress}\n\nSecondary address ${
            secondaryAddress ? 'exists.' : 'not available.'
          }`
        : 'No address selected. Please add an address.',
      [
        {
          text: 'Change Address',
          onPress: () =>
            navigate('EditAddressScreen', {
              addressType: activeAddressType,
              existingAddress: selectedAddress,
              fromPlaceOrder: true,
            }),
        },
        {
          text: 'Proceed',
          onPress: async () => {
            const formattedData = cart.map(item => ({
              product: item._id,
              quantity: item.count,
              price: item.price,
            }));

            if (formattedData.length === 0) {
              Alert.alert(
                'No Items',
                'Please add items to your cart before placing an order.',
              );
              return;
            }

            if (!selectedAddress) {
              Alert.alert(
                'Missing Address',
                `Please add your ${activeAddressType} address to proceed.`,
                [
                  {
                    text: 'Go to Address',
                    onPress: () =>
                      navigate('EditAddressScreen', {
                        addressType: activeAddressType,
                        fromPlaceOrder: true,
                      }),
                  },
                  {text: 'Cancel', style: 'cancel'},
                ],
              );
              return;
            }

            setLoading(true);

            try {
              // ✅ Delivery charge logic
              const deliveryCharge = totalItemPrice >= 500 ? 0 : 40;
              const grandTotal = totalItemPrice + deliveryCharge;

              // Save selected address type to user profile
              await updateSelectedAddressType(
                user._id,
                activeAddressType === 'primary' ? 'Primary' : 'Secondary',
                selectedAddress,
              );

              // 👉 Send grand total + deliveryCharge to PaymentScreen
              navigate('PaymentScreen', {
                cartData: formattedData,
                totalAmount: grandTotal, // ✅ includes delivery charge
                deliveryCharge, // ✅ pass separately if you want to show it
                deliveryAddress: selectedAddress,
                addressType: activeAddressType,
                userId: user._id,
                liveLocation: user?.liveLocation || {
                  latitude: 0,
                  longitude: 0,
                },
              });
            } catch (err) {
              console.error('Error preparing order:', err);
              Alert.alert(
                'Error',
                'Unexpected error occurred while preparing the order.',
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  console.log('Touched selected address : ', selectedAddress);
  return (
    <View style={styles.container}>
      <CustomHeader title="Checkout" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* call OrderList component to display cart items */}
        <OrderList />

        <TouchableOpacity style={styles.flexRowBetween}>
          <View style={styles.flexRow}>
            <Image
              source={require('@assets/icons/coupon.png')}
              style={{width: wp(6), height: wp(6)}}
            />
            <CustomText variant="h6" fontFamily={Fonts.SemiBold}>
              Use Coupons
            </CustomText>
          </View>
          <Icon name="chevron-right" size={RFValue(14)} color={Colors.text} />
        </TouchableOpacity>

        <BillDetails totalItemPrice={totalItemPrice} />

        <View style={styles.flexRowBetween}>
          <View>
            <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
              Cancellation Policy
            </CustomText>
            <CustomText
              variant="h9"
              style={styles.cancelText}
              fontFamily={Fonts.SemiBold}>
              Orders cannot be cancelled once packed for delivery. In case of
              unexpected delays, refund will be provided, if applicable.
            </CustomText>
          </View>
        </View>
      </ScrollView>

      <View style={hocStyles.cartContainer}>
        <View style={styles.absoluteContainer}>
          <View style={styles.addressContainer}>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', marginBottom: 1.5}}>
                <TouchableOpacity
                  onPress={() => setActiveAddressType('primary')}
                  style={{marginRight: 10}}>
                  <CustomText
                    style={{
                      color:
                        activeAddressType === 'primary'
                          ? Colors.primary
                          : '#000',
                    }}>
                    Primary
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveAddressType('secondary')}>
                  <CustomText
                    style={{
                      color:
                        activeAddressType === 'secondary'
                          ? Colors.primary
                          : '#000',
                    }}>
                    Secondary
                  </CustomText>
                </TouchableOpacity>
              </View>

              <CustomText numberOfLines={2} style={{opacity: 0.6}}>
                {selectedAddress || 'No address saved yet'}
              </CustomText>
            </View>

            <TouchableOpacity
              onPress={() =>
                navigate('EditAddressScreen', {
                  addressType: activeAddressType,
                  existingAddress: selectedAddress,
                })
              }
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              activeOpacity={0.7}
              style={styles.changeAddressButton}>
              <CustomText
                variant="h6"
                style={{color: Colors.secondary}}
                fontFamily={Fonts.Medium}>
                Change
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentGateway}>
            <View style={{width: '30%'}}>
              <CustomText fontSize={RFValue(6)} fontFamily={Fonts.Regular}>
                💵 PAY USING
              </CustomText>
              <CustomText
                fontFamily={Fonts.Regular}
                variant="h6"
                style={{marginTop: 2}}>
                Cash on Delivery
              </CustomText>
            </View>
            <View style={{width: '70%'}}>
              <ArrowButton
                loading={loading}
                price={totalItemPrice}
                title="Place Order"
                onPress={handlePlaceOrder}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(30), // Enough space for bottom content
  },
  cancelText: {
    marginTop: hp(0.5),
    opacity: 0.6,
    fontSize: RFValue(10),
  },
  flexRowBetween: {
    padding: wp(4),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: wp(3),
    marginVertical: hp(1),
  },
  flexRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: wp(5),
  },
  paymentGateway: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: wp(4),
    paddingTop: hp(0),
  },
  addressContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    borderBottomWidth: 0.7,
    borderColor: Colors.border,
  },
  absoluteContainer: {
    marginVertical: hp(2),
    marginBottom: Platform.OS === 'ios' ? hp(5) : hp(2),
  },
  changeAddressButton: {
    padding: wp(2),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  changeAddressText: {
    color: Colors.secondary,
    textAlign: 'center',
    fontSize: RFValue(12),
  },
});

export default ProductOrder;
