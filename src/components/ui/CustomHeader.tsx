import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {goBack} from '@utils/NavigationUtils';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from './CustomText';
import {Fonts} from '@utils/Constants';
import {useNavigation} from '@react-navigation/native';
import {useCartStore} from '@state/CartStore';

type CustomHeaderProps = {
  title?: string;
  search?: boolean;
  customSearchBar?: React.ReactNode;
  showCart?: boolean; // 👈 Add this prop
};

const CustomHeader: FC<CustomHeaderProps> = ({
  title,
  search,
  customSearchBar,
  showCart = false, // 👈 Default is false
}) => {
  const navigation = useNavigation();
  const cartItems = useCartStore(state => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.count, 0);

  return (
    <SafeAreaView edges={['top']}>
      <View style={styles.wrapper}>
        {/* Top row: Back, Title, Right icon (Search/Cart) */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backButton}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Icon name="chevron-back" color="#212121" size={RFValue(18)} />
          </TouchableOpacity>

          <View style={styles.centerContent}>
            <CustomText
              style={styles.text}
              variant="h5"
              fontFamily={Fonts.SemiBold}>
              {title}
            </CustomText>
          </View>

          <View style={styles.rightIcon}>
            {showCart && (
              <TouchableOpacity onPress={() => navigation.navigate('CartList')}>
                <Icon name="cart-outline" size={22} color="#212121" />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <CustomText style={styles.badgeText}>
                      {cartCount}
                    </CustomText>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {customSearchBar && (
          <View style={styles.searchWrapper}>{customSearchBar}</View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'white',
    borderBottomWidth: 0.7,
    borderColor: '#E0E0E0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: RFValue(15),
    color: '#212121',
  },
  rightIcon: {
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchWrapper: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
});

export default CustomHeader;
