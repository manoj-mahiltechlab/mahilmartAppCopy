import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import ScalePress from '@components/ui/ScallPress';
import {navigate} from '@utils/NavigationUtils';
import CustomText from '@components/ui/CustomText';
import {Fonts, Colors} from '@utils/Constants';
import {
  getAllCategories,
  getProductsByCategoryId,
} from '@service/ProductService';

const SnacksDrinks: FC<{data: any}> = ({data}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

  const categoriesID = '682721bc955e2124af638b5b';

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
        {items?.map((item, index) => {
          return (
            <CustomText
              key={index}
              style={styles.item}
              onPress={() =>
                navigate('ProductCategories', {
                  initialCategory: item,
                  commonId: categoriesID,
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
            </CustomText>
          );
        })}
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

export default SnacksDrinks;
