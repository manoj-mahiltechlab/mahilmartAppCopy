// import {View, StyleSheet} from 'react-native';
// import React, {FC} from 'react';
// import {useCartStore} from '@state/CartStore';
// import CustomText from './CustomText';
// import {Fonts, Colors} from '@utils/Constants';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {RFValue} from 'react-native-responsive-fontsize';
// import {TouchableOpacity} from 'react-native';

// const UniversalAdd: FC<{item: any}> = ({item}) => {
//   const count = useCartStore(
//     state => state.cart.find(i => i._id === item._id)?.count || 0,
//   );

//   const {addItem, removeItem} = useCartStore();
//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           backgroundColor: count === 0 ? '#fff' : Colors.secondary,
//           zIndex: 10,
//           elevation: 3,
//           overflow: 'visible',
//         },
//       ]}>
//       {count === 0 ? (
//         <TouchableOpacity onPress={() => addItem(item)} style={styles.add}>
//           <CustomText
//             variant="h9"
//             fontFamily={Fonts.SemiBold}
//             style={styles.addText}>
//             ADD
//           </CustomText>
//         </TouchableOpacity>
//       ) : (
//         <View style={styles.counterContainer}>
//           <TouchableOpacity onPress={() => removeItem(item._id)}>
//             <Icon name="minus" color="#fff" size={RFValue(15)} />
//           </TouchableOpacity>
//           <CustomText
//             fontFamily={Fonts.SemiBold}
//             style={styles.text}
//             variant="h6">
//             {count}
//           </CustomText>
//           <TouchableOpacity onPress={() => addItem(item)}>
//             <Icon name="plus" color="#fff" size={RFValue(15)} />
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: Colors.secondary,
//     width: 65,
//     borderRadius: 8,
//     zIndex: 10, // important
//     elevation: 3, // improves Android touch reliability
//     overflow: 'visible', // avoids clipping
//   },
//   add: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 4,
//     paddingVertical: 6,
//   },
//   addText: {
//     color: Colors.secondary,
//     fontSize: 11,
//   },
//   counterContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     paddingHorizontal: 4,
//     paddingVertical: 6,
//     justifyContent: 'space-between',
//   },
//   text: {
//     color: '#fff',
//   },
// });

// export default UniversalAdd;
import React, {FC, useCallback} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useCartStore} from '@state/CartStore';
import CustomText from './CustomText';
import {Fonts, Colors} from '@utils/Constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';
import {SafeAreaView} from 'react-native-safe-area-context';

interface Item {
  _id: string | number;
}

const UniversalAdd: FC<{item: Item}> = ({item}) => {
  // Use store getter method for count (avoid find in component)
  const count = useCartStore(state => {
    const found = state.cart.find(i => String(i._id) === String(item._id));
    return found ? found.count : 0;
  });

  // Stable add/remove handlers
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);

  const onAdd = useCallback(() => {
    addItem(item);
  }, [addItem, item]);

  const onRemove = useCallback(() => {
    removeItem(item._id);
  }, [removeItem, item._id]);

  console.log('Rendering UniversalAdd', item._id, 'count:', count);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: count === 0 ? '#fff' : Colors.secondary,
        },
      ]}>
      {count === 0 ? (
        <TouchableOpacity
          onPress={onAdd}
          style={styles.add}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityLabel={`Add ${item._id} to cart`}
          accessible>
          <CustomText
            variant="h9"
            fontFamily={Fonts.SemiBold}
            style={styles.addText}>
            ADD
          </CustomText>
        </TouchableOpacity>
      ) : (
        <View style={styles.counterContainer}>
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            accessibilityLabel={`Remove one ${item._id} from cart`}
            accessible>
            <Icon name="minus" color="#fff" size={RFValue(15)} />
          </TouchableOpacity>

          <CustomText
            fontFamily={Fonts.SemiBold}
            style={styles.text}
            variant="h6">
            {count}
          </CustomText>

          <TouchableOpacity
            onPress={onAdd}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            accessibilityLabel={`Add one more ${item._id} to cart`}
            accessible>
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
    width: 65,
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
    fontSize: 11,
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
