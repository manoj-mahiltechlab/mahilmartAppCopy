import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';
import {screenHeight, screenWidth} from '@utils/Scaling';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import CustomText from '@components/ui/CustomText';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Fonts} from '@utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import {navigate} from '@utils/NavigationUtils';

interface CartSummaryProps {
  cartCount: number;
  cartImage: string;
}

const CartSummary: FC<CartSummaryProps> = ({cartCount, cartImage}) => {
  return (
    <View style={styles.container}>
      <View style={styles.flexRopGap}>
        <Image
          source={
            cartImage === null
              ? require('@assets/icons/bucket.png')
              : {uri: cartImage}
          }
          style={styles.image}
        />
        <CustomText fontFamily={Fonts.SemiBold}>
          {cartCount} ITEM{cartCount > 1 ? 'S' : ''}
        </CustomText>
        <Icon
          name="arrow-drop-up"
          color={Colors.secondary}
          size={RFValue(25)}
        />
      </View>

      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigate('ProductOrder')}
          activeOpacity={0.7}>
          <CustomText style={styles.btnText} fontFamily={Fonts.Medium}>
            Next
          </CustomText>
          <Icon name="arrow-right" color="#fff" size={RFValue(25)} />
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: screenWidth * 0.02,
    paddingBottom: screenWidth * 0.01,
    paddingTop: screenHeight * 0.014,
  },
  flexRopGap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: screenWidth * 0.05,
  },
  image: {
    width: screenWidth * 0.1,
    height: screenWidth * 0.1,
    borderRadius: screenWidth * 0.025,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenHeight * 0.01,
    borderRadius: screenWidth * 0.025,
    backgroundColor: 'green',
    paddingHorizontal: screenWidth * 0.1,
  },
  btnText: {
    marginLeft: screenWidth * 0.02,
    color: '#fff',
  },
});

export default CartSummary;
