import React, {FC, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import UniversalAdd from '@components/ui/UniversalAdd';
import {screenHeight} from '@utils/Scaling';
import {Fonts} from '@utils/Constants';
import axios from 'axios';
import RatingStars from '@components/ui/RatingStars';
import {BASE_URL} from '@service/config';

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
    units?: any[];
  };
  index: number;
  onPress?: () => void;
};

const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';
const API_URL = BASE_URL;

const getImageSource = (img: ImageType): {uri: string} => {
  if (typeof img === 'string' && img.startsWith('http')) return {uri: img};
  if (
    typeof img === 'object' &&
    typeof img?.uri === 'string' &&
    img.uri.startsWith('http')
  )
    return {uri: img.uri};
  return {uri: fallbackImage};
};

const ProductItem: FC<ProductItemProps> = ({index, item, onPress}) => {
  const isSecondColumn = index % 2 !== 0;

  // Fix price calculation - ensure we're working with numbers
  const originalPrice =
    typeof item.price === 'string'
      ? parseFloat(item.price.replace(/[^\d.]/g, ''))
      : Number(item.price) || 0;

  const discountPriceValue = item.discountPrice
    ? typeof item.discountPrice === 'string'
      ? parseFloat(item.discountPrice.replace(/[^\d.]/g, ''))
      : Number(item.discountPrice)
    : originalPrice;

  const hasValidDiscount = discountPriceValue < originalPrice;
  const discountPercent = hasValidDiscount
    ? Math.round(((originalPrice - discountPriceValue) / originalPrice) * 100)
    : 0;

  const [rating, setRating] = useState({avgRating: 0, totalReviews: 0});
  const [loadingRating, setLoadingRating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRating = async () => {
      if (!item._id) return;

      try {
        setLoadingRating(true);
        const res = await axios.get(`${API_URL}/reviews/${item._id}/rating`);
        if (isMounted && res.data) {
          setRating({
            avgRating: Number(res.data.avgRating ?? 0),
            totalReviews: Number(res.data.totalReviews ?? 0),
          });
        }
      } catch (err: any) {
        console.warn(
          `Rating fetch failed for ${item._id}:`,
          err.response?.status,
        );
        if (isMounted) setRating({avgRating: 0, totalReviews: 0});
      } finally {
        if (isMounted) setLoadingRating(false);
      }
    };

    fetchRating();
    return () => {
      isMounted = false;
    };
  }, [item._id]);

  return (
    <View style={[styles.container, {marginLeft: isSecondColumn ? 8 : 0}]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.3}
        style={styles.touchable}>
        <View style={styles.imageContainer}>
          <Image source={getImageSource(item.image)} style={styles.image} />
          {hasValidDiscount && (
            <View style={styles.discountBadge}>
              <CustomText style={styles.discountText}>
                {discountPercent}% OFF
              </CustomText>
            </View>
          )}
        </View>

        {/* Add this section to show sub-images */}
        <View style={styles.subImagesContainer}>
          {(item.subImages || []).slice(0, 3).map((subImg, idx) => (
            <Image
              key={`${item._id}-sub-${idx}`}
              source={getImageSource(subImg)}
              style={styles.subImageThumb}
              resizeMode="cover"
            />
          ))}
        </View>

        <View style={styles.content}>
          <View style={styles.textWrapper}>
            <CustomText
              fontFamily={Fonts.Medium}
              variant="h8"
              numberOfLines={2}
              style={styles.title}>
              {item.name || 'Unnamed Product'}
            </CustomText>

            <View style={styles.ratingContainer}>
              {loadingRating ? (
                <ActivityIndicator size="small" color="#FFB800" />
              ) : (
                <RatingStars
                  rating={rating.avgRating}
                  reviews={rating.totalReviews}
                />
              )}
            </View>
          </View>

          {/* ✅ Stock details */}
          {item.stocks !== undefined &&
            (item.stocks === 0 ? (
              <CustomText style={[styles.stockText, styles.stockOut]}>
                Out of stock
              </CustomText>
            ) : item.stocks < 11 ? (
              <CustomText style={[styles.stockText, styles.stockLow]}>
                Only {item.stocks} left in stock!
              </CustomText>
            ) : null)}

          {/* Always at the bottom */}
          <View style={styles.priceContainer}>
            <View style={styles.priceWrapper}>
              {hasValidDiscount ? (
                <>
                  <CustomText style={styles.originalPrice}>
                    ₹{originalPrice}
                  </CustomText>
                  <CustomText style={styles.discountPrice}>
                    ₹{discountPriceValue}
                  </CustomText>
                </>
              ) : (
                <CustomText style={styles.regularPrice}>
                  ₹{originalPrice}
                </CustomText>
              )}
            </View>

            {item.stocks === 0 ? (
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: '#d9534f',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}>
                <CustomText style={{color: '#d9534f', fontSize: RFValue(11)}}>
                  Notify Me
                </CustomText>
              </TouchableOpacity>
            ) : (
              <UniversalAdd item={item} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 4,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#319639ff',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    zIndex: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: RFValue(9),
    fontWeight: 'bold',
  },
  imageContainer: {
    height: screenHeight * 0.16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 8,
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  // Add styles for sub-images container
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
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between', // pushes price to bottom
  },
  textWrapper: {
    flexShrink: 1, // wraps name + rating
  },
  title: {
    marginBottom: 4,
    textAlign: 'left',
    color: '#222',
    fontSize: RFValue(12),
    lineHeight: RFValue(15),
    minHeight: RFValue(30),
  },
  ratingContainer: {
    marginBottom: 6,
    height: RFValue(21),
    justifyContent: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#777',
    fontSize: RFValue(11),
    marginRight: 4,
  },
  discountPrice: {
    color: '#2e7231ff',
    fontSize: RFValue(13),
    fontWeight: 'bold',
  },
  regularPrice: {
    color: '#2e7231ff',
    fontSize: RFValue(13),
    fontWeight: 'bold',
  },
  stockText: {
    fontSize: RFValue(11),
    marginBottom: 6,
  },
  stockIn: {
    color: '#2e7231', // green
  },
  stockLow: {
    color: '#d9534f', // red (low stock / out of stock)
  },
  stockOut: {
    color: '#d9534f',
    fontWeight: '600',
  },
});

export default ProductItem;
