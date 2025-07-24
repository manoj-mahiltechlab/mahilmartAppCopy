import React, {useRef, useEffect, useMemo, useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Share,
} from 'react-native';
import {
  useRoute,
  RouteProp,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UniversalAdd from '@components/ui/UniversalAdd';
import ProductItem from '@features/category/ProductItem';
import {getProductsBySubcategoryId} from '@service/ProductService';
import withCart from '@features/cart/WithCart';

const {width} = Dimensions.get('window');
const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

// 👇 Define Product and Navigation Param Types
type Product = {
  _id?: string;
  id?: string;
  name: string;
  image: string | {uri: string};
  subImages?: string[];
  price: number;
  discountPrice?: number;
  description?: string;
  subcategory?: string;
};

type RootStackParamList = {
  ProductDetails: {
    product: Product;
    touchedSubcategoryId?: string;
    fromSearch?: boolean;
    relatedProducts?: Product[];
  };
  ProductCategories: {
    categoryId?: string;
    subcategoryId?: string;
    categoryName?: string;
    searchResults?: Product[];
  };
};

const ProductDetails = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetails'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    product,
    touchedSubcategoryId,
    fromSearch,
    relatedProducts: passedRelated,
  } = route.params;

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const flatListRef = useRef<FlatList<string>>(null);

  const images = useMemo(() => {
    const mainImage =
      typeof product.image === 'string' ? product.image : product.image?.uri;
    return [mainImage, ...(product.subImages || [])].filter(Boolean);
  }, [product]);

  useEffect(() => {
    console.log('[ProductDetails] route.params:', {
      product,
      touchedSubcategoryId,
      fromSearch,
      passedRelated,
    });
  }, []);

  useEffect(() => {
    const fetchOrSetRelatedProducts = async () => {
      console.log('[ProductDetails] Fetching related products...');

      setLoadingRelated(true);

      try {
        if (fromSearch && Array.isArray(passedRelated)) {
          console.log(
            '[ProductDetails] Using passed relatedProducts (fromSearch)',
          );
          const filtered = passedRelated.filter(
            p => (p._id || p.id) !== (product._id || product.id),
          );
          console.log(
            '[ProductDetails] Filtered related products (fromSearch):',
            filtered,
          );
          setRelatedProducts(filtered);
        } else if (touchedSubcategoryId) {
          console.log(
            '[ProductDetails] Fetching products by touchedSubcategoryId:',
            touchedSubcategoryId,
          );
          const response = await getProductsBySubcategoryId(
            touchedSubcategoryId,
          );
          const products = response?.products || [];

          const filtered = products.filter(
            p => (p._id || p.id) !== (product._id || product.id),
          );
          console.log(
            '[ProductDetails] Filtered related products (subcategory):',
            filtered,
          );
          setRelatedProducts(filtered);
        } else {
          console.log(
            '[ProductDetails] No subcategory or related products to fetch',
          );
        }
      } catch (error) {
        console.error('[❗ Related Products Fetch Error]:', error);
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchOrSetRelatedProducts();
  }, [product, touchedSubcategoryId, fromSearch]);

  const onShare = async () => {
    try {
      console.log('[ProductDetails] Sharing product:', product.name);
      await Share.share({
        message: `Check out this product: ${product.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderHeader = () => (
    <View style={{paddingBottom: 10}}>
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item}) => (
            <Image
              source={{uri: item || fallbackImage}}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        />
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={onShare}>
            <Icon name="share-variant" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <Icon name="heart-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {product.subImages?.length > 0 && (
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.subImagesList}
          renderItem={({item, index}) => (
            <TouchableOpacity
              onPress={() =>
                flatListRef.current?.scrollToIndex({index, animated: true})
              }>
              <Image source={{uri: item}} style={styles.subImage} />
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.detailsContainer}>
        <CustomText style={styles.name}>{product.name}</CustomText>

        <View style={styles.priceContainer1}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <CustomText
              style={{
                color: '#777',
                fontSize: 14,
                textDecorationLine: 'line-through',
              }}>
              ₹{product.discountPrice || product.price}
            </CustomText>
            {product.discountPrice && (
              <CustomText
                style={{
                  color: '#2e7d32',
                  fontSize: 20,
                  marginLeft: 10,
                  fontWeight: 'bold',
                }}>
                ₹{product.price}
              </CustomText>
            )}
          </View>
          <UniversalAdd item={product} />
        </View>

        <CustomText style={styles.sectionTitle}>Description</CustomText>
        <CustomText
          style={styles.description}
          numberOfLines={showFullDescription ? undefined : 3}>
          {product.description ||
            'Get this product to experience quality and value. Suitable for daily use, made with care, and designed to meet your needs.'}
        </CustomText>
        <TouchableOpacity
          onPress={() => setShowFullDescription(!showFullDescription)}
          style={{marginTop: 5}}>
          <CustomText style={styles.toggleMore}>
            {showFullDescription ? 'Less' : 'More...'}
          </CustomText>
        </TouchableOpacity>
      </View>

      {!fromSearch && (
        <CustomText style={[styles.sectionTitle, {marginTop: 10}]}>
          Related Products
        </CustomText>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Product Details" />
      {loadingRelated ? (
        <ActivityIndicator style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={relatedProducts}
          keyExtractor={item =>
            (item._id || item.id)?.toString() || Math.random().toString()
          }
          numColumns={2}
          contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 30}}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            !fromSearch && (
              <View style={{alignItems: 'center', marginVertical: 20}}>
                <CustomText>No related products found.</CustomText>
              </View>
            )
          }
          renderItem={({item, index}) => {
            const transformedItem = {
              _id: item._id || item.id,
              image:
                typeof item.image === 'string' ? item.image : item.image?.uri,
              name: item.name,
              subImages: item.subImages || [],
              price: item.price,
              discountPrice: item.discountPrice,
              description: item.description,
              subcategory: item.subcategory || item.subcategoryId,
            };

            console.log(
              '[ProductDetails] Navigating to ProductDetails of:',
              transformedItem,
            );

            return (
              <ProductItem
                item={transformedItem}
                index={index}
                onPress={() =>
                  navigation.push('ProductDetails', {
                    product: transformedItem,
                    touchedSubcategoryId: transformedItem.subcategory,
                    fromSearch,
                    relatedProducts: fromSearch
                      ? [product, ...relatedProducts]
                      : undefined,
                  })
                }
              />
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  carouselContainer: {
    width,
    height: 350,
    backgroundColor: '#fafafa',
    position: 'relative',
    elevation: 3,
  },
  image: {width, height: 350},
  iconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: '#0008',
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  subImagesList: {marginVertical: 14, paddingHorizontal: 16},
  subImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  detailsContainer: {paddingHorizontal: 16, marginTop: 10},
  name: {fontSize: 18, fontWeight: '700', marginBottom: 6, color: '#222'},
  priceContainer1: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {fontSize: 13, color: '#444', lineHeight: 20},
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#333',
  },
  toggleMore: {color: '#007BFF', fontSize: 13, fontWeight: '500'},
});

export default withCart(ProductDetails);
