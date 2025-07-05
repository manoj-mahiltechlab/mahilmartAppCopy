import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UniversalAdd from '@components/ui/UniversalAdd';
import ProductItem from '@features/category/ProductItem';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {getProductsBySubcategoryId} from '@service/ProductService';
import withCart from '@features/cart/WithCart';

const {width} = Dimensions.get('window');

interface Product {
  _id?: string;
  id?: string;
  name: string;
  image: string | {uri: string};
  subImages?: string[];
  price: number;
  discountPrice?: number;
  description?: string;
}

type ProductDetailsRouteParams = {
  product: Product;
  touchedSubcategoryId?: string;
};

const ProductDetails = () => {
  const route =
    useRoute<RouteProp<Record<string, ProductDetailsRouteParams>, string>>();
  const navigation = useNavigation<any>();

  const {product, touchedSubcategoryId} = route.params || {};
  const [productData, setProductData] = useState<Product | undefined>(product);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const flatListRef = useRef<FlatList<string>>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const images = useMemo(() => {
    if (!productData) return [];
    const mainImage =
      typeof productData.image === 'string'
        ? productData.image
        : productData.image?.uri;
    return [mainImage, ...(productData.subImages || [])].filter(Boolean);
  }, [productData]);

  useEffect(() => {
    setProductData(product);
  }, [product]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (touchedSubcategoryId) {
        setLoadingRelated(true);
        try {
          const products = await getProductsBySubcategoryId(
            touchedSubcategoryId,
          );
          const filtered = products.filter(
            p => (p._id || p.id) !== product._id,
          );
          setRelatedProducts(filtered);
        } catch (error) {
          console.error('[❗ Related Products Fetch Error]:', error);
        } finally {
          setLoadingRelated(false);
        }
      }
    };
    fetchRelatedProducts();
  }, [touchedSubcategoryId, product]);

  if (!productData) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Product Details" />
        <View style={styles.center}>
          <CustomText>Product not found.</CustomText>
        </View>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={{paddingBottom: 10}}>
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item}: ListRenderItemInfo<string>) => (
            <Image
              source={{uri: item}}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        />
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="share-variant" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="heart-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {productData.subImages?.length > 0 && (
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
        <CustomText style={styles.name}>{productData.name}</CustomText>
        <View style={styles.priceContainer1}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <CustomText
              style={{
                color: '#777',
                fontSize: 14,

                textDecorationLine: 'line-through',
              }}>
              ₹{productData.discountPrice || productData.price}
            </CustomText>
            {productData.discountPrice && (
              <CustomText
                style={{
                  color: '#2e7d32',
                  fontSize: 20,
                  marginLeft: 10,
                  fontWeight: 'bold',
                }}>
                ₹{productData.price}
              </CustomText>
            )}
          </View>
          <UniversalAdd item={productData} />
        </View>

        <CustomText style={styles.sectionTitle}>Description</CustomText>
        <CustomText
          style={styles.description}
          numberOfLines={showFullDescription ? undefined : 3}>
          {productData.description ||
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

      <CustomText style={[styles.sectionTitle, {marginTop: 10}]}>
        Related Products
      </CustomText>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Product Details" />
      {loadingRelated ? (
        <ActivityIndicator style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={relatedProducts.length > 0 ? relatedProducts : [productData]}
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
            };

            console.log(
              `[ProductItem] Rendering index ${index}:`,
              transformedItem,
            );

            return (
              <ProductItem
                item={transformedItem}
                index={index}
                onPress={() => {
                  console.log('[Navigation] Navigate to ProductDetails with:', {
                    product: transformedItem,
                    touchedSubcategoryId,
                  });
                  navigation.navigate('ProductDetails', {
                    product: transformedItem,
                    touchedSubcategoryId,
                  });
                }}
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
