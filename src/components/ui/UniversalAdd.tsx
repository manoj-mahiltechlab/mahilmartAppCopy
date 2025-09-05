import {
  View,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from 'react-native';
import React, {FC} from 'react';
import {useCartStore} from '@state/CartStore';
import CustomText from './CustomText';
import {Fonts, Colors} from '@utils/Constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';

const UniversalAdd: FC<{item: any}> = ({item}) => {
  const count = useCartStore(
    state => state.cart.find(i => i._id === (item._id || item.id))?.count || 0,
  );
  const {addItem, removeItem} = useCartStore();
  const isOutOfStock = item?.stocks === 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            isOutOfStock || count === 0 ? '#fff' : Colors.secondary,
          borderColor: isOutOfStock ? '#ccc' : Colors.secondary,
        },
      ]}>
      {isOutOfStock ? (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.fullButton}
          onPress={() => {
            Alert.alert(
              'Out of Stock',
              `Is currently out of stock.\nYou will be notified when it's available.`,
              [{text: 'OK'}],
            );
          }}>
          <CustomText
            style={{
              fontSize: RFValue(11),
              color: Colors.secondary,
              fontFamily: Fonts.SemiBold,
            }}>
            Notify Me
          </CustomText>
        </TouchableOpacity>
      ) : count === 0 ? (
        <TouchableOpacity
          onPress={() => addItem({...item, _id: item._id || item.id})}
          style={styles.fullButton}>
          <CustomText
            fontFamily={Fonts.SemiBold}
            style={styles.addText}
            variant="h9">
            ADD
          </CustomText>
        </TouchableOpacity>
      ) : (
        <View style={styles.counterContainer}>
          <TouchableOpacity onPress={() => removeItem(item._id || item.id)}>
            <Icon name="minus" color="#fff" size={RFValue(15)} />
          </TouchableOpacity>

          <CustomText
            fontFamily={Fonts.SemiBold}
            style={styles.text}
            variant="h6">
            {count}
          </CustomText>

          <TouchableOpacity
            onPressOut={() => addItem({...item, _id: item._id || item.id})}>
            <Icon name="plus" color="#fff" size={RFValue(15)} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 75,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    zIndex: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullButton: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  addText: {
    color: Colors.secondary,
    fontSize: RFValue(11),
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    justifyContent: 'space-between',
  },
  text: {
    color: '#fff',
  },
});

export default UniversalAdd;
