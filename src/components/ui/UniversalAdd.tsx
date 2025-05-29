import {View, StyleSheet, Pressable} from 'react-native';
import React, {FC} from 'react';
import {useCartStore} from '@state/CartStore';
import CustomText from './CustomText';
import {Fonts, Colors} from '@utils/Constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';
import {TouchableOpacity} from 'react-native';

const UniversalAdd: FC<{item: any}> = ({item}) => {
  const count = useCartStore(
    state => state.cart.find(i => i._id === item._id)?.count || 0,
  );

  const {addItem, removeItem} = useCartStore();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: count === 0 ? '#fff' : Colors.secondary,
        },
      ]}>
      {count === 0 ? (
        <TouchableOpacity onPressOut={() => addItem(item)} style={styles.add}>
          <CustomText
            variant="h9"
            fontFamily={Fonts.SemiBold}
            style={styles.addText}>
            ADD
          </CustomText>
        </TouchableOpacity>
      ) : (
        <View style={styles.counterContainer}>
          <TouchableOpacity onPressOut={() => removeItem(item._id)}>
            <Icon name="minus" color="#fff" size={RFValue(15)} />
          </TouchableOpacity>
          <CustomText
            fontFamily={Fonts.SemiBold}
            style={styles.text}
            variant="h6">
            {count}
          </CustomText>
          <TouchableOpacity onPressOut={() => addItem(item)}>
            <Icon name="plus" color="#fff" size={RFValue(15)} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
    width: 75,
    borderRadius: 8,
    zIndex: 10,
    elevation: 3,
    overflow: 'visible',
  },
  add: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  addText: {
    color: Colors.secondary,
    //  fontSize: 11,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  text: {
    color: '#fff',
  },
});

export default UniversalAdd;
