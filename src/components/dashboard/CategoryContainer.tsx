import {View, StyleSheet} from 'react-native';
import React, {FC} from 'react';
import ScalePress from '@components/ui/ScallPress';
import {navigate} from '@utils/NavigationUtils';
import {Image} from 'react-native';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';

const CategoryContainer: FC<{data: any}> = ({data}) => {
  const renderItems = (items: any[]) => {
    return (
      <>
        {items?.map((items, index) => {
          return (
            <ScalePress
              key={index}
              style={styles.item}
              onPress={() => {
                console.log('Touched item:', items);
                navigate('ProductCategories', {category: items});
              }}>
              <View style={styles.imageContainer}>
                <Image source={items?.image} style={styles.image} />
              </View>
              <CustomText
                style={styles.text}
                variant="h8"
                fontFamily={Fonts.Medium}>
                {items?.name}
              </CustomText>
            </ScalePress>
          );
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>{renderItems(data?.slice(0, 4))}</View>
      <View style={styles.row}>{renderItems(data?.slice(4))}</View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  text: {
    textAlign: 'center',
  },
  item: {
    width: '22%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 6,
    backgroundColor: '#E5F3F3',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default CategoryContainer;
