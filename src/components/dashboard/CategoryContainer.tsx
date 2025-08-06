import React, {FC, useRef} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import ScalePress from '@components/ui/ScallPress';
import {navigate} from '@utils/NavigationUtils';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';

const fallbackImage =
  'https://res.cloudinary.com/duvnlj6m2/image/upload/v1749819426/uxxb1eun3m48lkt6bgkb.png';

interface Subcategory {
  id: string;
  name: string;
  image: {uri: string} | string;
}

interface CategoryItem {
  _id?: string;
  id: string;
  name: string;
  image: {uri: string} | string;
  categoryId?: string | number;
  products?: any[];
  subcategories?: Subcategory[];
}

interface CategoryContainerProps {
  data: CategoryItem[];
  onCategoryPress?: (categoryItem: CategoryItem) => void;
}

const CategoryContainer: FC<CategoryContainerProps> = ({
  data,
  onCategoryPress,
}) => {
  const lastPress = useRef(0);

  const handlePress = (item: CategoryItem) => {
    const now = Date.now();
    if (now - lastPress.current < 500) return;
    lastPress.current = now;

    if (onCategoryPress) {
      onCategoryPress(item);
    } else {
      navigate('CategoryOrSubcategory', {
        categoryId: item._id || item.id,
        categoryName: item.name,
        subcategories: item.subcategories || null,
      });
    }
  };

  return (
    <View style={styles.grid}>
      {data.map((item, index) => {
        const mainImageUri =
          typeof item.image === 'string'
            ? item.image
            : item.image?.uri || fallbackImage;

        return (
          <ScalePress
            key={item.id || item._id || index}
            style={styles.item}
            onPress={() => handlePress(item)}>
            <View style={styles.imageContainer}>
              <Image
                source={{uri: mainImageUri}}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.subImagesContainer}>
                {item?.subcategories?.slice(0, 3).map((sub, idx) => {
                  const subImageUri =
                    typeof sub.image === 'string'
                      ? sub.image
                      : sub.image?.uri || fallbackImage;

                  return (
                    <Image
                      key={idx}
                      source={{uri: subImageUri}}
                      style={styles.subImage}
                    />
                  );
                })}
              </View>
            </View>

            <CustomText
              style={styles.text}
              variant="h8"
              fontFamily={Fonts.Medium}>
              {item.name}
            </CustomText>
          </ScalePress>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  item: {
    width: '23%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    marginRight: '2%',
  },

  imageContainer: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E5F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  subImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 0,
    gap: 4,
  },
  subImage: {
    width: 20,
    height: 20,
    borderRadius: 4,
    resizeMode: 'cover',
  },
  text: {
    textAlign: 'center',
    fontSize: 13,
  },
});

export default CategoryContainer;
