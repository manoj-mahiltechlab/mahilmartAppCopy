import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import {
  getAllCategories,
  getAllSubcategories,
  getProductsBySubcategoryId,
} from '@service/ProductService';
import ProductItem from './ProductItem';
import withCart from '@features/cart/WithCart';
import {
  RouteProp,
  useNavigation,
  useRoute,
  NavigationProp,
} from '@react-navigation/native';
import CustomText from '@components/ui/CustomText';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import SearchBar from '@components/dashboard/SearchBar';

const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

type RootStackParamList = {
  ProductCategories: {
    categoryId?: string;
    subcategoryId?: string;
    categoryName?: string;
    searchResults?: any[];
  };
  ProductDetails: {product: any; touchedSubcategoryId?: string};
};

const ProductCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showNoProductMessage, setShowNoProductMessage] = useState(false);
  const [overrideProducts, setOverrideProducts] = useState<any[]>([]);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductCategories'>>();
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const {categoryId, subcategoryId, categoryName, searchResults} =
    route.params || {};

  const fetchProducts = async (subId: string, pageNum = 1, append = false) => {
    try {
      setProductsLoading(true);
      const result = await getProductsBySubcategoryId(subId, pageNum); // 👈 make sure your API supports pageNum

      if (result.success) {
        setProducts(prev =>
          append ? [...prev, ...result.products] : result.products,
        );
        setHasMore(result.products.length > 0);
        setShowNoProductMessage(result.products.length === 0);
      } else {
        setProducts([]);
        setShowNoProductMessage(true);
      }
    } catch (err) {
      console.error('[fetchProducts] Error:', err);
      setProducts([]);
      setShowNoProductMessage(true);
    } finally {
      setProductsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      console.log('[fetchSubcategories] Fetching all subcategories...');
      const allSubcategories = await withTimeout(getAllSubcategories(), 5000); // ⏳ 5s
      console.log(
        '[fetchSubcategories] Subcategories fetched:',
        allSubcategories,
      );

      const filteredSubs = allSubcategories.filter(
        sub =>
          sub.category === selectedCategory?._id ||
          sub.category === selectedCategory?.id,
      );

      setSubcategories(filteredSubs);

      const firstSubId = filteredSubs?.[0]?._id || filteredSubs?.[0]?.id;

      if (subcategoryId) {
        setSelectedSubId(subcategoryId);
        fetchProducts(subcategoryId);
      } else if (firstSubId) {
        setSelectedSubId(firstSubId);
        fetchProducts(firstSubId);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error('[fetchSubcategories] Error:', error);
      Alert.alert(
        error.name === 'AbortError' ? 'Timeout' : 'Network Error',
        'Unable to load subcategories. Please try again.',
      );
      setSubcategories([]);
    }
  };
  // Refresh handler
  // ✅ Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    if (selectedSubId) {
      fetchProducts(selectedSubId, 1, false); // fresh fetch
    }
  }, [selectedSubId]);

  // ✅ Load more handler
  const handleLoadMore = useCallback(() => {
    if (!productsLoading && hasMore && selectedSubId) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(selectedSubId, nextPage, true); // append mode
    }
  }, [productsLoading, hasMore, selectedSubId, page]);

  useEffect(() => {
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      console.log(
        '[useEffect] Received searchResults from route:',
        searchResults,
      );
      setOverrideProducts(searchResults);
    } else {
      console.log('[useEffect] No searchResults found in route params');
      setOverrideProducts([]);
    }
  }, [searchResults]);

  useEffect(() => {
    if (selectedSubId) {
      getProductsBySubcategoryId(selectedSubId).then(result => {
        if (result.success) {
          setProducts(result.products);
        } else {
          setProducts([]);
        }
      });
    }
  }, [selectedSubId]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        console.log('[fetchCategories] Fetching all categories...');
        setCategoriesLoading(true);
        const data = await getAllCategories();
        console.log('[fetchCategories] Categories fetched:', data);

        if (isMounted) {
          setCategories(data);

          const matched = categoryId
            ? data.find(cat => cat._id === categoryId || cat.id === categoryId)
            : data[0];

          console.log('[fetchCategories] Matched category:', matched);
          if (matched) setSelectedCategory(matched);
        }
      } catch (error) {
        console.error('[fetchCategories] Error:', error);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    };

    if (!searchResults) {
      console.log(
        '[useEffect] No searchResults. Proceeding to fetch categories...',
      );
      fetchCategories();
    } else {
      console.log(
        '[useEffect] Skipping fetchCategories because searchResults exist',
      );
    }

    return () => {
      isMounted = false;
    };
  }, [categoryId, searchResults]);

  useEffect(() => {
    if (!selectedCategory || searchResults?.length) {
      console.log(
        '[useEffect] Skipping subcategory fetch because either selectedCategory is null or searchResults exist',
      );
      return;
    }

    const fetchSubcategories = async () => {
      try {
        console.log('[fetchSubcategories] Fetching all subcategories...');
        const allSubcategories = await getAllSubcategories();
        console.log(
          '[fetchSubcategories] Subcategories fetched:',
          allSubcategories,
        );

        const filteredSubs = allSubcategories.filter(
          sub =>
            sub.category === selectedCategory?._id ||
            sub.category === selectedCategory?.id,
        );

        console.log(
          '[fetchSubcategories] Filtered subcategories:',
          filteredSubs,
        );
        setSubcategories(filteredSubs);

        const firstSubId = filteredSubs?.[0]?._id || filteredSubs?.[0]?.id;

        if (subcategoryId) {
          console.log(
            '[fetchSubcategories] Using provided subcategoryId:',
            subcategoryId,
          );
          setSelectedSubId(subcategoryId);
          fetchProducts(subcategoryId);
        } else if (firstSubId) {
          console.log(
            '[fetchSubcategories] Using first available subcategoryId:',
            firstSubId,
          );
          setSelectedSubId(firstSubId);
          fetchProducts(firstSubId);
        } else {
          console.warn('[fetchSubcategories] No subcategories found');
          setProducts([]);
        }
      } catch (error) {
        console.error('[fetchSubcategories] Error:', error);

        setTimeout(() => {
          Alert.alert(
            'Server Problem',
            'Unable to connect to the server. Please check your internet connection and try again.',
            [{text: 'OK'}],
          );
        }, 1000);
      }
    };

    fetchSubcategories();
  }, [selectedCategory, searchResults]);

  const handleSubcategoryPress = (subId: string) => {
    if (selectedSubId !== subId) {
      console.log('[handleSubcategoryPress] User selected subId:', subId);
      setSelectedSubId(subId);
      fetchProducts(subId);
    } else {
      console.log(
        '[handleSubcategoryPress] SubId already selected, skipping:',
        subId,
      );
    }
  };

  // const renderSubcategory = useMemo(
  //   () =>
  //     !overrideProducts.length && (
  //       <View style={styles.subcategoryGrid}>
  //         {subcategories.map(sub => {
  //           const id = sub._id || sub.id;
  //           const uri =
  //             typeof sub?.image === 'string'
  //               ? sub.image
  //               : sub?.image?.uri || fallbackImage;

  //           return (
  //             <TouchableOpacity
  //               key={id}
  //               style={[
  //                 styles.subcategoryCard,
  //                 selectedSubId === id && styles.selectedSubcategoryCard,
  //               ]}
  //               onPress={() => handleSubcategoryPress(id)}>
  //               <Image
  //                 source={{uri}}
  //                 style={styles.subcategoryImage}
  //                 resizeMode="contain"
  //               />
  //               <CustomText style={styles.subcategoryName}>
  //                 {sub.name}
  //               </CustomText>
  //             </TouchableOpacity>
  //           );
  //         })}
  //       </View>
  //     ),
  //   [subcategories, selectedSubId, overrideProducts],
  // );

  const renderItem = useCallback(
    ({item, index}: {item: any; index: number}) => {
      const imageUri =
        typeof item.image === 'string'
          ? item.image
          : item.image?.uri || fallbackImage;

      const transformedItem = {
        _id: item._id || item.id || String(index),
        image: imageUri,
        name: item.name || 'Unnamed Product',
        subImages: Array.isArray(item.subImages) ? item.subImages : [],
        price: item.price ?? 0,
        discountPrice: item.discountPrice ?? 0,
        description: item.description ?? '',
        stocks: item.stocks ?? item.stock ?? 0,
        units: Array.isArray(item.units) ? item.units : [],
        subcategory:
          item.subcategory?._id ||
          item.subcategoryId ||
          item.subcategory ||
          selectedSubId ||
          '',
        rating: Number(item.rating) || 0, // ✅ ensure rating is always a number
      };

      return (
        <ProductItem
          item={transformedItem}
          index={index}
          onPress={() => {
            const touchedSubcategoryId =
              searchResults?.length > 0
                ? transformedItem.subcategory || selectedSubId
                : selectedSubId;
            const relatedProducts =
              overrideProducts.length > 0 ? overrideProducts : products;

            navigation.navigate('ProductDetails', {
              product: transformedItem,
              touchedSubcategoryId,
              fromSearch: !!searchResults?.length,
              relatedProducts,
            });

            console.log('[renderItem] transformedItem:', transformedItem);
          }}
        />
      );
    },
    [navigation, selectedSubId, searchResults],
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title={categoryName || selectedCategory?.name || 'Search Products'}
        search
        // customSearchBar={<SearchBar />}
      />

      <FlatList
        data={overrideProducts.length > 0 ? overrideProducts : products}
        keyExtractor={(item, index) =>
          String(item._id || item.id || item.name || index)
        }
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          productsLoading && products.length > 0 ? (
            <ActivityIndicator size="small" color={Colors.border} />
          ) : showNoProductMessage && products.length === 0 ? (
            <View style={styles.center}>
              <CustomText>No products found.</CustomText>
              <TouchableOpacity
                onPress={handleRefresh}
                style={{
                  marginTop: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  backgroundColor: '#007bff',
                  borderRadius: 6,
                }}>
                <CustomText style={{color: '#fff'}}>Retry</CustomText>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {paddingHorizontal: 6, paddingBottom: 50},
  subcategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  subcategoryCard: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 25,
  },
  selectedSubcategoryCard: {
    backgroundColor: '#cde5f6',
    borderRadius: 10,
    padding: 8,
  },
  subcategoryImage: {width: 50, height: 50, marginBottom: 4},
  subcategoryName: {fontSize: 12, textAlign: 'center', color: '#333'},
  center: {padding: 20, alignItems: 'center', width: '100%'},
});

export default withCart(ProductCategories);
