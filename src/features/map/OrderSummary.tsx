import {View, StyleSheet, Image} from 'react-native';
import React, {FC} from 'react';
import {Colors, Fonts} from '@utils/Constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import BillDetails from '@features/order/BillDetails';

// ✅ Helper function to handle different image structures
const getImageSource = (value: any): {uri: string} | undefined => {
  if (typeof value === 'string' && value.startsWith('http'))
    return {uri: value};
  if (value?.uri && typeof value.uri === 'string') return {uri: value.uri};
  return undefined;
};

const OrderSummary: FC<{order: any}> = ({order}) => {
  const totalPrice =
    order?.items?.reduce((total: number, cartItem: any) => {
      const product = cartItem?.product;
      // 👇 Prefer sellingPrice, fallback to discountPrice, then MRP
      const price =
        product?.sellingPrice ?? product?.discountPrice ?? product?.price ?? 0;

      const count = cartItem?.count ?? 0;
      return total + price * count;
    }, 0) || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.flexRow}>
        <View style={styles.iconContainer}>
          <Icon
            name="shopping-outline"
            color={Colors.disabled}
            size={RFValue(10)}
          />
        </View>
        <View>
          <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
            Order summary
          </CustomText>
          <CustomText variant="h9" fontFamily={Fonts.Medium}>
            Order ID - #{order?.orderId ?? 'N/A'}
          </CustomText>
        </View>
      </View>

      {/* Order Items */}
      {order?.items?.map((item: any, index: number) => {
        const product = item?.product;
        if (!product) return null;

        const imageSource = getImageSource(product.image);
        const price =
          product?.sellingPrice ??
          product?.discountPrice ??
          product?.price ??
          0;

        return (
          <View style={styles.flexRow} key={index}>
            <View style={styles.iconContainer}>
              {imageSource ? (
                <Image source={imageSource} style={styles.img} />
              ) : (
                <View
                  style={[
                    styles.img,
                    {
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#ddd',
                    },
                  ]}>
                  <CustomText>No Img</CustomText>
                </View>
              )}
            </View>
            <View style={{width: '55%'}}>
              <CustomText
                numberOfLines={2}
                variant="h8"
                fontFamily={Fonts.Medium}>
                {product.name ?? 'Unnamed Product'}
              </CustomText>
              <CustomText variant="h9">{product.quantity ?? 'N/A'}</CustomText>
            </View>
            <View style={{width: '20%', alignItems: 'flex-end'}}>
              <CustomText
                variant="h8"
                fontFamily={Fonts.Medium}
                style={{alignSelf: 'flex-end', marginTop: 4}}>
                ₹{(item.count ?? 0) * price}
              </CustomText>
              <CustomText
                variant="h8"
                fontFamily={Fonts.Medium}
                style={{alignSelf: 'flex-end', marginTop: 4}}>
                {item.count ?? 0}x
              </CustomText>
            </View>
          </View>
        );
      })}

      {/* Bill Details */}
      <BillDetails totalItemPrice={totalPrice} />
    </View>
  );
};

const styles = StyleSheet.create({
  img: {
    width: 40,
    height: 40,
  },
  container: {
    width: '100%',
    borderRadius: 15,
    marginVertical: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  iconContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 100,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderBottomWidth: 0.7,
    borderColor: Colors.border,
  },
});

export default OrderSummary;
