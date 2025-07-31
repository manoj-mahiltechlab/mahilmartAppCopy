import React, {useRef, useEffect, useMemo, useState, useCallback} from 'react';
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
  useFocusEffect,
} from '@react-navigation/native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UniversalAdd from '@components/ui/UniversalAdd';
import ProductItem from '@features/category/ProductItem';
import {getProductsBySubcategoryId} from '@service/ProductService';
import withCart from '@features/cart/WithCart';
import ImageViewing from 'react-native-image-viewing';

const {width} = Dimensions.get('window');
const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

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
  subcategoryId?: string;
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
    product: initialProduct,
    touchedSubcategoryId,
    fromSearch,
    relatedProducts: passedRelated,
  } = route.params;

  const [product, setProduct] = useState<Product>(() => {
    if (!initialProduct.subcategory && touchedSubcategoryId) {
      return {...initialProduct, subcategory: touchedSubcategoryId};
    }
    return initialProduct;
  });

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const originalRelatedProductsRef = useRef<Product[]>([]);

  const images = useMemo(() => {
    const mainImage =
      typeof product.image === 'string' ? product.image : product.image?.uri;
    return [mainImage, ...(product.subImages || [])].filter(Boolean);
  }, [product]);

  useFocusEffect(
    useCallback(() => {
      setLoadingProduct(false);
    }, []),
  );

  useEffect(() => {
    const hasPassedRelated =
      Array.isArray(passedRelated) && passedRelated.length > 0;

    if (hasPassedRelated) {
      if (originalRelatedProductsRef.current.length === 0) {
        originalRelatedProductsRef.current = passedRelated; // store full list once
      }

      const filtered = passedRelated.filter(
        p => (p._id || p.id) !== (product._id || product.id),
      );

      setRelatedProducts(filtered);
    } else {
      const subcategoryId =
        touchedSubcategoryId ||
        (typeof product.subcategory === 'object'
          ? product.subcategory?._id
          : product.subcategory) ||
        product.subcategoryId;

      if (!subcategoryId) return;

      setLoadingRelated(true);
      getProductsBySubcategoryId(subcategoryId)
        .then(res => {
          const fetched = res?.products || [];
          const filtered = fetched.filter(
            p => (p._id || p.id) !== (product._id || product.id),
          );
          setRelatedProducts(filtered);
        })
        .catch(err => {
          console.error('Fetch related error:', err);
        })
        .finally(() => setLoadingRelated(false));
    }
  }, [product, touchedSubcategoryId]);

  const onShare = async () => {
    try {
      await Share.share({message: `Check out this product: ${product.name}`});
    } catch (error) {
      console.error('Share failed:', error);
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
          renderItem={({item, index}) => (
            <TouchableOpacity
              onPress={() => {
                setImageIndex(index);
                setImageViewerVisible(true);
              }}>
              <Image
                source={{uri: item || fallbackImage}}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={onShare}>
            <Icon name="share-variant" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
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
              <Image
                source={{uri: item || fallbackImage}}
                style={styles.subImage}
              />
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.detailsContainer}>
        <CustomText style={styles.name}>{product.name}</CustomText>

        <View style={styles.priceContainer1}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            {product.discountPrice && (
              <>
                <CustomText
                  style={{color: '#777', textDecorationLine: 'line-through'}}>
                  ₹{product.discountPrice}
                </CustomText>
                <CustomText style={{fontWeight: 'bold', color: '#222'}}>
                  ₹{product.price}
                </CustomText>
              </>
            )}
            {!product.discountPrice && (
              <CustomText style={{fontWeight: 'bold', color: '#222'}}>
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
          {product.description || 'No description provided.'}
        </CustomText>
        <TouchableOpacity
          onPress={() => setShowFullDescription(!showFullDescription)}>
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
      <ImageViewing
        images={images.map(uri => ({uri}))}
        imageIndex={imageIndex}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
      {loadingRelated ? (
        <ActivityIndicator style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={relatedProducts}
          keyExtractor={(item, index) =>
            `${item._id || item.id || 'product'}-${index}`
          }
          numColumns={2}
          contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 30}}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginVertical: 20}}>
              <CustomText>
                {fromSearch
                  ? 'No other products found in search.'
                  : 'No related products found.'}
              </CustomText>
            </View>
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
              subcategory:
                item.subcategory || item.subcategoryId || touchedSubcategoryId,
            };

            return (
              <ProductItem
                item={transformedItem}
                index={index}
                onPress={() => {
                  const subcategoryId =
                    typeof transformedItem.subcategory === 'object'
                      ? transformedItem.subcategory?._id
                      : transformedItem.subcategory;

                  navigation.push('ProductDetails', {
                    product: transformedItem,
                    touchedSubcategoryId: subcategoryId,
                    fromSearch,
                    relatedProducts: fromSearch
                      ? originalRelatedProductsRef.current
                      : undefined,
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
  carouselContainer: {
    width,
    height: 350,
    backgroundColor: '#fafafa',
    position: 'relative',
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
