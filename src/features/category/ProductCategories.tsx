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

  const {categoryId, subcategoryId, categoryName, searchResults} =
    route.params || {};

  const fetchProducts = useCallback(async (subId: string, override?: any[]) => {
    setProductsLoading(true);
    setShowNoProductMessage(false);

    try {
      if (Array.isArray(override) && override.length > 0) {
        console.log('[fetchProducts] override products:', override);
        setProducts(override);
        return;
      }

      const {success, products} = await getProductsBySubcategoryId(subId);
      const productsArray = Array.isArray(products) ? products : [];

      console.log('[fetchProducts] fetched products:', productsArray);
      setProducts(productsArray);

      if (!success || productsArray.length === 0) {
        setTimeout(() => setShowNoProductMessage(true), 500);
      }
    } catch (error) {
      console.error(
        `[ProductCategories] Error fetching products for subId=${subId}:`,
        error,
      );
      setProducts([]);
      setTimeout(() => setShowNoProductMessage(true), 3000);
    } finally {
      setProductsLoading(false);
    }
  }, []);

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

        // ✅ Delay 6 seconds before showing alert
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

  const renderSubcategory = useMemo(
    () =>
      !overrideProducts.length && (
        <View style={styles.subcategoryGrid}>
          {subcategories.map(sub => {
            const id = sub._id || sub.id;
            const uri =
              typeof sub?.image === 'string'
                ? sub.image
                : sub?.image?.uri || fallbackImage;

            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.subcategoryCard,
                  selectedSubId === id && styles.selectedSubcategoryCard,
                ]}
                onPress={() => handleSubcategoryPress(id)}>
                <Image
                  source={{uri}}
                  style={styles.subcategoryImage}
                  resizeMode="contain"
                />
                <CustomText style={styles.subcategoryName}>
                  {sub.name}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </View>
      ),
    [subcategories, selectedSubId, overrideProducts],
  );

  const renderItem = useCallback(
    ({item, index}: {item: any; index: number}) => {
      const imageUri =
        typeof item.image === 'string'
          ? item.image
          : item.image?.uri || fallbackImage;

      const transformedItem = {
        _id: item._id || item.id || '',
        image: imageUri,
        name: item.name,
        subImages: Array.isArray(item.subImages) ? item.subImages : [],
        price: item.price,
        discountPrice: item.discountPrice || '',
        description: item.description || '',
        subcategory:
          item.subcategory?._id ||
          item.subcategoryId ||
          item.subcategory ||
          selectedSubId,
      };

      return (
        <ProductItem
          item={transformedItem}
          index={index}
          onPress={() => {
            console.log(
              '[renderItem > onPress] Navigating to ProductDetails with:',
              {
                transformedItem,
                selectedSubId,
                searchResultsLength: searchResults?.length ?? 0,
              },
            );

            navigation.navigate('ProductDetails', {
              product: transformedItem,
              touchedSubcategoryId:
                searchResults?.length > 0
                  ? transformedItem.subcategory || selectedSubId
                  : selectedSubId,
              fromSearch: !!searchResults?.length,
              relatedProducts: searchResults ? searchResults : undefined,
            });
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
        ListFooterComponent={
          productsLoading ? (
            <ActivityIndicator
              size="small"
              color={Colors.border}
              style={{marginVertical: 10}}
            />
          ) : showNoProductMessage && products.length === 0 ? (
            <View style={styles.center}>
              <CustomText>No products found.</CustomText>
            </View>
          ) : null
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {paddingHorizontal: 10, paddingBottom: 50},
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
