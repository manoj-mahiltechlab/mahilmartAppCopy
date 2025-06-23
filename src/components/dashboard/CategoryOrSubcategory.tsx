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
import Icon from 'react-native-vector-icons/Ionicons';
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

  useEffect(() => {
    if (!categoryId) return;

    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        console.log('Fetching subcategories for categoryId:', categoryId);

        const allSubcategories = await getSubcategoriesByCategoryId(categoryId);

        console.log('All fetched subcategories:', allSubcategories);

        const matched = allSubcategories.filter(
          (sub: SubcategoryType) => sub.category === categoryId,
        );

        if (matched.length === 0) {
          console.warn(
            'No subcategories found, redirecting to ProductCategories...',
          );
          navigation.replace('ProductCategories', {
            selectedCategory: {
              _id: categoryId,
              name: categoryName || '',
            },
            subcategoryId: categoryId,
            categoryName: categoryName || '',
          });
        } else {
          console.log('Matched subcategories:', matched);
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
    console.log('👉 Subcategory Pressed:', subcategory);
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
          <Image
            source={{uri: imageUri}}
            style={styles.image}
            onError={() =>
              console.error(
                `❌ Image load error for subcategory [${item.id}] → URI: ${imageUri}`,
              )
            }
          />
        </View>
        <CustomText
          style={styles.text}
          variant="h8"
          fontFamily={Fonts.Medium}
          numberOfLines={2}>
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
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <CustomText style={styles.headerTitle} numberOfLines={2}>
            {categoryName || 'Category'}
          </CustomText>
        </View>
        <View style={{width: 26}} />
      </View>

      <FlatList
        data={subcategories}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        numColumns={4}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  backButton: {
    padding: 6,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  flatListContent: {
    paddingBottom: 20,
    gap: 8,
  },
  item: {
    flexBasis: '23%',
    alignItems: 'center',
    margin: 6,
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
