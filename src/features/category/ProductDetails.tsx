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
  ScrollView,
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
import {fetchProductByProductId} from '@service/authService';
import {BASE_URL} from '@service/config';
import RatingStars from '@components/ui/RatingStars';
import axios from 'axios';

const {width} = Dimensions.get('window');
const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

type Unit = {gram: number; price: number; _id: string; productRef?: string};
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
  stocks?: number;
  units?: Unit[];
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

  const [product, setProduct] = useState<Product>(() =>
    !initialProduct.subcategory && touchedSubcategoryId
      ? {...initialProduct, subcategory: touchedSubcategoryId}
      : initialProduct,
  );
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingRating, setLoadingRating] = useState(true);
  const unitListRef = useRef<FlatList<any>>(null);
  const [rating, setRating] = useState({
    avgRating: 0,
    totalReviews: 0,
    comments: [] as string[],
  });

  const flatListRef = useRef<FlatList<any>>(null);
  const originalRelatedProductsRef = useRef<Product[]>([]);
  // Add at the top with other states
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>(
    'details',
  );

  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const selectedUnit = product.units?.[selectedUnitIndex];

  const displayedPrice = selectedUnit?.price ?? product.price;
  const displayedDiscountPrice = product.discountPrice;
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);

  const images = useMemo(() => {
    const mainImage =
      typeof product.image === 'string' ? product.image : product.image?.uri;
    return [mainImage, ...(product.subImages || [])].filter(Boolean);
  }, [product]);

  useFocusEffect(useCallback(() => setLoadingProduct(false), []));

  const [reviews, setReviews] = useState<
    {id: string; comment: string; user: string; rating: number}[]
  >([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Fetch reviews
  useEffect(() => {
    if (!product._id && !product.id) return;

    setLoadingReviews(true);
    axios
      .get(`${BASE_URL}/reviews/${product._id || product.id}`)
      .then(res => {
        const mapped = Array.isArray(res.data)
          ? res.data.map(r => ({
              id: r._id,
              comment: r.comment || 'No comment',
              rating: r.rating || 0,
              user: r.userId?.name || 'Anonymous',
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
              productId: r.productId,
            }))
          : [];
        setReviews(mapped);
        console.log('Reviews fetched:', mapped);
      })
      .catch(err => console.error('Failed to fetch reviews:', err))
      .finally(() => setLoadingReviews(false));
  }, [product._id, product.id]);

  useEffect(() => {
    if (reviews.length > 0) {
      const avg =
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
      setRating({
        avgRating: parseFloat(avg.toFixed(1)),
        totalReviews: reviews.length,
        comments: reviews.map(r => r.comment),
      });
    } else {
      setRating({avgRating: 0, totalReviews: 0, comments: []});
    }
  }, [reviews]);
  console.log('Product Rating ******** :', rating);

  // Fetch related products
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

      {/* Sub Images */}
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

      {/* Product Name */}
      <View style={styles.detailsContainer}>
        <CustomText style={styles.name}>{product.name}</CustomText>

        {/* ✅ Product Rating (Only show if reviews exist) */}
        {rating.totalReviews > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}>
            {/* Rating Number with Green Badge */}
            <View
              style={{
                backgroundColor: '#4CAF50',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 8,
              }}>
              <CustomText
                style={{color: '#fff', fontWeight: '600', fontSize: 13}}>
                {rating.avgRating.toFixed(1)}
              </CustomText>
              <Icon
                name="star"
                size={14}
                color="#fff"
                style={{marginLeft: 3}}
              />
            </View>

            {/* Reviews Count */}
            <CustomText style={{fontSize: 13, color: '#555'}}>
              {rating.totalReviews} Reviews
            </CustomText>
          </View>
        )}

        {/* Price & Add */}
        <View style={styles.priceContainer1}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            {selectedUnit ? (
              <CustomText style={{fontWeight: 'bold', color: '#222'}}>
                ₹{selectedUnit.price.toFixed(2)}
              </CustomText>
            ) : product.discountPrice ? (
              <>
                <CustomText
                  style={{color: '#777', textDecorationLine: 'line-through'}}>
                  ₹{product.price}
                </CustomText>
                <CustomText style={{fontWeight: 'bold', color: '#222'}}>
                  ₹{product.discountPrice}
                </CustomText>
              </>
            ) : (
              <CustomText style={{fontWeight: 'bold', color: '#222'}}>
                ₹{product.price}
              </CustomText>
            )}
          </View>

          <UniversalAdd
            item={{
              ...product,
              price: displayedPrice,
              unit: selectedUnit,
            }}
          />
        </View>

        {/* Units */}
        {product.units?.length > 0 && (
          <FlatList
            ref={unitListRef}
            data={product.units}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item._id}
            contentContainerStyle={{paddingHorizontal: 10}}
            getItemLayout={(_, index) => ({
              length: 135, // approximate width of each item (minWidth + marginRight)
              offset: 135 * index,
              index,
            })}
            renderItem={({item: unit, index}) => {
              const isSelected = index === selectedUnitIndex;
              return (
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    isSelected
                      ? styles.unitButtonSelected
                      : styles.unitButtonUnselected,
                    index !== product.units!.length - 1 && {marginRight: 10},
                  ]}
                  onPress={async () => {
                    const productRefId = unit.productRef;
                    if (!productRefId) {
                      alert('No referenced product found for this unit');
                      return;
                    }

                    setLoadingProduct(true);
                    try {
                      const productData = await fetchProductByProductId(
                        productRefId,
                      );
                      if (productData) {
                        setProduct(productData);
                        setSelectedUnitIndex(index);

                        // ✅ Now scroll works because FlatList knows item size
                        unitListRef.current?.scrollToIndex({
                          index,
                          animated: true,
                        });
                      } else {
                        alert('Product not found');
                      }
                    } catch (err) {
                      console.error('Error fetching product:', err);
                      alert('Error fetching product');
                    } finally {
                      setLoadingProduct(false);
                    }
                  }}>
                  <CustomText
                    style={
                      isSelected
                        ? styles.unitTextSelected
                        : styles.unitTextUnselected
                    }>
                    {unit.gram}g
                  </CustomText>
                  <CustomText
                    style={
                      isSelected
                        ? styles.unitTextSelected
                        : styles.unitTextUnselected
                    }>
                    ₹{unit.price.toFixed(2)}
                  </CustomText>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Tabs */}
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: '#ddd',
            marginTop: 16,
          }}>
          <TouchableOpacity
            style={{flex: 1, alignItems: 'center', padding: 10}}
            onPress={() => setActiveTab('details')}>
            <CustomText
              style={{
                color: activeTab === 'details' ? '#d00' : '#555',
                fontWeight: activeTab === 'details' ? 'bold' : '500',
              }}>
              Product Details
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={{flex: 1, alignItems: 'center', padding: 10}}
            onPress={() => setActiveTab('reviews')}>
            <CustomText
              style={{
                color: activeTab === 'reviews' ? '#d00' : '#555',
                fontWeight: activeTab === 'reviews' ? 'bold' : '500',
              }}>
              Reviews ({reviews.length})
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={{paddingVertical: 12}}>
          {activeTab === 'details' && (
            <>
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
            </>
          )}

          {activeTab === 'reviews' && (
            <View>
              {loadingReviews ? (
                <ActivityIndicator size="small" color="#FFB800" />
              ) : reviews.length > 0 ? (
                <>
                  {/* Individual Reviews */}
                  {reviews.map(rev => (
                    <View
                      key={rev.id}
                      style={{
                        marginBottom: 12,
                        backgroundColor: '#fff',
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#eee',
                      }}>
                      {/* User + Rating */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}>
                        <CustomText
                          style={{
                            fontWeight: '600',
                            fontSize: 14,
                            marginRight: 40,
                          }}>
                          {rev.user || 'Anonymous'}
                        </CustomText>

                        {/* ⭐ Show rating always for each review */}
                        <RatingStars rating={rev.rating} reviews={1} />
                      </View>

                      {/* Comment */}
                      <CustomText
                        style={{
                          fontSize: 13,
                          color: '#444',
                          textAlign: 'right', // Align text to the right
                          alignSelf: 'flex-end', // Position to the right side
                          marginTop: 8, // Add some spacing from the rating
                          fontStyle: 'italic', // Optional: make it italic
                          paddingRight: 8, // Optional: add some padding from the edge
                        }}>
                        {rev.comment}
                      </CustomText>
                    </View>
                  ))}
                </>
              ) : (
                <CustomText>No reviews yet.</CustomText>
              )}
            </View>
          )}
        </View>
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
      {images.length > 0 && (
        <ImageViewing
          images={images.map(uri => ({uri}))}
          imageIndex={imageIndex}
          visible={isImageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      )}

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
              stocks: item.stocks ?? 0,
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
  unitsContainer: {flexDirection: 'row', marginVertical: 8},
  unitButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 125,
  },
  unitButtonSelected: {borderColor: '#00bfa5', backgroundColor: '#b2dfdb'},
  unitButtonUnselected: {borderColor: '#ccc', backgroundColor: '#f7f7f7'},
  unitTextSelected: {color: '#00796b', fontWeight: '700', fontSize: 14},
  unitTextUnselected: {color: '#555', fontWeight: '500', fontSize: 14},
  toggleMore: {color: '#007BFF', fontSize: 13, fontWeight: '500'},
});

export default withCart(ProductDetails);
