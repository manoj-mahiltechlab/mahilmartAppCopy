import {View, StyleSheet} from 'react-native';
import React, {FC} from 'react';
import Carousal from 'react-native-reanimated-carousel';
import {screenWidth} from '@utils/Scaling';
import ScalePress from '@components/ui/ScallPress';
import {Image} from 'react-native';

const AdCarousal: FC<{adData: any}> = ({adData}) => {
  const baseOptions = {
    vertical: false,
    width: screenWidth,
    height: screenWidth * 0.6,
  };
  return (
    <View style={{left: -20, marginVertical: 10}}>
      <Carousal
        {...baseOptions}
        loop
        pagingEnabled
        snapEnabled
        autoPlay
        autoPlayInterval={2000}
        mode="parallax"
        data={adData}
        modeConfig={{
          parallaxScrollingOffset: 0,
          parallaxScrollingScale: 0.93,
        }}
        renderItem={({item}: any) => {
          return (
            <ScalePress style={styles.imageContainer}>
              <Image source={item} style={styles.img} />
            </ScalePress>
          );
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 15,
  },
});

export default AdCarousal;
