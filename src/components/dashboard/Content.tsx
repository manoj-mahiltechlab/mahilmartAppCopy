import {View, StyleSheet} from 'react-native';
import React, {FC} from 'react';
import {
  adData,
  groceryKitchen,
  homeLifeStyle,
  snacksDrinks,
} from '@utils/dummyData';
import AdCarousal from './AdCarousal';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import CategoryContainer from './CategoryContainer';

const Content: FC = () => {
  return (
    <View style={styles.container}>
      <AdCarousal adData={adData} />
      <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
        Grocery Items
      </CustomText>
      <CategoryContainer data={groceryKitchen} />

      <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
        Snacks & Drinks
      </CustomText>
      <CategoryContainer data={snacksDrinks} />

      <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
        Home & Lifestyle
      </CustomText>
      <CategoryContainer data={homeLifeStyle} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
  },
});

export default Content;
