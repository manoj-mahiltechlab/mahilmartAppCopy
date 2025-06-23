import React, {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
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

const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

type RootStackParamList = {
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

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route =
    useRoute<
      RouteProp<
        Record<
          string,
          {categoryId?: string; subcategoryId?: string; categoryName?: string}
        >,
        string
      >
    >();
  const {categoryId, subcategoryId, categoryName} = route.params || {};

  const fetchProducts = useCallback(async (subId: string) => {
    setProductsLoading(true);
    try {
      const data = await getProductsBySubcategoryId(subId);
      const productsArray = Array.isArray(data) ? data : [];
      console.log('[fetchProducts] products:', productsArray);
      setProducts(productsArray);
    } catch (error) {
      console.error(
        `[ProductCategories] Error fetching products for subId=${subId}:`,
        error,
      );
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getAllCategories();
        if (isMounted) {
          setCategories(data);
          const matched = categoryId
            ? data.find(cat => cat._id === categoryId || cat.id === categoryId)
            : data[0];
          if (matched) setSelectedCategory(matched);
        }
      } catch (error) {
        console.error('[ProductCategories] Error fetching categories:', error);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchSubcategories = async () => {
      try {
        const allSubcategories = await getAllSubcategories();
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
      } catch (error) {
        console.error(
          '[ProductCategories] Error fetching subcategories:',
          error,
        );
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  const handleSubcategoryPress = (subId: string) => {
    if (selectedSubId !== subId) {
      setSelectedSubId(subId);
      fetchProducts(subId);
    }
  };

  const renderSubcategory = useMemo(
    () => (
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
              <CustomText style={styles.subcategoryName}>{sub.name}</CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    ),
    [subcategories, selectedSubId],
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
      };

      return (
        <ProductItem
          item={transformedItem}
          index={index}
          onPress={() => {
            console.log(
              '[ProductCategories] Navigating to ProductDetails:',
              transformedItem,
              index,
            );
            navigation.navigate('ProductDetails', {
              product: transformedItem,
              touchedSubcategoryId: selectedSubId || undefined,
            });
          }}
        />
      );
    },
    [navigation, selectedSubId],
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title={categoryName || selectedCategory?.name || 'Categories'}
        search
      />

      {categoriesLoading ? (
        <ActivityIndicator
          size="small"
          color={Colors.border}
          style={styles.center}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) =>
            String(item._id || item.id || item.name || index)
          }
          renderItem={renderItem}
          numColumns={2}
          ListHeaderComponent={renderSubcategory}
          ListFooterComponent={
            productsLoading ? (
              <ActivityIndicator
                size="small"
                color={Colors.border}
                style={{marginVertical: 10}}
              />
            ) : products.length === 0 ? (
              <View style={styles.center}>
                <CustomText>No products found.</CustomText>
              </View>
            ) : null
          }
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        />
      )}
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
