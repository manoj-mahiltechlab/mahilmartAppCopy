import {View, StyleSheet, TouchableOpacity} from 'react-native';
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
import SnacksDrinks from './SnacksDrinks';

const Content: FC = () => {
  return (
    <View style={styles.container}>
      <AdCarousal adData={adData} />
      <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
        Grocery & Kitchen
      </CustomText>
      <CategoryContainer data={groceryKitchen} />
      {/* <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
        Bestseller
      </CustomText>
      <CategoryContainer data={bestseller} /> */}
      <TouchableOpacity
        onPress={() => console.log('Snacks & Drinks Title Pressed')}>
        <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
          Snacks & Drinks
        </CustomText>
        <SnacksDrinks data={snacksDrinks} />
      </TouchableOpacity>

      <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
        Home & Lifestyle
      </CustomText>
      <CategoryContainer data={homeLifeStyle} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});

export default Content;
