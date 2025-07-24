import {View, StyleSheet, Image} from 'react-native';
import React, {FC} from 'react';
import Carousal from 'react-native-reanimated-carousel';
import {screenWidth} from '@utils/Scaling';
import ScalePress from '@components/ui/ScallPress';

const AdCarousal: FC<{adData: any}> = ({adData}) => {
  const baseOptions = {
    vertical: false,
    width: screenWidth, // ✅ use full screen width
    height: screenWidth * 0.6,
  };

  return (
    <View style={styles.wrapper}>
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
        renderItem={({item}: any) => (
          <ScalePress style={styles.imageContainer}>
            <Image source={item} style={styles.img} />
          </ScalePress>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 15,
    alignSelf: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
  },
});

export default AdCarousal;
