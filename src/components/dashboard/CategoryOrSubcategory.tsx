import React, {useEffect} from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {navigate} from '@utils/NavigationUtils';
import CustomText from '@components/ui/CustomText';
import {RouteProp, useRoute} from '@react-navigation/native';

const CategoryOrSubcategory = () => {
  const route = useRoute<RouteProp<Record<string, any>, string>>();
  const {categoryId, subcategories} = route.params;

  useEffect(() => {
    if (!subcategories) {
      navigate('ProductCategories', {category: categoryId});
    }
  }, [subcategories]);

  if (!subcategories) return null;

  const handleSubcategoryPress = (subcategory: any) => {
    navigate('ProductCategories', {category: subcategory.id});
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={subcategories}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSubcategoryPress(item)}>
            <Image source={item.image} style={styles.image} />
            <CustomText style={styles.text}>{item.name}</CustomText>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 55,
  },
  item: {
    width: '45%',
    margin: '2%',
    backgroundColor: '#E5F3F3',
    borderRadius: 25,
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
  },
});

export default CategoryOrSubcategory;
