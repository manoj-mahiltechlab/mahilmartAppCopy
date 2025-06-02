import React, {FC} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import ScalePress from '@components/ui/ScallPress';
import {navigate} from '@utils/NavigationUtils';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
interface Subcategory {
  id: string;
  name: string;
  image: {uri: string};
}

interface CategoryItem {
  _id?: string;
  id: string;
  name: string;
  image: any;
  categoryId?: string | number;
  products?: any[];
  subcategories?: Subcategory[];
}

interface CategoryContainerProps {
  data: CategoryItem[];
}

const CategoryContainer: FC<CategoryContainerProps> = ({data}) => {
  const renderItems = (items: CategoryItem[]) => {
    return items.map((item, index) => {
      return (
        <ScalePress
          key={item.id}
          style={styles.item}
          onPress={() => {
            console.log('ID : : ', items);
            console.log('Touched item category ID item i id :', item.id, index);
            navigate('CategoryOrSubcategory', {
              categoryId: item.id,
              subcategories: item.subcategories || null,
            });
          }}>
          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.image} />
          </View>
          <CustomText
            style={styles.text}
            variant="h8"
            fontFamily={Fonts.Medium}>
            {item.name}
          </CustomText>
        </ScalePress>
      );
    });
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
    width: '23%',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '120%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default CategoryContainer;
