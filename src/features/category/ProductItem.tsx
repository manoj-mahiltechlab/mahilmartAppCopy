import React, {FC} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {screenHeight} from '@utils/Scaling';
import {Colors} from 'react-native/Libraries/NewAppScreen'; // Make sure this Colors import is correct
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';
import {Fonts} from '@utils/Constants';
import UniversalAdd from '@components/ui/UniversalAdd';

interface ProductItemProps {
  item: {
    image: string;
    name: string;
    price: number | string;
    discountPrice: number | string;
  };
  index: number;
}

const ProductItem: FC<ProductItemProps> = ({index, item}) => {
  const isSecondColumn = index % 2 !== 0;

  return (
    <View style={[styles.container, {marginRight: isSecondColumn ? 10 : 0}]}>
      <View style={styles.imageContainer}>
        <Image source={{uri: item?.image}} style={styles.image} />
      </View>

      <View style={styles.content}>
        <View style={styles.flexRow}>
          <Image
            source={require('@assets/icons/clock.png')}
            style={styles.clockIcon}
          />
          <CustomText fontSize={RFValue(6)} fontFamily={Fonts.Medium}>
            16 MINS
          </CustomText>
        </View>

        <CustomText
          fontFamily={Fonts.Medium}
          variant="h8"
          numberOfLines={2}
          style={styles.title}>
          {item.name}
        </CustomText>

        <View style={styles.priceContainer}>
          <View>
            <CustomText variant="h8" fontFamily={Fonts.Medium}>
              ₹{item?.price}
            </CustomText>
            <CustomText
              fontFamily={Fonts.Medium}
              variant="h8"
              style={styles.strikePrice}>
              ₹{item?.discountPrice}
            </CustomText>
          </View>
          <UniversalAdd item={item} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '45%',
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    marginBottom: 10,
    marginLeft: 10,
    // overflow: 'hidden',
  },
  imageContainer: {
    height: screenHeight * 0.15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: 10,
    aspectRatio: 1 / 1,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  flexRow: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 5,
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary || '#e6e6e6', // fallback color if needed
    alignSelf: 'flex-start',
  },
  clockIcon: {
    height: 15,
    width: 15,
  },
  title: {
    marginVertical: 4,
    textAlign: 'left',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 'auto',
  },
  strikePrice: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
});

export default ProductItem;
