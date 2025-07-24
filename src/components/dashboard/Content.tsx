import {View, StyleSheet} from 'react-native';
import React, {FC} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {
  adData,
  GroceryItems,
  HomeKitchen,
  homeLifeStyle,
} from '@utils/dummyData';
import AdCarousal from './AdCarousal';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import CategoryContainer from './CategoryContainer';

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

const Content: FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<DashboardStackParamList>>();

  const handleCategoryPress = (categoryItem: {id: string; name: string}) => {
    navigation.navigate('CategoryOrSubcategory', {
      categoryId: categoryItem.id,
      categoryName: categoryItem.name,
    });
  };

  return (
    <View style={styles.container}>
      <AdCarousal adData={adData} />

      <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
        Home & Kitchen
      </CustomText>
      <CategoryContainer
        data={HomeKitchen}
        onCategoryPress={handleCategoryPress}
      />

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
