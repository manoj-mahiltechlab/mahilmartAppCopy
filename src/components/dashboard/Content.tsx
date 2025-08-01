import {View, StyleSheet} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {GroceryItems, homeLifeStyle} from '@utils/dummyData';
import AdCarousal from './AdCarousal';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import CategoryContainer from './CategoryContainer';
import {
  getAdImages,
  getAllSections,
  getCategoriesBySection,
} from '@service/authService';

type DashboardStackParamList = {
  CategoryOrSubcategory: {categoryId: string; categoryName: string};
  ProductCategories: {
    selectedCategory: {_id: string; name: string};
    subcategoryId: string;
    categoryName: string;
  };
  ProductDashboard: undefined;
  DeliveryLogin: undefined;
  DeliveryDashboard: undefined;
};

type CategoryType = {
  id: string;
  name: string;
  image: {uri: string};
};

const Content: FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<DashboardStackParamList>>();

  const [adData, setAdData] = useState<string[]>([]);
  const [homeKitchenCategories, setHomeKitchenCategories] = useState<
    CategoryType[]
  >([]);

  const handleCategoryPress = (categoryItem: {id: string; name: string}) => {
    navigation.navigate('CategoryOrSubcategory', {
      categoryId: categoryItem.id,
      categoryName: categoryItem.name,
    });
  };

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const images = await getAdImages('Home');
        setAdData(images);
      } catch (error) {
        console.error('❌ Failed to fetch ad images:', error);
      }
    };

    fetchAds();
    const interval = setInterval(fetchAds, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const sectionData = await getAllSections();

        const homeKitchenSection = sectionData?.sections?.find(
          (s: any) => s.name === 'Home & Kitchen',
        );

        if (homeKitchenSection?._id) {
          const categories = await getCategoriesBySection(
            homeKitchenSection._id,
          );
          setHomeKitchenCategories(categories);
          console.log('✅ Home & Kitchen categories:', categories);
        } else {
          console.warn('⚠️ "Home & Kitchen" section not found');
        }
      } catch (error) {
        console.error('❌ Failed to fetch Home & Kitchen categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <View style={styles.container}>
      <AdCarousal adData={adData} />

      {homeKitchenCategories.length > 0 && (
        <>
          <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
            Home & Kitchen
          </CustomText>
          <CategoryContainer
            data={homeKitchenCategories}
            onCategoryPress={handleCategoryPress}
          />
        </>
      )}

      <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
        Grocery
      </CustomText>
      <CategoryContainer
        data={GroceryItems}
        onCategoryPress={handleCategoryPress}
      />

      <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
        Home & Lifestyle
      </CustomText>
      <CategoryContainer
        data={homeLifeStyle}
        onCategoryPress={handleCategoryPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
});

export default Content;
