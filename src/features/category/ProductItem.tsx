import React, {FC} from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {screenHeight} from '@utils/Scaling';
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';
import {Fonts} from '@utils/Constants';
import UniversalAdd from '@components/ui/UniversalAdd';

type ImageType = string | {uri?: string | null} | null | undefined;

type ProductItemProps = {
  item: {
    _id: string;
    image: ImageType;
    name: string;
    subImages?: ImageType[];
    price: string | number;
    discountPrice?: string | number | null;
    description?: string;
    stocks?: number;
    units?: UnitType[];
  };
  index: number;
  onPress?: () => void;
};

const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

const getImageSource = (img: ImageType): {uri: string} => {
  if (typeof img === 'string' && img.startsWith('http')) return {uri: img};
  if (
    typeof img === 'object' &&
    typeof img?.uri === 'string' &&
    img.uri.startsWith('http')
  ) {
    return {uri: img.uri};
  }
  return {uri: fallbackImage};
};

const ProductItem: FC<ProductItemProps> = ({index, item, onPress}) => {
  const isSecondColumn = index % 2 !== 0;

  const originalPrice = Number(item.price);
  const discountPrice = Number(item.discountPrice ?? 0);
  const hasValidDiscount =
    !!item.discountPrice &&
    !isNaN(originalPrice) &&
    !isNaN(discountPrice) &&
    discountPrice < originalPrice;

  // console.log('Stocks Details : ', item);
  const discountPercent = hasValidDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  const stockText = item.stocks !== undefined ? item.stocks : 'N/A';

  return (
    <View style={[styles.container, {marginRight: isSecondColumn ? 1 : 0}]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.3}>
        <View style={styles.imageContainer}>
          <Image source={getImageSource(item?.image)} style={styles.image} />
          {hasValidDiscount && (
            <View style={styles.discountBadge}>
              <CustomText style={styles.discountText}>
                {discountPercent}% OFF
              </CustomText>
            </View>
          )}
        </View>

        <View style={styles.subImagesContainer}>
          {item?.subImages?.length > 0 ? (
            item.subImages
              .slice(0, 3)
              .map((subImg, idx) => (
                <Image
                  key={idx}
                  source={getImageSource(subImg)}
                  style={styles.subImageThumb}
                  resizeMode="cover"
                />
              ))
          ) : (
            <CustomText style={styles.noImageText}></CustomText>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.timeContainer}>
            <Image
              source={require('@assets/icons/clock.png')}
              style={styles.clockIcon}
            />
            <CustomText fontSize={RFValue(7)} fontFamily={Fonts.Medium}>
              16 MINS
            </CustomText>
          </View>

          {item.stocks !== undefined &&
            (item.stocks === 0 ? (
              <CustomText
                style={{
                  color: '#d9534f',
                  fontSize: RFValue(8),
                  marginTop: 2,
                }}>
                Out of stock
              </CustomText>
            ) : item.stocks < 11 ? (
              <CustomText
                style={{
                  color: '#d9534f',
                  fontSize: RFValue(8),
                  marginTop: 2,
                }}>
                Only {item.stocks} left in stock!
              </CustomText>
            ) : null)}

          <CustomText
            fontFamily={Fonts.Medium}
            variant="h8"
            numberOfLines={2}
            style={styles.title}>
            {item.name}
          </CustomText>

          <View style={styles.priceContainer}>
            <View>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                {hasValidDiscount && (
                  <CustomText
                    style={{
                      textDecorationLine: 'line-through',
                      color: '#777',
                      fontSize: RFValue(10),
                    }}>
                    ₹{originalPrice}
                  </CustomText>
                )}
                <CustomText
                  style={{
                    color: '#2e7231ff',
                    fontSize: RFValue(12),
                    fontWeight: 'bold',
                  }}>
                  ₹{discountPrice}
                </CustomText>
              </View>
            </View>
            <UniversalAdd item={item} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '50%',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 4,
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#319639ff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    zIndex: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: RFValue(9),
    fontWeight: 'bold',
  },
  imageContainer: {
    height: screenHeight * 0.18,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  subImagesContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  subImageThumb: {
    width: 40,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#ddd',
  },
  noImageText: {
    fontSize: 10,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  clockIcon: {
    height: 12,
    width: 12,
    marginRight: 4,
  },
  title: {
    marginVertical: 6,
    textAlign: 'left',
    color: '#222',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});

export default ProductItem;
