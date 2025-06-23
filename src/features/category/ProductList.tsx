import {FlatList, StyleSheet} from 'react-native';
import React, {FC} from 'react';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import ProductItem from './ProductItem';

const ProductList: FC<{data: any}> = ({data}) => {
  const renderItem = ({item, index}: any) => {
    return <ProductItem item={item} index={index} />;
  };

  return (
    <FlatList
      data={data}
      keyExtractor={item => item._id}
      renderItem={renderItem}
      style={styles.container}
      contentContainerStyle={styles.content}
      numColumns={2}
      removeClippedSubviews={false}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    paddingVertical: 10,
    paddingBottom: 100,
  },
});

export default ProductList;
