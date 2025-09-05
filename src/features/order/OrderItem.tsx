import {View, StyleSheet, Image} from 'react-native';
import React, {FC} from 'react';
import {Colors, Fonts} from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import UniversalAdd from '@components/ui/UniversalAdd';

// Helper to get safe image source
const getImageSource = (value: any): {uri: string} | undefined => {
  if (typeof value === 'string' && value.startsWith('http'))
    return {uri: value};
  if (value?.uri && typeof value.uri === 'string') return {uri: value.uri};
  return undefined;
};

const OrderItem: FC<{item: any}> = ({item}) => {
  const product = item?.product ?? item?.item;
  const imageSource = getImageSource(product?.image);

  const unitPrice =
    item?.price ??
    product?.sellingPrice ??
    product?.discountPrice ??
    product?.price ??
    0;

  const qty = item?.count ?? item?.quantity ?? 0;
  const totalPrice = unitPrice * qty;

  return (
    <View style={styles.flexRow}>
      {/* Image */}
      <View style={styles.imgContainer}>
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

      {/* Name + Quantity */}
      <View style={{width: '55%'}}>
        <CustomText numberOfLines={2} variant="h8" fontFamily={Fonts.Medium}>
          {product?.name ?? 'Unnamed Product'}
        </CustomText>
        <CustomText variant="h9">{qty}x</CustomText>
      </View>

      {/* Counter + Price */}
      <View style={{width: '20%', alignItems: 'flex-end'}}>
        <UniversalAdd item={product} />
        <CustomText
          variant="h8"
          fontFamily={Fonts.Medium}
          style={{alignSelf: 'flex-end', marginTop: 4}}>
          ₹{totalPrice}
        </CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  img: {
    width: 40,
    height: 40,
  },
  imgContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderRadius: 15,
    width: '17%',
  },
  flexRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 0.6,
    borderBottomColor: Colors.border, // ✅ fixed
  },
});

export default OrderItem;
