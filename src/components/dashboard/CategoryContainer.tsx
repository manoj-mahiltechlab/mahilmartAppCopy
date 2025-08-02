import React, {FC, useRef, useState} from 'react';
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
  const [expanded, setExpanded] = useState(false);
  const maxVisible = 8;

  const visibleData = expanded ? data : data.slice(0, maxVisible);
  const finalData =
    data.length > maxVisible ? [...visibleData, {id: 'more-button'}] : data;

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

  const renderCategory = (item: CategoryItem | {id: string}, index: number) => {
    if ('id' in item && item.id === 'more-button') {
      return (
        <ScalePress
          key="more-button"
          style={[styles.item, styles.moreButtonContainer]}
          activeScale={0.95}
          onPress={() => {
            setExpanded(prev => !prev);
          }}>
          <View style={styles.moreButtonBox}>
            <CustomText style={styles.moreButtonText}>
              {expanded ? 'Less' : 'More'}
            </CustomText>
          </View>
        </ScalePress>
      );
    }

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
            resizeMode="contain" // <--- valid prop here
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

        <CustomText style={styles.text} variant="h8" fontFamily={Fonts.Medium}>
          {item.name}
        </CustomText>
      </ScalePress>
    );
  };

  return (
    <View style={styles.grid}>
      {finalData.map((item, idx) => renderCategory(item, idx))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '23%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 15,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    backgroundColor: '#E5F3F3',
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
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
    marginTop: 4,
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
  moreButtonContainer: {
    width: '23%', // same as .item
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  moreButtonBox: {
    height: 40,
    width: 80,
    borderRadius: 22,
    backgroundColor: '#E5F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
    marginLeft: '77%',
  },
  moreButtonText: {
    color: '#363636',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CategoryContainer;
