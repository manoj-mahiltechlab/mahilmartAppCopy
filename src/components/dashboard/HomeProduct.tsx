import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {
  getAllCategories,
  getProductsByCategoryId,
} from '@service/ProductService';
import CustomText from '@components/ui/CustomText';
import {navigate} from '@utils/NavigationUtils';
import {Fonts} from '@utils/Constants';

const HomeProduct: FC<{data: any}> = ({data}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

  const categoryId = '67e786faac8a406fb692a379';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getAllCategories();
        setCategories(data);
        if (data && data.length > 0) {
          setSelectedCategory(data[0]);
        }
      } catch (error) {
        console.log('Error Fetching Categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

    if (selectedCategory?._id) {
      fetchProducts(selectedCategory._id);
      console.log('Selected Category:', selectedCategory);
    }
  }, [selectedCategory]);

  const renderItems = (items: any[]) => {
    return (
      <>
        {items?.map((item, index) => (
          <TouchableOpacity
            key={item._id || item.id || index}
            style={styles.item}
            onPress={() =>
              navigate('ProductCategories', {
                category: categoryId,
              })
            }>
            <View style={styles.imageContainer}>
              <Image source={item?.image} style={styles.image} />
            </View>
            <CustomText
              style={styles.text}
              variant="h8"
              fontFamily={Fonts.Medium}>
              {item?.name}
            </CustomText>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>{renderItems(data?.slice(0, 4))}</View>
      <View style={styles.row}>{renderItems(data?.slice(4))}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  text: {
    textAlign: 'center',
  },
  item: {
    width: '22%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 6,
    backgroundColor: '#E5F3F3',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default HomeProduct;
