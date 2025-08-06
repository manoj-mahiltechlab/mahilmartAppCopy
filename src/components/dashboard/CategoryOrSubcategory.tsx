import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {getSubcategoriesByCategoryId} from '@service/ProductService';
import CustomText from '@components/ui/CustomText';
import CustomHeader from '@components/ui/CustomHeader';
import {StackNavigationProp} from '@react-navigation/stack';
import {Fonts} from '@utils/Constants';

const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

type RootStackParamList = {
  CategoryOrSubcategory: {categoryId: string; categoryName?: string};
  ProductCategories: {
    selectedCategory: {_id: string; name: string};
    subcategoryId: string;
    categoryName: string;
    subcategory?: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'CategoryOrSubcategory'>;

type SubcategoryType = {
  id: string;
  name: string;
  image: {uri: string} | string;
  category: string;
};

const CategoryOrSubcategory = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const {categoryId, categoryName} = route.params;

  const [subcategories, setSubcategories] = useState<SubcategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  //console.log('Subcategory :', subcategories);

  useEffect(() => {
    if (!categoryId) return;

    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        const allSubcategories = await getSubcategoriesByCategoryId(categoryId);

        const matched = allSubcategories.filter(
          (sub: SubcategoryType) => sub.category === categoryId,
        );

        if (matched.length === 0) {
          console.log(
            '[Navigation] No subcategories matched. Navigating to ProductCategories with:',
          );
          console.log({
            selectedCategory: {
              _id: categoryId,
              name: categoryName || '',
            },
            subcategoryId: categoryId,
            categoryName: categoryName || '',
          });

          navigation.replace('ProductCategories', {
            selectedCategory: {
              _id: categoryId,
              name: categoryName || '',
            },
            subcategoryId: categoryId,
            categoryName: categoryName || '',
          });
        } else {
          console.log('[Subcategories] Matched subcategories:', matched);
          setSubcategories(matched);
        }
      } catch (error) {
        console.error('❌ Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [categoryId, navigation, categoryName]);

  const handleSubcategoryPress = (subcategory: SubcategoryType) => {
    navigation.navigate('ProductCategories', {
      selectedCategory: {
        _id: categoryId,
        name: categoryName || '',
      },
      subcategoryId: subcategory.id,
      categoryName: subcategory.name,
    });
  };

  const renderItem = ({item}: {item: SubcategoryType}) => {
    const imageUri =
      typeof item.image === 'string'
        ? item.image
        : item.image?.uri || fallbackImage;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleSubcategoryPress(item)}>
        <View style={styles.imageContainer}>
          <Image source={{uri: imageUri}} style={styles.image} />
        </View>
        <CustomText
          style={styles.text}
          variant="h8"
          fontFamily={Fonts.Medium}
          numberOfLines={5}>
          {item.name}
        </CustomText>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title={categoryName || 'Category'} />

      <FlatList
        data={subcategories}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        numColumns={4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={{justifyContent: 'space-between'}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
  },
  flatListContent: {
    paddingBottom: 20,
    paddingTop: 12,
  },
  item: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 9,
    backgroundColor: '#E5F3F3',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryOrSubcategory;
