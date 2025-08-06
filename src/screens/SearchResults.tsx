import React from 'react';
import {FlatList, View, StyleSheet} from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import {
  RouteProp,
  useRoute,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import ProductItem from '@features/category/ProductItem';

const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

type RootStackParamList = {
  SearchResults: {searchResults: any[]};
  ProductDetails: {
    product: any;
    touchedSubcategoryId?: string;
    fromSearch?: boolean;
    relatedProducts?: any[];
  };
};

type SearchResultsRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;

const SearchResults = () => {
  const route = useRoute<SearchResultsRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {searchResults = []} = route.params || {};

  const renderItem = ({item, index}: {item: any; index: number}) => {
    const imageUri =
      typeof item.image === 'string'
        ? item.image
        : item.image?.uri || fallbackImage;

    const subcategory = item?.subcategory || item?.subcategoryId || null;

    const transformedItem = {
      _id: item._id || item.id || '',
      image: imageUri,
      name: item.name,
      subImages: Array.isArray(item.subImages) ? item.subImages : [],
      price: item.price,
      discountPrice: item.discountPrice || '',
      description: item.description || '',
      subcategory: subcategory,
    };

    return (
      <ProductItem
        item={transformedItem}
        index={index}
        onPress={() =>
          navigation.navigate('ProductDetails', {
            product: transformedItem,
            touchedSubcategoryId:
              transformedItem.subcategory || transformedItem.subcategoryId,
            fromSearch: true,
            passedRelated: searchResults,
          })
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Search Results" />
      <FlatList
        data={searchResults}
        keyExtractor={(item, index) =>
          String(item._id || item.id || item.name || index)
        }
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {paddingHorizontal: 10, paddingBottom: 50},
});

export default SearchResults;
