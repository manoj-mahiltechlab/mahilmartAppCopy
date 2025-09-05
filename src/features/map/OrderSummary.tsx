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
  const activeItems =
    order?.items?.filter((item: any) => item?.status !== 'Cancelled') || [];
  const cancelledItems =
    order?.items?.filter((item: any) => item?.status === 'Cancelled') || [];

  const totalPrice =
    activeItems.reduce((total: number, cartItem: any) => {
      const product = cartItem?.product;
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

      {/* Active Items */}
      {activeItems.map((item: any, index: number) => {
        const product = item?.product;
        if (!product) return null;

        const imageSource = getImageSource(product.image);
        const price =
          product?.sellingPrice ??
          product?.discountPrice ??
          product?.price ??
          0;

        return (
          <View style={styles.flexRow} key={`active-${index}`}>
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

      {/* Cancelled Items Section */}
      {cancelledItems.length > 0 && (
        <View style={{marginTop: 10}}>
          <CustomText
            variant="h8"
            fontFamily={Fonts.SemiBold}
            style={{marginLeft: 10, color: 'red'}}>
            Cancelled Items
          </CustomText>

          {cancelledItems.map((item: any, index: number) => {
            const product = item?.product;
            if (!product) return null;

            const imageSource = getImageSource(product.image);
            const price =
              product?.sellingPrice ??
              product?.discountPrice ??
              product?.price ??
              0;

            return (
              <View
                style={[
                  styles.flexRow,
                  styles.cancelledRow,
                  index === cancelledItems.length - 1 && {borderBottomWidth: 0}, // no border for last item
                ]}
                key={`cancel-${index}`}>
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
                    fontFamily={Fonts.Medium}
                    style={{textDecorationLine: 'line-through', color: '#666'}}>
                    {product.name ?? 'Unnamed Product'}
                  </CustomText>
                  {/* Cancelled Badge */}
                  <View style={styles.cancelledBadge}>
                    <CustomText style={styles.cancelledBadgeText}>
                      Cancelled
                    </CustomText>
                  </View>
                </View>
                <View style={{width: '20%', alignItems: 'flex-end'}}>
                  <CustomText
                    variant="h8"
                    fontFamily={Fonts.Medium}
                    style={{
                      marginTop: 4,
                      textDecorationLine: 'line-through',
                      color: '#999',
                    }}>
                    ₹{(item.count ?? 0) * price}
                  </CustomText>
                  <CustomText
                    variant="h8"
                    fontFamily={Fonts.Medium}
                    style={{marginTop: 4}}>
                    {item.count ?? 0}x
                  </CustomText>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Bill Details (only active items included in total) */}
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
  cancelledRow: {
    backgroundColor: '#ffecec',
    borderColor: '#ffb3b3',
    opacity: 0.9,
  },

  cancelledBadge: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  cancelledBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Fonts.Medium,
  },
});

export default OrderSummary;
