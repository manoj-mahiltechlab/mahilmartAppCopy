import React from 'react';
import {FlatList, View, StyleSheet} from 'react-native';

import CustomHeader from '@components/ui/CustomHeader';
import {
  RouteProp,
  useRoute,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';

const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

type SearchResultsRouteProp = RouteProp<
  Record<string, {searchResults: any[]}>,
  string
>;

const SearchResults = () => {
  const route = useRoute<SearchResultsRouteProp>();
  const navigation = useNavigation();
  const {searchResults = []} = route.params || {};

  const renderItem = ({item, index}: {item: any; index: number}) => {
    const imageUri =
      typeof item.image === 'string' ? item.image : fallbackImage;

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
        onPress={() =>
          navigation.navigate('ProductDetails', {
            product: transformedItem,
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
