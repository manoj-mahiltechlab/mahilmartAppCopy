import {View, StyleSheet, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Sidebar from './Sidebar';
import {
  getAllCategories,
  getProductsByCategoryId,
} from '@service/ProductService';
import ProductList from './ProductList';
import withCart from '@features/cart/WithCart';
import {RouteProp, useRoute} from '@react-navigation/native';

const ProductCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

  // Expect param 'category' which is the category ID (string)
  const route =
    useRoute<RouteProp<Record<string, {category?: string}>, string>>();
  const {category} = route.params || {};

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getAllCategories();
        setCategories(data);

        if (data && data.length > 0) {
          if (category) {
            // Find category by _id or id matching param
            const matchedCategory = data.find(
              cat => cat._id === category || cat.id === category,
            );
            setSelectedCategory(matchedCategory || data[0]);
          } else {
            setSelectedCategory(data[0]);
          }
        }
      } catch (error) {
        console.log('Error Fetching Categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [category]);

  useEffect(() => {
    const fetchProducts = async (categoryId: string) => {
      try {
        setProductsLoading(true);
        const data = await getProductsByCategoryId(categoryId);
        setProducts(data);
      } catch (error) {
        console.log('Error Fetching Products', error);
      } finally {
        setProductsLoading(false);
      }
    };

    if (selectedCategory?._id || selectedCategory?.id) {
      fetchProducts(selectedCategory._id || selectedCategory.id);
    }
  }, [selectedCategory]);

  return (
    <View style={styles.mainContainer}>
      <CustomHeader title={selectedCategory?.name || 'Categories'} search />
      <View style={styles.subContainer}>
        {categoriesLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color={Colors.border} />
          </View>
        ) : (
          <Sidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryPress={(category: any) => setSelectedCategory(category)}
          />
        )}

        {productsLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.border}
            style={styles.center}
          />
        ) : (
          <ProductList data={products || []} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withCart(ProductCategories);
